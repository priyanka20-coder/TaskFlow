import { useState, useEffect } from 'react';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

// Splits a 'YYYY-MM-DD' string into { day, month, year } parts for the dropdowns
function splitDate(dueDate) {
  if (!dueDate) return { day: '', month: '', year: '' };
  const [year, month, day] = dueDate.slice(0, 10).split('-');
  return { day: day || '', month: month || '', year: year || '' };
}

const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  category: 'General',
  status: 'to-do',
};
export default function TaskModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState('');
  const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });
  useEffect(() => {
    if (initialData) {
      const cleanDueDate = initialData.dueDate ? initialData.dueDate.slice(0, 10) : '';
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        dueDate: cleanDueDate,
        priority: initialData.priority || "medium",
        category: initialData.category || "General",
        status: initialData.status || "to-do",
      });
      setDateParts(splitDate(cleanDueDate));
    } else {
      setForm(emptyTask);
      setDateParts({ day: '', month: '', year: '' });
    }
    setError('');
  }, [initialData, isOpen]);
  if (!isOpen) return null;
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleDatePartChange = (part, value) => {
    const updated = { ...dateParts, [part]: value };
    setDateParts(updated);
    const { day, month, year } = updated;
    if (day && month && year) {
      // Build the date string explicitly ourselves — never rely on the
      // browser or device to parse/guess the order of day/month/year.
      const safeDay = day.padStart(2, '0');
      setForm((prev) => ({ ...prev, dueDate: `${year}-${month}-${safeDay}` }));
    } else {
      setForm((prev) => ({ ...prev, dueDate: '' }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please fill in this field.');
      return;
    }

    if (!form.dueDate) {
      setError('Please select a due date (day, month and year).');
      return;
    }

    if (form.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) {
      setError('Due date looks invalid. Please pick it again using the calendar.');
      return;
    }
    console.log("Updating Task:", form);
    onSubmit(form);
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-display font-semibold mb-4">
          {initialData ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className="input-field"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Due date</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="Day"
                  value={dateParts.day}
                  onChange={(e) => handleDatePartChange('day', e.target.value)}
                  className="input-field"
                >
                  <option value="">Day</option>
                  {Array.from(
                    { length: daysInMonth(dateParts.year, dateParts.month) },
                    (_, i) => String(i + 1).padStart(2, '0'),
                  ).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Month"
                  value={dateParts.month}
                  onChange={(e) => handleDatePartChange('month', e.target.value)}
                  className="input-field"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Year"
                  value={dateParts.year}
                  onChange={(e) => handleDatePartChange('year', e.target.value)}
                  className="input-field"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 3000 - 1990 + 1 }, (_, i) => String(1990 + i)).map(

                    //{Array.from({ length: 21 }, (_, i) => String(new Date().getFullYear() - 10 + i)).map(

                    (y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="to-do">To Do</option>
                <option value="In Process">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? 'Save Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}