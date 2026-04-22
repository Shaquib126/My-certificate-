import React, { useEffect, useState } from 'react';
import { Trash2, FileText, Download, Plus, Search, User, Image as ImageIcon, FileArchive, FileSpreadsheet, FileCode, File, FileVideo, FileAudio, Eye, X, Edit2 } from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/UploadModal';
import EditModal from '../components/EditModal';

interface Document {
  _id: string;
  title: string;
  category: string;
  cloudinaryUrl: string;
  createdAt: string;
  fileType?: string;
  tags?: string[];
}

const getFileIcon = (doc: Document) => {
  const ext = (doc.fileType || doc.cloudinaryUrl.split('.').pop() || doc.title.split('.').pop() || '').toLowerCase();
  
  switch (ext) {
    case 'pdf': return FileText;
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': case 'svg': 
      return ImageIcon;
    case 'mp4': case 'webm': case 'mov': 
      return FileVideo;
    case 'mp3': case 'wav': 
      return FileAudio;
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': 
      return FileArchive;
    case 'csv': case 'xls': case 'xlsx': 
      return FileSpreadsheet;
    case 'doc': case 'docx': 
      return FileText;
    case 'js': case 'ts': case 'html': case 'css': case 'json': 
      return FileCode;
    default: 
      return File;
  }
};

const isPreviewable = (doc: Document) => {
  const ext = (doc.fileType || doc.cloudinaryUrl.split('.').pop() || doc.title.split('.').pop() || '').toLowerCase();
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(docs => docs.filter(doc => doc._id !== id));
    } catch (error) {
       alert('Delete failed');
    }
  };

  const categoryStyles: Record<string, { badge: string, icon: string }> = {
    Work: {
      badge: 'bg-indigo-50 text-indigo-600',
      icon: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    },
    Identity: {
      badge: 'bg-green-50 text-green-600',
      icon: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    },
    Certificate: {
      badge: 'bg-amber-50 text-amber-600',
      icon: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    },
    Personal: {
      badge: 'bg-slate-50 text-slate-600',
      icon: 'bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white',
    },
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DocVault</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium transition-colors">All Documents</button>
          <div className="pt-4 pb-2 px-4 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Categories</div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">Work</button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">Personal</button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">Certificate</button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">Identity</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-96 hidden sm:block">
             <input type="text" placeholder="Search documents..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <div className="sm:hidden"></div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Upload New</span>
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                <div onClick={logout} className="text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Log out</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center cursor-pointer" onClick={logout}>
                <User className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Your Document Vault</h1>
          </div>

          {loading ? (
             <div className="text-center py-20 text-slate-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-24 bg-white border border-slate-200 items-center justify-center rounded-2xl flex flex-col shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">No documents yet</h3>
              <p className="text-slate-500 mb-4 max-w-sm">You haven't uploaded any personal or work documents yet. Add your first file to get started.</p>
               <button onClick={() => setModalOpen(true)} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                 Upload your first document &rarr;
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => {
                const IconComponent = getFileIcon(doc);
                return (
                  <div key={doc._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-all shadow-sm group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-lg transition-colors ${categoryStyles[doc.category]?.icon || 'bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingDoc(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors bg-white border border-transparent hover:border-blue-100"
                          title="Edit Document"
                        >
                          <Edit2 size={14} />
                        </button>
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wide ${categoryStyles[doc.category]?.badge || 'bg-slate-100 text-slate-700'}`}>
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">Added {new Date(doc.createdAt).toLocaleDateString()}</p>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-5">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between gap-2">
                      {isPreviewable(doc) && (
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm"
                        >
                          <Eye size={14} /> Preview
                        </button>
                      )}
                      <a 
                        href={doc.cloudinaryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!window.confirm('Are you sure you want to download this file?')) {
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100 bg-white shadow-sm"
                        title="Download Document"
                      >
                        <Download size={14} /> {!isPreviewable(doc) && 'Download'}
                      </a>
                      <button 
                        onClick={() => handleDelete(doc._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100 bg-white"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onUploadSuccess={fetchDocuments} 
      />

      <EditModal
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        onEditSuccess={fetchDocuments}
        documentData={editingDoc}
      />

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800 line-clamp-1">{previewDoc.title}</h2>
              <button onClick={() => setPreviewDoc(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shrink-0 ml-4">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center">
              {(previewDoc.fileType?.toLowerCase() === 'pdf' || previewDoc.cloudinaryUrl.toLowerCase().includes('.pdf')) ? (
                <iframe 
                  src={previewDoc.cloudinaryUrl} 
                  className="w-full h-[75vh] rounded border border-slate-200 bg-white"
                  title={previewDoc.title}
                />
              ) : (
                <img 
                  src={previewDoc.cloudinaryUrl} 
                  alt={previewDoc.title} 
                  className="max-w-full max-h-[75vh] object-contain rounded drop-shadow-sm" 
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
