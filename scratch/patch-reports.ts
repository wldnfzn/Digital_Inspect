import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('apps/web/src/pages/ReportsPage.tsx', 'utf8');

// 1. Add handleDelete
const handleDelSrc = `
  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      await api.delete(\`/reports/\${type}/\${id}\`);
      alert('Report deleted successfully');
      setReports(reports.filter(r => r.id !== id));
    } catch (e: any) {
      alert('Failed to delete: ' + (e.response?.data?.error || e.message));
    }
  };

  const openDetail`;

content = content.replace('  const openDetail', handleDelSrc);

// 2. Add Delete button in the table row
const btnSrc = `                      <td className="p-sm pr-md flex gap-2">
                        <button 
                          className="text-primary hover:underline text-sm font-medium cursor-pointer"
                          onClick={() => openDetail(r.id, r.asset_type)}
                        >
                          View Detail
                        </button>
                        <button 
                          className="text-error hover:underline text-sm font-medium cursor-pointer"
                          onClick={() => handleDelete(r.id, r.asset_type)}
                        >
                          Delete
                        </button>
                      </td>`;

content = content.replace(/<td className="p-sm pr-md">[\s\S]*?<\/td>/, btnSrc);

writeFileSync('apps/web/src/pages/ReportsPage.tsx', content);
console.log('Done reports');
