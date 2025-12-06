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
import Upload from '../Pages/Upload';
import Interview from '../Pages/Interview';
import Users from '../Pages/Users';
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
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="jobs"
                    element={
                        <ProtectedRoute>
                            {roles.includes("CANDIDATE") ? <CandidateDashboard/> : <Jobs />}
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
                <Route
                    path="upload"
                    element={
                        <ProtectedRoute>
                            {roles.includes("RECRUITER") ? <Upload /> : <Navigate to="/dashboard" replace />}
                        </ProtectedRoute>
                    }
                    />
                <Route
                    path="interviews"
                    element={
                        <ProtectedRoute>
                            {roles.includes("RECRUITER") ? <Interview /> : <Navigate to="/dashboard" replace />  }
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="users"
                    element={
                      <ProtectedRoute>
                        {roles.includes("ADMIN") ? <Users/> : <Navigate to="/dashboard" replace />}
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
