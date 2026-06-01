import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AssetsTU = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [tuFeedback, setTuFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asset Management
  const [assets, setAssets] = useState([]);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ code: '', name: '', condition: 'GOOD', location: '' });

  useEffect(() => {
    fetchTickets();
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    fetch(`http://localhost:8080/api/assets`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAssets(data);
      })
      .catch(err => console.error(err));
  };

  const fetchTickets = () => {
    fetch(`http://localhost:8080/api/assets/tickets`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTickets(data);
      })
      .catch(err => console.error(err));
  };

  const openForwardModal = (ticket) => {
    setSelectedTicket(ticket);
    setEstimatedCost('');
    setIsForwardModalOpen(true);
  };

  const closeForwardModal = () => {
    setSelectedTicket(null);
    setIsForwardModalOpen(false);
  };

  const openReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setTuFeedback('');
    setIsReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setSelectedTicket(null);
    setIsReplyModalOpen(false);
  };

  const handleForwardToKepsek = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets/tickets/${selectedTicket.id}/forward`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedCost: parseFloat(estimatedCost) })
      });
      if (res.ok) {
        alert("Berhasil diteruskan ke Kepala Sekolah");
        closeForwardModal();
        fetchTickets();
      } else {
        alert("Gagal meneruskan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToGuru = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets/tickets/${selectedTicket.id}/tu-response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: tuFeedback })
      });
      if (res.ok) {
        alert("Berhasil membalas ke Guru");
        closeReplyModal();
        fetchTickets();
      } else {
        alert("Gagal membalas");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadExcel = () => {
    window.open('http://localhost:8080/api/assets/export/excel', '_blank');
  };

  const downloadPpt = () => {
    window.open('http://localhost:8080/api/assets/export/ppt', '_blank');
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });
      if (res.ok) {
        alert("Aset berhasil ditambahkan");
        setIsAddAssetModalOpen(false);
        setNewAsset({ code: '', name: '', condition: 'GOOD', location: '' });
        fetchAssets();
      } else {
        alert("Gagal menambahkan aset");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[24px] p-8 text-white shadow-lg flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard TU - Sarpras</h1>
          <p className="text-emerald-100 text-lg">Kelola pelaporan kerusakan dan estimasi anggaran perbaikan.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadExcel} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl backdrop-blur-sm transition flex items-center gap-2">
            <span>📊</span> Excel Recap
          </button>
          <button onClick={downloadPpt} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl backdrop-blur-sm transition flex items-center gap-2">
            <span>📈</span> PPT Stats
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Daftar Inventaris Induk</h2>
          <button onClick={() => setIsAddAssetModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition">
            + Tambah Aset Baru
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Nama Aset</th>
                <th className="px-6 py-3">Kondisi</th>
                <th className="px-6 py-3">Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{asset.code}</td>
                  <td className="px-6 py-4">{asset.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${asset.condition === 'GOOD' ? 'bg-green-100 text-green-700' : asset.condition === 'BROKEN' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">{asset.location}</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">Belum ada aset terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean Laporan Baru (REPORTED) */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b]">
          <h2 className="text-xl font-bold mb-4 text-[#0f172a] dark:text-white flex items-center justify-between">
            Laporan Baru (Dari Guru)
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{tickets.filter(t => t.status === 'REPORTED').length}</span>
          </h2>
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
            {tickets.filter(t => t.status === 'REPORTED').map(ticket => (
              <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-[#0f172a] dark:text-white">{ticket.asset?.name}</h4>
                  <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Pelapor: {ticket.reporter?.name}</p>
                <p className="text-xs text-[#64748b] mb-4">"{ticket.description}"</p>
                
                {ticket.photoUrl && (
                  <img src={ticket.photoUrl} alt="Kerusakan" className="w-full h-32 object-cover rounded-lg mb-4" />
                )}

                <button 
                  onClick={() => openForwardModal(ticket)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition"
                >
                  Taksir Biaya & Teruskan ke Kepsek
                </button>
              </div>
            ))}
            {tickets.filter(t => t.status === 'REPORTED').length === 0 && <p className="text-center text-gray-500 text-sm">Tidak ada laporan baru.</p>}
          </div>
        </div>

        {/* Antrean Keputusan Kepsek (APPROVED / POSTPONED) */}
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] p-6 border border-[#e2e8f0] dark:border-[#1e293b]">
          <h2 className="text-xl font-bold mb-4 text-[#0f172a] dark:text-white flex items-center justify-between">
            Menunggu Tindak Lanjut TU
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{tickets.filter(t => ['APPROVED', 'POSTPONED'].includes(t.status)).length}</span>
          </h2>
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
            {tickets.filter(t => ['APPROVED', 'POSTPONED'].includes(t.status)).map(ticket => (
              <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-[#0f172a] dark:text-white">{ticket.asset?.name}</h4>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${ticket.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    Kepsek: {ticket.status === 'APPROVED' ? 'DITERIMA' : 'DITUNDA'}
                  </span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-xs mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Pesan Kepala Sekolah:</span>
                  <p className="text-gray-600 dark:text-gray-400 italic">"{ticket.kepsekFeedback}"</p>
                </div>

                <button 
                  onClick={() => openReplyModal(ticket)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition"
                >
                  Beri Info ke Guru / Pelapor
                </button>
              </div>
            ))}
            {tickets.filter(t => ['APPROVED', 'POSTPONED'].includes(t.status)).length === 0 && <p className="text-center text-gray-500 text-sm">Tidak ada tugas tindak lanjut.</p>}
          </div>
        </div>
      </div>

      {/* Modal Teruskan ke Kepsek */}
      {isForwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0f172a] dark:text-white">Teruskan Laporan</h2>
              
              <form onSubmit={handleForwardToKepsek} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">
                    Estimasi Biaya (Rp)
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="Contoh: 150000"
                    required
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={closeForwardModal} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Batal</button>
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Kirim ke Kepsek</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Balas ke Guru */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0f172a] dark:text-white">Balas ke Guru</h2>
              
              <form onSubmit={handleReplyToGuru} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">
                    Pesan untuk Guru (Terkait Status Perbaikan)
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={tuFeedback}
                    onChange={(e) => setTuFeedback(e.target.value)}
                    placeholder="Contoh: Laporan sedang diproses, tukang akan datang besok..."
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={closeReplyModal} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Kirim Balasan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Aset Baru */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0f172a] dark:text-white">Registrasi Aset Baru</h2>
              
              <form onSubmit={handleAddAsset} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">Kode Aset</label>
                  <input type="text" className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.code} onChange={(e) => setNewAsset({...newAsset, code: e.target.value})} placeholder="Contoh: A001" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">Nama Aset</label>
                  <input type="text" className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})} placeholder="Contoh: Proyektor Epson" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">Kondisi</label>
                  <select className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.condition} onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}>
                    <option value="GOOD">BAIK</option>
                    <option value="BROKEN">RUSAK</option>
                    <option value="IN_REPAIR">DALAM PERBAIKAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">Lokasi</label>
                  <input type="text" className="w-full p-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newAsset.location} onChange={(e) => setNewAsset({...newAsset, location: e.target.value})} placeholder="Contoh: Ruang Kelas 10A" required />
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsAddAssetModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Simpan Aset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsTU;
