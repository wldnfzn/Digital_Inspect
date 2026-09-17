import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';

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
    setTimeout(() => window.print(), 50);
  };

  const handlePrintSingle = (id: string) => {
    setPrintTargetId(id);
    setTimeout(() => {
      window.print();
      setPrintTargetId(null); // Reset after print dialog opens/closes
    }, 100);
  };

  const getQRData = (asset: any) => {
    return JSON.stringify({ type: asset.type.toLowerCase(), id: asset.id });
  };

  return (
    <>
      {/* Hide this entire header and filter section when printing */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div>
            <h2 className="font-headline-xl text-headline-xl text-on-background">QR Code Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Generate and print QR codes for assets</p>
          </div>
          <div className="flex gap-sm">
            <button 
              onClick={handlePrintAll}
              className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
              Print All (Visible)
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md mt-md mb-md">
          <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center">
            <span className="text-sm font-medium">Filter:</span>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
              className="border border-outline-variant rounded p-1 text-sm bg-surface-container-low outline-none"
            >
              <option value="ALL">All Assets</option>
              <option value="FORKLIFT">Forklift</option>
              <option value="BATTERY">Battery</option>
            </select>
            <div className="relative w-full sm:w-64 ml-auto">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1 text-sm h-8 outline-none focus:border-primary" 
                placeholder="Search code/model..." 
                type="text"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 print:hidden">Loading assets...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center p-8 text-on-surface-variant print:hidden">No assets found</div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${printTargetId === null ? 'print:grid-cols-4 print:gap-8' : 'print:block'}`}>
          {filteredAssets.map(asset => {
            const isTarget = printTargetId === asset.id;
            const isSinglePrintMode = printTargetId !== null;
            
            return (
              <div 
                key={asset.id} 
                className={`border border-outline-variant rounded-lg p-4 flex flex-col items-center gap-3 hover:bg-surface-container-low transition-colors print:bg-white print:break-inside-avoid
                  ${isSinglePrintMode && !isTarget ? 'print:hidden' : ''}
                  ${isTarget ? 'print:fixed print:inset-0 print:m-0 print:w-full print:h-full print:border-none print:flex print:flex-col print:items-center print:justify-center print:p-8' : 'print:border-2 print:border-black print:p-2'}
                `}
              >
                <div className={`w-full bg-white rounded flex items-center justify-center border border-gray-100 print:border-none p-2 ${isTarget ? 'print:w-full print:max-w-[70vw] print:max-h-[70vh] print:aspect-square' : 'aspect-square'}`}>
                  <QRCodeSVG 
                    value={getQRData(asset)} 
                    size={isTarget ? 1000 : 120} 
                    style={{ width: "100%", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center w-full">
                  <p className={`font-asset-id text-primary font-bold print:text-black ${isTarget ? 'print:text-5xl print:mt-6' : 'print:text-lg'}`}>{asset.asset_code}</p>
                  <p className={`text-on-surface-variant font-medium print:text-gray-800 ${isTarget ? 'print:text-3xl print:mt-2' : 'text-xs'}`}>{asset.type}</p>
                  <p className={`text-on-surface-variant opacity-75 print:text-gray-600 mt-1 ${isTarget ? 'print:text-2xl print:mt-2' : 'text-[10px]'}`}>{asset.model || asset.brand || '-'}</p>
                </div>
                <button 
                  onClick={() => handlePrintSingle(asset.id)}
                  className="w-full mt-auto bg-surface-container-high border border-outline-variant rounded py-1.5 flex justify-center hover:bg-surface-dim print:hidden cursor-pointer transition-colors"
                  title="Print this QR Code only"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
