const fs = require('fs');

function updateSettingsPage() {
  let content = fs.readFileSync('apps/web/src/pages/SettingsPage.tsx', 'utf-8');

  // 1. Imports
  content = content.replace(
    /import \{ useState, useEffect \} from 'react';/,
    "import { useState, useEffect } from 'react';\nimport { Button, Modal, Badge, Input, useToast, ConfirmDialog } from '../components/ui';"
  );

  // 2. Add toast & modals state inside component
  content = content.replace(
    /const \[isSaving, setIsSaving\] = useState\(false\);/,
    `const [isSaving, setIsSaving] = useState(false);\n  const { toast } = useToast();\n  const [promptModal, setPromptModal] = useState<{open: boolean, value: string, title: string, callback: (val: string) => void}>({open: false, value: '', title: '', callback: () => {}});\n  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);`
  );

  // 3. Replace handleAddVariable
  content = content.replace(
    /const handleAddVariable = \(\) => \{[\s\S]*?\};/,
    `const handleAddVariable = () => {
    setPromptModal({
      open: true,
      title: 'Enter new variable name (e.g. "11. New Feature"):',
      value: '',
      callback: (itemName) => {
        if (itemName && itemName.trim()) {
          const newCats = [...categories];
          newCats[activeCategory].items.push(itemName.trim());
          setCategories(newCats);
        }
      }
    });
  };`
  );

  // 4. Replace handleEditVariable
  content = content.replace(
    /const handleEditVariable = \(idx: number, currentName: string\) => \{[\s\S]*?\};/,
    `const handleEditVariable = (idx: number, currentName: string) => {
    setPromptModal({
      open: true,
      title: 'Edit variable name:',
      value: currentName,
      callback: (itemName) => {
        if (itemName && itemName.trim()) {
          const newCats = [...categories];
          newCats[activeCategory].items[idx] = itemName.trim();
          setCategories(newCats);
        }
      }
    });
  };`
  );

  // 5. Replace handleDeleteVariable
  content = content.replace(
    /const handleDeleteVariable = \(idx: number\) => \{[\s\S]*?\};/,
    `const handleDeleteVariable = (idx: number) => {
    setConfirmDelete(idx);
  };
  
  const confirmDeleteVariable = () => {
    if (confirmDelete !== null) {
      const newCats = [...categories];
      newCats[activeCategory].items.splice(confirmDelete, 1);
      setCategories(newCats);
      setConfirmDelete(null);
    }
  };`
  );

  // 6. Alerts to Toasts
  content = content.replace(/alert\('Template saved successfully!'\);/, "toast('Template saved successfully!', 'success');");
  content = content.replace(/alert\('Template saved locally \\(Backend sync failed, but UI updated\\)\\.'\);/, "toast('Template saved locally (Backend sync failed, but UI updated).', 'error');");

  // 7. Spacing tokens
  content = content.replaceAll('gap-md', 'gap-4');
  content = content.replaceAll('gap-xs', 'gap-1');
  content = content.replaceAll('p-sm', 'p-2');
  content = content.replaceAll('p-md', 'p-4');
  content = content.replaceAll('mb-lg', 'mb-6');
  content = content.replaceAll('mb-sm', 'mb-2');
  content = content.replaceAll('mt-xs', 'mt-1');
  content = content.replaceAll('mt-md', 'mt-4');

  // 8. bg-[#f8fafc]
  content = content.replace(/bg-\[#f8fafc\]/g, 'bg-gray-50');

  // 9. Remove style={{ fontSize: '...' }}
  content = content.replace(/style=\{\{ fontSize: '16px' \}\}/g, 'className="text-base"');
  content = content.replace(/style=\{\{ fontSize: '18px' \}\}/g, 'className="text-lg"');
  content = content.replace(/style=\{\{ fontSize: '20px' \}\}/g, 'className="text-xl"');

  // Fix classNames that might have been duplicated if there was already a className
  content = content.replace(/className="(.*?)" className="(.*?)"/g, 'className="$1 $2"');

  // 10. Drag handle removal
  content = content.replace(/<span className="material-symbols-outlined text-outline cursor-grab"[^>]*>drag_indicator<\/span>/g, '');

  // 11. Badges
  content = content.replace(
    /<span className="bg-error-container text-on-error-container border border-error\/20 px-2 py-0\.5 rounded text-xs font-semibold">1 \(Buruk\)<\/span>/g,
    '<Badge variant="critical">1 (Buruk)</Badge>'
  );
  content = content.replace(
    /<span className="bg-warning-container text-on-warning-container border border-warning\/20 px-2 py-0\.5 rounded text-xs font-semibold">2 \(Cukup\)<\/span>/g,
    '<Badge variant="attention">2 (Cukup)</Badge>'
  );
  content = content.replace(
    /<span className="bg-success-container text-on-success-container border border-success\/20 px-2 py-0\.5 rounded text-xs font-semibold">3 \(Baik\)<\/span>/g,
    '<Badge variant="healthy">3 (Baik)</Badge>'
  );

  // 12. Buttons
  content = content.replace(
    /<button\s+onClick=\{handleSave\}\s+disabled=\{isSaving\}\s+className="bg-primary[^"]+"\s*>\s*<span className="material-symbols-outlined[^"]*">[\s\S]*?<\/span>[\s\S]*?<\/button>/,
    `<Button variant="primary" onClick={handleSave} loading={isSaving} icon={isSaving ? 'sync' : 'save'}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>`
  );

  content = content.replace(
    /<button\s+onClick=\{handleAddVariable\}\s+className="bg-white border[^"]+"\s*>\s*<span className="material-symbols-outlined[^"]*">add<\/span>\s*Add Variable\s*<\/button>/,
    `<Button variant="outline" size="sm" icon="add" onClick={handleAddVariable}>Add Variable</Button>`
  );

  content = content.replace(
    /<button onClick=\{\(\) => handleEditVariable\(idx, item\)\} className="text-on-surface-variant hover:text-primary p-1 cursor-pointer"><span className="material-symbols-outlined[^"]*">edit<\/span><\/button>/g,
    `<Button variant="ghost" size="sm" icon="edit" onClick={() => handleEditVariable(idx, item)} />`
  );

  content = content.replace(
    /<button onClick=\{\(\) => handleDeleteVariable\(idx\)\} className="text-on-surface-variant hover:text-error p-1 cursor-pointer"><span className="material-symbols-outlined[^"]*">delete<\/span><\/button>/g,
    `<Button variant="ghost" size="sm" icon="delete" onClick={() => handleDeleteVariable(idx)} />`
  );

  content = content.replace(
    /<button className="bg-surface-container-high border border-outline-variant text-on-surface px-4 py-2 rounded flex items-center gap-1 font-label-sm text-label-sm hover:bg-surface-dim transition-colors cursor-pointer">\s*<span className="material-symbols-outlined text-base">edit<\/span>\s*Edit Template\s*<\/button>/,
    `<Button variant="outline" size="sm" icon="edit">Edit Template</Button>`
  );

  // Render modals at the bottom
  const modalJSX = `
      <Modal open={promptModal.open} onClose={() => setPromptModal({ ...promptModal, open: false })}>
        <Modal.Header onClose={() => setPromptModal({ ...promptModal, open: false })}>{promptModal.title}</Modal.Header>
        <Modal.Body>
          <Input 
            autoFocus 
            value={promptModal.value} 
            onChange={e => setPromptModal({ ...promptModal, value: e.target.value })} 
            placeholder="Enter value..." 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPromptModal({ ...promptModal, open: false })}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            promptModal.callback(promptModal.value);
            setPromptModal({ ...promptModal, open: false });
          }}>Save</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog 
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteVariable}
        title="Remove Variable"
        message="Are you sure you want to remove this variable?"
        confirmText="Remove"
        variant="danger"
      />
    </>
  );
};`;

  content = content.replace(/<\/>\s*\);\s*\};\s*$/, modalJSX);
  fs.writeFileSync('apps/web/src/pages/SettingsPage.tsx', content);
}

