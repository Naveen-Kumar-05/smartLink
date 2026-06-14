import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Copy, Zap, Shield, BarChart3, Globe, ChevronDown, MapPin, Mail, Clock, Activity, ShieldCheck } from 'lucide-react';

// ─── Particle / Creature System ─────────────────────────────────────────────
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }
  reset() {
    const w = this.canvas.width, h = this.canvas.height;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.z = Math.random() * 2 + 0.2;
    this.vx = (Math.random() - 0.5) * 0.4 * this.z;
    this.vy = (Math.random() - 0.5) * 0.4 * this.z;
    this.radius = Math.random() * 2.5 * this.z + 0.3;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.alphaDir = Math.random() > 0.5 ? 1 : -1;
    this.color = this.pickColor();
    this.type = Math.random() > 0.85 ? 'creature' : 'star';
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = (Math.random() - 0.5) * 0.02;
    this.tail = [];
  }
  pickColor() {
    const colors = [
      '#7c5cfc', '#5b8def', '#22d3a5', '#ec4899', '#f97316', '#a78bfa', '#60a5fa', '#34d399'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  update(mouseX, mouseY, scrollY) {
    const drift = scrollY * 0.0003;
    this.x += this.vx + Math.sin(Date.now() * 0.0003 + this.y) * 0.15;
    this.y += this.vy + drift * this.z;
    this.angle += this.angleSpeed;
    this.alpha += 0.005 * this.alphaDir;
    if (this.alpha > 0.8 || this.alpha < 0.1) this.alphaDir *= -1;

    // mouse repulsion
    if (mouseX && mouseY) {
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.x += (dx / dist) * 1.5;
        this.y += (dy / dist) * 1.5;
      }
    }

    if (this.type === 'creature') {
      this.tail.unshift({ x: this.x, y: this.y });
      if (this.tail.length > 12) this.tail.pop();
    }

    const w = this.canvas.width, h = this.canvas.height;
    if (this.x < -20) this.x = w + 20;
    if (this.x > w + 20) this.x = -20;
    if (this.y < -20) this.y = h + 20;
    if (this.y > h + 20) this.y = -20;
  }
  draw(ctx) {
    ctx.save();
    if (this.type === 'creature') {
      // Draw tail
      for (let i = 0; i < this.tail.length; i++) {
        const t = this.tail[i];
        const a = (this.alpha * (1 - i / this.tail.length)) * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.radius * (1 - i / this.tail.length) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      // Draw body
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.floor(this.alpha * 0.7 * 255).toString(16).padStart(2, '0');
      ctx.fill();
      // Glow
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 5);
      grad.addColorStop(0, this.color + 'aa');
      grad.addColorStop(1, this.color + '00');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // Eye
      ctx.beginPath();
      ctx.arc(this.x + Math.cos(this.angle) * this.radius, this.y + Math.sin(this.angle) * this.radius, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      // Star with glow
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
      grad.addColorStop(0, this.color + 'ff');
      grad.addColorStop(0.4, this.color + '88');
      grad.addColorStop(1, this.color + '00');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
    ctx.restore();
  }
}

class Connection {
  static draw(ctx, p1, p2) {
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 160) return;
    const alpha = (1 - dist / 160) * 0.18;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(124,92,252,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

// ─── Canvas Component ────────────────────────────────────────────────────────
function ParticleCanvas({ scrollY }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 160);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas));
      }
      particlesRef.current = particles;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          Connection.draw(ctx, particles[i], particles[j]);
        }
      }

      // Update & draw particles
      particles.forEach(p => {
        p.update(mouseRef.current.x, mouseRef.current.y, scrollY);
        p.draw(ctx);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Update scroll ref without re-mounting
  useEffect(() => {
    particlesRef.current.forEach(p => { p._scroll = scrollY; });
  }, [scrollY]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
        opacity: Math.max(0, 1 - scrollY / 900),
      }}
    />
  );
}

