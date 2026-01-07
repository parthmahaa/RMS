import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";
import useAuthStore from "../../Store/authStore";
import Button from "../../Components/ui/Button"; 
import { Loader2 } from "lucide-react";
import Input  from "../../Components/ui/Input";

interface OtpVerificationDialogProps {
  email: string;
  onClose: () => void;
}

export const OtpVerificationDialog: React.FC<OtpVerificationDialogProps> = ({ email, onClose }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      
      const { token, userId, roles, isProfileComplete } = response.data.data;

      login(email, userId.toString(), roles, token, isProfileComplete);
      
      toast.success(response.data.message || "Verification successful!");
      
      if (isProfileComplete) {
        navigate("/dashboard");
      } else {
        const profilePath = roles.includes("CANDIDATE") ? "/profile" : "/company-profile";
        navigate(profilePath);
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const response = await api.post("/auth/resend-otp", { email });
      toast.success(response.data.message || "New OTP sent!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center bg-opacity-60">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Check your email
        </h2>
        <p className="text-center text-gray-600 mt-2">
          We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>
          
          <Button
            id="submit"
            onClick={handleVerify}
            loading={loading}
            disabled={loading || otp.length !== 6}
            className="w-full"
            variant="contained"
          >
            Verify Account
          </Button>

          <div className="text-sm mt-2 text-center">
            <Button
            id="resend"
              onClick={handleResend}
              disabled={resendLoading}
              variant="outlined"
              size="small"
              className="border-none shadow-none text-gray-600 hover:text-black"
            >
              {resendLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Didn't get a code? Resend"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
            <Button
              id="cancel"
              onClick={onClose}
              variant="contained"
              size="small"
              className="border-none text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
      </div>
    </div>
  );
};
