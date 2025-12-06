import React, { useEffect } from "react";
import useAuthStore from "./Store/authStore";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes/AppRoutes";
import { Toaster } from "sonner";
const App: React.FC = () => {
  const userId = useAuthStore((state: any) => state.userId);
  const email = useAuthStore((state: any) => state.email);
  const roles = useAuthStore((state: any) => state.roles);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  const initializeAuth = useAuthStore((state: any) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Router>
        <div className="min-h-screen">
          <AppRoutes />
        </div>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
