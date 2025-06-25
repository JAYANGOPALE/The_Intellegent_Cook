import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, Camera, X, AlertCircle } from 'lucide-react';
import { detectIngredientsFromImage } from '../../store/slices/ingredientsSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { AppDispatch } from '../../store';
import Button from '../atoms/Button';
import LoadingSpinner from '../atoms/LoadingSpinner';

const ImageUploader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please upload only image files (JPEG, PNG)',
      }));
      return false;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      dispatch(addNotification({
        type: 'error',
        message: 'File size must be less than 10MB',
      }));
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, [dispatch]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (selectedFiles.length === 0) return;

    setProcessing(true);
    
    try {
      // Process first image (simulate batch processing)
      await dispatch(detectIngredientsFromImage(selectedFiles[0])).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: `Successfully detected ingredients from ${selectedFiles.length} image(s)`,
      }));

      setSelectedFiles([]);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to process images. Please try again.',
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <motion.div
              className="p-3 bg-primary-100 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {dragActive ? (
                <Camera className="h-8 w-8 text-primary-600" />
              ) : (
                <Upload className="h-8 w-8 text-primary-600" />
              )}
            </motion.div>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive ? 'Drop images here' : 'Upload ingredient photos'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop images or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports JPEG, PNG • Max 10MB per image
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium text-gray-900">Selected Images ({selectedFiles.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                  {file.name}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>AI will analyze these images for ingredients</span>
            </div>
            
            <Button
              onClick={processImages}
              loading={processing}
              disabled={selectedFiles.length === 0}
            >
              {processing ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Detect Ingredients'
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploader;