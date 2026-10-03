const fs = require('fs');

let content = fs.readFileSync('apps/web/src/pages/AssetsPage.tsx', 'utf-8');

// Replace table header
content = content.replace(
  "{tab === 'forklift' && <th className=\"px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider\">Year</th>}",
  "{tab === 'forklift' && <th className=\"px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider\">Year</th>}\n                  {tab === 'battery' && <th className=\"px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider\">Tipe</th>}\n                  {tab === 'battery' && <th className=\"px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider\">Kapasitas</th>}"
);

// Replace table row
content = content.replace(
  "{tab === 'forklift' && <td className=\"px-5 py-3.5 text-gray-600\">{item.year || '-'}</td>}",
  "{tab === 'forklift' && <td className=\"px-5 py-3.5 text-gray-600\">{item.year || '-'}</td>}\n                    {tab === 'battery' && <td className=\"px-5 py-3.5 text-gray-600\">{item.type || '-'}</td>}\n                    {tab === 'battery' && <td className=\"px-5 py-3.5 text-gray-600\">{item.capacity_ah ? item.capacity_ah + ' Ah' : '-'}</td>}"
);

// Replace form inputs
content = content.replace(
  "onChange={e => setFormData({...formData, voltage: e.target.value})}\n                  />\n                </>\n              )}",
  "onChange={e => setFormData({...formData, voltage: e.target.value})}\n                  />\n                  <Input \n                    label=\"Tipe Baterai\"\n                    value={formData.type}\n                    onChange={e => setFormData({...formData, type: e.target.value})}\n                  />\n                  <Input \n                    label=\"Kapasitas (Ah)\"\n                    value={formData.capacity_ah}\n                    onChange={e => setFormData({...formData, capacity_ah: e.target.value})}\n                  />\n                </>\n              )}"
);

// Replace loading / empty state colspan
content = content.replace(
  /colSpan=\{tab === 'forklift' \? 6 : 5\}/g,
  "colSpan={tab === 'forklift' ? 6 : 7}"
);

fs.writeFileSync('apps/web/src/pages/AssetsPage.tsx', content);
console.log('done');
