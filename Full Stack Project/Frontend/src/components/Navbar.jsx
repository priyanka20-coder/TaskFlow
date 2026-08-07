import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`;
  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-medium border-b border-slate-50 dark:border-slate-700 ${isActive ? 'text-primary bg-primary-light dark:bg-slate-700' : 'text-slate-600 dark:text-slate-300'}`;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 relative transition-colors">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-primary font-display font-bold text-lg">
          <span>✓</span> TaskFlow
        </div>

        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={linkClass}>
            Tasks
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-slate-500 dark:text-slate-300 hover:text-primary p-1.5 rounded-lg"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary text-white items-center justify-center text-sm font-semibold">
            {initial}
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex btn-secondary text-sm py-1.5 px-3"
          >
            Logout
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-slate-500 dark:text-slate-300 p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-lg z-40">
          <NavLink
            to="/dashboard"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tasks"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Tasks
          </NavLink>
          <NavLink
            to="/profile"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}