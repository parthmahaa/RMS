import { useState, useEffect } from 'react';
import { CircularProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { CheckCircle, Visibility, VerifiedUser, CalendarMonth, OpenInNew, ErrorOutline } from '@mui/icons-material';
import { toast } from 'sonner';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';
import FormSection from '../../Components/ui/FormSection';
import CommonModal from '../../Components/layout/CommonModal';
import api from '../../utils/api';

interface Candidate {
    id: number;
    candidateName: string;
    position: string;
    companyName: string;
    aadharUrl?: string;
    marksheetUrl?: string;
    addressProofUrl?: string;
    joiningDate?: string;
    isDocumentsVerified: boolean;
    status: string;
}

const HRInterview = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [joiningDate, setJoiningDate] = useState('');
    const [verifying, setVerifying] = useState(false);

    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchHiredCandidates();
    }, []);

    const fetchHiredCandidates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/interviews/hr/hired');
            setCandidates(res.data.data || []);
        } catch (e) {
            toast.error('Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (isApproved: boolean) => {
        if (!selectedCandidate) return;

        if (isApproved && !joiningDate) {
            toast.error('Joining date is required for verification');
            return;
        }

        if (!isApproved && !remarks.trim()) {
            toast.error('Remarks are required when putting a candidate on hold');
            return;
        }

        setActionLoading(true);
        try {
            await api.post(`/interviews/${selectedCandidate.id}/verify`, {
                joiningDate: isApproved ? joiningDate : null,
                remarks: remarks,
                isApproved: isApproved
            });

            toast.success(isApproved ? 'Documents verified & Date set!' : 'Candidate status updated to On Hold');
            handleClose();
            fetchHiredCandidates();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedCandidate(null);
        setJoiningDate('');
        setRemarks('');
    };

    const handleViewDocument = (url: string, docType: string) => {
        if (!url) {
            toast.error(`${docType} not uploaded yet`);
            return;
        }
        window.open(url, '_blank');
    };

    const isDocumentsComplete = (candidate: Candidate) => {
        return candidate.aadharUrl && candidate.marksheetUrl && candidate.addressProofUrl;
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">HR Onboarding Dashboard</h1>

            {candidates.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-900">
                            <div className="col-span-3">Candidate</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-3">Documents</div>
                            <div className="col-span-2">Joining Date</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                                {/* Name */}
                                <div className="col-span-3">
                                    <p className="font-medium text-gray-900">{candidate.candidateName}</p>
                                    <p className="text-xs text-gray-500">{candidate.position}</p>
                                </div>

                                <div className="col-span-2">
                                    <Chip
                                        label={candidate.status}
                                        color={candidate.status === 'HIRED' ? 'success' : 'warning'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </div>

                                <div className="col-span-3 flex gap-1 flex-wrap">
                                    <Chip size="small" label="Aadhar" color={candidate.aadharUrl ? 'success' : 'default'} variant={candidate.aadharUrl ? 'filled' : 'outlined'} />
                                    <Chip size="small" label="Marks" color={candidate.marksheetUrl ? 'success' : 'default'} variant={candidate.marksheetUrl ? 'filled' : 'outlined'} />
                                    <Chip size="small" label="Addrress Proof" color={candidate.addressProofUrl ? 'success' : 'default'} variant={candidate.addressProofUrl ? 'filled' : 'outlined'} />
                                </div>

                                <div className="col-span-2 text-sm text-gray-700">
                                    {candidate.joiningDate ? new Date(candidate.joiningDate).toLocaleDateString() : '-'}
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    {candidate.isDocumentsVerified ? (
                                        <div className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                            <CheckCircle /> Verified
                                        </div>
                                    ) : (
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setSelectedCandidate(candidate);
                                                setJoiningDate(candidate.joiningDate || '');
                                            }}
                                            startIcon={candidate.status === 'ON_HOLD' ? <ErrorOutline /> : <CheckCircle />}
                                            variant={candidate.status === 'ON_HOLD' ? 'outlined' : 'contained'}
                                            className={candidate.status === 'ON_HOLD' ? 'text-orange-600 border-orange-600' : ''}
                                        >
                                            {candidate.status === 'ON_HOLD' ? 'Re-Verify' : 'Verify'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">No candidates found.</div>
            )}

            <CommonModal
                openState={!!selectedCandidate}
                onClose={handleClose}
                title={selectedCandidate?.candidateName || ''}
                title2={`${selectedCandidate?.position}`}
                sizes={['95%', '90%', '75%', '60%']}
            >
                {selectedCandidate && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Current Status:</span>
                            <Chip
                                label={selectedCandidate.status}
                                color={selectedCandidate.status === 'HIRED' ? 'success' : 'warning'}
                                size="small"
                            />
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-900 mb-3">Submitted Documents</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-900">Aadhar</span>
                                    {selectedCandidate.aadharUrl ? (
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleViewDocument(
                                                    selectedCandidate.aadharUrl!,
                                                    'Aadhar Card'
                                                )
                                            }
                                            sx={{ color: '#2563eb' }}
                                        >
                                            <OpenInNew fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <Chip label="Missing" color="default" size="small" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-900">Marksheet</span>
                                    {selectedCandidate.marksheetUrl ? (
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleViewDocument(
                                                    selectedCandidate.marksheetUrl!,
                                                    'Marksheet'
                                                )
                                            }
                                            sx={{ color: '#2563eb' }}
                                        >
                                            <OpenInNew fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <Chip label="Missing" color="default" size="small" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-900">Address</span>
                                    {selectedCandidate.addressProofUrl ? (
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleViewDocument(
                                                    selectedCandidate.addressProofUrl!,
                                                    'Address Proof'
                                                )
                                            }
                                            sx={{ color: '#2563eb' }}
                                        >
                                            <OpenInNew fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <Chip label="Missing" color="default" size="small" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <FormSection title="Verification Actions">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Set Joining Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={joiningDate}
                                        onChange={(e) => setJoiningDate(e.target.value)}
                                        fullWidth
                                        inputProps={{
                                            min: new Date().toISOString().split('T')[0]
                                        }}
                                        placeholder="Select joining date"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Required for verification and onboarding
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        HR Remarks
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                                        rows={3}
                                        placeholder="Enter remarks about document verification or reason for holding..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Required when putting candidate on hold
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ErrorOutline />}
                                onClick={() => handleSubmit(false)}
                                disabled={actionLoading || !remarks.trim()}
                                sx={{
                                    borderColor: '#f97316',
                                    color: '#f97316',
                                    '&:hover': {
                                        borderColor: '#ea580c',
                                        backgroundColor: '#fff7ed',
                                    }
                                }}
                            >
                                Put On Hold
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={() => handleSubmit(true)}
                                disabled={
                                    actionLoading ||
                                    !isDocumentsComplete(selectedCandidate) ||
                                    !joiningDate
                                }
                            >
                                {actionLoading ? 'Processing...' : 'Verify & Onboard'}
                            </Button>
                        </div>
                    </div>
                )}
            </CommonModal>
        </div>
    );
};

export default HRInterview;