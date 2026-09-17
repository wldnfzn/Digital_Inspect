import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import { api } from '../lib/api';
import { BatteryPrintLayout } from '../components/BatteryPrintLayout';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, FORKLIFT, BATTERY

  useEffect(() => {
    setLoading(true);
    api.get('/reports')
      .then(res => setReports(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer?.toLowerCase().includes(search.toLowerCase()) ||
      r.mechanic?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || r.asset_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Hapus laporan ini? Data yang sudah dihapus tidak dapat dikembalikan.')) return;
    try {
      await api.delete(`/reports/${type}/${id}`);
      alert('Laporan berhasil dihapus');
      setReports(reports.filter(r => r.id !== id));
    } catch (e: any) {
      alert('Gagal: ' + (e.response?.data?.error || e.message));
    }
  };

  const openDetail = (id: string, type: string) => {
    setLoadingDetail(true);
    setSelectedReportType(type);
    api.get(`/inspections/${type.toLowerCase()}/${id}`)
      .then(res => {
        setSelectedReport(res.data.data);
        setLoadingDetail(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingDetail(false);
      });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-background">Inspection Reports</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">View completed inspection and service reports</p>
        </div>
        <button 
          onClick={() => alert('Export to Excel feature coming soon!')}
          className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-6">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-body-md">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-body-md h-9 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" 
              placeholder="Search reports..." 
              type="text"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 bg-gray-50 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow h-9"
            >
              <option value="ALL">All Asset Types</option>
              <option value="FORKLIFT">Forklifts Only</option>
              <option value="BATTERY">Batteries Only</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                <th className="p-sm pl-md font-label-sm text-label-sm font-semibold">Completed Date</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Asset Type</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Asset Code</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Customer</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Mechanic</th>
                <th className="p-sm font-label-sm text-label-sm font-semibold">Score / Result</th>
                <th className="p-sm pr-md font-label-sm text-label-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-background">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading reports...</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">No completed reports found</td></tr>
              ) : (
                filteredReports.map(r => (
                  <tr key={r.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                    <td className="p-sm pl-md">{new Date(r.date).toLocaleString()}</td>
                    <td className="p-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {r.asset_type === 'FORKLIFT' ? 'forklift' : 'battery_charging_full'}
                        </span>
                        {r.asset_type}
                      </span>
                    </td>
                    <td className="p-sm font-medium text-primary">{r.asset_code}</td>
                    <td className="p-sm text-on-surface-variant">{r.customer || '-'}</td>
                    <td className="p-sm">{r.mechanic || '-'}</td>
                    <td className="p-sm">
                      {r.asset_type === 'FORKLIFT' ? (
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm border ${
                          r.status === 'CRITICAL' ? 'bg-error-container text-on-error-container border-error/20' :
                          r.status === 'ATTENTION' ? 'bg-warning-container text-on-warning-container border-warning/20' :
                          'bg-success-container text-on-success-container border-success/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'CRITICAL' ? 'bg-error' :
                            r.status === 'ATTENTION' ? 'bg-warning' :
                            'bg-success'
                          }`}></span> {r.score}%
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full font-label-sm text-label-sm border ${
                          r.status === 'ATTENTION' ? 'bg-warning-container text-on-warning-container border-warning/20' :
                          'bg-success-container text-on-success-container border-success/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.status === 'ATTENTION' ? 'bg-warning' : 'bg-success'
                          }`}></span> {r.score}V
                        </span>
                      )}
                    </td>
                    <td className="p-sm pr-md flex gap-2">
                      <button 
                        className="text-primary hover:underline text-sm font-medium cursor-pointer"
                        onClick={() => openDetail(r.id, r.asset_type)}
                      >
                        View Detail
                      </button>
                      <button 
                        className="text-error hover:underline text-sm font-medium cursor-pointer text-[#dc2626]"
                        onClick={() => handleDelete(r.id, r.asset_type)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">Loading details...</div>
        </div>
      )}

      {selectedReport && !loadingDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:block print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:w-full print:max-w-none print:overflow-visible print:block print:rounded-none">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-headline-sm text-headline-sm">
                Report Detail - {selectedReport.asset_code}
                <span className="text-sm font-normal text-on-surface-variant ml-2">
                  (No: {selectedReport.additional_data?.service_report_no || selectedReport.full_report_data?.service_report_no || 'N/A'})
                </span>
              </h3>
              <div className="flex gap-2 items-center">
                <button onClick={() => window.print()} className="no-print bg-primary hover:bg-primary-fixed-variant text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span> Print PDF
                </button>
                <button onClick={() => setSelectedReport(null)} className="no-print material-symbols-outlined cursor-pointer text-gray-500 hover:text-gray-800 ml-2 transition-colors">close</button>
              </div>
            </div>
            
            <div id="printable-report" className="p-6 overflow-y-auto flex-1 bg-white text-black print:block print:overflow-visible print:p-0">
              <div className="print:hidden">
                <div className="text-center mb-6 border-b-2 border-black pb-4 hidden print:block">
                  <h1 className="text-2xl font-bold uppercase">Service Report</h1>
                  <h2 className="text-lg">No: {selectedReport.additional_data?.service_report_no || selectedReport.full_report_data?.service_report_no || 'N/A'}</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50/50 border border-gray-200 rounded-xl mb-6 text-body-md print:border-gray-300 print:p-4 print:gap-4 print:rounded-none print:bg-transparent">
                  {selectedReportType === 'FORKLIFT' && (
                    <>
                      <div><strong>Model:</strong> {selectedReport.model || '-'}</div>
                      <div><strong>Year:</strong> {selectedReport.year || '-'}</div>
                    </>
                  )}
                  <div><strong>Client:</strong> {selectedReport.customer_name || 'Internal'}</div>
                  <div><strong>Address:</strong> {selectedReport.customer_address || '-'}</div>
                  <div><strong>Mechanic:</strong> {selectedReport.mechanic}</div>
                  <div>
                    <strong>Time:</strong> {selectedReport.additional_data?.started_at ? new Date(selectedReport.additional_data.started_at).toLocaleString() : '-'} s/d {new Date(selectedReport.completed_at).toLocaleString()}
                  </div>
                  {selectedReport.additional_data?.location && (
                    <div className="col-span-2">
                      <strong>Location:</strong> {selectedReport.additional_data.location.latitude.toFixed(4)}, {selectedReport.additional_data.location.longitude.toFixed(4)}
                    </div>
                  )}
                  {selectedReportType === 'FORKLIFT' && <div><strong>Health Score:</strong> {selectedReport.health_percentage}%</div>}
                </div>

                {selectedReportType === 'FORKLIFT' && selectedReport.additional_data && (
                  <div className="mb-6 p-4 border border-gray-300 space-y-2 text-sm">
                    <h4 className="font-bold mb-2 border-b border-gray-300 pb-2">General Data</h4>
                    <div><strong className="inline-block w-32">Hour Meter:</strong> {selectedReport.additional_data.hour_meter || '-'}</div>
                    <div><strong className="inline-block w-32">Service Type:</strong> {selectedReport.additional_data.service_type || '-'}</div>
                    <div><strong className="inline-block w-32">Working Cond:</strong> {selectedReport.additional_data.working_conditions?.join(', ') || '-'}</div>
                  </div>
                )}

                {selectedReportType === 'FORKLIFT' && selectedReport.scores && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">Checklist Items</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100"><th className="border border-gray-300 p-2">Category</th><th className="border border-gray-300 p-2">Item</th><th className="border border-gray-300 p-2 w-20 text-center">Score</th></tr>
                      </thead>
                      <tbody>
                        {selectedReport.scores.map((s: any, idx: number) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 p-2 text-sm">{s.category_name}</td>
                            <td className="border border-gray-300 p-2 text-sm">{s.item_name} {s.photo_url && <a href={s.photo_url} target="_blank" rel="noreferrer" className="text-blue-500 underline ml-2 no-print">(Bukti Foto)</a>}</td>
                            <td className={`border border-gray-300 p-2 text-center font-bold ${s.score === 3 ? 'text-success' : s.score === 2 ? 'text-warning' : 'text-error'}`}>{s.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.parts_used?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">Based On Above Report We Used</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Qty</th><th className="border border-gray-300 p-2">Description</th><th className="border border-gray-300 p-2">Part No.</th></tr></thead>
                      <tbody>
                        {selectedReport.additional_data.parts_used.map((p: any, idx: number) => (
                          <tr key={idx}><td className="border border-gray-300 p-2 text-sm">{p.qty}</td><td className="border border-gray-300 p-2 text-sm">{p.description}</td><td className="border border-gray-300 p-2 text-sm">{p.part_no}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.parts_recommended?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-2">We Recomend You To Order</h4>
                    <table className="w-full text-left border-collapse border border-gray-300">
                      <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2">Qty</th><th className="border border-gray-300 p-2">Description</th><th className="border border-gray-300 p-2">Part No.</th></tr></thead>
                      <tbody>
                        {selectedReport.additional_data.parts_recommended.map((p: any, idx: number) => (
                          <tr key={idx}><td className="border border-gray-300 p-2 text-sm">{p.qty}</td><td className="border border-gray-300 p-2 text-sm">{p.description}</td><td className="border border-gray-300 p-2 text-sm">{p.part_no}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.additional_data?.action_flags?.length > 0 && (
                  <div className="mb-6 p-4 border border-gray-300">
                    <h4 className="font-bold mb-2">Action Flags:</h4>
                    <p>{selectedReport.additional_data.action_flags.join(', ')}</p>
                  </div>
                )}

                <div className="mt-12 pt-8 flex justify-between px-10 hidden print:flex">
                  <div className="text-center">
                    <p className="mb-16">Customer Signature</p>
                    <p className="border-t border-black pt-2">(................................................)</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-16">Mechanic Signature</p>
                    <p className="border-t border-black pt-2">({selectedReport.mechanic})</p>
                  </div>
                </div>
                {selectedReport.notes && <div className="mt-4 p-4 bg-surface-container-low rounded"><strong className="block mb-1">Notes:</strong> {selectedReport.notes}</div>}

                {selectedReportType === 'BATTERY' && selectedReport.full_report_data && (
                  <div>
                    <h4 className="font-bold mb-2">Battery Service Detail</h4>
                    <div className="p-4 bg-surface-container-low rounded-lg space-y-4 text-sm">
                      <div><strong>Condition during servicing:</strong> {selectedReport.full_report_data.condition_during_servicing || '-'}</div>
                      
                      <div>
                        <strong className="block mb-2">Charger Info:</strong>
                        <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary">
                          <div>Brand: {selectedReport.full_report_data.charger?.brand || '-'}</div>
                          <div>Input: {selectedReport.full_report_data.charger?.input || '-'}</div>
                          <div>Output: {selectedReport.full_report_data.charger?.output || '-'}</div>
                          <div>Condition: {selectedReport.full_report_data.charger?.condition || '-'}</div>
                        </div>
                      </div>

                      <div>
                        <strong className="block mb-2">Other Battery Info:</strong>
                        <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-primary">
                          {Object.entries(selectedReport.full_report_data.other_info || {}).map(([k, v]) => (
                            <div key={k} className="capitalize">{k}: <span className="font-medium">{v as string}</span></div>
                          ))}
                        </div>
                      </div>

                      {selectedReport.full_report_data.cells && (
                        <div>
                          <strong className="block mb-2">40 Cells Readings (S.G / Volts):</strong>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                            {selectedReport.full_report_data.cells.map((c: any, i: number) => (
                              <div key={i} className="text-xs border p-1 bg-white text-center">
                                <div className="font-bold text-[10px] text-primary border-b mb-1">C{i+1}</div>
                                <div>{c.sg || '-'}</div>
                                <div>{c.v || '-'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedReport.full_report_data.work_done && (
                        <div><strong className="block mb-1">Work Done:</strong> {selectedReport.full_report_data.work_done}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* EXACT NCR PDF LAYOUT (ONLY SHOWN IN PRINT) */}
              {selectedReportType === 'BATTERY' ? (
                <BatteryPrintLayout report={selectedReport} />
              ) : (
                <div className="hidden print:block text-[10px] leading-tight font-sans">
                {/* Header */}
                <div className="flex border-b-2 border-black pb-2 mb-2 items-center">
                  <div className="w-1/4">
                    <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-4xl">M</div>
                  </div>
                  <div className="w-3/4 text-center">
                    <h1 className="text-xl font-bold text-black uppercase tracking-wider mb-1">PT UNITED MULTILIFT PERKASA</h1>
                    <p className="font-bold text-[9px]">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423</p>
                    <p className="font-bold text-[9px]">Tel. 021 - 8240 1141 (Hunting)</p>
                    <p className="text-[9px]">www.multiliftperkasa.com • e-mail: marketing@multiliftperkasa.com</p>
                  </div>
                </div>

                {/* Info Block */}
                <div className="grid grid-cols-3 gap-2 mb-2 text-[9px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-16 font-bold uppercase">CLIENT</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.customer_name}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">ADDRESS</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.customer_address}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">MODEL</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.model || '-'}</span></div>
                    <div className="flex"><span className="w-16 font-bold uppercase">YEAR</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.year || '-'}</span></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-20 font-bold uppercase">PRODUCT</span><span>: </span><span className="flex-1 border-b border-black uppercase">{selectedReportType}</span></div>
                    <div className="flex"><span className="w-20 font-bold uppercase">HOUR METER</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.additional_data?.hour_meter || '-'}</span></div>
                    <div className="flex"><span className="w-20 font-bold uppercase">SERIAL NO</span><span>: </span><span className="flex-1 border-b border-black">{selectedReport.asset_code}</span></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex"><span className="w-24 font-bold uppercase">DATE</span><span className="flex-1 border-b border-black">{new Date(selectedReport.completed_at).toLocaleDateString()}</span></div>
                    <div className="flex"><span className="w-24 font-bold uppercase">SERVICE REPORT NO.</span><span className="flex-1 border-b border-black">{selectedReport.additional_data?.service_report_no || '-'}</span></div>
                    
                    <div className="mt-2 flex flex-col gap-1 text-[8px]">
                      {['Warranty Service', 'Contract Service', 'Non-Contract Service'].map(svc => (
                        <div key={svc} className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-black flex items-center justify-center font-bold">
                            {selectedReport.additional_data?.service_type === svc ? 'X' : ''}
                          </div>
                          <span className="uppercase font-bold">{svc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Working Conditions */}
                <div className="flex items-center gap-2 mb-3 text-[9px]">
                  <span className="font-bold w-24">WORKING CONDITION</span>
                  {['Indoor', 'Outdoor', 'Wet/Dry', 'Dusty', 'Aggressive'].map(cond => (
                    <div key={cond} className="border border-black px-1 uppercase font-bold text-[8px]">
                      {selectedReport.additional_data?.working_conditions?.includes(cond) ? '☑' : '☐'} {cond}
                    </div>
                  ))}
                </div>

                {/* Checklist (3 Columns Masonry) */}
                <div className="columns-3 gap-4 mb-4">
                  {Object.entries(
                    (selectedReport.scores || []).reduce((acc: any, curr: any) => {
                      if (!acc[curr.category_name]) acc[curr.category_name] = [];
                      acc[curr.category_name].push(curr);
                      return acc;
                    }, {})
                  ).map(([catName, items]: [string, any]) => (
                    <div key={catName} className="break-inside-avoid mb-2">
                      <div className="flex justify-between font-bold uppercase mb-1 border-b border-black text-[9px]">
                        <span>{catName}</span>
                        <span className="tracking-[0.2em] font-normal">1 2 3</span>
                      </div>
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center border border-black border-b-0 last:border-b text-[7px] leading-none">
                          <div className="w-4 border-r border-black text-center py-0.5">{idx + 1}</div>
                          <div className="flex-1 px-1 uppercase truncate py-0.5">{item.item_name}</div>
                          <div className="flex border-l border-black w-[45px] py-0.5">
                            <div className="w-1/3 border-r border-black text-center">{item.score === 1 ? 'X' : ''}</div>
                            <div className="w-1/3 border-r border-black text-center">{item.score === 2 ? 'X' : ''}</div>
                            <div className="w-1/3 text-center">{item.score === 3 ? 'X' : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend & Notes */}
                <div className="flex gap-4 mb-4 text-[9px]">
                  <div className="flex-1">
                    <p className="font-bold mb-1">Report of any other works carried out:</p>
                    <div className="border-b border-black min-h-[40px] italic p-1">{selectedReport.notes}</div>
                  </div>
                  <div className="w-64">
                    <p><strong>Report:</strong> Col. 1 - Item requires Immediate repair resp. replacement</p>
                    <p className="ml-10">Col. 2 - Item requires Attention</p>
                    <p className="ml-10">Col. 3 - Item is in order / completed</p>
                  </div>
                </div>

                {/* Parts Tables */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-[8px]">
                  <div>
                    <p className="text-center font-bold mb-1">Based on above report we used</p>
                    <table className="w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-1 w-8">QTY</th>
                          <th className="border border-black p-1">DESCRIPTION</th>
                          <th className="border border-black p-1 w-16">PART. No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.max(5, selectedReport.additional_data?.parts_used?.length || 0) }).map((_, i) => {
                          const p = selectedReport.additional_data?.parts_used?.[i] || {};
                          return (
                            <tr key={i}>
                              <td className="border border-black p-1 text-center h-4">{p.qty || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.description || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.part_no || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-center font-bold mb-1">We recommend you to order</p>
                    <table className="w-full border-collapse border border-black">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-1 w-8">QTY</th>
                          <th className="border border-black p-1">DESCRIPTION</th>
                          <th className="border border-black p-1 w-16">PART. No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.max(5, selectedReport.additional_data?.parts_recommended?.length || 0) }).map((_, i) => {
                          const p = selectedReport.additional_data?.parts_recommended?.[i] || {};
                          return (
                            <tr key={i}>
                              <td className="border border-black p-1 text-center h-4">{p.qty || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.description || ''}</td>
                              <td className="border border-black p-1 uppercase">{p.part_no || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures & Actions */}
                <p className="font-bold text-[7px] uppercase mb-4 text-center">Signing of the report constitute an intruction for works to be carried out where an official order may or may not follow</p>
                
                <div className="flex justify-between items-end mb-4 text-[9px]">
                  <div className="text-center w-48">
                    <div className="h-12 border-b border-black mb-1"></div>
                    <p className="font-bold uppercase">SERVICE PERFORMED BY</p>
                    <p className="uppercase">{selectedReport.mechanic}</p>
                  </div>
                  
                  <div className="border border-black text-center w-64">
                    <div className="border-b border-black p-1 font-bold text-[8px]">
                      The client was informend about the found<br/>Detect and the danger resulting therefrom
                    </div>
                    <div className="p-1 flex justify-between font-bold">
                      <div>WORKING HOURS:</div>
                      <div>DATE:</div>
                      <div>TO:</div>
                    </div>
                  </div>
                  
                  <div className="text-center w-48">
                    <div className="h-12 border-b border-black mb-1"></div>
                    <p className="font-bold uppercase">CLIENT SIGNATURE & STAMP</p>
                    <p className="uppercase mt-1 text-[7px]">NAME IN BLOCK LETTER<br/>PLEASE SUBMIT QUOTATION</p>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-4 font-bold uppercase text-[8px]">
                  {['Under Guarantee', 'To Be Charged', 'Urgently', 'Immediate'].map(flag => (
                    <div key={flag} className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center">
                        {selectedReport.additional_data?.action_flags?.includes(flag) ? 'X' : ''}
                      </div>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end bg-surface-container-lowest">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 border rounded font-medium hover:bg-surface-container-low">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
