export function dueDateLabel(dueDate) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return {
            text: 'Due today',
            overdue: false,
        };
    if (diffDays === 1)
        return {
            text: 'Due tomorrow',
            overdue: false,
        };
    if (diffDays > 1)
        return {
            text: `${diffDays} days left`,
            overdue: false,
        };
    if (diffDays === -1)
        return {
            text: 'Overdue by 1 day',
            overdue: true,
        };
    return {
        text: `Overdue by ${Math.abs(diffDays)} days`,
        overdue: true,
    };
}
export function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);
    return due < new Date();
}