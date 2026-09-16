import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('apps/web/src/pages/InspectionsPage.tsx', 'utf8');

const startIndex = content.indexOf('<div className="overflow-x-auto">');
const correctCode = `<div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Date</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Asset Code</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Type</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Mechanic</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Status</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center">No tasks found matching filters</td></tr>
              ) : filteredTasks.map(t => (
                <tr key={t.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                  <td className="p-sm pl-md">{new Date(t.scheduled_date).toLocaleDateString()}</td>
                  <td className="p-sm font-medium text-primary">{t.asset_type === 'FORKLIFT' ? t.forklift_code : t.battery_code}</td>
                  <td className="p-sm">{t.asset_type}</td>
                  <td className="p-sm">{t.mechanic_name || t.assigned_to}</td>
                  <td className="p-sm">
                    <span className={\`px-2 py-1 rounded text-xs font-bold \${
                      t.status === 'COMPLETED' ? 'bg-[#dcfce7] text-[#166534]' : 
                      t.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }\`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-sm pr-md text-right">
                    {canSchedule && (
                      <button 
                        className="text-error hover:underline text-sm font-medium cursor-pointer text-[#dc2626]"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};`;

if (startIndex !== -1) {
  content = content.substring(0, startIndex) + correctCode;
  writeFileSync('apps/web/src/pages/InspectionsPage.tsx', content);
  console.log('Fixed syntax error by replacing table entirely.');
} else {
  console.log('Could not find overflow-x-auto');
}
