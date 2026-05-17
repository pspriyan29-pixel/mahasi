import React, { useState } from 'react';
import { Accessibility, FileText, Mic, Volume2, Search, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function AksesPage() {
  const [jargonInput, setJargonInput] = useState('Pihak Kedua dengan ini membebaskan Pihak Pertama dari segala tuntutan hukum yang timbul di kemudian hari atas wanprestasi yang disebabkan oleh force majeure sebagaimana diatur dalam Pasal 1244 dan 1245 KUHPerdata.');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedOutput, setSimplifiedOutput] = useState('');

  const handleSimplify = async () => {
    if (!jargonInput) return;
    setIsSimplifying(true);
    setSimplifiedOutput('');
    
    try {
      const prompt = `Terjemahkan teks hukum/medis/teknis yang penuh jargon berikut menjadi bahasa sehari-hari yang sangat mudah dipahami oleh orang awam (seperti menjelaskan ke anak SMP atau orang tua).
Teks Asli: "${jargonInput}"`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'chat', (chunk) => {
        setSimplifiedOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setSimplifiedOutput('Error: Gagal menyederhanakan teks.');
    } finally {
      setIsSimplifying(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Accessibility size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Pahlawan Empati (Akses Inklusif)</h1>
          <p className="text-bp-medium-gray mt-1">Hancurkan batasan dengan AI yang menyederhanakan bahasa dan alat bantu disabilitas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Jargon Simplifier */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised flex flex-col">
          <div className="p-6 border-b border-bp-border-gray">
            <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen size={20} className="text-bp-electric-blue" /> Penyederhana Bahasa Hukum/Medis</h3>
            <p className="text-sm text-bp-medium-gray mt-2">Ubah teks penuh jargon menjadi bahasa sehari-hari yang mudah dipahami.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <label className="bp-label">Teks Asli (Jargon)</label>
            <textarea 
              className="bp-textarea h-32 mb-4 text-bp-deep-black" 
              placeholder="Paste dokumen hukum, diagnosa medis, atau manual teknis di sini..."
              value={jargonInput}
              onChange={e => setJargonInput(e.target.value)}
            />
            
            <div className="flex justify-center mb-4">
              <button 
                onClick={handleSimplify}
                disabled={isSimplifying || !jargonInput}
                className="bp-btn bp-btn-primary dark-theme rounded-full w-12 h-12 p-0 flex items-center justify-center disabled:opacity-50"
              >
                {isSimplifying ? <Loader2 className="animate-spin text-white" size={20} /> : <ArrowRight size={24} className="rotate-90 md:rotate-0" />}
              </button>
            </div>

            <label className="bp-label">Hasil Terjemahan Bahasa Sehari-hari</label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
              {isSimplifying && !simplifiedOutput ? (
                <div className="space-y-2 animate-pulse">
                   <div className="h-3 bg-green-200 rounded w-full"></div>
                   <div className="h-3 bg-green-200 rounded w-full"></div>
                   <div className="h-3 bg-green-200 rounded w-3/4"></div>
                </div>
              ) : simplifiedOutput ? (
                <p className="text-sm text-green-800 leading-relaxed font-medium whitespace-pre-wrap">
                  "{simplifiedOutput}"
                </p>
              ) : (
                <p className="text-sm text-green-800/50 leading-relaxed font-medium italic">
                  Klik tombol panah untuk menerjemahkan teks di atas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Voice Assistant Toolkit */}
        <div className="flex flex-col gap-8">
          <div className="bg-bp-black text-white rounded-xl shadow-bp-shadow-floating p-8 relative overflow-hidden">
            <Mic size={150} className="absolute -right-10 -top-10 opacity-10 text-bp-electric-blue" />
            <h3 className="font-bold text-xl mb-2 relative z-10">Voice Navigation Assistant</h3>
            <p className="text-gray-400 text-sm mb-6 relative z-10 max-w-sm">Dirancang khusus untuk lansia atau pengguna dengan keterbatasan motorik. Navigasi web dan aplikasi hanya dengan suara.</p>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-bp-electric-blue/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <Mic size={32} className="text-bp-electric-blue" />
              </div>
              <p className="text-white font-medium">"Tolong bacakan berita utama hari ini dengan suara pelan"</p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="w-1 h-3 bg-bp-electric-blue rounded-full animate-pulse"></div>
                <div className="w-1 h-5 bg-bp-electric-blue rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-8 bg-bp-electric-blue rounded-full animate-pulse delay-150"></div>
                <div className="w-1 h-4 bg-bp-electric-blue rounded-full animate-pulse delay-200"></div>
                <div className="w-1 h-2 bg-bp-electric-blue rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-bp-electric-blue rounded-full flex items-center justify-center shrink-0">
               <Volume2 size={32} />
            </div>
            <div>
               <h3 className="font-bold text-lg mb-1">Text-to-Speech Alami</h3>
               <p className="text-sm text-bp-medium-gray mb-3">Teknologi kloning suara yang terdengar seperti manusia asli, cocok untuk alat bantu baca tuna netra.</p>
               <button className="text-sm font-bold text-bp-electric-blue hover:underline">Coba Suara Bahasa Indonesia &rarr;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
