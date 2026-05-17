import React, { useState, useRef, useEffect } from 'react';
import { Heart, Activity, Coffee, Moon, Sun, Wind, Loader2, Send } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function KesejahteraanPage() {
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hai. Aku perhatikan dari data smartwatch-mu, detak jantungmu agak tinggi siang ini saat ada meeting maraton. Bagaimana perasaanmu sekarang? Ingin cerita?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
      
      const promptContext = `Kamu adalah Jurnal Refleksi AI Neurova. Kamu bertindak sebagai pendengar yang empatik, suportif, dan membantu pengguna merefleksikan emosi serta mengurangi stres mereka. Berikan balasan yang hangat dan suportif, bukan seperti robot. Gunakan bahasa Indonesia yang nyaman.`;
      
      await streamChat([
        { role: 'system' as const, content: promptContext },
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
        updated[updated.length - 1].content = 'Error: Gagal terhubung ke layanan AI Kesejahteraan.';
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
          <Heart size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Pendamping Zen (Kesejahteraan)</h1>
          <p className="text-bp-medium-gray mt-1">Fokus untuk menjadi versi terbaik dirimu dengan refleksi AI.</p>
        </div>
      </div>

      {/* Wellness Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white rounded-2xl p-6 border border-bp-border-gray shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center"><Activity size={24} /></div>
            <div>
               <div className="text-xs font-bold text-bp-medium-gray uppercase mb-1">Skor Kebugaran</div>
               <div className="text-2xl font-bold text-bp-deep-black">82/100</div>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-bp-border-gray shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Moon size={24} /></div>
            <div>
               <div className="text-xs font-bold text-bp-medium-gray uppercase mb-1">Kualitas Tidur</div>
               <div className="text-2xl font-bold text-bp-deep-black">7.5 Jam</div>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-bp-border-gray shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center"><Coffee size={24} /></div>
            <div>
               <div className="text-xs font-bold text-bp-medium-gray uppercase mb-1">Level Stres AI</div>
               <div className="text-2xl font-bold text-bp-deep-black">Rendah</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reflection Journal */}
        <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised flex flex-col h-[500px] overflow-hidden">
           <div className="p-6 border-b border-bp-border-gray flex justify-between items-center bg-bp-light-bg">
              <h3 className="font-bold text-lg">Jurnal Refleksi Interaktif</h3>
              <span className="text-xs bg-bp-electric-blue text-white px-2 py-1 rounded-full font-bold">Terjaga Privasi</span>
           </div>
           <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="text-center text-bp-medium-gray text-xs font-bold my-2">HARI INI</div>
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={`rounded-xl p-4 text-sm w-4/5 ${msg.role === 'assistant' ? 'bg-bp-light-bg border border-bp-border-gray' : 'bg-bp-electric-blue text-white ml-auto'}`}>
                   {msg.content ? <div className="whitespace-pre-wrap">{msg.content}</div> : <Loader2 className="animate-spin" size={16} />}
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <div className="p-4 border-t border-bp-border-gray bg-white flex gap-2">
              <input 
                type="text" 
                className="bp-input flex-1" 
                placeholder="Ketik balasan Anda di sini..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                disabled={isChatting}
              />
              <button 
                onClick={handleChat}
                disabled={isChatting || !chatInput}
                className="bp-btn bp-btn-primary dark-theme px-4"
              >
                <Send size={16} />
              </button>
           </div>
        </div>

        {/* Workout & Meditation */}
        <div className="flex flex-col gap-6">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-bp-shadow-floating p-8 text-white relative overflow-hidden">
              <Wind size={120} className="absolute -right-5 -bottom-5 opacity-20" />
              <h3 className="font-bold text-2xl mb-2 relative z-10">Sesi Meditasi AI</h3>
              <p className="text-indigo-100 text-sm mb-6 max-w-sm relative z-10">AI akan membacakan narasi meditasi yang disesuaikan dengan kondisi emosionalmu hari ini.</p>
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 py-3 rounded-lg flex items-center gap-2 relative z-10 transition-colors">
                 Mulai Sesi 5 Menit <Sun size={18} />
              </button>
           </div>

           <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised p-6 flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg mb-1">Pengatur Latihan Fisik Personal</h3>
              <p className="text-sm text-bp-medium-gray mb-6">Jadwal yang dibuat spesifik berdasarkan tujuan dan waktu luangmu.</p>
              
              <div className="space-y-3">
                 {[
                   { day: 'Senin', type: 'Yoga Ringan', time: '15 Mnt', done: true },
                   { day: 'Rabu', type: 'Cardio Core', time: '30 Mnt', done: false },
                   { day: 'Jumat', type: 'Strength Training', time: '45 Mnt', done: false }
                 ].map(workout => (
                   <div key={workout.day} className={`flex items-center justify-between p-3 rounded-lg border ${workout.done ? 'bg-bp-light-bg border-bp-border-gray opacity-60' : 'bg-white border-bp-border-gray'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${workout.done ? 'bg-green-500 border-green-500 text-white' : 'border-bp-border-gray'}`}>
                            {workout.done && <Activity size={12} />}
                         </div>
                         <span className="font-bold text-sm">{workout.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs text-bp-medium-gray">{workout.day} • {workout.time}</span>
                         <button className="text-bp-electric-blue text-xs font-bold hover:underline">Lihat Detail</button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