function updateReportsPage() {
  let content = fs.readFileSync('apps/web/src/pages/ReportsPage.tsx', 'utf-8');

  // 1. Imports
  content = content.replace(
    /import \{ useState, useEffect \} from 'react';/,
    "import { useState, useEffect } from 'react';\nimport { Button, Badge, Input, Select, useToast, ConfirmDialog } from '../components/ui';"
  );

  // 2. Add toast & confirm state
  content = content.replace(
    /const \{ user \} = useAuth\(\);/,
    `const { user } = useAuth();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<{id: string, type: string} | null>(null);`
  );

  // 3. Replace handleDelete
  content = content.replace(
    /const handleDelete = async \(id: string, type: string\) => \{[\s\S]*?\};/,
    `const handleDelete = (id: string, type: string) => {
    setConfirmDelete({ id, type });
  };
  
  const confirmDeleteReport = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(\`/reports/\${confirmDelete.type}/\${confirmDelete.id}\`);
      toast('Laporan berhasil dihapus', 'success');
      setReports(reports.filter(r => r.id !== confirmDelete.id));
    } catch (e: any) {
      toast('Gagal: ' + (e.response?.data?.error || e.message), 'error');
    } finally {
      setConfirmDelete(null);
    }
  };`
  );

  // 4. Buttons (Export)
  content = content.replace(
    /<button\s+onClick=\{\(\) => alert\('Export to Excel feature coming soon!'\)\}\s+className="[^"]+"\s*>\s*<span className="material-symbols-outlined"[^>]*>download<\/span>\s*Export to Excel\s*<\/button>/,
    `<Button variant="primary" icon="download" onClick={() => toast('Export to Excel coming soon', 'info')}>Export to Excel</Button>`
  );

  // 5. Replace text-[#dc2626] with text-error
  content = content.replace(/text-\[#dc2626\]/g, 'text-error');

  // 6. Inline styles
  content = content.replace(/style=\{\{ fontSize: '16px' \}\}/g, 'className="text-base"');
  content = content.replace(/style=\{\{ fontSize: '18px' \}\}/g, 'className="text-lg"');
  content = content.replace(/style=\{\{ fontSize: '20px' \}\}/g, 'className="text-xl"');
  content = content.replace(/className="(.*?)" className="(.*?)"/g, 'className="$1 $2"');

  // 7. Spacing tokens
  content = content.replaceAll('gap-md', 'gap-4');
  content = content.replaceAll('gap-xs', 'gap-1');
  content = content.replaceAll('p-sm', 'p-2');
  content = content.replaceAll('p-md', 'p-4');
  content = content.replaceAll('mb-lg', 'mb-6');
  content = content.replaceAll('mb-sm', 'mb-2');

  // 8. Badges for forklift
  content = content.replace(
    /<span className=\{\`inline-flex items-center gap-1 px-2 py-0\.5 rounded-full font-label-sm text-label-sm border \$\{[\s\S]*?\}\`\}>\s*<span className=\{\`w-1\.5 h-1\.5 rounded-full \$\{[\s\S]*?\}\`\}><\/span> \{r\.score\}%\s*<\/span>/,
    `<Badge variant={r.status === 'CRITICAL' ? 'critical' : r.status === 'ATTENTION' ? 'attention' : 'healthy'} dot>
                          {r.score}%
                        </Badge>`
  );

  // Badges for battery
  content = content.replace(
    /<span className=\{\`inline-flex items-center gap-1 px-2 py-0\.5 rounded-full font-label-sm text-label-sm border \$\{[\s\S]*?\}\`\}>\s*<span className=\{\`w-1\.5 h-1\.5 rounded-full \$\{[\s\S]*?\}\`\}><\/span> \{r\.score\}V\s*<\/span>/,
    `<Badge variant={r.status === 'ATTENTION' ? 'attention' : 'healthy'} dot>
                          {r.score}V
                        </Badge>`
  );

  // 9. Table Action Buttons
  content = content.replace(
    /<button \s*className="text-primary hover:underline text-sm font-medium cursor-pointer"\s*onClick=\{\(\) => openDetail\(r\.id, r\.asset_type\)\}\s*>\s*View Detail\s*<\/button>/g,
    `<Button variant="ghost" size="sm" onClick={() => openDetail(r.id, r.asset_type)}>View Detail</Button>`
  );

  content = content.replace(
    /<button \s*className="text-error hover:underline text-sm font-medium cursor-pointer text-error"\s*onClick=\{\(\) => handleDelete\(r\.id, r\.asset_type\)\}\s*>\s*Delete\s*<\/button>/g,
    `<Button variant="ghost" size="sm" onClick={() => handleDelete(r.id, r.asset_type)}>Delete</Button>`
  );

  // 10. bg-green-500
  content = content.replace(/bg-green-500/g, 'bg-primary');

  // 11. Loading spinner
  content = content.replace(
    /<div className="bg-white p-6 rounded-lg">Loading details\.\.\.<\/div>/,
    `<div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            <span className="font-medium">Loading details...</span>
          </div>`
  );

  // 12. Modal Close/Print buttons
  content = content.replace(
    /<button onClick=\{\(\) => window\.print\(\)\} className="no-print bg-primary hover:bg-primary-fixed-variant text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 cursor-pointer transition-colors">\s*<span className="material-symbols-outlined text-lg">print<\/span> Print PDF\s*<\/button>/,
    `<Button variant="primary" onClick={() => window.print()} className="no-print" icon="print">Print PDF</Button>`
  );
  content = content.replace(
    /<button onClick=\{\(\) => setSelectedReport\(null\)\} className="no-print material-symbols-outlined cursor-pointer text-gray-500 hover:text-gray-800 ml-2 transition-colors">close<\/button>/,
    `<Button variant="ghost" className="no-print" icon="close" onClick={() => setSelectedReport(null)} />`
  );

  content = content.replace(
    /<button onClick=\{\(\) => setSelectedReport\(null\)\} className="px-4 py-2 border rounded font-medium hover:bg-surface-container-low">Close<\/button>/,
    `<Button variant="secondary" onClick={() => setSelectedReport(null)}>Close</Button>`
  );

  // 13. ConfirmDialog append
  const modalJSX = `
      <ConfirmDialog 
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteReport}
        title="Hapus Laporan"
        message="Hapus laporan ini? Data yang sudah dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
        variant="danger"
      />
    </>
  );
};`;

  content = content.replace(/<\/>\s*\);\s*\};\s*$/, modalJSX);

  fs.writeFileSync('apps/web/src/pages/ReportsPage.tsx', content);
}

try {
  updateSettingsPage();
  console.log('SettingsPage updated.');
} catch (e) { console.error(e); }

try {
  updateReportsPage();
  console.log('ReportsPage updated.');
} catch (e) { console.error(e); }
