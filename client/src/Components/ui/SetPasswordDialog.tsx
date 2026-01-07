import { useState } from "react";
import { toast } from "sonner";
import { X, KeyRound, Lock, Send } from "lucide-react";
import Button from "./Button"; //
import Input from "./Input"; //
import api from "../../utils/api";

interface Props {
  email: string;
  onClose: () => void;
}

export const SetPasswordDialog = ({ email, onClose }: Props) => {
  const [formData, setFormData] = useState({ otp: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/activate-account", {
        email: email,
        otp: formData.otp,
        password: formData.password
      });
      toast.success("Account activated! Please login with your new password.");
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Activate Account</h3>
          <p className="text-sm text-gray-500 mt-2">
            An OTP has been sent to <b>{email}</b>. Please enter it below to set your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Enter OTP"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              required
              className="text-center tracking-widest font-mono text-lg"
            />
            <div className="pt-2">
              <Input
                type="password"
                label="New Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="pt-2">
              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" loading={loading} className="w-full bg-black hover:bg-gray-800">
              Activate & Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};