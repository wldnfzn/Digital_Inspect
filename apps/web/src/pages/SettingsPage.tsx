import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const DEFAULT_FORKLIFT_CATEGORIES = [
  {
    name: 'A. Body & Structure',
    items: ['1. Bolted Connections', '2. Cabin & Mounting', '3. Cabin Doors']
  },
  {
    name: 'B. Drive Unit',
    items: ['1. Gear Box', '2. Oil Level, Leakage']
  },
  {
    name: 'C. Wheels',
    items: ['1. Wear & Damage', '2. Wheel & Bearing', '3. Roller Guide Bolts']
  },
  {
    name: 'D. Steering',
    items: ['1. Free Play', '2. Chain & Sprocket', '3. Steering Angle Lim']
  },
  {
    name: 'E. Brakes',
    items: ['1. Oil Level', '2. Motor Brake Lining', '3. Air Gap (Motor)']
  },
  {
    name: 'F. Hydraulics',
    items: ['1. Oil Level Strainer', '2. Hose & Piping Connection', '3. Hyd Pump Control Valves', '4. Solenoid Valves, Relief Valves', '5. Main Lift Cyl', '6. Suplementary Lift Cyl', '7. Traverse/Reach Cyl', '8. Swivel Cyl Motor', '9. Hyd Motor', '10. Emergency Lowering']
  },
  {
    name: 'G. Electric Motors',
    items: ['1. Carbon Brushes', '2. Mountings', '3. Terminals', '4. Blow Out Motor Housing', '5. Cooling Fan']
  },
  {
    name: 'H. Battery',
    items: ['1. Electrolyte Level', '2. Cell Voltage, S.G', '3. Terminals, Cable, Plugs', '4. Battery Lock']
  },
  {
    name: 'I. Electrical System',
    items: ['1. Fuses', '2. Limit Switches', '3. Cable Connections', '4. Socket, Plugs', '5. Trip Cam', '6. Horn', '7. Contactor & Contact Tips', '8. Relays', '9. Electronics Boards', '10. Sensors', '11. Tacho Generator Belt', '12. Indicator Lamps']
  },
  {
    name: 'J. Lifting System',
    items: ['1. Mast Bolts', '2. Carriage Assembly', '3. Forks', '4. Chain & Rollers', '5. Toothed Rack', '6. Gear Wheels', '7. Bearings', '8. End Stops', '9. Lubrication']
  },
  {
    name: 'K. Auxiliary Function',
    items: ['1. Travelling', '2. Lifting', '3. Brakes', '4. HICONT System']
  }
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'forklift' | 'battery' | 'scoring'>('forklift');
  const [activeCategory, setActiveCategory] = useState(0);
  const [categories, setCategories] = useState(DEFAULT_FORKLIFT_CATEGORIES);
  const [isSaving, setIsSaving] = useState(false);

  // Load from API (optional but good practice)
  useEffect(() => {
    // If we wanted to load from DB we could, but for now we default to the standard 58
  }, []);

  const totalVariables = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  const handleAddVariable = () => {
    const itemName = window.prompt('Enter new variable name (e.g. "11. New Feature"):');
    if (itemName && itemName.trim()) {
      const newCats = [...categories];
      newCats[activeCategory].items.push(itemName.trim());
      setCategories(newCats);
    }
  };

  const handleEditVariable = (idx: number, currentName: string) => {
    const itemName = window.prompt('Edit variable name:', currentName);
    if (itemName && itemName.trim()) {
      const newCats = [...categories];
      newCats[activeCategory].items[idx] = itemName.trim();
      setCategories(newCats);
    }
  };

  const handleDeleteVariable = (idx: number) => {
    if (window.confirm('Are you sure you want to remove this variable?')) {
      const newCats = [...categories];
      newCats[activeCategory].items.splice(idx, 1);
      setCategories(newCats);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/settings/templates/forklift/sync', { categories });
      alert('Template saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Template saved locally (Backend sync failed, but UI updated).');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-background">System Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage inspection templates and scoring rules</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-on-primary px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-on-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {isSaving ? 'sync' : 'save'}
          </span>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex border-b border-outline-variant gap-lg mt-md">
        <button 
          className={`pb-sm font-label-sm text-label-sm transition-colors ${activeTab === 'forklift' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface cursor-pointer'}`}
          onClick={() => setActiveTab('forklift')}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>forklift</span>
          Forklift Template
        </button>
        <button 
          className={`pb-sm font-label-sm text-label-sm transition-colors ${activeTab === 'battery' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface cursor-pointer'}`}
          onClick={() => setActiveTab('battery')}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>battery_charging_full</span>
          Battery Template
        </button>
        <button 
          className={`pb-sm font-label-sm text-label-sm transition-colors ${activeTab === 'scoring' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface cursor-pointer'}`}
          onClick={() => setActiveTab('scoring')}
        >
          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>rule</span>
          Scoring Config
        </button>
      </div>

      <div className="mt-md flex flex-col flex-1 h-full min-h-[500px]">
        
        {/* FORKLIFT TAB */}
        {activeTab === 'forklift' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Categories Sidebar */}
            <div className="w-full md:w-64 border-r border-outline-variant bg-surface-container-low flex flex-col">
              <div className="p-sm border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <span className="font-label-sm font-semibold">Categories (Total: {totalVariables} Var)</span>
              </div>
              <ul className="flex-1 overflow-y-auto max-h-[600px]">
                {categories.map((cat, idx) => (
                  <li key={idx}>
                    <button 
                      onClick={() => setActiveCategory(idx)}
                      className={`w-full text-left px-md py-sm text-sm border-b border-outline-variant transition-colors flex items-center justify-between cursor-pointer ${activeCategory === idx ? 'bg-primary-container text-on-primary-container font-medium' : 'hover:bg-surface-dim text-on-surface-variant'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {activeCategory === idx ? 'folder_open' : 'folder'}
                        </span>
                        {cat.name}
                      </span>
                      <span className="text-xs bg-surface-variant px-2 rounded-full">{cat.items.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Items Area */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest">
              <div className="p-md border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-primary">{categories[activeCategory].name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Manage checklist items for this category</p>
                </div>
                <button 
                  onClick={handleAddVariable}
                  className="bg-surface-container-high border border-outline-variant text-on-surface px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-surface-dim transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  Add Variable
                </button>
              </div>
              <div className="p-md flex-1 overflow-y-auto">
                <div className="bg-[#fffbeb] border border-[#fef08a] p-sm rounded mb-md flex items-start gap-sm text-sm text-[#854d0e]">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                  <p>Terdapat total <b>{totalVariables} Variabel</b> form Forklift yang mereplikasi formulir standar PT United Multilift Perkasa.</p>
                </div>
                
                <ul className="flex flex-col gap-sm">
                  {categories[activeCategory].items.map((item, idx) => (
                    <li key={idx} className="border border-outline-variant rounded p-sm flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-outline cursor-grab" style={{ fontSize: '18px' }}>drag_indicator</span>
                        <span className="font-medium text-sm">{item}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium opacity-50">
                        <span className="border px-2 py-0.5 rounded border-error text-error bg-error-container">1 (Buruk)</span>
                        <span className="border px-2 py-0.5 rounded border-[#b45309] text-[#b45309] bg-[#fef3c7]">2 (Cukup)</span>
                        <span className="border px-2 py-0.5 rounded border-[#166534] text-[#166534] bg-[#dcfce7]">3 (Baik)</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 cursor-pointer">
                          <button onClick={() => handleEditVariable(idx, item)} className="text-on-surface-variant hover:text-primary p-1 cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span></button>
                          <button onClick={() => handleDeleteVariable(idx)} className="text-on-surface-variant hover:text-error p-1 cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* BATTERY TAB */}
        {activeTab === 'battery' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col flex-1 overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <div>
                <h3 className="font-headline-lg text-headline-lg text-primary">Battery Service Report</h3>
                <p className="text-sm text-on-surface-variant mt-1">Standar form PT Multidaya Anugrah Perkasa</p>
              </div>
              <button className="bg-surface-container-high border border-outline-variant text-on-surface px-md py-sm rounded flex items-center gap-xs font-label-sm text-label-sm hover:bg-surface-dim transition-colors cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                Edit Template
              </button>
            </div>
            
            <div className="p-md flex-1 overflow-y-auto bg-[#f8fafc]">
              <div className="max-w-4xl mx-auto bg-white border border-outline-variant shadow-sm p-8 flex flex-col gap-6">
                
                {/* 1 & 3: Auto-filled System Info */}
                <div className="grid grid-cols-2 gap-4 border-b border-outline-variant pb-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2 text-primary">1. Client Info (Auto-filled)</h4>
                    <div className="h-6 bg-surface-container-low rounded w-3/4 mb-1"></div>
                    <div className="h-6 bg-surface-container-low rounded w-full mb-1"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2 text-primary">3. Truck Brand/Model (Auto-filled)</h4>
                    <div className="h-6 bg-surface-container-low rounded w-3/4 mb-1"></div>
                  </div>
                </div>

                {/* 2 & 4: Battery Cap & Condition */}
                <div className="grid grid-cols-2 gap-4 border-b border-outline-variant pb-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2">2. Battery Cap</h4>
                    <ul className="text-sm flex flex-col gap-2 text-on-surface-variant">
                      <li>• Ah.Voltage, Type, Type of Plug</li>
                      <li>• Tray Size</li>
                      <li>• Cable Length (Positive / Negative mm)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">4. Battery Condition During Servicing</h4>
                    <div className="flex gap-4 text-sm mt-2">
                      <label className="flex items-center gap-1"><input type="checkbox" disabled /> Fully Charge</label>
                      <label className="flex items-center gap-1"><input type="checkbox" disabled /> Before Charging</label>
                      <label className="flex items-center gap-1"><input type="checkbox" disabled /> IN Operation</label>
                    </div>
                  </div>
                </div>

                {/* 5. READINGS */}
                <div>
                  <h4 className="font-bold text-sm mb-3">5. READINGS (1 - 40)</h4>
                  <div className="border border-outline-variant overflow-hidden rounded">
                    <table className="w-full text-center text-sm border-collapse">
                      <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                          <th className="py-1 px-2 border-r border-outline-variant w-12">No.</th>
                          <th className="py-1 px-2 border-r border-outline-variant">S.G</th>
                          <th className="py-1 px-2 border-r border-outline-variant">Volts</th>
                          <th className="py-1 px-2 border-r border-outline-variant bg-surface-bright w-12">No.</th>
                          <th className="py-1 px-2 border-r border-outline-variant bg-surface-bright">S.G</th>
                          <th className="py-1 px-2 bg-surface-bright">Volts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5].map((row) => (
                          <tr key={row} className="border-b border-outline-variant">
                            <td className="py-1 px-2 border-r border-outline-variant font-medium">{row}</td>
                            <td className="py-1 px-2 border-r border-outline-variant text-outline">input</td>
                            <td className="py-1 px-2 border-r border-outline-variant text-outline">input</td>
                            <td className="py-1 px-2 border-r border-outline-variant font-medium bg-surface-bright">{row + 20}</td>
                            <td className="py-1 px-2 border-r border-outline-variant text-outline bg-surface-bright">input</td>
                            <td className="py-1 px-2 text-outline bg-surface-bright">input</td>
                          </tr>
                        ))}
                        <tr><td colSpan={6} className="text-center py-2 text-xs text-on-surface-variant italic border-t border-outline-variant">... (lanjut hingga 40)</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 6. CHARGER */}
                  <div>
                    <h4 className="font-bold text-sm mb-3">6. CHARGER</h4>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex"><span className="w-28">Brand/Model</span>: <span className="border-b border-outline-variant flex-1 ml-2"></span></div>
                      <div className="flex"><span className="w-28">Input Rating</span>: <span className="border-b border-outline-variant flex-1 ml-2"></span></div>
                      <div className="flex"><span className="w-28">Output Rating</span>: <span className="border-b border-outline-variant flex-1 ml-2"></span></div>
                      <div className="flex"><span className="w-28">Condition</span>: <span className="border-b border-outline-variant flex-1 ml-2"></span></div>
                    </div>
                  </div>

                  {/* 7. OTHER BATTERY INFORMATION */}
                  <div>
                    <h4 className="font-bold text-sm mb-3">7. OTHER BATTERY INFORMATION</h4>
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Tray</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Corrosion</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Intercell connectors</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Broken</span><span className="border px-2 py-0.5 rounded text-[10px]">Corroded</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                      <div className="flex"><span className="text-xs">Broken/corroded connector No.:</span> <span className="border-b border-outline-variant flex-1 ml-2"></span></div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span>Cell Lids</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Cracked</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                      <div className="flex"><span className="text-xs">Cracked Cell Lid No.:</span> <span className="border-b border-outline-variant flex-1 ml-2"></span></div>

                      <div className="flex justify-between items-center mt-1">
                        <span>General Appearance</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Poor</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>General Maintenance</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Poor</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Electrolyte levels</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Poor</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Correct</span></div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span>Any defective Cells Detected</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Yes</span><span className="border px-2 py-0.5 rounded text-[10px]">No</span></div>
                      </div>

                      <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t border-outline-variant">
                        <span>Battery's condition</span>
                        <div className="flex gap-1"><span className="border px-2 py-0.5 rounded text-[10px]">Poor</span><span className="border px-2 py-0.5 rounded text-[10px]">Fair</span><span className="border px-2 py-0.5 rounded text-[10px]">Good</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8 & 9. RECOMENDATIONS & WORK DONE */}
                <div className="border-t border-outline-variant pt-4 mt-2">
                  <h4 className="font-bold text-sm mb-2">8. RECOMMENDATIONS</h4>
                  <div className="flex flex-col gap-1 text-sm text-on-surface-variant">
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Battery needs acid adjustment</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Battery needs capacity test</label>
                    <label className="flex items-center gap-2"><input type="checkbox" disabled /> Battery Reaching end of normal useful life, advised to prepare for new replacement</label>
                  </div>
                  
                  <h4 className="font-bold text-sm mb-2 mt-4">9. WORK DONE ON BATTERY</h4>
                  <div className="h-20 border border-outline-variant rounded bg-surface-container-lowest mt-1 p-2 text-xs text-outline">Notes...</div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SCORING CONFIG TAB */}
        {activeTab === 'scoring' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
            <h3 className="font-headline-lg text-headline-lg mb-md">Health Thresholds & Labels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
              <div className="border border-[#bbf7d0] bg-[#f0fdf4] rounded p-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#166534]">Healthy</span>
                  <span className="bg-[#16a34a] text-white text-xs px-2 py-0.5 rounded">100%</span>
                </div>
                <label className="text-sm text-[#166534] mt-2">Threshold (%)</label>
                <input type="text" value="80 - 100" readOnly className="border border-[#bbf7d0] bg-white rounded p-1.5 text-sm" />
              </div>
              <div className="border border-[#fef08a] bg-[#fefce8] rounded p-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#854d0e]">Attention</span>
                  <span className="bg-[#eab308] text-white text-xs px-2 py-0.5 rounded">~66%</span>
                </div>
                <label className="text-sm text-[#854d0e] mt-2">Threshold (%)</label>
                <input type="text" value="50 - 79" readOnly className="border border-[#fef08a] bg-white rounded p-1.5 text-sm" />
              </div>
              <div className="border border-[#fecaca] bg-[#fef2f2] rounded p-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#991b1b]">Critical</span>
                  <span className="bg-[#dc2626] text-white text-xs px-2 py-0.5 rounded">&lt; 50%</span>
                </div>
                <label className="text-sm text-[#991b1b] mt-2">Threshold (%)</label>
                <input type="text" value="0 - 49" readOnly className="border border-[#fecaca] bg-white rounded p-1.5 text-sm" />
              </div>
            </div>
            
            <h3 className="font-headline-lg text-headline-lg mb-sm">Calculation Rule</h3>
            <div className="bg-surface-container-low p-md rounded border border-outline-variant">
              <code className="text-sm text-primary block mb-2 font-bold bg-white p-2 border border-outline-variant rounded">Formula: (Total Score / (Total Variables × 3)) × 100%</code>
              <p className="text-sm text-on-surface-variant mt-2">Contoh:</p>
              <ul className="text-sm text-on-surface-variant list-disc ml-5 mt-1">
                <li>Jika terdapat 58 Variabel dan mekanik mengisi semua nilai 3 (Baik) : <br/><code>(174 / 174) × 100% = 100%</code></li>
                <li>Jika terdapat 58 Variabel dan mekanik mengisi semua nilai 2 (Cukup) : <br/><code>(116 / 174) × 100% = 66.6%</code></li>
              </ul>
              <p className="text-sm text-on-surface-variant mt-3 text-error">Catatan: Jika mekanik menemukan cacat fatal (Nilai 1 pada komponen Kritis), status otomatis berubah menjadi CRITICAL tanpa mempedulikan persentase di atas.</p>
            </div>
          </div>
        )}

      </div>
    </>
  );
};
