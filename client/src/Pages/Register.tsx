import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../Components/ui/Button"; 
import { Input } from "../Components/ui/Input"; 
import api from "../utils/api"; 
import { OtpVerificationDialog } from "../Components/ui/OtpVerification";
import { User, Briefcase } from "lucide-react";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    else if(formData.phone.length !== 10) newErrors.phone = "Phone number must be 10 digits";
    if (!formData.role) newErrors.role = "A role must be selected";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      
      if (response.data && response.status === 200) {
        toast.success(response.data.message || "Registration successful! Please check your email.");
        setShowOtpDialog(true);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Registration failed");
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
              Create your account
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, role: "CANDIDATE"}))}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.role === "CANDIDATE"
                        ? "border-black bg-black text-white shadow-lg"
                        : "border-gray-300 text-gray-500 hover:border-gray-500"
                    }`}
                  >
                    <User className="w-8 h-8 mb-2" />
                    <span className="font-semibold">Candidate</span>
                    <span className="text-xs">I'm looking for a job</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({...prev, role: "RECRUITER"}))}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.role === "RECRUITER"
                        ? "border-black bg-black text-white shadow-lg"
                        : "border-gray-300 text-gray-500 hover:border-gray-500"
                    }`}
                  >
                    <Briefcase className="w-8 h-8 mb-2" />
                    <span className="font-semibold">Recruiter</span>
                    <span className="text-xs">I'm hiring</span>
                  </button>
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {formData.role === "RECRUITER" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must be your company email (e.g., @company.com)
                  </p>
                )}
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
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
                  placeholder="Create a strong password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                loading={loading}
                variant="primary"
              >
                Create Account
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-gray-900 cursor-pointer hover:underline font-medium"
              >
                Sign in here
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

export default RegisterForm;

