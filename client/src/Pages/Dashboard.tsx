// src/pages/Dashboard.tsx
import useAuthStore from "../Store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { email, roles, isAuthenticated } = useAuthStore((state :any) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Dashboard
      </h1>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p className="text-gray-700 mb-3">
          <strong className="font-semibold">Email:</strong> {email}
        </p>
        <p className="text-gray-700">
          <strong className="font-semibold">Roles:</strong> {roles?.join(", ") || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
