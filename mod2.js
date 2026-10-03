const fs = require('fs');

// 1. Fix ReportsPage.tsx
let rep = fs.readFileSync('apps/web/src/pages/ReportsPage.tsx', 'utf-8');

// Replace Table Header for Reports
rep = rep.replace(
  '<th className="p-2 pl-md font-label-sm text-label-sm font-semibold">Completed Date</th>',
  '<th className="p-2 pl-md font-label-sm text-label-sm font-semibold">Completed Date</th>\n                  <th className="p-2 font-label-sm text-label-sm font-semibold">Report Code</th>'
);

// Replace Table Row for Reports
rep = rep.replace(
  '<td className="p-2 pl-md">{new Date(r.date).toLocaleString()}</td>',
  '<td className="p-2 pl-md">{new Date(r.date).toLocaleString([], { year: \'numeric\', month: \'2-digit\', day: \'2-digit\', hour: \'2-digit\', minute: \'2-digit\' })}</td>\n                      <td className="p-2 font-medium text-primary">{r.report_code || \'-\'}</td>'
);

fs.writeFileSync('apps/web/src/pages/ReportsPage.tsx', rep);

// 2. Fix DashboardPage.tsx
let dash = fs.readFileSync('apps/web/src/pages/DashboardPage.tsx', 'utf-8');

// Remove the hardcoded * 1.5 hours, just show nothing or a placeholder.
dash = dash.replace(
  '<span className="text-[10px] text-gray-500 font-semibold">{m.total_hours || (m.count * 1.5)} Jam Pengerjaan</span>',
  ''
);

fs.writeFileSync('apps/web/src/pages/DashboardPage.tsx', dash);

console.log('done');
