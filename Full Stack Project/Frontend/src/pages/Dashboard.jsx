import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext';
import { getTasks, getStats } from '../api/tasksApi';
import { dueDateLabel, isOverdue } from '../utils/dateHelpers';
import toast from 'react-hot-toast';
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};
export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([getTasks(), getStats()]);
        setTasks(
          Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.tasks || [],
        );
        setCounts(statsRes.data);
      } catch (err) {
        toast.error('Could not load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const { total, completed, pending, overdue } = counts;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const todayTasks = useMemo(
    () =>
      tasks.filter((t) => !t.completed && dueDateLabel(t.dueDate)?.text === 'Due today'),
    [tasks],
  );
  const upcoming = [...tasks]
    .filter((t) => t.dueDate && !t.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
  const priorityChartData = useMemo(() => {
    const counts = {
      high: 0,
      medium: 0,
      low: 0,
    };
    tasks.forEach((t) => {
      const p = t.priority || 'medium';
      if (counts[p] !== undefined) counts[p]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [tasks]);
  const categoryChartData = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const cat = t.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
    }));
  }, [tasks]);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const stats = [
    {
      label: 'Total',
      value: total,
      icon: '📋',
      color: 'border-primary text-primary',
    },
    {
      label: 'Completed',
      value: completed,
      icon: '✅',
      color: 'border-green-500 text-green-600',
    },
    {
      label: 'Pending',
      value: pending,
      icon: '⏳',
      color: 'border-amber-500 text-amber-600',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: '⚠️',
      color: 'border-red-500 text-red-600',
    },
  ];
  return (
    <div className="min-h-screen dark:bg-slate-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-display font-semibold">
          {greeting}, {user?.name || 'there'} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{today}</p>

        {!loading && todayTasks.length > 0 && (
          <div className="card p-5 mb-6 border-l-4 border-primary">
            <p className="text-sm font-semibold text-primary mb-3">
              🎯 Today's Focus — {todayTasks.length} task
              {todayTasks.length > 1 ? 's' : ''} due today
            </p>
            <ul className="space-y-2">
              {todayTasks.map((t) => (
                <li
                  key={t._id || t.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{t.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                    {t.priority || 'medium'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Overall progress
              </p>
              <p className="text-sm font-semibold text-primary">{progressPct}%</p>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {completed} of {total} tasks completed
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`card border-l-4 ${s.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold font-display">{s.value}</div>
                <span className="text-lg">{s.icon}</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {!loading && total > 0 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="card p-5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Tasks by priority
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {priorityChartData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-1">
                {priorityChartData.map((entry) => (
                  <span
                    key={entry.name}
                    className="flex items-center gap-1 capitalize text-slate-500 dark:text-slate-400"
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        backgroundColor: PRIORITY_COLORS[entry.name],
                      }}
                    />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Tasks by category
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  margin={{
                    left: 10,
                  }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{
                      fontSize: 12,
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-slate-700 dark:text-slate-200">
            Upcoming tasks
          </h2>
          <Link to="/tasks" className="text-primary text-sm font-medium">
            View all →
          </Link>
        </div>

        <div className="card p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-4 w-16" />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                All caught up — no pending tasks.
              </p>
              <Link to="/tasks" className="btn-primary">
                Add a task
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {upcoming.map((t) => {
                const overdue = isOverdue(t);
                return (
                  <li
                    key={t._id || t.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.dueDate && (
                        <p
                          className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}
                        >
                          {dueDateLabel(t.dueDate)?.text}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-light text-primary capitalize">
                      {t.priority || 'medium'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}