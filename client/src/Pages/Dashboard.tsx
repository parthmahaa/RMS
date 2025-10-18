// src/pages/Dashboard.tsx
import useAuthStore from "../Store/authStore";
import { useNavigate } from "react-router-dom";
import  Button  from "../Components/ui/Button";
import { useEffect } from "react";
import Navbar from "../Components/layout/Navbar";

const Dashboard = () => {
  const { email, roles, isAuthenticated, logout } = useAuthStore((state :any) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-600 mb-2">
          <strong>Email:</strong> {email}
        </p>
        <p className="text-gray-600 mb-6">
          <strong>Roles:</strong> {roles.join(", ")}
        </p>
        {/* <Button
          onClick={() => {
            logout();
            navigate("/login");
            }}
            className="w-full bg-gray-900 text-white hover:bg-gray-800"
            >
            Logout
            </Button> */}
      </div>
    </div>
    </>
  );
};

export default Dashboard;
