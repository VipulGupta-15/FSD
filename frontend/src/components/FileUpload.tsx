import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, CheckCircle } from 'lucide-react';
import FuturisticButton from './FuturisticButton';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  label = 'Drag & drop your file here, or click to browse',
  accept = 'application/pdf', // Updated to correct MIME type
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > maxSize) {
        setError(`File size exceeds the ${maxSize / (1024 * 1024)}MB limit`);
        return;
      }
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [], // Correct MIME type for PDFs
    },
    maxSize,
    multiple: false,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-neonCyan bg-neonCyan/5' : 'border-gray-500/50 hover:border-neonCyan/50'
        } ${error ? 'border-neonPink/50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center bg-neonCyan/10 rounded-full px-4 py-2 mb-3">
              <FileText className="text-neonCyan mr-2" size={20} />
              <span className="text-softWhite font-medium truncate max-w-[200px]">
                {file.name}
              </span>
              <button 
                onClick={clearFile}
                className="ml-2 text-neonPink hover:text-neonPink/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center text-neonCyan">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">File ready for upload</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload 
              className={`${
                isDragActive ? 'text-neonCyan animate-bounce' : 'text-gray-400'
              } mb-3`} 
              size={40}
            />
            <p className="text-softWhite/80 mb-2">{label}</p>
            <p className="text-sm text-gray-400">
              Supported format: PDF (Max {maxSize / (1024 * 1024)}MB)
            </p>
            
            <FuturisticButton
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={(e) => e.stopPropagation()}
              type="button"
            >
              Browse Files
            </FuturisticButton>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-neonPink text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;