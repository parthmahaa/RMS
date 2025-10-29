import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import useAuthStore from "../../Store/authStore";
import { useNavigate } from "react-router-dom";
import type { DashboardData } from "../../Types/types";

interface DashboardLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore((state :any) => state);
    const [dashboardData] = useState<DashboardData | null>(null);
    const fetchDashboardData = async (): Promise<DashboardData> => {
        return null;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            fetchDashboardData();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar dashboardData={dashboardData} />
            <main className="ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
