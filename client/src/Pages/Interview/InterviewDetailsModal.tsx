import {
    Chip,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Rating
} from '@mui/material';
import { ExpandMore, VideoCall, AddCircle, Delete } from '@mui/icons-material';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import CommonModal from '../../Components/layout/CommonModal';
import FormSection from '../../Components/ui/FormSection';
import AutocompleteWoControl from '../../Components/ui/AutoCompleteWoControl';
import type { EmployeeDTO } from '../../Types/user';

const splitDateTime = (value?: string) => {
    if (!value) return { date: '', time: '' };

    const [date, time] = value.split('T');
    return {
        date,
        time: time?.slice(0, 5) || ''
    };
};

const combineDateTime = (date: string, time: string) => {
    if (!date && !time) return null;
    if (!date) return null;
    if (!time) return `${date}T00:00`;
    return `${date}T${time}`;
};

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

interface InterviewDetailsModalProps {
    interview: Interview | null;
    open: boolean;
    onClose: () => void;
    skills: Skill[];
    availableInterviewers: EmployeeDTO[];
    availableHRs: EmployeeDTO[];
    roundEdits: Record<number, any>;
    expandedRounds: Record<number, boolean>;
    onUpdateRound: (roundId: number, field: string, value: any) => void;
    onSaveRound: (roundId: number) => Promise<void>;
    onToggleRound: (roundId: number, round: InterviewRound) => void;
    hasChanges: (roundId: number) => boolean;
    onAddFeedbackRow: (round: InterviewRound) => void;
    onRemoveFeedbackRow: (roundId: number, index: number) => void;
    onUpdateFeedbackRow: (roundId: number, index: number, field: keyof SkillFeedbackDto, value: any) => void;
    onOpenDecisionDialog: () => void;
    getStatusColor: (status: string) => 'success' | 'error' | 'warning' | 'info' | 'default';
}

