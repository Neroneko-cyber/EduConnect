import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AssetsGuru = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchMyTickets();
  }, [user]);

  const fetchAssets = (keyword = '') => {
    fetch(`http://localhost:8080/api/assets/search?keyword=${keyword}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAssets(data);
      })
      .catch(err => console.error(err));
  };

  const fetchMyTickets = () => {
    if(!user) return;
    fetch(`http://localhost:8080/api/assets/tickets/reporter/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTickets(data);
      })
      .catch(err => console.error(err));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssets(search);
  };

  const openReportModal = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const closeReportModal = () => {
    setSelectedAsset(null);
    setDescription('');
    setPhoto(null);
    setIsModalOpen(false);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!description) {
      alert("Deskripsi kerusakan wajib diisi");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('assetId', selectedAsset.id);
    formData.append('reporterId', user.id);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const res = await fetch(`http://localhost:8080/api/assets/tickets`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert("Laporan berhasil dikirim");
        closeReportModal();
        fetchMyTickets();
        fetchAssets(search); // refresh asset condition
      } else {
        alert("Gagal mengirim laporan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[24px] p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Sarana Prasarana</h1>
        <p className="text-blue-100 text-lg">Cari aset ruangan dan laporkan kerusakan fasilitas sekolah.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Pencarian Aset */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b]">
          <h2 className="text-xl font-bold mb-4 text-[#0f172a] dark:text-white">Daftar Aset</h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Cari nama atau kode aset..." 
              className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition">
              Cari
            </button>
          </form>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {assets.map(asset => (
              <div key={asset.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-[#0f172a] dark:text-white">{asset.name} <span className="text-xs text-gray-500">({asset.code})</span></h4>
                  <p className="text-xs text-[#64748b]">Lokasi: {asset.location}</p>
                  <p className="text-xs text-[#64748b]">Status: {asset.condition}</p>
                </div>
                {asset.condition === 'GOOD' && (
                  <button 
                    onClick={() => openReportModal(asset)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md transition"
                  >
                    Lapor Rusak
                  </button>
                )}
              </div>
            ))}
            {assets.length === 0 && <p className="text-center text-gray-500 text-sm">Tidak ada aset ditemukan.</p>}
          </div>
        </div>

        {/* Kolom Riwayat Laporan */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b]">
          <h2 className="text-xl font-bold mb-4 text-[#0f172a] dark:text-white">Riwayat Laporan Saya</h2>
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-orange-50/30 dark:bg-orange-900/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-[#0f172a] dark:text-white">{ticket.asset?.name}</h4>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                    ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'POSTPONED' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mb-2">{ticket.description}</p>
                {ticket.tuFeedback && (
                  <div className="mt-2 bg-white dark:bg-gray-800 p-2 rounded-lg text-xs border-l-2 border-blue-500">
                    <span className="font-bold text-blue-600">Pesan dari TU:</span> {ticket.tuFeedback}
                  </div>
                )}
              </div>
            ))}
            {tickets.length === 0 && <p className="text-center text-gray-500 text-sm">Belum ada laporan.</p>}
          </div>
        </div>
      </div>

      {/* Modal Lapor Rusak */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-[#0f172a] dark:text-white">Lapor Kerusakan Aset</h2>
              <p className="text-sm text-gray-500 mb-6">Laporkan kerusakan untuk aset: <span className="font-bold text-gray-800 dark:text-gray-200">{selectedAsset?.name} ({selectedAsset?.code})</span></p>
              
              <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">
                    Deskripsi Kerusakan
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan bagian apa yang rusak..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">
                    Lampirkan Foto (Opsional)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-blue-400"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={closeReportModal}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsGuru;
