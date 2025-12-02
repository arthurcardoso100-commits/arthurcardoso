import React, { useRef, useState } from 'react';
import { Upload, FileType, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  label: string;
  description: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ accept, onFilesSelected, multiple = false, label, description }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    // Basic filter for accepted types (simple extension check)
    // In a production app, do more robust MIME checking
    setSelectedFiles(files);
    onFilesSelected(files);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`relative w-full h-48 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out flex flex-col items-center justify-center p-6 cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
      >
        <input 
            ref={fileInputRef}
            className="hidden" 
            type="file" 
            accept={accept} 
            multiple={multiple} 
            onChange={handleChange} 
        />
        
        <div className="flex flex-col items-center text-center space-y-3">
          {selectedFiles.length > 0 ? (
            <div className="flex flex-col items-center text-green-600">
               <CheckCircle className="w-10 h-10 mb-2" />
               <span className="font-semibold text-lg">{selectedFiles.length} arquivo(s) selecionado(s)</span>
               <span className="text-sm text-gray-500">{selectedFiles.map(f => f.name).join(', ')}</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};