const InterviewDetailsModal = ({
    interview,
    open,
    onClose,
    skills,
    availableInterviewers,
    availableHRs,
    roundEdits,
    expandedRounds,
    onUpdateRound,
    onSaveRound,
    onToggleRound,
    hasChanges,
    onAddFeedbackRow,
    onRemoveFeedbackRow,
    onUpdateFeedbackRow,
    onOpenDecisionDialog,
    getStatusColor
}: InterviewDetailsModalProps) => {
    if (!interview) return null;

    return (
        <CommonModal
            openState={open}
            onClose={onClose}
            title={interview.candidateName}
            title2={interview.position}
            sizes={['95%', '90%', '80%', '70%']}
        >
            <div className="space-y-4">
                {interview.rounds.map(round => {
                    const current =
                        roundEdits[round.id]?.scheduledAt
                            ? splitDateTime(roundEdits[round.id].scheduledAt)
                            : splitDateTime(round.scheduledAt);

                    return (
                        <FormSection key={round.id} title="">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-4"
                                onClick={() => onToggleRound(round.id, round)}
                            >
                                <h3 className="text-base font-semibold text-gray-900">
                                    {round.roundType}
                                </h3>

                                <div className="flex items-center gap-2">
                                    <Chip
                                        label={round.status}
                                        size="small"
                                        color={getStatusColor(round.status)}
                                    />
                                    <ExpandMore
                                        className={`transition-transform ${expandedRounds[round.id] ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </div>

                            {expandedRounds[round.id] && (
                                <div className="space-y-4  border-t border-gray-100">
                                    <div className=" rounded-lg ">
                                        <div className="space-y-3">
                                            <AutocompleteWoControl
                                                multiple
                                                options={round.roundType.toLowerCase().includes('hr')
                                                    ? availableHRs
                                                    : availableInterviewers}
                                                getOptionLabel={(o: EmployeeDTO) => `${o.name} (${o.email})`}
                                                value={(() => {
                                                    const isHr = round.roundType.toLowerCase().includes('hr');
                                                    const fieldName = isHr ? 'assignedHrs' : 'assignedInterviewers';
                                                    return roundEdits[round.id]?.[fieldName] ??
                                                        (isHr ? round.assignedHrs || [] : round.assignedInterviewers || []);
                                                })()}
                                                onChange={(_, value: EmployeeDTO[]) => {
                                                    const isHr = round.roundType.toLowerCase().includes('hr');
                                                    const fieldName = isHr ? 'assignedHrs' : 'assignedInterviewers';
                                                    onUpdateRound(round.id, fieldName, value);
                                                }}
                                                label={round.roundType.toLowerCase().includes('hr')
                                                    ? 'Select HR Staff'
                                                    : 'Select Interviewers'}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Interview Date
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                value={current.date}
                                                onChange={e =>
                                                    onUpdateRound(
                                                        round.id,
                                                        'scheduledAt',
                                                        combineDateTime(e.target.value, current.time)
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Interview Time
                                            </label>
                                            <input
                                                type="time"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                                value={current.time}
                                                onChange={e =>
                                                    onUpdateRound(
                                                        round.id,
                                                        'scheduledAt',
                                                        combineDateTime(current.date, e.target.value)
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Meeting Link
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={
                                                        roundEdits[round.id]?.meetingLink ??
                                                        round.meetingLink ??
                                                        ''
                                                    }
                                                    onChange={e =>
                                                        onUpdateRound(
                                                            round.id,
                                                            'meetingLink',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {(round.meetingLink ||
                                                    roundEdits[round.id]?.meetingLink) && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() =>
                                                                window.open(
                                                                    roundEdits[round.id]?.meetingLink ??
                                                                    round.meetingLink,
                                                                    '_blank'
                                                                )
                                                            }
                                                        >
                                                            <VideoCall />
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={
                                                        roundEdits[round.id]?.status ?? round.status
                                                    }
                                                    onChange={e =>
                                                        onUpdateRound(
                                                            round.id,
                                                            'status',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem value="SCHEDULED">
                                                        Scheduled
                                                    </MenuItem>
                                                    <MenuItem value="COMPLETED">
                                                        Completed
                                                    </MenuItem>
                                                    <MenuItem value="PASSED">Passed</MenuItem>
                                                    <MenuItem value="FAILED">Failed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Round Summary
                                            </label>
                                            <Input
                                                value={
                                                    roundEdits[round.id]?.comments ??
                                                    round.comments ??
                                                    ''
                                                }
                                                onChange={e =>
                                                    onUpdateRound(
                                                        round.id,
                                                        'comments',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="General comments..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-gray-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                                Skill Evaluation
                                            </h4>
                                            <Button
                                                size="small"
                                                variant="text"
                                                startIcon={<AddCircle />}
                                                onClick={() => onAddFeedbackRow(round)}
                                            >
                                                Add Other Skill
                                            </Button>
                                        </div>

                                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                            {(() => {
                                                const feedbacks = roundEdits[round.id]?.feedbacks ?? round.feedbacks ?? [];

                                                if (feedbacks.length === 0) {
                                                    return (
                                                        <p className="text-sm text-gray-500 italic text-center py-2">
                                                            No skills to evaluate.
                                                        </p>
                                                    );
                                                }

                                                return feedbacks.map((fb: SkillFeedbackDto, idx: number) => {
                                                    const isJobSkill = interview.jobSkills?.some(js => js.id === fb.skillId);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                                                        >
                                                            <div className="col-span-12 sm:col-span-4">
                                                                {isJobSkill && fb.skillName ? (
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-800">
                                                                            {fb.skillName}
                                                                        </p>
                                                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                                            Required
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <AutocompleteWoControl
                                                                        options={skills}
                                                                        getOptionLabel={(s: Skill) => s.name}
                                                                        value={skills.find(s => s.id === fb.skillId) || null}
                                                                        onChange={(_, value: Skill | null) => {
                                                                            if (value) {
                                                                                onUpdateFeedbackRow(
                                                                                    round.id,
                                                                                    idx,
                                                                                    'skillId',
                                                                                    value.id
                                                                                );
                                                                            }
                                                                        }}
                                                                        label="Select Skill"
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Rating */}
                                                            <div className="col-span-12 sm:col-span-3 flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    Rating:
                                                                </span>
                                                                <Rating
                                                                    size="small"
                                                                    value={fb.rating}
                                                                    onChange={(_, val) => {
                                                                        onUpdateFeedbackRow(
                                                                            round.id,
                                                                            idx,
                                                                            'rating',
                                                                            val || 0
                                                                        );
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="col-span-11 sm:col-span-4">
                                                                <input
                                                                    className="w-full text-sm border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 px-0 py-1"
                                                                    placeholder="Add specific feedback..."
                                                                    value={fb.comments || ''}
                                                                    onChange={(e) => {
                                                                        onUpdateFeedbackRow(
                                                                            round.id,
                                                                            idx,
                                                                            'comments',
                                                                            e.target.value
                                                                        );
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="col-span-1 flex justify-end">
                                                                {!isJobSkill && (
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() =>
                                                                            onRemoveFeedbackRow(round.id, idx)
                                                                        }
                                                                    >
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            disabled={!hasChanges(round.id)}
                                            onClick={() => onSaveRound(round.id)}
                                            variant="contained"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </FormSection>
                    );
                })}

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={onOpenDecisionDialog}
                        variant="contained"
                    >
                        Make Final Decision
                    </Button>
                </div>
            </div>
        </CommonModal>
    );
};

export default InterviewDetailsModal;