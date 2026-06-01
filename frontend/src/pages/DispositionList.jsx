import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';

const DispositionList = () => {
  const { user } = useAuth();
  const [dispositions, setDispositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispositions = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/dispositions/receiver/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDispositions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDispositions();
  }, [user]);

  const handleDownloadWord = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/dispositions/${id}/export-word`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Disposisi_${id}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download', err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Daftar Tugas Disposisi</h2>
      
      {loading ? (
        <div className="text-center text-slate-500">Memuat...</div>
      ) : (
        <div className="grid gap-4">
          {dispositions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-200 dark:border-slate-700">
              Belum ada tugas disposisi untuk Anda.
            </div>
          ) : (
            dispositions.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      d.status === 'TODO' ? 'bg-amber-100 text-amber-700' :
                      d.status === 'PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Dari: {d.sender?.name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{d.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{d.description}</p>
                  
                  {d.attachmentUrl && (
                    <a href={d.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
                      <FileText size={16} />
                      Lihat Lampiran
                    </a>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleDownloadWord(d.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Download size={16} />
                    <span>Download Surat</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DispositionList;
