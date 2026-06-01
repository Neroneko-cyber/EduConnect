import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateDisposition = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !receiverId) {
      setStatus({ type: 'error', message: 'Harap isi semua kolom' });
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('senderId', user.id);
      formData.append('receiverId', receiverId);
      
      const fileInput = document.getElementById('file-upload');
      if (fileInput && fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
      }

      const response = await fetch('http://localhost:8080/api/dispositions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // assuming token is stored here
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal mengirim disposisi');

      setStatus({ type: 'success', message: 'Disposisi berhasil dikirim!' });
      setTitle('');
      setDescription('');
      setReceiverId('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-8 shadow-sm border border-[#e2e8f0] dark:border-[#1e293b]">
        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-6">Buat Disposisi Baru</h2>
        
        {status && (
          <div className={`p-4 rounded-xl mb-6 font-semibold border ${status.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="Judul Disposisi" 
            placeholder="Contoh: Pembaruan Kurikulum 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">ID Penerima (UUID)</label>
            <input 
              type="text"
              placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Deskripsi / Instruksi</label>
            <textarea 
              rows="5"
              placeholder="Jelaskan detail penugasan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#334155] dark:text-[#94a3b8]">Lampiran Dokumen (Opsional)</label>
            <input 
              id="file-upload"
              type="file"
              disabled={isLoading}
              className="w-full bg-[#f8fafc] dark:bg-[#1e293b] border-2 border-[#e2e8f0] dark:border-[#334155] rounded-[16px] px-4 py-3 text-[#0f172a] dark:text-white font-medium focus:outline-none focus:border-[#2563eb] transition-colors"
            />
          </div>
          
          <Button type="submit" isLoading={isLoading} className="mt-4">
            Kirim Disposisi
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateDisposition;
