import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

interface FileUploadModalProps {
  docType: string;
  applicationId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FileUploadModal({ docType, applicationId, onClose, onSuccess }: FileUploadModalProps) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleUpload = async () => {
    if (!file || !applicationId) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('applicationId', applicationId.toString());
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#0a1935] border border-zinc-800 rounded-2xl p-8 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <UploadCloud className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upload Document</h2>
          <p className="text-sm text-zinc-500 font-medium px-4">{docType}</p>
        </div>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center">
              <Check className="text-emerald-500 mb-2" size={32} />
              <p className="text-sm text-zinc-200 font-medium truncate max-w-full px-2">{file.name}</p>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-zinc-300 mb-1 font-medium">Drag & drop your file here</p>
              <p className="text-xs text-zinc-500">or click to browse your folders</p>
              <p className="text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-bold">PDF, PNG, JPG, DOC (Max 10MB)</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-8">
          <button 
            onClick={onClose}
            className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!file || uploading}
            onClick={handleUpload}
            className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Finalize Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
