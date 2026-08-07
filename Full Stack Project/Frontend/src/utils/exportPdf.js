import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export function exportTasksToPDF(tasks, userName) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('TaskFlow — Task Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `Generated for ${userName || 'User'} on ${new Date().toLocaleDateString()}`,
        14,
        27,
    );
    const rows = tasks.map((t) => [
        t.title,
        t.category || 'General',
        (t.priority || 'medium').toUpperCase(),
        t.status || 'to-do',
        t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : '—',
        t.completed ? 'Yes' : 'No',
    ]);
    autoTable(doc, {
        startY: 34,
        head: [['Title', 'Category', 'Priority', 'Status', 'Due Date', 'Completed']],
        body: rows,
        headStyles: {
            fillColor: [79, 70, 229],
        },
        styles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250],
        },
    });
    doc.save(`taskflow-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}