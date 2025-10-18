import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../Store/authStore";
import { toast } from "sonner";
import Button from "../Components/ui/Button";
import { Input } from "../Components/ui/Input";
import api from "../utils/api";

const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post("/auth/login", formData);

    if (response.data) {
      const userData = response.data.data;
      const { token, email, id, roles } = userData;
      
      localStorage.setItem('token', token);
      
      login(email, id.toString(), roles, token);
      toast.success(`Welcome, ${email}!`);
      navigate("/dashboard");
    }
  } catch (error: any) {
    console.error('Login error:', error); // Debug log
    toast.error(error?.response?.data?.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              loading={loading}
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
  );
};

export default LoginForm;