import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navBg = isLanding
    ? scrolled
      ? 'rgba(6,6,15,0.85)'
      : 'transparent'
    : 'rgba(10,10,20,0.95)';

  const navBorder = isLanding
    ? scrolled
      ? '1px solid rgba(255,255,255,0.07)'
      : '1px solid transparent'
    : '1px solid rgba(255,255,255,0.07)';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: navBg,
      borderBottom: navBorder,
      backdropFilter: scrolled || !isLanding ? 'blur(20px)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
              boxShadow: '0 0 20px rgba(124,92,252,0.4)',
              transition: 'all 0.3s ease',
            }}>⚡</div>
            <span style={{
              fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em',
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #f0f0ff, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>SmartLink</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 10,
                    fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                    color: isActive('/dashboard') ? '#a78bfa' : '#8888aa',
                    background: isActive('/dashboard') ? 'rgba(124,92,252,0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 10,
                    fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                    color: isActive('/settings') ? '#a78bfa' : '#8888aa',
                    background: isActive('/settings') ? 'rgba(124,92,252,0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Settings size={15} />
                  Settings
                </Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              style={{
                padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: theme === 'dark' ? '#fbbf24' : '#8888aa',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f0ff' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#5555aa' }}>{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                    fontFamily: 'inherit', transition: 'all 0.2s ease',
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" style={{
                  padding: '9px 16px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
                  color: '#8888aa', textDecoration: 'none', transition: 'color 0.2s ease',
                }}>
                  Sign In
                </Link>
                <Link to="/register" id="nav-register-btn" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 20px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #7c5cfc, #5b8def)',
                  color: '#fff', textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(124,92,252,0.35)',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,92,252,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(124,92,252,0.35)';
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none', padding: 8, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f0ff', cursor: 'pointer',
            }}
            className="mobile-ham"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(6,6,15,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {user ? (
            <>
              <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: '#f0f0ff' }}>{user.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#5555aa' }}>{user.email}</div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                borderRadius: 12, color: '#c0c0dd', textDecoration: 'none', fontWeight: 500,
                background: 'rgba(255,255,255,0.04)', marginBottom: 4
              }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                borderRadius: 12, color: '#c0c0dd', textDecoration: 'none', fontWeight: 500,
                background: 'rgba(255,255,255,0.04)', marginBottom: 4
              }}>
                <Settings size={16} /> Settings
              </Link>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                borderRadius: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 500, fontSize: '0.95rem',
              }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 8 }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{
                padding: '12px', borderRadius: 12, textAlign: 'center', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)', color: '#c0c0dd', textDecoration: 'none',
              }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{
                padding: '12px', borderRadius: 12, textAlign: 'center', fontWeight: 700,
                background: 'linear-gradient(135deg, #7c5cfc, #5b8def)', color: '#fff', textDecoration: 'none',
              }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-ham { display: flex !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
