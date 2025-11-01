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

const AppRoutes: React.FC = () => {
    const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
    const isLoading = useAuthStore((state: any) => state.isLoading);

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
                            <Dashboard />
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
                            <Jobs />
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
