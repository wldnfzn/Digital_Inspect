import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import { Button, Input, Select } from '../components/ui';

export const QRCodesPage = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [printTargetId, setPrintTargetId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/forklifts').then(res => res.data.data.map((f: any) => ({ ...f, type: 'FORKLIFT' }))),
      api.get('/batteries').then(res => res.data.data.map((b: any) => ({ ...b, type: 'BATTERY' })))
    ])
    .then(([forklifts, batteries]) => {
      setAssets([...forklifts, ...batteries].sort((a, b) => a.asset_code.localeCompare(b.asset_code)));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.asset_code.toLowerCase().includes(search.toLowerCase()) || 
      (a.model && a.model.toLowerCase().includes(search.toLowerCase())) ||
      (a.brand && a.brand.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filter === 'ALL' || a.type === filter;

    return matchesSearch && matchesFilter;
  });

  const handlePrintAll = () => {
    setPrintTargetId(null);
    setTimeout(() => {
      try {
        window.print();
      } finally {
        setPrintTargetId(null);
      }
    }, 50);
  };

  const handlePrintSingle = (id: string) => {
    setPrintTargetId(id);
    setTimeout(() => {
      try {
        window.print();
      } finally {
        setPrintTargetId(null);
      }
    }, 100);
  };

  const getQRData = (asset: any) => {
    return JSON.stringify({ type: asset.type.toLowerCase(), id: asset.id });
  };

  return (
    <>
      {/* Hide this entire header and filter section when printing */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QR Code Management</h2>
            <p className="text-base text-gray-500 mt-1">Generate and print QR codes for assets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" icon="print" onClick={handlePrintAll}>
              Print All (Visible)
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6 mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <Select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
          >
            <option value="ALL">All Assets</option>
            <option value="FORKLIFT">Forklift</option>
            <option value="BATTERY">Battery</option>
          </Select>
          <div className="w-full sm:w-64 ml-auto">
            <Input 
              icon="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search code/model..." 
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 print:hidden">Loading assets...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center p-8 text-gray-500 print:hidden">No assets found</div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ${printTargetId === null ? 'print:grid-cols-4 print:gap-8' : 'print:block'}`}>
          {filteredAssets.map(asset => {
            const isTarget = printTargetId === asset.id;
            const isSinglePrintMode = printTargetId !== null;
            
            return (
              <div 
                key={asset.id} 
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all print:bg-white print:border-none print:shadow-none print:p-0 print:break-inside-avoid
                  ${isSinglePrintMode && !isTarget ? 'print:hidden' : ''}
                  ${isTarget ? 'print:fixed print:inset-0 print:m-0 print:w-full print:h-full print:border-none print:flex print:flex-col print:items-center print:justify-center print:p-8' : 'print:border-2 print:border-black print:p-2'}
                `}
              >
                <div className={`p-3 border border-gray-100 rounded-lg bg-white w-full flex items-center justify-center print:border-none print:p-0 ${isTarget ? 'print:w-full print:max-w-[70vw] print:max-h-[70vh] print:aspect-square' : 'aspect-square'}`}>
                  <QRCodeSVG 
                    value={getQRData(asset)} 
                    size={isTarget ? 1000 : 120} 
                    className="w-full h-auto max-w-full max-h-full"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center w-full min-w-0">
                  <p className={`font-asset-id text-gray-900 font-bold text-base truncate print:text-black ${isTarget ? 'print:text-5xl print:mt-6' : 'print:text-lg'}`}>{asset.asset_code}</p>
                  <p className={`text-primary font-semibold text-xs truncate print:text-gray-800 ${isTarget ? 'print:text-3xl print:mt-2' : ''}`}>{asset.type}</p>
                  <p className={`text-gray-500 text-xs mt-1 truncate print:text-gray-600 ${isTarget ? 'print:text-2xl print:mt-2' : ''}`}>{asset.model || asset.brand || '-'}</p>
                </div>
                <div className="w-full mt-auto print:hidden" title="Print this QR Code only">
                  <Button 
                    variant="outline"
                    icon="print"
                    onClick={() => handlePrintSingle(asset.id)}
                  >
                    Print
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
