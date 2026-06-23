'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { BlocksIcon, LogOut, ChevronDown, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';


const HERO_ROUTES = ['/', '/home']; 
const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/contact', label: 'Contact' },
];

// ─── Three visual modes ───────────────────────────────────────────────────────
// hero      → transparent bg, white text
// default   → white bg, black text, hover:primary
// scrolled  → primary bg, white text, hover:white/bright
type NavMode = 'hero' | 'default' | 'scrolled';

function useNavMode(isHero: boolean): NavMode {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    // passive for perf
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (scrolled) return 'scrolled';
  if (isHero) return 'hero';
  return 'default';
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const navBg: Record<NavMode, string> = {
  hero:     'bg-transparent',
  default:  'bg-white shadow-sm',
  scrolled: 'bg-primary shadow-md',
};

const linkCls: Record<NavMode, string> = {
  hero:     'text-black/80 hover:text-black',
  default:  'text-gray-800 hover:text-primary',
  scrolled: 'text-white/85 hover:text-white',
};

const logoTextCls: Record<NavMode, string> = {
  hero:     'text-black',
  default:  'text-gray-900',
  scrolled: 'text-white',
};

const logoBgCls: Record<NavMode, string> = {
  hero:     'bg-transparent backdrop-blur-sm',
  default:  'bg-gray-100',
  scrolled: 'bg-white',   // ← white box on primary bg
};

const hamburgerCls: Record<NavMode, string> = {
  hero:     'text-black',
  default:  'text-gray-800',
  scrolled: 'text-white',
};



// ─── Sub-components ───────────────────────────────────────────────────────────
function UserAvatar({ name }: { name?: string | null }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

function UserDropdown({ mode }: { mode: NavMode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!session) return null;

  // Pill adapts: on white bg use a bordered dark pill, on colored bg use glass pill
  const pillCls =
    mode === 'default'
      ? 'flex items-center gap-2 border border-gray-200 text-gray-800 bg-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-all'
      : 'flex items-center gap-2 bg-white backdrop-blur-sm border border-white/25 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-all';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)} className={pillCls}>
        <UserAvatar name={session.user?.name} />
        <span className="max-w-[100px] truncate">{session.user?.name?.split(' ')[0]}</span>
        <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BlocksIcon className="w-4 h-4 text-gray-400" /> Dashboard
          </Link>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/login' }); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isHero = HERO_ROUTES.includes(pathname);
  const mode = useNavMode(isHero);
  return (
    <nav className={`
      ${'fixed'} top-0 left-0 right-0 z-50
      transition-all duration-300
      ${navBg[mode]}
    `}>
      <div className="mx-auto width-padding">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
<div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${logoBgCls[mode]}`}>              
                <Image
                src="https://res.cloudinary.com/dggey8rb6/image/upload/v1781519413/download_e9qskl.png"
                alt="Cards AI logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className={`font-bold text-sm hidden sm:block tracking-wide transition-colors duration-300 ${logoTextCls[mode]}`}>
              Cards AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`font-medium text-sm transition-colors duration-200 ${linkCls[mode]}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center">
            {status !== 'loading' && (
              session
                ? <UserDropdown mode={mode} />
                : <Link
                    href="/login"
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md
                      ${mode === 'default'
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white text-gray-900 hover:bg-white/90'}
                    `}
                  >
                    Get Started <ArrowUpRight className="w-4 h-4" />
                  </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden p-2 transition-colors duration-300 ${hamburgerCls[mode]}`}
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu — always white bg for readability */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg font-medium text-gray-800 hover:text-primary hover:bg-gray-50 transition-colors text-sm"
              >
                {label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              {status !== 'loading' && (
                session ? (
                  <div className="px-4 py-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {session.user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-gray-900">{session.user?.name}</span>
                        <span className="text-xs text-gray-500">{session.user?.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/templates"
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center bg-primary text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm hover:bg-primary/90"
                      >
                        Create a Card
                      </Link>
                      <button
                        onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/login' }); }}
                        className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-4 pb-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center bg-primary text-white hover:bg-primary/90 px-4 py-3 rounded-lg font-semibold transition-colors text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}