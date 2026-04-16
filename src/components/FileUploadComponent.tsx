/**
 * File Upload Component
 * Allows users to upload assignment files with progress tracking
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface FileUploadProps {
  assignmentId: string;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onSuccess?: (submission: any) => void;
  onError?: (error: string) => void;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage: string;
  successMessage: string;
}

export default function FileUploadComponent({
  assignmentId,
  maxFileSize = 10,
  allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'xlsx'],
  onSuccess,
  onError
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    status: 'idle',
    errorMessage: '',
    successMessage: ''
  });

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (in bytes)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxFileSize}MB limit (uploaded: ${fileSizeInMB.toFixed(2)}MB)`
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();
    
    if (!extension || !allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `File type .${extension} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: validation.error || 'Invalid file'
      }));
      onError?.(validation.error || 'Invalid file');
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'idle', errorMessage: '' }));
      }, 5000);
      return;
    }

    setState(prev => ({
      ...prev,
      file: selectedFile,
      status: 'idle',
      errorMessage: ''
    }));

    // Auto-upload immediately
    await uploadFile(selectedFile);
  };

  /**
   * Upload file to backend
   */
  const uploadFile = async (fileToUpload: File) => {
    setState(prev => ({
      ...prev,
      uploading: true,
      status: 'uploading',
      progress: 0,
      errorMessage: '',
      successMessage: ''
    }));

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setState(prev => ({
            ...prev,
            progress: Math.round(percentComplete)
          }));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const responseData = JSON.parse(xhr.responseText);
          
          setState(prev => ({
            ...prev,
            uploading: false,
            progress: 100,
            status: 'success',
            successMessage: 'File uploaded successfully!',
            file: fileToUpload
          }));

          onSuccess?.(responseData.submission);

          // Reset after 3 seconds
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              status: 'idle',
              file: null,
              successMessage: ''
            }));
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }, 3000);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          throw new Error(errorData.error || 'Upload failed');
        }
      });

      // Handle error
      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      // Send request
      xhr.open('POST', `/api/assignments/${assignmentId}/submit`);
      xhr.send(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        uploading: false,
        status: 'error',
        errorMessage: errorMessage,
        progress: 0
      }));

      onError?.(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'idle',
          errorMessage: ''
        }));
      }, 5000);
    }
  };

  /**
   * Handle manual upload button click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clear selected file
   */
  const handleClear = () => {
    setState(prev => ({
      ...prev,
      file: null,
      status: 'idle',
      errorMessage: '',
      progress: 0
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={allowedTypes.map(type => `.${type}`).join(',')}
        aria-label="Upload assignment file"
      />

      {/* Upload Area */}
      {state.status === 'idle' && !state.file && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 hover:bg-blue-100 transition-colors">
          <button
            onClick={handleUploadClick}
            className="w-full flex flex-col items-center gap-3 cursor-pointer"
            type="button"
          >
            <Upload className="w-10 h-10 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-800">Click to upload file</p>
              <p className="text-sm text-gray-600 mt-1">
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Max {maxFileSize}MB • {allowedTypes.join(', ')}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Uploading State */}
      {state.status === 'uploading' && (
        <div className="border border-blue-300 rounded-lg p-8 bg-blue-50">
          <div className="flex items-center gap-4">
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                Uploading: {state.file?.name}
              </p>
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {state.progress}% complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {state.status === 'success' && state.file && (
        <div className="border border-green-300 rounded-lg p-6 bg-green-50">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">
                ✅ {state.successMessage}
              </p>
              <p className="text-sm text-green-700 mt-1">
                File: <span className="font-mono">{state.file.name}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Size: {(state.file.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={handleClear}
                className="mt-3 text-sm text-green-700 hover:text-green-800 font-medium"
                type="button"
              >
                Upload another file
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.status === 'error' && state.errorMessage && (
        <div className="border border-red-300 rounded-lg p-6 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Upload Failed</p>
              <p className="text-sm text-red-700 mt-1">{state.errorMessage}</p>
              <button
                onClick={handleClear}
                className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
                type="button"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File selected but not uploading */}
      {state.file && state.status === 'idle' && !state.errorMessage && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-800">File Selected</p>
              <p className="text-sm text-gray-600 mt-1">
                {state.file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(state.file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
              type="button"
              aria-label="Clear file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500 mt-3">
        💡 Tip: Accepted formats are {allowedTypes.join(', ')} up to {maxFileSize}MB
      </p>
    </div>
  );
}
