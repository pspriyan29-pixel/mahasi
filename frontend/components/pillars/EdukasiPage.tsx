import React, { useState } from 'react';
import { GraduationCap, BookOpen, Languages, HelpCircle, ArrowRight, Brain, Lightbulb, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function EdukasiPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'explain' | 'language' | 'homework'>('explain');
  const [targetUsia, setTargetUsia] = useState('Anak 10 Tahun');
  const [format, setFormat] = useState('Analogi Sehari-hari');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');

  const handleExplain = async () => {
    if (!topic) return;
    setIsProcessing(true);
    setOutput('');
    
    try {
      const prompt = `Jelaskan tentang topik "${topic}".
Target pembaca: ${targetUsia}.
Format Penjelasan: ${format}.
Gunakan bahasa Indonesia. Buat penjelasan yang sangat menarik, mudah dipahami sesuai umur, dan akurat. Jangan gunakan XML artifacts.`;

      const messages = [{ role: 'user' as const, content: prompt }];
      
      let fullOutput = '';
      await streamChat(messages, 'chat', (chunk) => {
        fullOutput += chunk.content;
        setOutput(fullOutput);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setOutput('Error: Gagal terhubung ke tutor AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Teman Belajar (Edukasi)</h1>
          <p className="text-bp-medium-gray mt-1">Sederhanakan konsep rumit, bantu PR, dan pelajari bahasa baru.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Nav */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="text-xs font-bold text-bp-muted-gray tracking-wider mb-2">MODE BELAJAR</div>
          {[
            { id: 'explain', icon: <Lightbulb size={18} />, label: 'Jelaskan Konsep Rumit' },
            { id: 'language', icon: <Languages size={18} />, label: 'Tutor Bahasa Asing' },
            { id: 'homework', icon: <HelpCircle size={18} />, label: 'Asisten Pekerjaan Rumah' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setMode(item.id as any); setOutput(''); }}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-left ${mode === item.id ? 'bg-bp-electric-blue text-white shadow-bp-shadow-raised' : 'bg-white text-bp-deep-black hover:bg-bp-light-bg border border-transparent hover:border-bp-border-gray'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="text-bp-electric-blue shrink-0 mt-1" size={18} />
              <div>
                <div className="font-bold text-sm text-bp-electric-blue mb-1">Neurova Study AI</div>
                <div className="text-xs text-bp-medium-gray leading-relaxed">
                  Menyesuaikan gaya bahasa dengan umur dan tingkat pemahaman Anda.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-8">
          
          {mode === 'explain' && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-6">Jelaskan Konsep Rumit</h2>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="bp-label">Apa yang ingin kamu pelajari hari ini?</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="bp-input flex-1 h-12 text-base" 
                      placeholder="Contoh: Teori Relativitas, Quantum Computing, Inflasi Ekonomi..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleExplain()}
                    />
                    <button 
                      onClick={handleExplain}
                      disabled={isProcessing || !topic}
                      className="bp-btn bp-btn-primary dark-theme h-12 px-6 gap-2"
                    >
                      {isProcessing ? 'Menganalisa...' : 'Jelaskan'} {!isProcessing && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="bp-label">Target Usia/Pemahaman</label>
                    <select className="bp-input" value={targetUsia} onChange={e => setTargetUsia(e.target.value)}>
                      <option>Anak 10 Tahun</option>
                      <option>Remaja SMA</option>
                      <option>Mahasiswa Universitas</option>
                      <option>Ahli (Expert)</option>
                    </select>
                  </div>
                  <div>
                    <label className="bp-label">Format Penjelasan</label>
                    <select className="bp-input" value={format} onChange={e => setFormat(e.target.value)}>
                      <option>Analogi Sehari-hari</option>
                      <option>Poin-poin Singkat</option>
                      <option>Cerita Pendek</option>
                      <option>Metode Feynman</option>
                    </select>
                  </div>
                </div>
                
                {/* Output Area */}
                {(output || isProcessing) && (
                  <div className="mt-4 border-t border-bp-border-gray pt-6">
                    <div className="bg-bp-light-bg rounded-xl p-6 border border-bp-border-gray relative min-h-[150px]">
                      <div className="absolute top-0 right-0 bg-bp-soft-gray text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-2">
                        Output AI {isProcessing && <Loader2 className="animate-spin text-bp-electric-blue" size={12} />}
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-bp-electric-blue">
                        <BookOpen size={20} />
                        <span className="font-bold">{topic || 'Konsep'} (Untuk {targetUsia})</span>
                      </div>
                      
                      {isProcessing && !output ? (
                         <div className="space-y-4 animate-pulse mt-4">
                           <div className="h-4 bg-bp-border-gray rounded w-3/4"></div>
                           <div className="h-4 bg-bp-border-gray rounded w-full"></div>
                           <div className="h-4 bg-bp-border-gray rounded w-5/6"></div>
                         </div>
                      ) : (
                         <div className="text-sm text-bp-deep-black leading-relaxed whitespace-pre-wrap">
                           {output}
                         </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'language' && (
            <div className="animate-in fade-in slide-in-from-right-4">
               <h2 className="text-xl font-bold mb-6">Tutor Bahasa Asing</h2>
               <div className="text-center py-20 text-bp-medium-gray border-2 border-dashed border-bp-border-gray rounded-xl bg-bp-light-bg">
                 <Languages size={48} className="mx-auto mb-4 opacity-50 text-bp-electric-blue" />
                 <p className="font-medium">Modul Pembelajaran Bahasa Interaktif</p>
                 <p className="text-sm mt-2 max-w-sm mx-auto">Fitur ini akan segera diintegrasikan dengan AI Voice engine.</p>
                 <button className="bp-btn bp-btn-primary dark-theme mt-6 opacity-50 cursor-not-allowed">Segera Hadir</button>
               </div>
            </div>
          )}

          {mode === 'homework' && (
            <div className="animate-in fade-in slide-in-from-right-4">
               <h2 className="text-xl font-bold mb-6">Asisten Pekerjaan Rumah</h2>
               <div className="text-center py-20 text-bp-medium-gray border-2 border-dashed border-bp-border-gray rounded-xl bg-bp-light-bg">
                 <HelpCircle size={48} className="mx-auto mb-4 opacity-50 text-bp-electric-blue" />
                 <p className="font-medium">Upload Soal atau Foto Tugas</p>
                 <p className="text-sm mt-2 max-w-sm mx-auto">Fitur Vision AI (OCR) sedang dalam tahap sinkronisasi model.</p>
                 <button className="bp-btn bp-btn-primary dark-theme mt-6 opacity-50 cursor-not-allowed">Upload Tugas (Coming Soon)</button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
