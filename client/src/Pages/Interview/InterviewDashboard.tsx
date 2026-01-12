import { useState, useEffect } from 'react';
import {
    CircularProgress,
    Rating,
    Chip
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import FormSection from '../../Components/ui/FormSection';
import CommonModal from '../../Components/layout/CommonModal';
import api from '../../utils/api';

const InterviewerDashboard = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRound, setSelectedRound] = useState<any>(null);
    const [feedbacks, setFeedbacks] = useState<{ [skillId: number]: { rating: number, comments: string } }>({});

    useEffect(() => {
        fetchAssignedInterviews();
        fetchSkills();
    }, []);

    const fetchAssignedInterviews = async () => {
        try {
            const res = await api.get('/interviews/assigned');
            setInterviews(res.data.data || []);
        } catch (e) { 
            toast.error("Failed to fetch interviews"); 
        } finally {
            setLoading(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await api.get('/skills');
            setSkills(res.data.data || []);
        } catch (e) { 
            console.error("Skills fetch error"); 
        }
    };

    const handleSubmitFeedback = async () => {
        if (!selectedRound) return;

        const feedbackList = Object.entries(feedbacks).map(([skillId, data]) => ({
            skillId: Number(skillId),
            skillName: skills.find(s => s.id === Number(skillId))?.name,
            rating: data.rating,
            comments: data.comments
        }));

        try {
            await api.post(`/interviews/rounds/${selectedRound.id}/feedback`, feedbackList);
            toast.success("Feedback submitted successfully");
            setSelectedRound(null);
            setFeedbacks({});
            fetchAssignedInterviews();
        } catch (e) { 
            toast.error("Failed to submit feedback"); 
        }
    };

    const handleFeedbackChange = (skillId: number, field: string, value: any) => {
        setFeedbacks(prev => ({
            ...prev,
            [skillId]: { ...prev[skillId], [field]: value }
        }));
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
            'COMPLETED': 'success',
            'PASSED': 'success',
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Assigned Interviews</h1>
            
            {interviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {interviews.map(interview => (
                        <div key={interview.id} className="bg-white border border-gray-200 rounded-lg p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Person className="text-gray-600" />
                                        {interview.candidateName}
                                    </h3>
                                    <p className="text-sm text-gray-600 ml-8">{interview.position}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                {interview.rounds.map((round: any) => (
                                    <div key={round.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{round.roundType}</p>
                                            <Chip 
                                                label={round.status} 
                                                size="small" 
                                                color={getStatusColor(round.status)}
                                                className="mt-1"
                                            />
                                        </div>
                                        {round.status !== 'COMPLETED' && (
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                onClick={() => setSelectedRound(round)}
                                            >
                                                Give Feedback
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                    <div className="mb-6">
                        <svg
                            className="mx-auto h-24 w-24 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No assigned interviews
                    </h3>
                    <p className="text-sm text-gray-600">
                        You don't have any interviews assigned at the moment.
                    </p>
                </div>
            )}

            <CommonModal 
                openState={!!selectedRound} 
                onClose={() => setSelectedRound(null)}
                title={`Feedback for ${selectedRound?.roundType || ''}`}
                title2="Please rate the candidate on the following skills"
                sizes={['95%', '85%', '70%', '60%']}
            >
                <div className="space-y-4">
                    {skills.map(skill => (
                        <FormSection key={skill.id} title={skill.name}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                                    <Rating
                                        value={feedbacks[skill.id]?.rating || 0}
                                        onChange={(_, val) => handleFeedbackChange(skill.id, 'rating', val)}
                                        size="large"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comments
                                    </label>
                                    <Input
                                        multiline
                                        rows={2}
                                        placeholder="Add your comments..."
                                        value={feedbacks[skill.id]?.comments || ''}
                                        onChange={(e) => handleFeedbackChange(skill.id, 'comments', e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormSection>
                    ))}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setSelectedRound(null)} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitFeedback} variant="contained">
                            Submit Evaluation
                        </Button>
                    </div>
                </div>
            </CommonModal>
        </div>
    );
};

export default InterviewerDashboard;