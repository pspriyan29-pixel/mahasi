import React, { useState } from 'react';
import { Zap, FileText, Calendar, CheckSquare, Upload, ArrowRight, BarChart2, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function ProduktivitasPage() {
  const [activeTab, setActiveTab] = useState<'summarize' | 'schedule'>('summarize');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');

  const generatePrompt = () => {
    if (activeTab === 'summarize') {
      return `Tolong berikan ringkasan eksekutif dari teks berikut. Format jawabanmu dengan:
1. Ringkasan Eksekutif (1-2 paragraf pendek)
2. Poin Kunci (bullet points)
Gunakan bahasa Indonesia yang profesional.

Teks:
${inputText}`;
    } else {
      return `Tolong ekstrak semua jadwal, tanggal, waktu, meeting, dan tugas dari teks berikut.
Format jawabanmu sebagai daftar urut (bullet points) yang jelas berisi: Tanggal, Waktu, Judul Kegiatan, dan Tipe (Meeting/Tugas).
Jika tidak ada waktu spesifik, estimasikan atau sebutkan "TBA". Gunakan bahasa Indonesia.

Teks:
${inputText}`;
    }
  };

  const handleProcess = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    setOutput('');
    
    try {
      const messages = [{ role: 'user' as const, content: generatePrompt() }];
      
      let fullOutput = '';
      await streamChat(messages, 'fast', (chunk) => {
        fullOutput += chunk.content;
        setOutput(fullOutput);
      }, undefined, 3, undefined, true);
      
    } catch (error) {
      console.error(error);
      setOutput('Error: Gagal terhubung ke AI Engine.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Zap size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Penghemat Waktu (Produktivitas)</h1>
          <p className="text-bp-medium-gray mt-1">Otomatiskan tugas, ringkas dokumen, dan kelola jadwal dengan AI.</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setActiveTab('summarize'); setOutput(''); }}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'summarize' ? 'bg-bp-deep-black text-white' : 'bg-white text-bp-deep-black border border-bp-border-gray hover:bg-bp-light-bg'}`}
        >
          <FileText size={18} /> Ringkas Dokumen
        </button>
        <button 
          onClick={() => { setActiveTab('schedule'); setOutput(''); }}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'schedule' ? 'bg-bp-deep-black text-white' : 'bg-white text-bp-deep-black border border-bp-border-gray hover:bg-bp-light-bg'}`}
        >
          <Calendar size={18} /> Ekstrak Jadwal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="bg-white border border-bp-border-gray rounded-xl p-6 shadow-bp-shadow-raised flex flex-col">
          <h3 className="font-bold text-lg mb-4">Input Data</h3>
          
          <div className="border-2 border-dashed border-bp-border-gray rounded-xl p-8 flex flex-col items-center justify-center text-center mb-6 bg-bp-light-bg hover:border-bp-electric-blue transition-colors cursor-pointer">
            <Upload size={32} className="text-bp-muted-gray mb-3" />
            <div className="font-medium">Upload File (PDF, Word, TXT)</div>
            <div className="text-xs text-bp-medium-gray mt-1">atau drag & drop ke sini</div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-bp-border-gray"></div>
            <div className="text-xs text-bp-medium-gray font-medium">ATAU PASTE TEKS</div>
            <div className="flex-1 h-px bg-bp-border-gray"></div>
          </div>

          <textarea 
            className="bp-textarea flex-1 mb-6" 
            placeholder={activeTab === 'summarize' ? "Paste laporan panjang, artikel, atau transkrip meeting di sini..." : "Paste email panjang yang berisi rencana meeting atau jadwal proyek..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button 
            onClick={handleProcess}
            disabled={isProcessing || !inputText}
            className="bp-btn bp-btn-primary dark-theme w-full justify-center gap-2"
          >
            {isProcessing ? 'Memproses Data...' : (activeTab === 'summarize' ? 'Generate Ringkasan' : 'Ekstrak Jadwal & Tugas')}
            {!isProcessing && <ArrowRight size={16} />}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="bg-bp-light-bg border border-bp-border-gray rounded-xl p-6 shadow-bp-shadow-raised flex flex-col relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BarChart2 size={200} />
          </div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-bold text-lg">Hasil AI</h3>
            {isProcessing && <Loader2 className="animate-spin text-bp-electric-blue" size={16} />}
          </div>

          <div className="flex-1 bg-white rounded-lg border border-bp-border-gray p-6 relative z-10 overflow-y-auto whitespace-pre-wrap">
            {isProcessing && !output ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-bp-border-gray rounded w-3/4"></div>
                <div className="h-4 bg-bp-border-gray rounded w-full"></div>
                <div className="h-4 bg-bp-border-gray rounded w-5/6"></div>
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                  <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                  <div className="h-3 bg-bp-border-gray rounded w-4/5"></div>
                </div>
              </div>
            ) : output ? (
              <div className="text-sm text-bp-deep-black leading-relaxed">
                {output}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-bp-muted-gray text-center px-8">
                <Zap size={48} className="mb-4 opacity-20" />
                <p>Masukkan data di sebelah kiri dan klik proses untuk melihat hasil otomatisasi dari AI.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 relative z-10">
            <button className="bp-btn bp-btn-ghost text-xs" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>Copy</button>
            <button className="bp-btn bp-btn-secondary text-xs h-8 px-4" disabled={!output}>Export PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
