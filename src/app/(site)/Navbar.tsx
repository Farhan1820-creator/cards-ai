'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, LogOut, ChevronDown } from 'lucide-react';

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/contact', label: 'Contact' },
];

const linkClass =
  'font-medium text-primary-foreground pb-0.5 transition duration-300 hover:scale-105 hover:border-b hover:border-b-[1.5px] hover:border-b-purple-600 hover:translate-y-0.5';

function UserAvatar({ name }: { name?: string | null }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-medium flex-shrink-0">
      {initials}
    </div>
  );
}

function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-purple-300 bg-white transition-colors"
      >
        <UserAvatar name={session.user?.name} />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate">
            {session.user?.name}
          </span>
          <span className="text-[11px] text-gray-500 max-w-[100px] truncate">
            {session.user?.email}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-sm z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>

          {/* Items */}
          <Link
            href="/templates"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-400" />
            Create
          </Link>

          <div className="border-t border-gray-100" />

          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/login' }); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-primary border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/home" className="flex items-center h-10 w-10 bg-primary-foreground">
            <Image src="https://res.cloudinary.com/dggey8rb6/image/upload/v1781519413/download_e9qskl.png" alt="Cards AI logo" width={40} height={40} className="object-contain" />
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth - Right */}
          <div className="hidden md:flex items-center space-x-3">
            {status === 'loading' ? (
              <span className="text-sm text-white">Loading...</span>
            ) : session ? (
              <UserDropdown />
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-white border border-1 border-white hover:bg-white/90 text-primary px-7 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm hover:shadow"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary border border-1 border-white hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-primary-foreground hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg font-medium hover:bg-gray-50 text-gray-700"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              {status !== 'loading' && (
                session ? (
                  <div className="px-4 py-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={session.user?.name} />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-gray-800">{session.user?.name}</span>
                        <span className="text-xs text-gray-500">{session.user?.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/templates"
                        onClick={closeMobileMenu}
                        className="w-full text-center bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                      >
                        Create a Card
                      </Link>
                      <button
                        onClick={() => { closeMobileMenu(); signOut({ callbackUrl: '/login' }); }}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="w-full text-center border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="w-full text-center bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                    >
                      Sign Up
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