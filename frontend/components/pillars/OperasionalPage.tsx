import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, TrendingUp, Users, MessageSquare, AlertCircle, Search, Star, Loader2, Send } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function OperasionalPage() {
  const [reviewsInput, setReviewsInput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [reviewSummary, setReviewSummary] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Selamat pagi bos. Laporan singkat hari ini: Ada anomali lonjakan pesanan untuk SKU-120 (Kemeja Putih). Sisa stok tinggal 12 pcs.' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSummarize = async () => {
    if (!reviewsInput) return;
    setIsSummarizing(true);
    setReviewSummary('');
    
    try {
      const prompt = `Analisis kumpulan ulasan/feedback berikut. Berikan ringkasan berupa:
1. Kekuatan utama (dengan persentase estimasi)
2. Kelemahan/Keluhan utama
3. Rekomendasi Tindakan Operasional
Gunakan format bullet points dan bahasa Indonesia yang profesional.
Ulasan: ${reviewsInput}`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'research', (chunk) => {
        setReviewSummary(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setReviewSummary('Error: Gagal menganalisis ulasan.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput || isChatting) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setIsChatting(true);
    
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMessage }];
    setChatHistory(newHistory);
    
    try {
      let assistantResponse = '';
      setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);
      
      await streamChat([
        { role: 'system' as const, content: 'Kamu adalah Asisten Operasional Bisnis Neurova. Jawab dengan ringkas, profesional, dan solutif layaknya manajer operasional.' },
        ...newHistory
      ], 'chat', (chunk) => {
        assistantResponse += chunk.content;
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantResponse;
          return updated;
        });
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Error: Sistem operasional sedang offline.';
        return updated;
      });
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Bos Cerdas (Operasional Bisnis)</h1>
          <p className="text-bp-medium-gray mt-1">Dashboard cerdas untuk memantau pesanan, ulasan, dan metrik bisnis.</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Sentimen Pelanggan', value: 'Positif (85%)', trend: '+5%', icon: <Star size={20} className="text-yellow-500" /> },
          { title: 'Risiko Stok Habis', value: '3 Produk', trend: 'Urgent', icon: <AlertCircle size={20} className="text-red-500" /> },
          { title: 'Efisiensi CS', value: '1.2 Jam', trend: '-30mnt', icon: <MessageSquare size={20} className="text-blue-500" /> },
          { title: 'Pertumbuhan', value: 'Rp 24.5M', trend: '+12%', icon: <TrendingUp size={20} className="text-green-500" /> }
        ].map((metric, i) => (
          <div key={i} className="bg-white border border-bp-border-gray rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-bp-medium-gray font-bold uppercase">{metric.title}</div>
              {metric.icon}
            </div>
            <div className="text-2xl font-bold text-bp-deep-black mb-1">{metric.value}</div>
            <div className={`text-xs font-bold ${metric.trend.includes('+') || metric.trend.includes('-') && !metric.trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
              {metric.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Review Summarizer */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised overflow-hidden flex flex-col">
          <div className="p-6 border-b border-bp-border-gray bg-bp-light-bg flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-bp-electric-blue" /> AI Review Summarizer
            </h3>
            <button className="text-bp-electric-blue text-sm font-bold">Sinkronisasi Data</button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <textarea 
                className="bp-textarea h-24 mb-2" 
                placeholder="Paste ulasan pelanggan atau link..." 
                value={reviewsInput}
                onChange={e => setReviewsInput(e.target.value)}
              />
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing || !reviewsInput}
                className="bp-btn bp-btn-primary dark-theme w-full justify-center"
              >
                {isSummarizing ? <Loader2 className="animate-spin" size={16} /> : 'Analisis Ulasan'}
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex-1 overflow-y-auto whitespace-pre-wrap">
              <h4 className="font-bold text-bp-deep-black mb-3 text-sm flex items-center gap-2">
                Kesimpulan AI {isSummarizing && <Loader2 className="animate-spin text-bp-electric-blue" size={14} />}
              </h4>
              
              {isSummarizing && !reviewSummary ? (
                <div className="space-y-2 animate-pulse mt-2">
                   <div className="h-3 bg-blue-200 rounded w-full"></div>
                   <div className="h-3 bg-blue-200 rounded w-full"></div>
                   <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                </div>
              ) : reviewSummary ? (
                <div className="text-sm text-bp-deep-black">
                  {reviewSummary}
                </div>
              ) : (
                <div className="text-sm text-bp-medium-gray italic">
                  Belum ada analisis. Masukkan data ulasan di atas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Operational Chat */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised flex flex-col h-[500px]">
          <div className="p-4 border-b border-bp-border-gray bg-bp-light-bg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-bp-electric-blue flex items-center justify-center text-white"><Briefcase size={16} /></div>
            <div>
              <div className="font-bold text-sm">Asisten Operasional Biz</div>
              <div className="text-xs text-green-600 font-medium">Online • Terhubung dengan Inventory</div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bp-surface-white">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`rounded-lg p-3 max-w-[80%] text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-bp-light-bg rounded-tl-none border border-bp-border-gray' : 'bg-bp-electric-blue text-white rounded-tr-none ml-auto'}`}>
                {msg.content || <Loader2 className="animate-spin" size={16} />}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-bp-border-gray">
            <div className="relative flex gap-2">
              <input 
                type="text" 
                className="bp-input flex-1" 
                placeholder="Tanya tentang stok, laporan..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                disabled={isChatting}
              />
              <button 
                onClick={handleChat}
                disabled={isChatting || !chatInput}
                className="bp-btn bp-btn-primary dark-theme px-3 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
