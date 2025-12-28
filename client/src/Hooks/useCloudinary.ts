import { useState } from "react";
import { toast } from "sonner";

const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

 const uploadFileToCloudinary = async (fileToUpload: File): Promise<string | null> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', 'snapdrop'); 

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dhvvqlsjq/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploading(false);
      setUrl(data.secure_url);
      return data.secure_url; 
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      toast.error('Failed to upload resume');
      return null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file.type === 'application/pdf' || file.type === 'application/msword') {
      setFile(file);
    } else {
      setFile(null);
      toast.error('Only pdf and docx files are supported');
    }
  };

  return {
    uploading,
    file,
    url,
    handleFileChange,
    uploadFileToCloudinary,
  };
};

export default useCloudinaryUpload