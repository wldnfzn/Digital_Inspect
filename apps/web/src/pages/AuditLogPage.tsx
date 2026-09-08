import { useState } from 'react';

const DUMMY_LOGS = [
  { id: '101', timestamp: '24 Aug 2026, 14:32:01', user: 'Admin (Super Admin)', action: 'UPDATE_USER', target: 'User ID: 5 (Joko)', details: 'Changed status to Inactive' },
  { id: '102', timestamp: '24 Aug 2026, 13:15:22', user: 'Budi (Manager)', action: 'CREATE_ASSET', target: 'Forklift FL-0042', details: 'Added new forklift for PT ABC' },
  { id: '103', timestamp: '24 Aug 2026, 10:12:18', user: 'Andi (Mechanic)', action: 'SUBMIT_INSPECTION', target: 'Inspection INS-2026-0042', details: 'Submitted forklift inspection. Health: 92%' },
  { id: '104', timestamp: '23 Aug 2026, 16:45:00', user: 'Pak Dir (Director)', action: 'DOWNLOAD_REPORT', target: 'Monthly Fleet Health', details: 'Exported PDF report for July 2026' },
  { id: '105', timestamp: '23 Aug 2026, 09:10:11', user: 'System', action: 'CRITICAL_ALERT', target: 'Forklift FL-0015', details: 'Score 1 detected on Brake System' },
  { id: '106', timestamp: '22 Aug 2026, 08:30:00', user: 'Budi (Manager)', action: 'UPDATE_CUSTOMER', target: 'Customer: PT XYZ', details: 'Updated contact person details' },
];

export const AuditLogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-background">Audit Log</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">System activity and security logs (Read-only)</p>
        </div>
        <button className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:border-outline transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          Export Logs
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col mt-md">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright">
          <div className="flex gap-md w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-body-md h-8 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Search action or user..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-outline-variant rounded-lg px-2 text-sm bg-surface-container-low h-8 outline-none focus:border-primary"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom">Custom Range...</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold w-48">Timestamp</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold w-48">User</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold w-40">Action</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold w-48">Target</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {DUMMY_LOGS.map((log) => (
                <tr key={log.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="p-sm pl-md text-on-surface-variant font-asset-id text-xs">{log.timestamp}</td>
                  <td className="p-sm font-medium">{log.user}</td>
                  <td className="p-sm">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary-fixed-dim text-on-primary-fixed font-label-sm text-[10px] border border-primary-fixed uppercase tracking-wider">
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-sm text-on-surface-variant">{log.target}</td>
                  <td className="p-sm pr-md text-on-surface-variant text-sm">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
