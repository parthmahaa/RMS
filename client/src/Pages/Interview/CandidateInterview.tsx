import { useState, useEffect } from 'react';
import { CircularProgress, Chip, IconButton } from '@mui/material';
import { CloudUpload, VideoCall, Close, ChevronRight, OpenInNew } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import FormSection from '../../Components/ui/FormSection';
import CommonModal from '../../Components/layout/CommonModal';
import api from '../../utils/api';
import useCloudinaryUpload from '../../Hooks/useCloudinary';

const CandidateInterview = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

    const DOC_KEY_MAP: Record<string, 'aadhar' | 'marksheet' | 'address'> = {
        'Aadhar': 'aadhar',
        'Marksheet': 'marksheet',
        'Address Proof': 'address'
    };

    type DocState = {
        aadhar: File | string;
        marksheet: File | string;
        address: File | string;
    };

    // Doc Upload State
    const { uploadFileToCloudinary, uploading } = useCloudinaryUpload();
    const [docs, setDocs] = useState<DocState>({
        aadhar: '',
        marksheet: '',
        address: ''
    });

    useEffect(() => {
        fetchInterviews();
    }, []);

    useEffect(() => {
        if (selectedInterview?.aadharUrl) {
            setDocs(prev => ({ ...prev, aadhar: selectedInterview.aadharUrl }));
        }
        if (selectedInterview?.marksheetUrl) {
            setDocs(prev => ({ ...prev, marksheet: selectedInterview.marksheetUrl }));
        }
        if (selectedInterview?.addressProofUrl) {
            setDocs(prev => ({ ...prev, address: selectedInterview.addressProofUrl }));
        }
    }, [selectedInterview]);

    const fetchInterviews = async () => {
        try {
            const res = await api.get('/interviews/my');
            setInterviews(res.data.data || []);
        } catch (e) {
            toast.error("Failed to load interviews");
        }
        finally {
            setLoading(false);
        }
    };

    const handleDocUpload = async (file: File, type: string) => {
        const key = DOC_KEY_MAP[type];
        if (!key) return;
        setDocs(prev => ({ ...prev, [key]: file }));
    };

    const handleRemoveDoc = (type: string) => {
        const key = DOC_KEY_MAP[type];
        if (!key) return;
        setDocs(prev => ({ ...prev, [key]: '' }));
    };

    const handleSubmitDocs = async () => {
        if (!selectedInterview) return;

        try {
            const uploadedUrls: any = {};

            if (docs.aadhar instanceof File) {
                const url = await uploadFileToCloudinary(docs.aadhar);
                if (!url) {
                    toast.error('Aadhar upload failed');
                    return;
                }
                uploadedUrls.aadharUrl = url;
            }

            if (docs.marksheet instanceof File) {
                const url = await uploadFileToCloudinary(docs.marksheet);
                if (!url) {
                    toast.error('Marksheet upload failed');
                    return;
                }
                uploadedUrls.marksheetUrl = url;
            }

            if (docs.address instanceof File) {
                const url = await uploadFileToCloudinary(docs.address);
                if (!url) {
                    toast.error('Address proof upload failed');
                    return;
                }
                uploadedUrls.addressProofUrl = url;
            }

            await api.post(
                `/interviews/candidate/${selectedInterview.id}/documents`,
                uploadedUrls
            );

            toast.success('Documents submitted successfully');
            fetchInterviews();
            setSelectedInterview(null);
            setDocs({ aadhar: '', marksheet: '', address: '' });

        } catch (e) {
            toast.error('Submission failed');
        }
    };



    const getStatusColor = (status: string) => {
        const colorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
            'HIRED': 'success',
            'REJECTED': 'error',
            'IN_PROGRESS': 'info',
            'SCHEDULED': 'info',
            'COMPLETED': 'success',
            'PASSED': 'success',
            'FAILED': 'error',
        };
        return colorMap[status] || 'default';
    };

    const getRoundStatusSummary = (rounds: any[]) => {
        const completed = rounds.filter(r => r.status === 'COMPLETED' || r.status === 'PASSED').length;
        const total = rounds.length;
        return `${completed}/${total} Rounds Completed`;
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Interviews</h1>

            {interviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interviews.map(interview => (
                        <div
                            key={interview.id}
                            onClick={() => setSelectedInterview(interview)}
                            className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{interview.position}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{interview.companyName}</p>
                                </div>
                                <Chip
                                    label={interview.status}
                                    color={getStatusColor(interview.status)}
                                    size="small"
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-3">
                                <p className="text-xs text-gray-600 mb-2">{getRoundStatusSummary(interview.rounds)}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        {interview.rounds.length} Interview Round{interview.rounds.length > 1 ? 's' : ''}
                                    </span>
                                    <ChevronRight className="text-gray-400" />
                                </div>
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No interviews scheduled
                    </h3>
                    <p className="text-sm text-gray-600">
                        You don't have any interviews at the moment.
                    </p>
                </div>
            )}

            <CommonModal
                openState={!!selectedInterview}
                onClose={() => {
                    setSelectedInterview(null);
                    setDocs({ aadhar: '', marksheet: '', address: '' });
                }}
                title={selectedInterview?.position || ''}
                title2={selectedInterview?.companyName}
                sizes={['95%', '90%', '80%', '70%']}
            >
                {selectedInterview && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <Chip
                                label={selectedInterview.status}
                                color={getStatusColor(selectedInterview.status)}
                                size="small"
                            />
                        </div>

                        <FormSection title="Interview Rounds">
                            <div className="space-y-3">
                                {selectedInterview.rounds.map((round: any) => (
                                    <div key={round.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-sm font-medium text-gray-900">{round.roundType}</p>
                                                    <Chip
                                                        label={round.status}
                                                        color={getStatusColor(round.status)}
                                                        size="small"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {round.scheduledAt
                                                        ? new Date(round.scheduledAt).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : <span className="italic text-gray-400">Not scheduled yet</span>
                                                    }
                                                </p>
                                            </div>
                                            {round.meetingLink && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<VideoCall />}
                                                    sx={{ textDecoration: 'none' }}
                                                    onClick={(e: any) => {
                                                        e.preventDefault();
                                                        window.open(round.meetingLink, '_blank');
                                                    }}
                                                >
                                                    Join Meeting
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        {selectedInterview.status === 'HIRED' && (
                            <FormSection title="Congratulations! You are Hired">
                                <p className="text-sm mb-4">
                                    Please upload the required documents for verification.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Aadhar', 'Marksheet', 'Address Proof'].map((type) => {
                                        const key = DOC_KEY_MAP[type];
                                        return (
                                            <div key={type} className="bg-white p-4 rounded-lg borde text-center">
                                                <p className="capitalize mb-3 font-medium text-gray-900">{type}</p>

                                                {docs[key] ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                                                            <p className="text-sm text-gray-700 truncate flex-1">
                                                                {docs[key] instanceof File ? docs[key].name : 'Document uploaded'}
                                                            </p>
                                                            <div className="flex gap-1">
                                                                {typeof docs[key] === 'string' && docs[key] && (
                                                                    <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={() => window.open(docs[key] as string, '_blank')}
                                                                        title="View document"
                                                                    >
                                                                        <OpenInNew fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveDoc(type)}
                                                                    disabled={uploading}
                                                                    title="Remove document"
                                                                >
                                                                    <Close fontSize="small" />
                                                                </IconButton>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        component="label"
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<CloudUpload />}
                                                        disabled={uploading}
                                                    >
                                                        Upload
                                                        <input
                                                            hidden
                                                            type="file"
                                                            onChange={(e) =>
                                                                e.target.files &&
                                                                handleDocUpload(e.target.files[0], type)
                                                            }
                                                        />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}

                                </div>
                            </FormSection>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSelectedInterview(null);
                                    setDocs({ aadhar: '', marksheet: '', address: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmitDocs}
                                disabled={!docs.aadhar || !docs.marksheet || uploading}
                            >
                                Submit Documents
                            </Button>
                        </div>
                    </div>
                )}
            </CommonModal>
        </div>
    );
};

export default CandidateInterview;