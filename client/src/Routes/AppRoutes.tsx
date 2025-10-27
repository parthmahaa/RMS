import { Routes, Route } from 'react-router-dom'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import Home from '../Pages/Home'
import Dashboard from '../Pages/Dashboard'
import RegisterForm from '../Pages/Register'
import LoginForm from '../Pages/Login'
import Profile from '../Pages/Profile'
import Navbar from '../Components/layout/Navbar'

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

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
                        <RegisterForm/>
                    </PublicRoute>
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
                path='/profile'
                element={
                    <ProtectedRoute>
                        <Navbar/>
                        <Profile/>
                    </ProtectedRoute>
                }
            />
            <Route path='*' element={<div className='text-center pt-20'>Page Not Found</div>} />
        </Routes>

    )
}

export default AppRoutes