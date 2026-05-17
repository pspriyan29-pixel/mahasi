import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Shield, CheckCircle2, Lock, Activity, Zap, Database, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Route } from '../App';

interface LandingPageProps {
  onNavigate: (route: Route) => void;
}

// -------------------------------------------------------------
// TIMING & ANIMATION TOKENS
// -------------------------------------------------------------
const cinematicBezier: [number, number, number, number] = [0.16, 1, 0.3, 1]; // Premium ease-out

const revealVars = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.8, ease: cinematicBezier }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// -------------------------------------------------------------
// COMPONENTS
// -------------------------------------------------------------

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [performanceMode, setPerformanceMode] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Handle scroll for navbar and performance mode check
  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPerformanceMode(true);
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Spotlight effect (only active on Hero if not performance mode)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (performanceMode || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="w-full bg-bp-soft-white overflow-x-hidden selection:bg-bp-electric-blue selection:text-white font-sans text-bp-deep-black">
      {/* GLOBAL NOISE TEXTURE */}
      <div className="bp-noise-overlay" />

      {/* 1. FLOATING GLASS NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: cinematicBezier }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-2xl border-b border-gray-200/80 py-3 shadow-sm'
            : 'bg-white/60 backdrop-blur-md border-b border-transparent py-5'
        }`}
      >
        <div className="bp-container-large flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('landing')}>
            <img src="/logo.png" alt="Neurova Logo" className="w-8 h-8 rounded-lg object-contain group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(51,112,255,0.3)]" />
            <span className="text-xl font-black tracking-tight text-bp-deep-black">Neurova</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Products', route: 'dashboard' as Route },
              { label: 'Solutions', route: 'produktivitas' as Route },
              { label: 'Infrastructure', route: 'operasional' as Route },
              { label: 'Pricing', route: 'pricing' as Route },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.route)}
                className="text-sm font-semibold text-bp-deep-black hover:text-bp-electric-blue transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('pricing')}
              className="hidden md:block text-sm font-semibold text-bp-deep-black hover:text-bp-electric-blue transition-colors"
            >
              Contact Sales
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-bp-electric-blue text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-bp-bright-blue transition-all hover:shadow-[0_4px_20px_rgba(51,112,255,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Console
            </button>
          </div>
        </div>
      </motion.nav>

      {/* 2. HERO CINEMATIC */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative pt-40 pb-20 md:pt-56 md:pb-32 overflow-hidden"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        {/* Spotlight Effect */}
        {!performanceMode && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(51,112,255,0.06), transparent 40%)`
            }}
          />
        )}
        
        {/* Static Blur Orbs */}
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" style={{ transform: 'translateZ(0)' }} />

        <div className="bp-container-large relative z-10">
          <div className="max-w-4xl">
            <motion.div 
              custom={0} initial="hidden" animate="visible" variants={revealVars}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-bp-border-gray shadow-sm mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-bp-electric-blue animate-pulse" />
              <span className="text-xs font-semibold text-bp-medium-gray uppercase tracking-wider">Neurova OS 2.0 Live</span>
            </motion.div>
            
            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={revealVars}
              className="text-[56px] md:text-[84px] font-black leading-[0.92] tracking-tight text-bp-deep-black mb-8"
            >
              Build AI infrastructure <br className="hidden md:block"/>
              for the next generation <br className="hidden md:block"/>
              of products.
            </motion.h1>
            
            <motion.p 
              custom={2} initial="hidden" animate="visible" variants={revealVars}
              className="text-lg md:text-xl text-bp-medium-gray max-w-2xl mb-10 leading-relaxed font-medium"
            >
              End-to-end cloud for AI. Deploy scalable agents, manage vector databases, and execute ultra-low latency inference globally.
            </motion.p>
            
            <motion.div custom={3} initial="hidden" animate="visible" variants={revealVars} className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-bp-electric-blue text-white px-8 py-4 rounded-full text-base font-semibold shadow-[0_10px_30px_rgba(51,112,255,0.35)] hover:shadow-[0_15px_40px_rgba(51,112,255,0.5)] hover:-translate-y-1 transition-all flex items-center gap-2 group"
              >
                Deploy Infrastructure
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="bg-white border-2 border-bp-border-gray text-bp-deep-black px-8 py-4 rounded-full text-base font-semibold shadow-sm hover:border-bp-electric-blue hover:text-bp-electric-blue transition-all"
              >
                Read Documentation
              </button>
            </motion.div>
          </div>

          {/* Hero Dashboard Preview Image */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={revealVars}
            className="mt-16 relative rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-gray-200/60 group"
          >
            {/* Gradient overlay fade at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-bp-soft-white to-transparent z-10 pointer-events-none" />
            <img
              src="/assets/hero_dashboard.png"
              alt="Neurova AI Dashboard"
              className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
            />
            {/* Floating badge */}
            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-bp-deep-black">Live Infrastructure</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. TRUSTED BY LOGOS */}
      <section className="py-12 border-y border-bp-border-gray bg-white overflow-hidden">
        <div className="bp-container-large mb-6">
          <p className="text-center text-sm font-bold text-bp-dark-gray uppercase tracking-widest">Trusted by innovative engineering teams</p>
        </div>
        <div className="flex w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="animate-marquee flex gap-24 items-center pl-24">
            {['Vercel', 'Stripe', 'Supabase', 'Anthropic', 'OpenAI', 'NVIDIA', 'AWS', 'BytePlus'].map((logo, i) => (
              <span key={i} className="text-3xl font-black text-bp-muted-gray whitespace-nowrap tracking-tighter hover:text-bp-dark-gray transition-colors cursor-default">
                {logo}
              </span>
            ))}
          </div>
          <div className="animate-marquee flex gap-24 items-center pl-24" aria-hidden="true">
             {['Vercel', 'Stripe', 'Supabase', 'Anthropic', 'OpenAI', 'NVIDIA', 'AWS', 'BytePlus'].map((logo, i) => (
              <span key={i} className="text-3xl font-black text-bp-muted-gray whitespace-nowrap tracking-tighter">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. METRICS (Trust/Low Density) */}
      <section className="py-20 relative" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="bp-container-large">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-bp-electric-blue uppercase tracking-widest">By the numbers</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-2 text-bp-deep-black">Built for mission-critical workloads.</h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { val: "99.99%", label: "Guaranteed Uptime", accent: "text-bp-electric-blue", bg: "bg-blue-50", border: "border-blue-100" },
              { val: "50ms", label: "Global P99 Latency", accent: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { val: "10B+", label: "API Requests / Mo", accent: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
              { val: "120+", label: "Countries Served", accent: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" }
            ].map((metric, i) => (
              <motion.div key={i} variants={revealVars} custom={i} className={`flex flex-col gap-2 text-center p-8 rounded-[24px] ${metric.bg} border ${metric.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <span className={`text-5xl md:text-6xl font-black tracking-tight ${metric.accent}`}>{metric.val}</span>
                <span className="text-sm font-semibold text-bp-medium-gray">{metric.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. AI SHOWCASE CAROUSEL (Cinematic High Density) */}
      <section className="py-32 text-white overflow-hidden relative" style={{ backgroundColor: '#0C0D0E' }}>
        <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-bp-electric-blue/10 rounded-full blur-[150px] pointer-events-none" style={{ transform: 'translateZ(0)' }} />
        
        <div className="bp-container-large mb-16 relative z-10">
          <motion.span 
             initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
             className="text-bp-electric-blue font-bold tracking-widest text-sm uppercase mb-4 block"
          >10 Functional Pillars</motion.span>
          <motion.h2 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="text-5xl md:text-6xl font-black tracking-tight leading-[1]"
          >Deploy autonomous <br/> AI workflows.</motion.h2>
        </div>

        <div className="w-full flex gap-6 px-4 md:px-32 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing relative z-10">
          {[
            { title: "Deep Research", desc: "Semantic search, RAG pipelines, and multi-source synthesis.", color: "from-blue-500 to-indigo-600", tag: "Productivity", route: "produktivitas", image: "/assets/3d_deep_research.png" },
            { title: "Agentic Operations", desc: "Autonomous agents that orchestrate tasks across your stack.", color: "from-purple-500 to-pink-600", tag: "Operasional", route: "operasional", image: "/assets/3d_agentic_ops.png" },
            { title: "Dynamic Education", desc: "Adaptive flashcards, quizzes, and personalized learning paths.", color: "from-emerald-400 to-cyan-500", tag: "Edukasi", route: "edukasi", image: "/assets/3d_dynamic_edu.png" },
            { title: "Content Generation", desc: "AI copywriting, campaigns, and creative content at scale.", color: "from-orange-400 to-red-500", tag: "Pemasaran", route: "pemasaran", image: "/assets/3d_content_gen.png" },
          ].map((card, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ ease: cinematicBezier, duration: 0.4 }}
              onClick={() => onNavigate(card.route as Route)}
              className="min-w-[320px] md:min-w-[480px] h-[480px] rounded-[32px] bg-[#131518] border border-white/10 p-8 flex flex-col justify-between snap-center relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
              
              <div className="relative z-10">
                <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-bold text-white border border-white/30">{card.tag}</span>
                <h3 className="text-3xl font-bold mt-5 mb-2 tracking-tight">{card.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-xs">{card.desc}</p>
              </div>

              {/* Fake UI mockup or Image inside card */}
              <div className="relative z-10 w-full h-[55%] rounded-2xl border border-white/20 backdrop-blur-xl translate-y-8 group-hover:translate-y-4 transition-transform duration-500 shadow-2xl flex flex-col overflow-hidden bg-[#0C0D0E]/60">
                {card.image ? (
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="p-4 flex flex-col gap-3 h-full">
                    <div className="w-1/3 h-2 bg-white/40 rounded-full" />
                    <div className="w-2/3 h-2 bg-white/30 rounded-full" />
                    <div className="w-1/2 h-2 bg-white/30 rounded-full" />
                    <div className="mt-auto flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-bp-electric-blue/20 flex items-center justify-center text-bp-electric-blue">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. BENTO GRID FEATURES (Technical Asymmetrical) */}
      <section className="py-32" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="bp-container-large">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Architected for scale.</h2>
            <p className="text-bp-medium-gray text-lg font-medium">Everything you need to build, deploy, and monitor LLM applications without managing underlying infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 rounded-[32px] bg-bp-deep-black border border-white/10 relative overflow-hidden group hover:shadow-[0_20px_60px_rgba(51,112,255,0.2)] transition-shadow duration-500 cursor-pointer"
              onClick={() => onNavigate('knowledge')}
            >
              {/* Background AI graph image */}
              <img src="/assets/bento_ai_graph.png" alt="AI Vector Search" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-bp-deep-black via-bp-deep-black/60 to-transparent" />
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bp-electric-blue/20 border border-bp-electric-blue/30 mb-4">
                  <Database size={12} className="text-bp-electric-blue" />
                  <span className="text-xs font-bold text-bp-electric-blue">Vector Infrastructure</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-3">Zero-config <br/> Vector Search.</h3>
                <p className="text-white/60 font-medium max-w-sm">Automatically generate embeddings and perform semantic search across billions of records with sub-50ms latency.</p>
                <div className="mt-6 flex items-center gap-2 text-bp-electric-blue font-semibold text-sm group-hover:gap-4 transition-all">
                  Learn more <ArrowUpRight size={16} />
                </div>
              </div>
            </motion.div>

            {/* Small Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-[32px] bg-white border border-bp-border-gray p-8 shadow-sm flex flex-col justify-center items-center text-center hover:border-bp-electric-blue/30 transition-colors hover:shadow-bp-shadow-premium"
            >
              <Activity size={48} className="text-bp-electric-blue mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold tracking-tight mb-2">Real-time Telemetry</h3>
              <p className="text-sm text-bp-medium-gray font-medium">Monitor token usage and latency instantly.</p>
            </motion.div>

            {/* Small Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="rounded-[32px] bg-bp-deep-black text-white p-8 shadow-bp-shadow-premium flex flex-col justify-between"
            >
              <div>
                <Lock size={32} className="text-bp-electric-blue mb-4" />
                <h3 className="text-xl font-bold tracking-tight mb-2">SOC2 Compliant</h3>
                <p className="text-sm text-white/70 font-medium">Enterprise-grade security built-in.</p>
              </div>
              <button
                onClick={() => onNavigate('pricing')}
                className="text-sm font-bold text-bp-electric-blue hover:underline mt-4 text-left flex items-center gap-1 group"
              >
                View Security Center <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. INFRASTRUCTURE FLOW (Quiet Genius) */}
      <section className="py-40 text-white relative overflow-hidden" style={{ backgroundColor: '#0C0D0E' }}>
        <div className="bp-container-large max-w-4xl text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-lg font-bold text-white/70 mb-6 tracking-widest uppercase"
          >
            The Architecture
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-20 text-white"
          >
            A unified runtime for <br/> agentic applications.
          </motion.p>
          
          {/* Expanded Flow Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-white font-mono text-sm flex-wrap">
            {[
              { label: 'Client App', active: false },
              { label: 'Auth & Rate Limit', active: false },
              { label: 'Neurova Gateway', active: true },
              { label: 'Vector DB', active: false },
              { label: 'LLM Runtime', active: false },
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div className={`px-5 py-3 rounded-xl border font-semibold ${
                  node.active
                    ? 'border-bp-electric-blue bg-bp-electric-blue/20 text-bp-electric-blue shadow-[0_0_25px_rgba(51,112,255,0.35)]'
                    : 'border-white/25 bg-white/10 text-white'
                }`}>{node.label}</div>
                {i < arr.length - 1 && <div className="hidden md:block text-white/30 text-lg font-light">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE SECURITY (Trust Layer) */}
      <section className="py-24 bg-white border-y border-bp-border-gray">
        <div className="bp-container-large flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-bp-deep-black">Security by design.</h2>
            <p className="text-bp-medium-gray font-medium">Your data is encrypted at rest and in transit. We maintain strict compliance with global security standards so you can deploy with confidence.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'SOC 2 Type II', desc: 'Audited annually' },
              { label: 'GDPR Compliant', desc: 'EU data residency' },
              { label: 'ISO 27701', desc: 'Privacy management' },
              { label: 'E2E Encryption', desc: 'AES-256 at rest' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-bp-border-gray bg-bp-soft-white hover:border-bp-electric-blue/40 transition-colors">
                <Shield className="text-bp-electric-blue flex-shrink-0" size={20} />
                <div>
                  <div className="font-bold text-bp-deep-black text-sm">{badge.label}</div>
                  <div className="text-xs text-bp-medium-gray">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8.5 TESTIMONIALS */}
      <section className="py-32" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="bp-container-large">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold text-bp-electric-blue uppercase tracking-widest block mb-3">Trusted worldwide</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-bp-deep-black">Loved by builders.</h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                quote: "Neurova cut our AI infrastructure costs by 60% and reduced deployment time from days to minutes. It's the backbone of our production stack.",
                name: "Sarah Chen",
                role: "Head of AI, TechCorp",
                avatar: "/images/avatar-1.png",
                stars: 5,
              },
              {
                quote: "The vector search and RAG pipeline setup was seamless. We went from prototype to 10M queries/day in under a week with zero downtime.",
                name: "Marcus Reeves",
                role: "CTO, DataFlow AI",
                avatar: "/images/avatar-2.png",
                stars: 5,
              },
              {
                quote: "As a solo founder, Neurova gives me enterprise-grade AI infrastructure at a fraction of the cost. Truly a game-changer for startups.",
                name: "Priya Mehta",
                role: "Founder, LexAI",
                avatar: "/images/avatar-3.png",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={revealVars}
                custom={i}
                className="bg-white border border-bp-border-gray rounded-[28px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-bp-deep-black font-medium leading-relaxed text-[15px] flex-1">
                  "{t.quote}"
                </p>
                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-bp-border-gray">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-bp-border-gray"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=3370FF&color=fff&bold=true`; }}
                  />
                  <div>
                    <div className="font-bold text-bp-deep-black text-sm">{t.name}</div>
                    <div className="text-xs text-bp-medium-gray">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 9. FINAL CTA (Emotional) */}
      <section className="py-40 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)' }}>
        <div className="bp-container-large max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[0.92] mb-8 text-bp-deep-black"
          >
            Deploy intelligence <br/> at global scale.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-xl text-bp-medium-gray font-medium mb-12"
          >
            Join thousands of developers building the future of AI infrastructure on Neurova.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => onNavigate('dashboard')}
              style={{ backgroundColor: '#0C0D0E', color: '#ffffff' }}
              className="px-10 py-5 rounded-full text-lg font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all"
            >
              Start Building Free
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              style={{ backgroundColor: 'white', color: '#0C0D0E', border: '2px solid #DDE2E9' }}
              className="px-10 py-5 rounded-full text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              View Pricing
            </button>
          </motion.div>
        </div>
      </section>

      {/* 10. MEGA FOOTER (Cinematic Dark) */}
      <footer className="pt-32 pb-12" style={{ backgroundColor: '#0C0D0E', color: 'rgba(255,255,255,0.85)' }}>
        <div className="bp-container-large">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-24">
            <div className="col-span-2 md:col-span-3">
              <div className="flex items-center gap-2 mb-6 text-white">
                <div className="w-8 h-8 bg-bp-electric-blue rounded-md shadow-[0_0_20px_rgba(51,112,255,0.4)]" />
                <span className="text-2xl font-black tracking-tight">Neurova</span>
              </div>
              <p className="text-lg max-w-sm font-medium leading-relaxed">
                The enterprise AI Operating System. <br/> Direct model access with simple, scalable integration.
              </p>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-white font-bold mb-6 tracking-wide">Infrastructure</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium">
                <li><a onClick={() => onNavigate('dashboard')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Inference API</a></li>
                <li><a onClick={() => onNavigate('knowledge')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Vector Search</a></li>
                <li><a onClick={() => onNavigate('operasional')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Agent Runtime</a></li>
                <li><a onClick={() => onNavigate('pricing')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Security</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-white font-bold mb-6 tracking-wide">Solutions</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium">
                <li><a onClick={() => onNavigate('produktivitas')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Productivity</a></li>
                <li><a onClick={() => onNavigate('operasional')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Operations</a></li>
                <li><a onClick={() => onNavigate('edukasi')} className="text-white/60 hover:text-white transition-colors cursor-pointer">Education</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium">
                <li><a className="text-white/60 hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a className="text-white/60 hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a className="text-white/60 hover:text-white transition-colors cursor-pointer">Careers</a></li>
                <li><a className="text-white/60 hover:text-white transition-colors cursor-pointer">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-medium">
            <div>© 2026 Neurova OS. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="text-white/60 hover:text-white transition-colors cursor-pointer">Twitter</a>
              <a className="text-white/60 hover:text-white transition-colors cursor-pointer">LinkedIn</a>
              <a className="text-white/60 hover:text-white transition-colors cursor-pointer">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
