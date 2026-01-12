import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../Pages/Dashboard';
import RegisterForm from '../Pages/Register';
import LoginForm from '../Pages/Login';
import Profile from '../Pages/Profile';
import DashboardLayout from '../Components/layout/DashboardLayout';
import Jobs from '../Pages/Jobs';
import useAuthStore from '../Store/authStore';
import CandidateDashboard from '../Pages/CandidateDashboard';
import Applications from '../Pages/Applications';
import Users from '../Pages/Admin/Users';
import CandidateJobDetails from '../Pages/Candidate/CandidateJobDetails';
import JobDetails from '../Pages/Jobs/JobDetails';
import ManageUsers from '../Pages/Recruiter/ManageUsers';
import { JOB_VIEW_ROLES, ADD_USER_ROLES, JOB_EDIT_ROLES, INTERVIEW_VIEW_ROLES } from '../Types/user';
import Interview from '../Pages/Interview/Interview';
import CandidateInterview from '../Pages/Interview/CandidateInterview';
import InterviewerDashboard from '../Pages/Interview/InterviewDashboard';
import HRInterview from '../Pages/Interview/HRInterview';
const AppRoutes: React.FC = () => {
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
    const isLoading = useAuthStore((state: any) => state.isLoading);
    const roles = useAuthStore((state: any) => state.roles);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <DashboardLayout onLogout={() => { }}>
                        <Outlet />
                    </DashboardLayout>
                }
            >
                <Route
                    index
                    element={
                        <ProtectedRoute>
                            <Navigate to="/dashboard" replace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="jobs"
                    element={
                        <ProtectedRoute>
                            {roles.includes("CANDIDATE") ? (
                                <CandidateDashboard />
                            ) : JOB_VIEW_ROLES.some(role => roles.includes(role)) ? (
                                <Jobs />
                            ) : (
                                <Navigate to="/interviews" replace />
                            )}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="jobs/:id"
                    element={
                        <ProtectedRoute>
                            {roles.includes("CANDIDATE") ? (
                                <CandidateJobDetails />
                            ) : JOB_VIEW_ROLES.some(role => roles.includes(role)) ? (
                                <JobDetails />
                            ) : (
                                <Navigate to="/interviews" replace />
                            )}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='applications'
                    element={
                        <ProtectedRoute>
                            {roles.includes("CANDIDATE") ? <Applications /> : <Navigate to="/dashboard" replace />}
                        </ProtectedRoute>
                    }
                />
                <Route path="applications/jobs/:id" element={
                    <ProtectedRoute>
                        <CandidateJobDetails />
                    </ProtectedRoute>
                } />
                <Route
                    path="interviews"
                    element={
                        <ProtectedRoute>
                            {roles.includes("CANDIDATE") ? (
                                <CandidateInterview />
                            ) : roles.includes("INTERVIEWER") ? (
                                <InterviewerDashboard />
                            ) : roles.includes("HR") ? (
                                <HRInterview />
                            ) : (
                                <Interview /> 
                            )}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users"
                    element={
                        <ProtectedRoute>
                            {roles.includes("ADMIN") ? (
                                <Users />
                            ) : ADD_USER_ROLES.some(role => roles.includes(role)) ? (
                                <ManageUsers />
                            ) : (
                                <Navigate to="/interviews" replace />
                            )}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                {isAuthenticated && (
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                )}
            </Route>

            <Route
                path="login"
                element={
                    <PublicRoute>
                        <LoginForm />
                    </PublicRoute>
                }
            />
            <Route
                path="register"
                element={
                    <PublicRoute>
                        <RegisterForm />
                    </PublicRoute>
                }
            />
            {!isAuthenticated && (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
        </Routes>
    );
};

export default AppRoutes;
