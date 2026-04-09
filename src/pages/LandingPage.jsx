import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Shield, Rocket, Activity, GitBranch, ArrowRight, CheckCircle2, Code2, Server, Lock } from 'lucide-react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const yElement = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <div className="bg-grid min-h-screen overflow-hidden" style={{ position: 'relative' }}>
      {/* ── Background Orbs ── */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: -100, left: '20%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }}
      />

      {/* ── Navigation ── */}
      <nav className="nav px-6" style={{ background: 'rgba(3,7,18,0.6)' }}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between" style={{ height: '70px' }}>
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-10 h-10 rounded glass flex items-center justify-center glow-purple relative"
            >
              <Zap size={20} className="text-accent" />
            </motion.div>
            <span className="text-2xl font-black text-gradient tracking-wider">AuraOps</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-secondary hover:text-white transition font-medium" style={{ display: 'none' }}>Login</Link>
            <div className="hidden sm:flex" style={{ display: 'flex', gap: '24px' }}>
               <Link to="/login" className="text-secondary hover:text-white transition" style={{ fontWeight: 500, lineHeight: '40px' }}>Sign In</Link>
               <Link to="/signup" className="btn btn-primary" style={{ paddingInline: '1.5rem', borderRadius: '12px' }}>
                 Get Started
               </Link>
            </div>
            {/* Mobile nav fallback button */}
            <div className="sm:hidden flex" style={{ display: 'none' }}>
               <Link to="/signup" className="btn btn-primary" style={{ paddingInline: '1.5rem', borderRadius: '12px' }}>
                 Start
               </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="badge badge-info mb-8 tracking-widest uppercase items-center glass" 
            style={{ padding: '8px 20px', display: 'inline-flex', gap: '12px', fontSize: '0.85rem', borderColor: 'rgba(59,130,246,0.3)' }}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: 'var(--color-accent-blue)',
              animation: 'pulse 2s infinite',
              flexShrink: 0,
              boxShadow: '0 0 10px var(--color-accent-blue)'
            }} />
            <span className="text-white font-bold tracking-widest">AuraOps give the power of AI to your Company Continuous Integration (CI) pipelines</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
            Stop Debugging CI.<br />
            <span className="text-gradient">Start Shipping Code.</span>
          </h1>

          <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '42rem', margin: '0 auto 3rem', lineHeight: 1.7 }}>
            AuraOps operates in the background, listening to GitHub actions. The second a build fails, our AI kicks in, extracts the stacktrace, and pushes the fix.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-5">
            <Link to="/signup" className="btn btn-primary glow-purple" style={{ paddingInline: '2.5rem', paddingBlock: '1.2rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 700 }}>
              Start Automating <ArrowRight size={20} />
            </Link>
            <a href="https://github.com/Subiksha-Sierra/AuraOps/blob/main/README.md" className="btn btn-outline glass" style={{ paddingInline: '2rem', paddingBlock: '1.2rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 600 }}>
              <GitBranch size={20} /> Read Documentation
            </a>
          </div>
        </motion.div>

        {/* ── Dynamic Mockup Preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
          style={{ marginTop: '6rem', position: 'relative', padding: '0 1rem', y: yElement }}
        >
          <div style={{
            maxWidth: '1000px', margin: '0 auto', borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)',
            padding: '10px', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.2)'
          }}>
            <div style={{ borderRadius: '16px', background: '#09090b', overflow: 'hidden', position: 'relative' }}>
              
              {/* Fake UI Header */}
              <div style={{ background: '#18181b', borderBottom: '1px solid #27272a', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#27272a', padding: '4px 12px', borderRadius: '6px' }}>
                  <Lock size={12} className="text-muted" /> <span className="text-secondary text-xs font-medium">auraops-terminal</span>
                </div>
                <div style={{ width: 44 }}></div>
              </div>

              {/* Fake Terminal Body */}
              <div style={{ padding: '2rem', height: '320px', position: 'relative', fontFamily: 'monospace', fontSize: '14px', color: '#a1a1aa', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <TerminalSimulation />
              </div>

            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Features ── */}
      <section style={{ maxWidth: '80rem', margin: '8rem auto 0', padding: '8rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="text-4xl font-black mb-4">A complete platform ecosystem.</h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">No hacks. Secure integrations, GitHub, and seamless authentications to power your CI pipelines directly.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard delay={0} icon={<Server className="text-accent" />} title="Effective Project Management" desc="Effortlessly manage your projects with our intuitive dashboard and automated workflows." />
          <FeatureCard delay={0.2} icon={<Code2 className="text-blue-400" />} title="Instant Detection" desc="Webhooks listen to your CI/CD pipelines and trigger fixes the precise microsecond a build failure occurs." />
          <FeatureCard delay={0.4} icon={<Shield className="text-green" />} title="Safe AI Patches" desc="AI-generated fixes are provided as atomic PRs, allowing developers to review every change before they merge." />
        </div>
      </section>

      {/* ── High-End Action Banner ── */}
      <section style={{ padding: '5rem 1.5rem', position: 'relative' }}>
         <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-5xl mx-auto flex-col items-center text-center relative overflow-hidden" 
            style={{ 
              padding: '6rem 2rem', 
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.1) inset, 0 20px 40px -10px rgba(0,0,0,0.5)',
            }}
         >
            {/* Ambient inner glow */}
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} 
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }}
            />
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div className="badge flex items-center justify-center gap-2 mx-auto mb-6" style={{ padding: '6px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-secondary)' }}>
                <Zap size={14} className="text-accent" /> Powered by Advanced AI
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>Ready to let AI handle your ops?</h2>
              <p className="text-secondary max-w-xl mx-auto mb-8" style={{ fontSize: '1.15rem' }}>Join the next generation of developers shipping code faster and safer than ever before.</p>
              
              <Link to="/signup" >
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  className="btn glow-purple"
                  style={{ 
                    padding: '1.1rem 2.5rem', fontSize: '1.15rem', borderRadius: '12px', 
                    background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)', color: '#ffffff', fontWeight: 700, 
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', transition: 'all 0.3s ease'
                  }}
                >
                  Create your free account <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
         </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#020617', padding: '4rem 1.5rem', borderTop: '1px solid rgba(30,41,59,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-accent" />
          <span className="font-black text-xl">AuraOps</span>
        </div>
        <p className="text-muted text-sm font-medium">© 2026 AuraOps AI. Crafted with intelligence.</p>
        <div className="flex gap-8 mt-2">
          <a href="#" className="text-secondary hover:text-white transition font-medium">Platform</a>
          <a href="#" className="text-secondary hover:text-white transition font-medium">Pricing</a>
          <a href="#" className="text-secondary hover:text-white transition font-medium">GitHub</a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card glass"
      style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px',
        background: 'rgba(30,41,59,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
      }}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-secondary font-medium" style={{ lineHeight: 1.7, fontSize: '1.05rem' }}>{desc}</p>
    </motion.div>
  )
}

