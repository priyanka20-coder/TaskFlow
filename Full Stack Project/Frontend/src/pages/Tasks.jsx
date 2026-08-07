import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { dueDateLabel, isOverdue } from '../utils/dateHelpers';
import { exportTasksToPDF } from '../utils/exportPdf.js';
import { useAuth } from '../context/AuthContext';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
} from '../api/tasksApi';
const priorityBorder = {
    high: 'border-l-priority-high',
    medium: 'border-l-priority-medium',
    low: 'border-l-priority-low',
};
const priorityBadge = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50',
};
function TaskSkeleton() {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-start gap-3 flex-1">
                <div className="skeleton w-4 h-4 rounded mt-1" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-3 w-1/2" />
                </div>
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
        </div>
    );
}
export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All status');
    const [priorityFilter, setPriorityFilter] = useState('All priority');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');
    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await getTasks();
            setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []);
        } catch (err) {
            toast.error('Could not load tasks');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadTasks();
    }, []);
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName;
            const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            if (e.key.toLowerCase() === 'n' && !isTyping && !modalOpen && !deleteTarget) {
                e.preventDefault();
                setEditingTask(null);
                setModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalOpen, deleteTarget]);
    const handleCreateOrUpdate = async (form) => {
        try {
            if (editingTask) {
                const res = await updateTask(editingTask._id || editingTask.id, form);
                setTasks((prev) =>
                    prev.map((t) =>
                        (t._id || t.id) === (editingTask._id || editingTask.id) ? res.data : t,
                    ),
                );
                toast.success('Task updated');
            } else {
                const res = await createTask(form);
                setTasks((prev) => [res.data, ...prev]);
                toast.success('Task created');
            }
            setModalOpen(false);
            setEditingTask(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        }
    };
    const confirmDelete = async () => {
        const id = deleteTarget;
        setDeleteTarget(null);
        const prev = tasks;
        setTasks((p) => p.filter((t) => (t._id || t.id) !== id));
        try {
            await deleteTask(id);
            toast.success('Task deleted');
        } catch (err) {
            setTasks(prev);
            toast.error('Could not delete task');
        }
    };
    const handleToggle = async (task) => {
        const id = task._id || task.id;
        const newValue = !task.completed;
        setTasks((p) =>
            p.map((t) =>
                (t._id || t.id) === id
                    ? {
                        ...t,
                        completed: newValue,
                    }
                    : t,
            ),
        );
        try {
            const res = await toggleTaskComplete(id);
            setTasks((p) => p.map((t) => ((t._id || t.id) === id ? res.data : t)));
            if (newValue) toast.success('Nice work! Task completed 🎉');
        } catch (err) {
            setTasks((p) =>
                p.map((t) =>
                    (t._id || t.id) === id
                        ? {
                            ...t,
                            completed: !newValue,
                        }
                        : t,
                ),
            );
            toast.error('Could not update task');
        }
    };
    const openEdit = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };
    const openNew = () => {
        setEditingTask(null);
        setModalOpen(true);
    };
    const categories = useMemo(() => {
        const set = new Set(tasks.map((t) => t.category || 'General').filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [tasks]);
    const filteredTasks = useMemo(() => {
        let result = [...tasks];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
            );
        }
        if (statusFilter !== 'All status') {
            result = result.filter((t) => (t.status || 'to-do') === statusFilter);
        }
        if (priorityFilter !== 'All priority') {
            result = result.filter((t) => (t.priority || 'medium') === priorityFilter);
        }
        if (categoryFilter !== 'All') {
            result = result.filter((t) => (t.category || 'General') === categoryFilter);
        }
        const priorityRank = {
            high: 0,
            medium: 1,
            low: 2,
        };
        if (sortBy === 'Due date') {
            result.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
        } else if (sortBy === 'Oldest') {
            result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === 'Priority') {
            result.sort(
                (a, b) => (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1),
            );
        } else {
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        return result;
    }, [tasks, search, statusFilter, priorityFilter, categoryFilter, sortBy]);
    return (
        <div className="min-h-screen dark:bg-slate-900">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-display font-semibold">My Tasks</h1>
                        <p className="text-xs text-slate-400 hidden sm:block">
                            Tip: press{' '}
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
                                N
                            </kbd>{' '}
                            to quickly add a task
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => exportTasksToPDF(filteredTasks, user?.name)}
                            className="btn-secondary"
                            title="Download tasks as PDF"
                        >
                            ⬇ Export PDF
                        </button>
                        <button onClick={openNew} className="btn-primary">
                            + New Task
                        </button>
                    </div>
                </div>

                {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategoryFilter(c)}
                                className={`chip ${categoryFilter === c ? 'chip-active' : 'chip-inactive'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                    <input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field flex-1 min-w-[200px]"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option>All status</option>
                        <option value="to-do">To Do</option>
                        <option value="In Process">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option>All priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option>Newest</option>
                        <option>Oldest</option>
                        <option>Due date</option>
                        <option>Priority</option>
                    </select>
                </div>

                <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                    {loading ? (
                        <>
                            <TaskSkeleton />
                            <TaskSkeleton />
                            <TaskSkeleton />
                        </>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-2">🗒️</div>
                            <p className="text-slate-500">No tasks found.</p>
                            <p className="text-slate-400 text-sm">
                                Try adjusting your filters, or add a new task.
                            </p>
                        </div>
                    ) : (
                        filteredTasks.map((t) => {
                            const id = t._id || t.id;
                            const overdue = isOverdue(t);
                            const dueLabel = dueDateLabel(t.dueDate);
                            const border = priorityBorder[t.priority] || priorityBorder.medium;
                            return (
                                <div
                                    key={id}
                                    className={`flex items-center justify-between px-6 py-4 border-l-4 ${border} ${overdue ? 'bg-red-50/40 dark:bg-red-900/20' : ''}`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={!!t.completed}
                                            onChange={() => handleToggle(t)}
                                            className="mt-1 w-4 h-4 accent-primary flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={`font-medium truncate ${t.completed ? 'line-through text-slate-400' : ''}`}
                                            >
                                                {t.title}
                                            </p>
                                            {t.description && (
                                                <p className="text-sm text-slate-500 truncate">{t.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400">
                                                    {t.category || 'General'}
                                                </span>
                                                {dueLabel && !t.completed && (
                                                    <span
                                                        className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-400'}`}
                                                    >
                                                        • {dueLabel.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full capitalize hidden sm:inline-block ${priorityBadge[t.priority] || priorityBadge.medium}`}
                                        >
                                            {t.priority || 'medium'}
                                        </span>
                                        {t.dueDate && (
                                            <span className="text-xs text-slate-400 w-20 text-right hidden md:inline-block">
                                                {new Date(t.dueDate).toLocaleDateString('en-GB')}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => openEdit(t)}
                                            className="text-slate-400 hover:text-primary"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(id)}
                                            className="text-slate-400 hover:text-red-500"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            <TaskModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleCreateOrUpdate}
                initialData={editingTask}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete this task?"
                message="This can't be undone. The task will be permanently removed."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}