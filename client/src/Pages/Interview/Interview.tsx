import { useEffect, useState } from 'react';
import {
    CircularProgress,
    Chip,
    Select,
    MenuItem,
    FormControl,
    Tooltip
} from '@mui/material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import CommonModal from '../../Components/layout/CommonModal';
import api from '../../utils/api';
import type { EmployeeDTO } from '../../Types/user';
import InterviewDetailsModal from './InterviewDetailsModal';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';

interface Skill {
    id: number;
    name: string;
}

interface SkillFeedbackDto {
    skillId: number;
    skillName?: string;
    rating: number;
    comments: string;
}

interface InterviewRound {
    id: number;
    roundNumber: number;
    roundType: string;
    status: string;
    scheduledAt?: string;
    meetingLink?: string;
    comments?: string;
    assignedInterviewers?: EmployeeDTO[];
    assignedHrs?: EmployeeDTO[];
    feedbacks?: SkillFeedbackDto[];
}

interface Interview {
    id: number;
    candidateName: string;
    position: string;
    status: string;
    jobSkills?: Skill[];
    rounds: InterviewRound[];
}

const Interviews = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

    const [roundEdits, setRoundEdits] = useState<Record<number, any>>({});
    const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({});

    const [showDecisionDialog, setShowDecisionDialog] = useState(false);
    const [finalStatus, setFinalStatus] = useState<'HIRED' | 'REJECTED'>('HIRED');
    const [finalComments, setFinalComments] = useState('');

    const [availableInterviewers, setAvailableInterviewers] = useState<EmployeeDTO[]>([]);
    const [availableHRs, setAvailableHRs] = useState<EmployeeDTO[]>([]);

    useEffect(() => {
        fetchInterviews();
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await api.get('/skills');
            setSkills(res.data.data || []);
        } catch (e) {
            console.error("Failed to fetch skills");
        }
    };

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/interviews/company');
            setInterviews(res.data.data || []);
        } catch {
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    const updateRound = (roundId: number, field: string, value: any) => {
        setRoundEdits(prev => ({
            ...prev,
            [roundId]: {
                ...(prev[roundId] || {}),
                [field]: value
            }
        }));
    };

    // Feedback Handlers
    const ensureFeedbackState = (round: InterviewRound) => {
        if (!roundEdits[round.id]?.feedbacks) {
            let initialFeedbacks = round.feedbacks ? [...round.feedbacks] : [];
            
            // If there are NO existing feedbacks, pre-populate with Job Skills
            if (initialFeedbacks.length === 0 && selectedInterview?.jobSkills) {
                initialFeedbacks = selectedInterview.jobSkills.map(s => ({
                    skillId: s.id,
                    skillName: s.name,
                    rating: 0,
                    comments: ''
                }));
            }
            
            updateRound(round.id, 'feedbacks', initialFeedbacks);
        }
    };

    const addFeedbackRow = (round: InterviewRound) => {
        ensureFeedbackState(round);
        const currentFeedbacks = roundEdits[round.id]?.feedbacks || round.feedbacks || [];
        updateRound(round.id, 'feedbacks', [
            ...currentFeedbacks,
            { skillId: 0, rating: 0, comments: '' }
        ]);
    };

    const removeFeedbackRow = (roundId: number, index: number) => {
        const current = roundEdits[roundId]?.feedbacks || [];
        const updated = [...current];
        updated.splice(index, 1);
        updateRound(roundId, 'feedbacks', updated);
    };

    const updateFeedbackRow = (roundId: number, index: number, field: keyof SkillFeedbackDto, value: any) => {
        const current = [...(roundEdits[roundId]?.feedbacks || [])];
        
        if (field === 'skillId') {
            const skillObj = skills.find(s => s.id === Number(value));
            current[index] = { ...current[index], [field]: value, skillName: skillObj?.name };
        } else {
            current[index] = { ...current[index], [field]: value };
        }
        
        updateRound(roundId, 'feedbacks', current);
    };

    const hasChanges = (roundId: number) => {
        return !!roundEdits[roundId] && Object.keys(roundEdits[roundId]).length > 0;
    };

    const saveRound = async (roundId: number) => {
        try {
            const edits = roundEdits[roundId] || {};
            const payload: any = { ...edits };

            if (payload.feedbacks) {
                payload.feedbacks = payload.feedbacks.filter((f: any) => f.skillId);
            }

            if (payload.assignedInterviewers || payload.assignedHrs) {
                const staffIds = (payload.assignedInterviewers || payload.assignedHrs || []).map((s: EmployeeDTO) => s.id);
                await api.post(`/interviews/rounds/${roundId}/assign`, staffIds);
                delete payload.assignedInterviewers;
                delete payload.assignedHrs;
            }

            await api.put(`/interviews/rounds/${roundId}`, payload);
            toast.success('Round updated successfully');

            setRoundEdits(prev => {
                const copy = { ...prev };
                delete copy[roundId];
                return copy;
            });
            fetchInterviews();

            if (selectedInterview) {
                const res = await api.get('/interviews/company');
                const updated = res.data.data.find((i: Interview) => i.id === selectedInterview.id);
                if (updated) setSelectedInterview(updated);
            }
            setSelectedInterview(null)
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error('Update failed');
        }
    };

    const fetchStaffLists = async () => {
        try {
            const [interviewersRes, hrsRes] = await Promise.all([
                api.get('/interviews/interviewers-list'),
                api.get('/interviews/hr-list')
            ]);
            setAvailableInterviewers(interviewersRes.data.data || []);
            setAvailableHRs(hrsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch staff lists');
        }
    };

    const completeInterview = async () => {
        if (!selectedInterview) return;
        try {
            await api.post(`/interviews/${selectedInterview.id}/complete`, {
                finalStatus,
                finalComments
            });
            toast.success('Interview completed');
            setShowDecisionDialog(false);
            setSelectedInterview(null);
            fetchInterviews();
        } catch {
            toast.error('Failed to complete interview');
        }
    };

    const toggleRound = (roundId: number, round: InterviewRound) => {
        const isExpanding = !expandedRounds[roundId];
        setExpandedRounds(prev => ({ ...prev, [roundId]: isExpanding }));
        
        if (isExpanding) {
            ensureFeedbackState(round);
            if (availableInterviewers.length === 0 && availableHRs.length === 0) {
                fetchStaffLists();
            }
        }
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
            'PASSED': 'success',
            'COMPLETED': 'success',
            'FAILED': 'error',
            'SCHEDULED': 'info',
        };
        return colorMap[status] || 'default';
    };

    if (loading) {
        return (
            <div className="flex justify-center h-64 items-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Interviews 
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map(interview => (
                    <div
                        key={interview.id}
                        onClick={() => setSelectedInterview(interview)}
                        className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {interview.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{interview.position}</p>
                        <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                            {interview.rounds.map(r => (
                                <Tooltip key={r.id} title={`${r.roundType} - ${r.status}`}>
                                    <Chip
                                        label={`R${r.roundNumber}`}
                                        size="small"
                                        color={getStatusColor(r.status)}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <InterviewDetailsModal
                interview={selectedInterview}
                open={!!selectedInterview}
                onClose={() => setSelectedInterview(null)}
                skills={skills}
                availableInterviewers={availableInterviewers}
                availableHRs={availableHRs}
                roundEdits={roundEdits}
                expandedRounds={expandedRounds}
                onUpdateRound={updateRound}
                onSaveRound={saveRound}
                onToggleRound={toggleRound}
                hasChanges={hasChanges}
                onAddFeedbackRow={addFeedbackRow}
                onRemoveFeedbackRow={removeFeedbackRow}
                onUpdateFeedbackRow={updateFeedbackRow}
                onOpenDecisionDialog={() => setShowDecisionDialog(true)}
                getStatusColor={getStatusColor}
            />

            <CommonModal
                openState={showDecisionDialog}
                onClose={() => setShowDecisionDialog(false)}
                title="Final Decision"
                sizes={['95%', '80%', '60%', '50%']}
            >
                <div className="space-y-4">
                    <div>
                        <AutocompleteWoControl
                            id='status'
                            options={["HIRED", "REJECTED"]}
                            value={finalStatus}
                            onChange={(_,value) => setFinalStatus(value as 'HIRED' | 'REJECTED')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Final Comments
                        </label>
                        <Input
                            multiline
                            rows={3}
                            value={finalComments}
                            onChange={e => setFinalComments(e.target.value)}
                            placeholder="Add your final comments..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setShowDecisionDialog(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={completeInterview} variant="contained">
                            Confirm Decision
                        </Button>
                    </div>
                </div>
            </CommonModal>
        </div>
    );
};

export default Interviews;