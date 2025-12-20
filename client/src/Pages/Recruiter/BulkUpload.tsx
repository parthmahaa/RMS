import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload as UploadIcon, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import Button from '../../Components/ui/Button';
import api from '../../utils/api';

const BulkUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/recruiter/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess(true);
      toast.success(response.data.message || 'File uploaded successfully!');
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file. Please try again.';
      toast.error(errorMessage);
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample.xlsx'; 
    link.download = 'sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Bulk Upload
          </h1>
          <p className="text-sm text-gray-500">
            Upload an Excel file to add multiple candidates at once.
          </p>
        </div>

        {/* Instructions Card */}
        <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <AlertCircle size={20} />
              <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-900">
              <p className="text-sm mb-3">
                Please download the sample file and follow the format:
              </p>
              <div className="flex flex-col gap-2 ml-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                  <span className="text-sm font-medium">Green fields are mandatory</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
                  <span className="text-sm font-medium">Blue fields are optional</span>
                </div>
              </div>
            </div>

            <div className="self-start">
              <Button
                id="download-sample-btn"
                variant="outlined"
                onClick={handleDownloadSample}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download Sample File
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`
            p-8 border-2 border-dashed rounded-xl bg-gray-50 transition-all duration-200 ease-in-out
            flex flex-col items-center justify-center gap-4 cursor-pointer
            ${selectedFile ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'}
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <FileSpreadsheet className="w-8 h-8 text-gray-600" />
          </div>

          <div className="text-center space-y-1">
            {selectedFile ? (
              <h3 className="text-lg font-medium text-gray-900">File Selected</h3>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900">
                  Drop your Excel file here
                </h3>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-input"
          />

          {!selectedFile && (
            <Button
              id="browse-file-btn"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-2"
            >
              <UploadIcon size={16} className="mr-2" />
              Browse Files
            </Button>
          )}

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 bg-white p-3 pr-4 rounded-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-200">
              <div className="p-2 bg-green-50 rounded-md">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
             {selectedFile && (
                <Button
                    id='cancel'
                    variant="outlined"
                    onClick={removeFile}
                    disabled={isUploading}
                >
                    Cancel
                </Button>
             )}
            <Button
                id="upload-btn"
                variant="contained" 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                loading={isUploading}
                sx={{ backgroundColor: 'black' }} // Maintaining your generic button style prop
                className="min-w-[120px]"
            >
                {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
        </div>

        {/* Success Message */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-300">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Upload Successful</h4>
              <p className="text-sm text-green-700 mt-1">
                File uploaded successfully! The candidates have been processed and added to the system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;