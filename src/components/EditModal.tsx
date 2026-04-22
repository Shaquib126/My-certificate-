import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { api } from '../api/axios';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSuccess: () => void;
  documentData: { _id: string; title: string; tags?: string[] } | null;
}

export default function EditModal({ isOpen, onClose, onEditSuccess, documentData }: EditModalProps) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (documentData && isOpen) {
      setTitle(documentData.title);
      setTags(documentData.tags || []);
      setTagInput('');
    }
  }, [documentData, isOpen]);

  if (!isOpen || !documentData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSaving(true);
    try {
      await api.patch(`/documents/${documentData._id}`, {
        title,
        tags
      });
      onEditSuccess();
      onClose();
    } catch (error) {
      console.error('Document update failed', error);
      alert('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-slate-800">Edit Document</h2>
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

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-4"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
