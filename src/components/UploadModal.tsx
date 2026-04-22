import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../api/axios';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const CATEGORIES = ['Work', 'Personal', 'Certificate', 'Identity'];

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) return;

    setUploading(true);
    setUploadProgress(0);
    setTimeRemaining('Calculating...');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('tags', JSON.stringify(tags));
    formData.append('file', file);

    const startTime = Date.now();

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);

            const timeElapsed = (Date.now() - startTime) / 1000;
            const uploadSpeed = progressEvent.loaded / timeElapsed;
            const bytesRemaining = progressEvent.total - progressEvent.loaded;
            const secondsRemaining = Math.round(bytesRemaining / uploadSpeed);

            if (secondsRemaining > 0 && Number.isFinite(secondsRemaining)) {
              setTimeRemaining(`${secondsRemaining}s remaining`);
            } else if (percentCompleted === 100) {
              setTimeRemaining('Processing on server...');
            }
          }
        }
      });
      setTitle('');
      setTags([]);
      setTagInput('');
      setFile(null);
      setIsDragging(false);
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('File upload failed', error);
      alert('Upload failed. Please check your config.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setTimeRemaining('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-slate-800">Upload Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Degree Certificate"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const newTag = tagInput.trim();
                    if (newTag && !tags.includes(newTag)) {
                      setTags([...tags, newTag]);
                    }
                    setTagInput('');
                  }
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Type a tag and press Enter"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-slate-400 hover:text-slate-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
            <div className="flex items-center justify-center w-full">
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="mb-2 text-sm font-medium text-center px-4 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                    {file ? (
                      <span className="text-slate-800">{file.name}</span>
                    ) : (
                      <span className="text-slate-500">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                      </span>
                    )}
                  </p>
                </div>
                <input required={!file} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          {uploading && (
            <div className="w-full bg-slate-100 rounded-lg p-3 border border-slate-200">
              <div className="flex justify-between items-center mb-1 text-xs text-slate-600 font-medium">
                <span>{uploadProgress}%</span>
                <span>{timeRemaining}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>
    </div>
  );
}