// Sub-component for an animated terminal mockup
function TerminalSimulation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const sequence = [
      { delay: 1000 },
      { delay: 800 },
      { delay: 1500 },
      { delay: 1200 },
      { delay: 600 }
    ]
    let timeoutId;
    let currentStep = 0;

    const runSequence = () => {
      if (currentStep >= sequence.length) return;
      timeoutId = setTimeout(() => {
        setStep(prev => prev + 1);
        currentStep++;
        runSequence();
      }, sequence[currentStep].delay);
    }
    
    runSequence();
    return () => clearTimeout(timeoutId);
  }, [])

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className="text-accent mr-2">➜</span> <span className="text-white">Listening to GitHub webhooks via secure proxy...</span>
      </motion.div>
      
      {step >= 1 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <span className="text-red mr-2 font-bold">[ALERT]</span> Build failed on repository: <b>auraops-web</b> / CI Test Suite
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-4 pl-4 border-l-2" style={{ borderColor: '#27272a', paddingBlock: '8px' }}>
           <span className="text-red">TypeError: Cannot read properties of undefined (reading 'config')</span><br/>
           <span className="text-muted">    at Server.initialize (server.js:42:15)</span><br/>
           <span className="text-muted">    at runApp (app.js:10:5)</span>
        </motion.div>
      )}

      {step >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
          <span className="text-accent mr-2">⚙</span> <span className="text-yellow-400">LLM Engine analyzing stack trace...</span>
        </motion.div>
      )}

      {step >= 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-2" style={{ background: 'rgba(16,185,129,0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
             <CheckCircle2 size={16} className="text-green" /> <span className="text-white font-bold">Fix successfully generated</span>
          </div>
          <span className="text-green">✔ Created Pull Request #145: "Fix undefined config in Server initialization"</span>
        </motion.div>
      )}
      
      {step < 5 && (
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="mt-4">
          <div style={{ width: '10px', height: '20px', background: 'var(--color-accent-purple)' }}></div>
        </motion.div>
      )}
    </>
  )
}
