import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🧭</div>
        <h1 className="text-3xl font-display font-bold mb-2">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}