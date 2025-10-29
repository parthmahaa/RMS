import { Routes, Route, Outlet } from 'react-router-dom'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import Home from '../Pages/Home'
import Dashboard from '../Pages/Dashboard'
import RegisterForm from '../Pages/Register'
import LoginForm from '../Pages/Login'
import Profile from '../Pages/Profile'
import DashboardLayout from '../Components/layout/DashboardLayout'
import Jobs from '../Pages/Jobs'

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                element={
                    <DashboardLayout onLogout={() => { }}>
                        <Outlet />
                    </DashboardLayout>
                }
            >
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/dashboard'
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/jobs'
                    element={
                        <ProtectedRoute>
                            <Jobs/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/profile'
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route
                path='/login'
                element={
                    <PublicRoute>
                        <LoginForm />
                    </PublicRoute>
                }
            />

            <Route
                path='/register'
                element={
                    <PublicRoute>
                        <RegisterForm />
                    </PublicRoute>
                }
            />
            <Route path='*' element={<div className='text-center pt-20'>Page Not Found</div>} />
        </Routes>

    )
}

export default AppRoutes