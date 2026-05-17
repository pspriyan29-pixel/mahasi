import React, { useState } from 'react';
import { Paintbrush, Plane, Music, Camera, Compass, Map, Calendar as CalendarIcon, Music4, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function HobiPage() {
  const [activeHobby, setActiveHobby] = useState('travel');
  
  // Travel State
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('7');
  const [vibe, setVibe] = useState('Santai & Kuliner');
  const [isGeneratingTravel, setIsGeneratingTravel] = useState(false);
  const [travelOutput, setTravelOutput] = useState('');

  // Music State
  const [songTheme, setSongTheme] = useState('');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicOutput, setMusicOutput] = useState('');

  const handleTravelGenerate = async () => {
    if (!destination) return;
    setIsGeneratingTravel(true);
    setTravelOutput('');
    
    try {
      const prompt = `Buatkan itinerary perjalanan ke ${destination} selama ${duration} hari.
Gaya liburan: ${vibe}.
Berikan saran tempat wisata tersembunyi (off the beaten path) dan kuliner lokal. Format dengan markdown, pisahkan per hari dengan jelas.`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'chat', (chunk) => {
        setTravelOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setTravelOutput('Error: Gagal membuat itinerary.');
    } finally {
      setIsGeneratingTravel(false);
    }
  };

  const handleMusicGenerate = async () => {
    if (!songTheme) return;
    setIsGeneratingMusic(true);
    setMusicOutput('');
    
    try {
      const prompt = `Kamu adalah pencipta lagu profesional. Buatkan struktur lagu (Verse, Chorus, Bridge) beserta lirik dan saran progresi chord dasar untuk lagu bertema: "${songTheme}".
Gunakan bahasa Indonesia (atau campuran Inggris jika cocok). Buat lirik yang puitis dan emosional.`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'chat', (chunk) => {
        setMusicOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setMusicOutput('Error: Gagal membuat lagu.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Paintbrush size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Teman Passion (Hobi)</h1>
          <p className="text-bp-medium-gray mt-1">Salurkan minatmu dengan partner AI yang kreatif.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {[
            { id: 'travel', name: 'Travel Planner', icon: <Plane size={18} /> },
            { id: 'music', name: 'Songwriter AI', icon: <Music size={18} /> },
            { id: 'photo', name: 'Photo Prompt Guide', icon: <Camera size={18} /> }
          ].map(hobby => (
            <button 
              key={hobby.id}
              onClick={() => setActiveHobby(hobby.id)}
              className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeHobby === hobby.id ? 'bg-bp-deep-black text-white shadow-bp-shadow-raised scale-105' : 'bg-white text-bp-medium-gray border border-bp-border-gray hover:border-bp-electric-blue'}`}
            >
              {hobby.icon} {hobby.name}
            </button>
          ))}
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3">
          {activeHobby === 'travel' && (
            <div className="bg-white rounded-2xl border border-bp-border-gray shadow-bp-shadow-raised overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-emerald-400 relative p-8 flex items-end">
                <Compass size={120} className="absolute -right-10 -top-10 text-white opacity-20" />
                <h2 className="text-3xl font-bold text-white relative z-10">AI Travel Architect</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="col-span-2">
                    <label className="bp-label">Destinasi</label>
                    <input type="text" className="bp-input" placeholder="Misal: Kyoto, Jepang" value={destination} onChange={e => setDestination(e.target.value)} />
                  </div>
                  <div>
                    <label className="bp-label">Durasi (Hari)</label>
                    <input type="number" className="bp-input" placeholder="7" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <label className="bp-label">Vibe / Style</label>
                    <select className="bp-input" value={vibe} onChange={e => setVibe(e.target.value)}>
                      <option>Santai & Kuliner</option>
                      <option>Petualangan Alam</option>
                      <option>Sejarah & Budaya</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleTravelGenerate}
                  disabled={isGeneratingTravel || !destination}
                  className="bp-btn bp-btn-primary dark-theme w-full h-12 text-base justify-center mb-8 gap-2"
                >
                  {isGeneratingTravel ? <Loader2 className="animate-spin" size={18} /> : null}
                  {isGeneratingTravel ? 'Merencanakan Perjalanan...' : 'Generate Itinerary Unik'}
                </button>

                {/* AI Output Result */}
                {(travelOutput || isGeneratingTravel) && (
                  <div className="border-t border-bp-border-gray pt-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Map size={20} className="text-bp-electric-blue" /> Rencana Perjalanan ke {destination}</h3>
                    <div className="bg-bp-light-bg rounded-xl p-6 border border-bp-border-gray">
                      {isGeneratingTravel && !travelOutput ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-bp-border-gray rounded w-3/4"></div>
                          <div className="h-4 bg-bp-border-gray rounded w-full"></div>
                          <div className="h-4 bg-bp-border-gray rounded w-5/6"></div>
                        </div>
                      ) : (
                        <div className="text-sm text-bp-deep-black leading-relaxed whitespace-pre-wrap">
                          {travelOutput}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeHobby === 'music' && (
            <div className="bg-bp-deep-black text-white rounded-2xl p-8 border border-gray-800 shadow-bp-shadow-raised flex flex-col items-center min-h-[500px] animate-in slide-in-from-bottom-4">
              <Music4 size={64} className="text-bp-electric-blue mb-6" />
              <h2 className="text-3xl font-bold mb-4">AI Songwriter Studio</h2>
              <p className="text-gray-400 max-w-md mb-8 text-center">Pilih genre, masukkan tema cerita Anda, dan biarkan AI menyusun lirik, struktur chord, hingga harmoni untuk lagu pertama Anda.</p>
              
              <div className="flex gap-4 w-full max-w-md mb-8">
                <input 
                  type="text" 
                  className="bp-input bg-gray-900 border-gray-700 text-white flex-1" 
                  placeholder="Tema: Patah hati di stasiun..." 
                  value={songTheme}
                  onChange={e => setSongTheme(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMusicGenerate()}
                />
                <button 
                  onClick={handleMusicGenerate}
                  disabled={isGeneratingMusic || !songTheme}
                  className="bp-btn bp-btn-primary bg-bp-electric-blue hover:bg-blue-600 text-white border-none"
                >
                  {isGeneratingMusic ? <Loader2 className="animate-spin" size={18} /> : 'Buat Lagu'}
                </button>
              </div>

              {(musicOutput || isGeneratingMusic) && (
                <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
                  {isGeneratingMusic && !musicOutput ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-800 rounded w-full"></div>
                      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                      {musicOutput}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeHobby === 'photo' && (
            <div className="bg-bp-light-bg rounded-2xl p-8 border border-bp-border-gray text-center flex flex-col justify-center items-center min-h-[500px]">
               <Camera size={64} className="text-bp-muted-gray mb-6" />
               <h2 className="text-2xl font-bold text-bp-deep-black">Photo Prompt Guide</h2>
               <p className="text-bp-medium-gray mt-2">Segera Hadir: Pelajari cara memotret dengan panduan angle dan lighting dari AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
