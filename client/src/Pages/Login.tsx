import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../Store/authStore";
import { toast } from "sonner";
import Button from "../Components/ui/Button";
import Input  from "../Components/ui/Input";
import api from "../utils/api";
import {OtpVerificationDialog} from "../Components/ui/OtpVerification";

const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data?.data) {
        const { token, userId, email, name, roles, isProfileComplete } = response.data.data;

        login(email, userId.toString(), roles, token, isProfileComplete);
        toast.success(`Welcome back, ${name || email}!`); 

          navigate("/dashboard");
      } else {
        throw new Error("Login failed.");
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage = error?.response?.data?.message || "Login failed. Please try again.";

      if (errorMessage.includes("Account is not verified")) {
        toast.info(errorMessage); 
        setShowOtpDialog(true);   
      } else {
        toast.error(errorMessage);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <Button
                id="sign_in"
                type="submit"
                disabled={loading}
                className="w-full"
                loading={loading}
                variant="contained" 
                sx={{backgroundColor: "black"}}
              >
                Sign In
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-gray-900 cursor-pointer hover:underline font-medium"
              >
                Register here
              </span>
            </div>
          </form>
        </div>
      </div>

      {showOtpDialog && (
        <OtpVerificationDialog
          email={formData.email} 
          onClose={() => setShowOtpDialog(false)} 
        />
      )}
    </>
  );
};

export default LoginForm;