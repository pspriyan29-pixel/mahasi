import React, { useState } from 'react';
import { Gamepad2, Send, Play, Users, Trophy, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function GamePage() {
  const [prompt, setPrompt] = useState('');
  const [gameType, setGameType] = useState('Text Adventure (RPG)');
  const [audience, setAudience] = useState('Semua Umur');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant'|'system', content: string}[]>([]);
  const [playerInput, setPlayerInput] = useState('');

  const generateSystemPrompt = () => {
    return `You are DUNGEON MASTER AI. You are a game engine for a ${gameType} game. The target audience is ${audience}. The user wants the theme to be: "${prompt}".
    Generate a compelling introduction, describe the setting vividly, and provide 3 choices (A, B, C) for the player to begin their journey.
    Format your output cleanly. Use Markdown but keep it suitable for a retro terminal interface. DO NOT use XML artifacts. Respond in Indonesian unless requested otherwise.`;
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setOutput('');
    setChatHistory([]);
    
    try {
      const messages = [
        { role: 'system' as const, content: generateSystemPrompt() },
        { role: 'user' as const, content: 'Mulai permainan.' }
      ];
      
      let fullOutput = '';
      await streamChat(messages, 'chat', (chunk) => {
        fullOutput += chunk.content;
        setOutput(fullOutput);
      }, undefined, 3, undefined, true);
      
      setChatHistory([...messages, { role: 'assistant', content: fullOutput }]);
    } catch (error) {
      console.error(error);
      setOutput('Error: Gagal terhubung ke AI Engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayerAction = async () => {
    if (!playerInput || isGenerating) return;
    
    const newAction = playerInput;
    setPlayerInput('');
    setIsGenerating(true);
    
    const currentHistory = [...chatHistory, { role: 'user' as const, content: newAction }];
    setChatHistory(currentHistory);
    setOutput(prev => prev + `\n\n> ${newAction}\n\n`);
    
    try {
      let fullOutput = '';
      await streamChat(currentHistory, 'chat', (chunk) => {
        fullOutput += chunk.content;
        // Append incrementally to output view
        setOutput(prev => {
          const split = prev.split(`> ${newAction}\n\n`);
          return split[0] + `> ${newAction}\n\n` + fullOutput;
        });
      }, undefined, 3, undefined, true);
      
      setChatHistory([...currentHistory, { role: 'assistant', content: fullOutput }]);
    } catch (error) {
      setOutput(prev => prev + '\n\nError processing your move.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Gamepad2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Pembuat Keseruan (Game)</h1>
          <p className="text-bp-medium-gray mt-1">Ubah imajinasimu jadi permainan interaktif dengan AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls & Input */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-bp-border-gray rounded-xl p-6 shadow-bp-shadow-raised">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Settings size={18} className="text-bp-electric-blue" />
              Game Builder
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="bp-label">Tipe Permainan</label>
                <select className="bp-input" value={gameType} onChange={e => setGameType(e.target.value)}>
                  <option>Text Adventure (RPG)</option>
                  <option>Trivia Lokal</option>
                  <option>Escape Room</option>
                  <option>Mystery Detective</option>
                </select>
              </div>
              
              <div>
                <label className="bp-label">Target Audiens</label>
                <select className="bp-input" value={audience} onChange={e => setAudience(e.target.value)}>
                  <option>Semua Umur</option>
                  <option>Remaja</option>
                  <option>Dewasa (Kompleks)</option>
                </select>
              </div>

              <div>
                <label className="bp-label">Tema / Konsep Utama</label>
                <textarea 
                  className="bp-textarea" 
                  placeholder="Misal: Bertahan hidup di hutan mistis pulau Jawa dengan elemen mitologi..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="bp-btn bp-btn-primary dark-theme w-full justify-center gap-2"
              >
                {isGenerating && chatHistory.length === 0 ? 'Membangun Dunia...' : 'Generate Game Engine'}
                {!isGenerating && <Play size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="bg-bp-light-bg border border-bp-border-gray rounded-xl p-6">
            <h3 className="font-bold text-sm mb-4">Template Populer</h3>
            <div className="space-y-3">
              {[
                { title: 'Tebak Sejarah Nusantara', users: '1.2k', p: 'Kuis interaktif tentang sejarah kemerdekaan Indonesia' },
                { title: 'Cyberpunk Jakarta 2077', users: '856', p: 'RPG survival di Jakarta versi futuristik dan dystopian' },
                { title: 'Misteri Vila Kosong', users: '2.4k', p: 'Escape room mencari jalan keluar dari vila angker' }
              ].map((tpl, i) => (
                <div key={i} onClick={() => setPrompt(tpl.p)} className="flex items-center justify-between p-3 bg-white border border-bp-border-gray rounded-lg cursor-pointer hover:border-bp-electric-blue transition-colors">
                  <div className="text-sm font-medium">{tpl.title}</div>
                  <div className="flex items-center gap-1 text-xs text-bp-medium-gray">
                    <Users size={12} /> {tpl.users}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview / Engine */}
        <div className="lg:col-span-2">
          <div className="bg-bp-surface-deep-dark rounded-xl shadow-bp-shadow-floating overflow-hidden h-full min-h-[600px] flex flex-col font-mono text-sm border border-bp-surface-subtle-border">
            {/* Window Header */}
            <div className="bg-bp-surface-dark border-b border-gray-800 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="font-bold ml-2">Neurova Game Engine v2.0</span>
              </div>
              <div className="flex gap-2">
                {isGenerating && <Loader2 className="animate-spin text-bp-electric-blue" size={16} />}
                <span className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">FPS: 60</span>
                <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-800">READY</span>
              </div>
            </div>

            {/* Game Content Area */}
            <div className="flex-1 p-6 text-gray-300 overflow-y-auto space-y-6 whitespace-pre-wrap">
              {!output && !isGenerating && chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Trophy size={48} className="text-yellow-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white tracking-widest">DUNGEON MASTER AI</h2>
                  <p className="text-gray-500 mt-2">Menunggu instruksi permulaan dunia...</p>
                </div>
              )}

              {isGenerating && chatHistory.length === 0 ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ) : (
                output && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <p className="text-green-400 mb-4">» System Initialized.</p>
                    {output}
                  </div>
                )
              )}
            </div>

            {/* Terminal Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center gap-3">
              <span className="text-bp-electric-blue font-bold">~ $</span>
              <input 
                type="text" 
                className="flex-1 bg-transparent border-none text-white outline-none focus:ring-0 placeholder-gray-600 text-sm"
                placeholder="Tuliskan tindakan karaktermu (A/B/C atau bebas)..."
                value={playerInput}
                onChange={e => setPlayerInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePlayerAction()}
                disabled={isGenerating || chatHistory.length === 0}
              />
              <button 
                onClick={handlePlayerAction}
                disabled={isGenerating || chatHistory.length === 0}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
