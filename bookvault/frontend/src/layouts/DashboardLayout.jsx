import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Library,
  Heart,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Plus,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books', icon: Library, label: 'My Books' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/wishlist', icon: ShoppingBag, label: 'Wishlist' },
  { to: '/stats', icon: BarChart3, label: 'Statistics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const themeIcons = { light: Sun, dark: Moon, system: Laptop };

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-soft">
          <BookOpen className="text-white" size={18} />
        </div>
        <span className="font-display font-bold text-lg text-primary dark:text-accent">BookVault</span>
      </div>

      <button
        onClick={() => navigate('/books/new')}
        className="btn-primary mx-6 mb-4"
      >
        <Plus size={18} /> Quick Add Book
      </button>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-accent/50 dark:hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-accent/50 dark:hover:bg-white/10 transition-all"
        >
          <ThemeIcon size={18} />
          Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 border-t border-stone-200/60 dark:border-white/10">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-display font-semibold text-primary">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.username}</p>
          <p className="text-xs text-stone-400 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 border-r border-stone-200/60 dark:border-white/10 glass sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="text-white" size={16} />
          </div>
          <span className="font-display font-bold text-primary dark:text-accent">BookVault</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 glass lg:hidden"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4" aria-label="Close menu">
                <X />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-16 lg:pt-0 relative">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
