import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button, Badge, Input, Select } from '../components/ui';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');

  useEffect(() => {
    setLoading(true);
    api.get('/audit')
      .then(res => {
        if (res.data?.data) {
          setLogs(res.data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (log.target?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const getActionBadgeVariant = (action: string) => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('CREATE') || upperAction.includes('INSERT')) return 'create';
    if (upperAction.includes('UPDATE') || upperAction.includes('EDIT')) return 'update';
    if (upperAction.includes('DELETE') || upperAction.includes('REMOVE')) return 'delete';
    if (upperAction.includes('LOGIN') || upperAction.includes('AUTH')) return 'login';
    return 'info';
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-base text-gray-500 mt-1">System activity and security logs (Read-only)</p>
        </div>
        <div title="Export functionality is currently disabled">
          <Button variant="outline" icon="download" disabled>
            Export Logs
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col mt-6">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Input 
                icon="search"
                placeholder="Search action or user..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-3.5 text-center text-sm text-gray-500">Loading audit logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-3.5 text-center text-sm text-gray-500">No logs found</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.user_name || 'System'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500">
                    {log.target}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
