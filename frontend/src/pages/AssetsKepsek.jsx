import React, { useState, useEffect } from 'react';

const AssetsKepsek = () => {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, APPROVED, POSTPONED
  
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isApproving, setIsApproving] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    fetch(`http://localhost:8080/api/assets/tickets`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTickets(data);
      })
      .catch(err => console.error(err));
  };

  const openRespondModal = (ticket, approve) => {
    setSelectedTicket(ticket);
    setIsApproving(approve);
    setFeedback('');
    setIsRespondModalOpen(true);
  };

  const closeRespondModal = () => {
    setSelectedTicket(null);
    setIsRespondModalOpen(false);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/assets/tickets/${selectedTicket.id}/kepsek-response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: isApproving, feedback })
      });
      if (res.ok) {
        alert(isApproving ? "Pengajuan Diterima" : "Pengajuan Ditunda");
        closeRespondModal();
        fetchTickets();
      } else {
        alert("Gagal menyimpan respon");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingTickets = tickets.filter(t => t.status === 'FORWARDED');
  const approvedTickets = tickets.filter(t => t.status === 'APPROVED');
  const postponedTickets = tickets.filter(t => t.status === 'POSTPONED');

  const renderTicketList = (list) => {
    if (list.length === 0) return <p className="text-center text-gray-500 p-4">Tidak ada data.</p>;
    
    return list.map(ticket => (
      <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 mb-3">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-sm text-[#0f172a] dark:text-white">{ticket.asset?.name}</h4>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Rp {ticket.estimatedCost?.toLocaleString('id-ID')}</span>
        </div>
        <p className="text-xs text-[#64748b] mb-1">Pelapor: {ticket.reporter?.name}</p>
        <p className="text-xs text-[#64748b] mb-3 text-justify">"{ticket.description}"</p>

        {activeTab === 'PENDING' && (
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => openRespondModal(ticket, true)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition"
            >
              Terima
            </button>
            <button 
              onClick={() => openRespondModal(ticket, false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition"
            >
              Tunda
            </button>
          </div>
        )}

        {(activeTab === 'APPROVED' || activeTab === 'POSTPONED') && ticket.kepsekFeedback && (
          <div className="mt-2 bg-white dark:bg-gray-900 p-2 rounded text-xs border-l-2 border-gray-400">
            <span className="font-bold">Catatan Anda:</span> {ticket.kepsekFeedback}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[24px] p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2">Persetujuan Sarpras</h1>
        <p className="text-purple-100 text-lg">Konfirmasi anggaran perbaikan aset dari Tata Usaha.</p>
        
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-[#e2e8f0] dark:border-[#1e293b] overflow-hidden">
        <div className="flex border-b border-[#e2e8f0] dark:border-[#1e293b]">
          <button 
            className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors relative ${activeTab === 'PENDING' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Menunggu Konfirmasi
            {pendingTickets.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {pendingTickets.length}
              </span>
            )}
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'APPROVED' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('APPROVED')}
          >
            Diterima
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-sm font-bold text-center border-b-2 transition-colors relative ${activeTab === 'POSTPONED' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('POSTPONED')}
          >
            Ditunda
            {postponedTickets.length > 0 && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {postponedTickets.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'PENDING' && renderTicketList(pendingTickets)}
          {activeTab === 'APPROVED' && renderTicketList(approvedTickets)}
          {activeTab === 'POSTPONED' && renderTicketList(postponedTickets)}
        </div>
      </div>

      {/* Modal Respond */}
      {isRespondModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`h-2 ${isApproving ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0f172a] dark:text-white">
                {isApproving ? 'Terima Pengajuan' : 'Tunda Pengajuan'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Aset: <span className="font-bold">{selectedTicket?.asset?.name}</span><br/>
                Anggaran: <span className="font-bold">Rp {selectedTicket?.estimatedCost?.toLocaleString('id-ID')}</span>
              </p>
              
              <form onSubmit={handleSubmitResponse} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] dark:text-gray-300 mb-2">
                    Catatan / Pesan untuk TU
                  </label>
                  <textarea 
                    className={`w-full p-3 border dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 ${isApproving ? 'focus:ring-emerald-500 border-gray-200 dark:border-gray-700' : 'focus:ring-red-500 border-gray-200 dark:border-gray-700'}`}
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tulis alasan atau catatan tambahan..."
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={closeRespondModal} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition" disabled={isSubmitting}>Batal</button>
                  <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-xl transition ${isApproving ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`} disabled={isSubmitting}>
                    {isApproving ? 'Ya, Terima' : 'Ya, Tunda'}
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

export default AssetsKepsek;