// ─── Floating Orb ────────────────────────────────────────────────────────────
function FloatingOrb({ color, size, top, left, delay, blur = 120 }) {
  return (
    <div
      style={{
        position: 'absolute', top, left,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${blur}px)`,
        opacity: 0.25,
        animation: `float ${3 + delay}s ease-in-out infinite alternate`,
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── Scroll Progress Indicator ───────────────────────────────────────────────
function ScrollProgress({ progress }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: `${progress * 100}%`,
      height: '2px', background: 'linear-gradient(90deg, #7c5cfc, #22d3a5)',
      zIndex: 1000, transition: 'width 0.1s ease',
    }} />
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function JourneySection({ children, style, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(60px)',
      transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
    }}>{children}</section>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '66' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '20px',
        padding: '32px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 24px 60px ${color}22` : 'none',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
        animationDelay: `${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, opacity: hovered ? 0.08 : 0,
        background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)`,
        transition: 'opacity 0.4s ease',
      }} />
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '22', border: `1px solid ${color}44`,
        transition: 'all 0.3s ease',
        boxShadow: hovered ? `0 0 24px ${color}55` : 'none',
      }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, color: '#f0f0ff' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#8888aa' }}>{desc}</p>
    </div>
  );
}

// ─── Glitch Text ─────────────────────────────────────────────────────────────
function GlitchWord({ children }) {
  return (
    <span className="glitch-word" data-text={children} style={{ display: 'inline-block', position: 'relative' }}>
      {children}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [demoUrl, setDemoUrl] = useState('');
  const [shortenedDemo, setShortenedDemo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAnnual, setIsAnnual] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrollY(sy);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(sy / maxScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDemoShorten = (e) => {
    e.preventDefault();
    if (!demoUrl) return;
    const mockCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShortenedDemo({
      original: demoUrl.trim(),
      shortCode: mockCode,
      shortUrl: `${window.location.origin}/${mockCode}`,
    });
  };

  const copyToClipboard = () => {
    if (!shortenedDemo) return;
    navigator.clipboard.writeText(shortenedDemo.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const heroParallax = scrollY * 0.4;
  const heroOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <div style={{ background: '#06060f', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <ScrollProgress progress={scrollProgress} />
      <ParticleCanvas scrollY={scrollY} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', position: 'relative', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <FloatingOrb color="#7c5cfc" size="600px" top="-15%" left="-10%" delay={0} blur={140} />
        <FloatingOrb color="#22d3a5" size="500px" top="30%" left="65%" delay={1.5} blur={140} />
        <FloatingOrb color="#ec4899" size="400px" top="60%" left="10%" delay={3} blur={120} />

        <div style={{
          position: 'relative', zIndex: 2,
          transform: `translateY(${heroParallax}px)`,
          opacity: heroOpacity,
          transition: 'opacity 0.1s ease',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 100,
            background: 'rgba(124,92,252,0.12)',
            border: '1px solid rgba(124,92,252,0.35)',
            marginBottom: 36, fontSize: '0.78rem', fontWeight: 600,
            color: '#a78bfa', letterSpacing: '0.12em', textTransform: 'uppercase',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a5', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            Surreal Link Intelligence
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(3rem, 9vw, 8.5rem)', fontWeight: 900,
            lineHeight: 0.95, letterSpacing: '-0.03em',
            marginBottom: 28, color: '#f0f0ff',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            <div style={{ overflow: 'hidden' }}>
              <span className="hero-word" style={{ display: 'block', background: 'linear-gradient(135deg, #f0f0ff 0%, #a78bfa 50%, #7c5cfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Every Link
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span className="hero-word hero-word-2" style={{ display: 'block', background: 'linear-gradient(135deg, #22d3a5 0%, #5b8def 50%, #7c5cfc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Is a Portal.
              </span>
            </div>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: '#8888aa', maxWidth: 580, margin: '0 auto 48px',
            lineHeight: 1.7, fontWeight: 400,
          }}>
            Transform your URLs into precision-engineered gateways. Track every heartbeat of your audience through a cinematic analytics ecosystem.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#journey" className="cta-btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: '1rem',
              background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
              color: '#fff', textDecoration: 'none', letterSpacing: '0.02em',
              boxShadow: '0 0 40px rgba(124,92,252,0.4)',
              transition: 'all 0.3s ease',
              border: 'none',
            }}>
              FREE TRAIL‼️ <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: heroOpacity, zIndex: 2,
          animation: 'bounce 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#5555aa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll to journey</span>
          <ChevronDown size={18} color="#7c5cfc" />
        </div>
      </section>

      {/* ── JOURNEY ZONE 1: URL Shorten Portal ──────────────── */}
      <section id="journey" style={{
        position: 'relative', padding: '120px 24px',
        background: 'linear-gradient(180deg, #06060f 0%, #0a0518 50%, #06060f 100%)',
      }}>
        <FloatingOrb color="#7c5cfc" size="400px" top="20%" left="50%" delay={0} blur={160} />

        <JourneySection style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#7c5cfc',
              padding: '6px 16px', borderRadius: 100,
              background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.25)',
            }}>
              <Zap size={12} /> Zone 01 — The Condenser
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Compress. Transmit. Transcend.
          </h2>
          <p style={{ color: '#8888aa', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 48 }}>
            Drop a URL into the void. Watch it collapse into a singularity — a perfect, trackable link forged by intelligence.
          </p>

          {/* URL Input Portal */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,92,252,0.3)',
            borderRadius: 24, padding: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 80px rgba(124,92,252,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Portal shimmer */}
            <div style={{
              position: 'absolute', top: -1, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, #7c5cfc, #22d3a5, transparent)',
            }} />

            <form onSubmit={handleDemoShorten}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 220 }}>
                  <div style={{
                    position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                    width: 8, height: 8, borderRadius: '50%',
                    background: shortenedDemo ? '#22d3a5' : '#7c5cfc',
                    boxShadow: `0 0 12px ${shortenedDemo ? '#22d3a5' : '#7c5cfc'}`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <input
                    type="url"
                    required
                    placeholder="Paste your URL into the void..."
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    id="demo-url-input"
                    style={{
                      width: '100%', padding: '16px 18px 16px 42px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, color: '#f0f0ff', fontSize: '0.95rem',
                      outline: 'none', fontFamily: 'inherit',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(124,92,252,0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124,92,252,0.15)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  id="shorten-btn"
                  style={{
                    padding: '16px 28px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(124,92,252,0.35)',
                    transition: 'all 0.3s ease', whiteSpace: 'nowrap', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 40px rgba(124,92,252,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = '0 0 30px rgba(124,92,252,0.35)';
                  }}
                >
                  Generate 🔗
                </button>
              </div>
            </form>

            {shortenedDemo && (
              <div style={{
                marginTop: 24, padding: '20px 24px',
                background: 'rgba(34,211,165,0.06)',
                border: '1px solid rgba(34,211,165,0.25)',
                borderRadius: 14, animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22d3a5', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                      ✦ Singularity Created
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22d3a5', letterSpacing: '0.02em' }}>
                      {shortenedDemo.shortUrl}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#5555aa', marginTop: 4, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shortenedDemo.original}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={copyToClipboard}
                      id="copy-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
                        background: copied ? 'rgba(34,211,165,0.2)' : 'rgba(34,211,165,0.1)',
                        border: '1px solid rgba(34,211,165,0.35)',
                        color: '#22d3a5', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <Link to="/register" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
                      background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
                      color: '#fff', textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}>
                      Track Analytics <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </JourneySection>
      </section>

      {/* ── JOURNEY ZONE 2: Stats ───────────────────────────── */}
      <section style={{
        position: 'relative', padding: '100px 24px',
        background: 'linear-gradient(180deg, #06060f, #060a18 50%, #06060f)',
      }}>
        <FloatingOrb color="#22d3a5" size="500px" top="-20%" left="70%" delay={2} blur={150} />
        <FloatingOrb color="#5b8def" size="350px" top="60%" left="-5%" delay={1} blur={130} />

        <JourneySection style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#22d3a5', padding: '6px 16px', borderRadius: 100,
              background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.25)',
            }}>
              <Globe size={12} /> Zone 02 — The Observatory
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #22d3a5, #5b8def)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Numbers That Tell Stories.
          </h2>
          <p style={{ color: '#8888aa', fontSize: '1rem', marginBottom: 64 }}>
            Every click is a data point in a living, breathing universe.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { val: 2400000, suf: '+', label: 'Links Created', color: '#7c5cfc' },
              { val: 98, suf: '.9%', label: 'Uptime SLA', color: '#22d3a5' },
              { val: 50, suf: 'ms', label: 'Avg Redirect Speed', color: '#5b8def' },
              { val: 140, suf: '+', label: 'Countries Tracked', color: '#ec4899' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}22`,
                borderRadius: 20, padding: '40px 24px', position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid ${s.color}55`;
                  e.currentTarget.style.boxShadow = `0 0 40px ${s.color}22`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = `1px solid ${s.color}22`;
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                }} />
                <div style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif", color: s.color,
                  lineHeight: 1, marginBottom: 8,
                }}>
                  <AnimatedCounter target={s.val} suffix={s.suf} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8888aa', fontWeight: 500, letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </JourneySection>
      </section>

      {/* ── JOURNEY ZONE 3: Features ────────────────────────── */}
      <section style={{
        position: 'relative', padding: '120px 24px',
        background: 'linear-gradient(180deg, #06060f, #080612 50%, #06060f)',
      }}>
        <FloatingOrb color="#ec4899" size="450px" top="10%" left="0%" delay={0.5} blur={150} />
        <FloatingOrb color="#7c5cfc" size="350px" top="50%" left="80%" delay={2} blur={130} />

        <JourneySection style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#ec4899', padding: '6px 16px', borderRadius: 100,
              background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)',
              marginBottom: 20,
            }}>
              <Shield size={12} /> Zone 03 — The Arsenal
            </span>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #ec4899, #7c5cfc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Weapons of Precision.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <FeatureCard icon={Zap} color="#7c5cfc" title="Instant Condensation"
              desc="URLs collapse to micro-links in milliseconds. Custom aliases like /portfolio or /launch — yours to command." delay={0} />
            <FeatureCard icon={BarChart3} color="#22d3a5" title="Living Analytics"
              desc="Watch clicks flow across real-time charts. Device, browser, country — every visitor tells a story." delay={100} />
            <FeatureCard icon={Shield} color="#ec4899" title="Temporal Expiry"
              desc="Schedule links to self-destruct at a precise moment. Perfect for launches, campaigns, or secrets." delay={200} />
            <FeatureCard icon={Globe} color="#5b8def" title="QR Singularity"
              desc="Vector QR codes generated instantly. Scannable from flyers, screens, or the surface of the moon." delay={300} />
          </div>
        </JourneySection>
      </section>

      {/* ── JOURNEY ZONE 4: Analytics Showcase ─────────────── */}
      <section style={{
        position: 'relative', padding: '120px 24px',
        background: 'linear-gradient(180deg, #06060f, #060a14 50%, #06060f)',
      }}>
        <FloatingOrb color="#5b8def" size="500px" top="20%" left="60%" delay={1} blur={160} />

        <JourneySection style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#5b8def', padding: '6px 16px', borderRadius: 100,
                background: 'rgba(91,141,239,0.1)', border: '1px solid rgba(91,141,239,0.25)', marginBottom: 20,
              }}>
                <BarChart3 size={12} /> Zone 04 — The Oracle
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1,
                marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, #f0f0ff, #5b8def)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                See Everything. Miss Nothing.
              </h2>
              <p style={{ color: '#8888aa', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
                An intelligence layer beneath every link. Understand your audience at atomic resolution — where they come from, how they browse, when they click.
              </p>
              {[
                'Real-time click streams & heatmaps',
                'Geographic & demographic breakdown',
                'Device, OS & browser intelligence',
                'Referrer source attribution',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(91,141,239,0.15)', border: '1px solid rgba(91,141,239,0.35)', flexShrink: 0,
                  }}>
                    <Check size={12} color="#5b8def" />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#c0c0dd' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Analytics UI mockup */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(91,141,239,0.2)',
              borderRadius: 24, padding: 28, backdropFilter: 'blur(16px)',
              boxShadow: '0 0 80px rgba(91,141,239,0.08)',
            }}>
              {/* Window dots */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>

              {/* Chart bars */}
              <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '20px 16px',
                marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#5555aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Click Velocity — 7d
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                  {[22, 45, 35, 68, 82, 95, 60].map((h, i) => (
                    <div key={i} style={{ flex: 1, position: 'relative' }}>
                      <div style={{
                        height: `${h}%`, borderRadius: '4px 4px 0 0',
                        background: i === 5
                          ? 'linear-gradient(180deg, #7c5cfc, #5b8def)'
                          : `rgba(91,141,239,${0.2 + h / 200})`,
                        transition: 'height 0.3s ease',
                        boxShadow: i === 5 ? '0 0 20px rgba(124,92,252,0.4)' : 'none',
                        minHeight: 4,
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', color: '#5555aa', flex: 1, textAlign: 'center' }}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Mini stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Top Device', val: '📱 Mobile', pct: '67%', color: '#7c5cfc' },
                  { label: 'Top Browser', val: '🌐 Chrome', pct: '48%', color: '#22d3a5' },
                  { label: 'Top Country', val: '🇮🇳 India', pct: '34%', color: '#5b8def' },
                  { label: 'Top Referrer', val: '🔗 Direct', pct: '52%', color: '#ec4899' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(0,0,0,0.25)', border: `1px solid ${s.color}22`,
                    borderRadius: 10, padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: '0.65rem', color: '#5555aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c0c0dd' }}>{s.val}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </JourneySection>
      </section>



      {/* ── JOURNEY ZONE 5: PRICING ────────────────────────── */}
      <section style={{
        position: 'relative', padding: '120px 24px',
        background: 'linear-gradient(180deg, #06060f, #0a0518 50%, #06060f)',
      }}>
        <FloatingOrb color="#ec4899" size="400px" top="20%" left="10%" delay={1.5} blur={160} />
        <FloatingOrb color="#7c5cfc" size="500px" top="40%" left="70%" delay={0} blur={180} />

        <JourneySection style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1,
              marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Choose your Plan
            </h2>
            <p style={{ color: '#8888aa', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
              Flexible plans for all needs, from personal projects to large enterprises.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: 6, position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: 6, bottom: 6, left: isAnnual ? 6 : '50%',
                width: 'calc(50% - 6px)', background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
                borderRadius: 100, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 0
              }} />
              <button
                onClick={() => setIsAnnual(true)}
                style={{
                  position: 'relative', zIndex: 1, padding: '10px 28px', border: 'none', background: 'transparent',
                  color: isAnnual ? '#fff' : '#8888aa', fontWeight: 600, cursor: 'pointer',
                  transition: 'color 0.3s ease', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                Annual <span style={{ background: '#f97316', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>-15%</span>
              </button>
              <button
                onClick={() => setIsAnnual(false)}
                style={{
                  position: 'relative', zIndex: 1, padding: '10px 28px', border: 'none', background: 'transparent',
                  color: !isAnnual ? '#fff' : '#8888aa', fontWeight: 600, cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { name: 'Free', priceM: 0, priceA: 0, icon: '🚀', features: ['100 links', '50 QR Codes', '1 page', 'Unlimited clicks'], missing: ['Ad removal', 'Custom domains', 'Campaigns'] },
              { name: 'Basic', priceM: 5, priceA: 4, icon: '⭐', features: ['1,000 links', '500 QR Codes', '5 pages', 'Unlimited clicks', 'Ad removal'], missing: ['Custom domains', 'Campaigns'] },
              { name: 'Pro', priceM: 13, priceA: 11, icon: '💎', pop: true, features: ['5,000 links', '2,500 QR Codes', '15 pages', 'Unlimited clicks', '5 custom domains', '50 campaigns', 'Ad removal'], missing: [] },
              { name: 'Premium', priceM: 41, priceA: 34, icon: '👑', features: ['15,000 links', '7,500 QR Codes', '30 pages', 'Unlimited clicks', '15 custom domains', '150 campaigns', 'Ad removal'], missing: [] },
            ].map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.pop ? 'rgba(124,92,252,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 24, padding: '40px 32px', position: 'relative',
                transform: p.pop ? 'translateY(-12px)' : 'none',
                boxShadow: p.pop ? '0 24px 60px rgba(124,92,252,0.15)' : 'none',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                {p.pop && (
                  <div style={{
                    position: 'absolute', top: -14, background: 'linear-gradient(135deg, #7c5cfc, #a78bfa)',
                    color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 16px', borderRadius: 100,
                    letterSpacing: '0.05em'
                  }}>POPULAR</div>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{p.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0f0ff', marginBottom: 12 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: '1.2rem', color: p.pop ? '#a78bfa' : '#5b8def', fontWeight: 600, marginTop: 4 }}>$</span>
                  <span style={{ fontSize: '3.5rem', fontWeight: 900, color: p.pop ? '#a78bfa' : '#5b8def', lineHeight: 1 }}>{isAnnual ? p.priceA : p.priceM}</span>
                </div>
                <div style={{ color: '#8888aa', fontSize: '0.9rem', marginBottom: isAnnual && p.priceM > 0 ? 4 : 24 }}>per month</div>
                {isAnnual && p.priceM > 0 && (
                  <div style={{ color: '#22d3a5', fontSize: '0.8rem', fontWeight: 600, marginBottom: 20 }}>Save ~15%</div>
                )}

                <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0 24px' }} />

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={16} color="#22d3a5" />
                      <span style={{ color: '#c0c0dd', fontSize: '0.9rem' }}>{f}</span>
                    </div>
                  ))}
                  {p.missing.map((m, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4 }}>
                      <X size={16} color="#8888aa" />
                      <span style={{ color: '#8888aa', fontSize: '0.9rem' }}>{m}</span>
                    </div>
                  ))}
                </div>
                
                <Link to={`/register?plan=${p.name.toUpperCase() === 'PREMIUM' ? 'ENTERPRISE' : p.name.toUpperCase() === 'BASIC' ? 'PRO' : p.name.toUpperCase()}`} style={{
                  marginTop: 'auto', paddingTop: 32, width: '100%'
                }}>
                  <button style={{
                    width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700,
                    background: p.pop ? 'linear-gradient(135deg, #7c5cfc, #5b8def)' : 'rgba(255,255,255,0.05)',
                    color: p.pop ? '#fff' : '#f0f0ff', border: p.pop ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    if(!p.pop) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    else e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,92,252,0.4)';
                  }}
                  onMouseLeave={e => {
                    if(!p.pop) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    else e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </JourneySection>
      </section>

      {/* ── NEW COMPREHENSIVE FOOTER ────────────────────────── */}
      <footer style={{
        background: '#04040a', borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 24px 40px', color: '#8888aa'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 60, marginBottom: 60 }}>
            {/* Column 1: Brand */}
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>⚡</div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f0f0ff', fontFamily: "'Space Grotesk', sans-serif" }}>SmartLink</span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                Efficient, secure and accessible URL shortening service. We transform long links into short and powerful experiences.
              </p>
            </div>

            {/* Column 2: Features */}
            <div>
              <h4 style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Features</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Link Shortener', 'Pages Customization', 'QR Code Generator', 'Advanced Analytics', 'Custom Domains', 'Campaign Management'].map(l => (
                  <li key={l}><a href="#" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='#7c5cfc'} onMouseLeave={e => e.target.style.color='#8888aa'}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Column 3: Security */}
            <div>
              <h4 style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Security</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Google Safe Browsing', 'Virus Total Protection', 'Norton Safe Web', 'SSL Encryption'].map(l => (
                  <li key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={14} color="#22d3a5" />
                    <a href="#" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='#7c5cfc'} onMouseLeave={e => e.target.style.color='#8888aa'}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Legal */}
            <div>
              <h4 style={{ color: '#f0f0ff', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>Contact & Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} color="#5b8def" />
                  <a href="mailto:naveenabi005@gmail.com" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem' }}>naveenabi005@gmail.com</a>
                </li>
                <li style={{ marginTop: 12 }}><a href="#" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Use</a></li>
                <li><a href="#" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem' }}>Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
          }}>
            <div style={{ fontSize: '0.85rem' }}>
              © 2026 <span style={{ color: '#7c5cfc', fontWeight: 600 }}>SmartLink</span>. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3a5', boxShadow: '0 0 10px #22d3a5' }} />
                <span>System Operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                <span>27ms response</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} />
                <span>99.99% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,92,252,0.3); }
          50%       { box-shadow: 0 0 50px rgba(124,92,252,0.6), 0 0 100px rgba(124,92,252,0.2); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-word {
          animation: heroEntrance 1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hero-word-2 {
          animation-delay: 0.15s;
        }
        @keyframes heroEntrance {
          from { opacity: 0; transform: translateY(60px) skewY(3deg); }
          to   { opacity: 1; transform: translateY(0) skewY(0deg); }
        }
        .cta-btn-primary:hover {
          transform: translateY(-3px) scale(1.03) !important;
          box-shadow: 0 20px 60px rgba(124,92,252,0.5) !important;
        }
        input[placeholder] { color: #5555aa !important; }
        ::placeholder { color: #5555aa !important; }
        #final-cta-btn:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 24px 80px rgba(124,92,252,0.5) !important;
        }
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
