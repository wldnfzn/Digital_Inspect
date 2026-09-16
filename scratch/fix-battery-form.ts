import { readFileSync, writeFileSync } from 'fs';

const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

// Fix 1: otherInfo state
content = content.replace(
  /const \[otherInfo, setOtherInfo\] = useState\(\{[\s\S]*?\}\);/,
  `const [otherInfo, setOtherInfo] = useState({
    tray: 'Good', intercell: 'Good', cell_lids: 'Good',
    gen_app: 'Good', gen_maint: 'Good', elec_levels: 'Correct',
    defective_cells: 'No', battery_cond: 'Good',
    broken_connector_no: '', cracked_lid_no: '', cell_no_1: '', cell_no_2: '', suspect_cell_no: ''
  });`
);

// Fix 2: workDone state
content = content.replace(
  /const \[workDone, setWorkDone\] = useState\(\['', '', ''\]\);/,
  `const [workDone, setWorkDone] = useState('');`
);

// Fix 3: submitBattery work_done mapping
content = content.replace(
  /work_done: workDone/,
  `work_done: workDone.split('\\n')`
);

// Fix 4: otherInfo items mapping in JSX
const oldItems = `            {[
              { key: 'tray', label: 'Tray', opts: ['Corrosion', 'Fair', 'Good'] },
              { key: 'intercell', label: 'Intercell Conn', opts: ['Broken', 'Corroded', 'Good'] },
              { key: 'lids', label: 'Cell Lids', opts: ['Cracked', 'Fair', 'Good'] },
              { key: 'appearance', label: 'Appearance', opts: ['Poor', 'Fair', 'Good'] },
              { key: 'electrolyte', label: 'Electrolyte', opts: ['Poor', 'Fair', 'Correct'] },
              { key: 'condition', label: 'Condition', opts: ['Poor', 'Fair', 'Good'] },
            ].map(item => (`;
const newItems = `            {[
              { key: 'tray', label: 'Tray', opts: ['Corrosion', 'Fair', 'Good'] },
              { key: 'intercell', label: 'Intercell Conn', opts: ['Broken', 'Corroded', 'Good'] },
              { key: 'cell_lids', label: 'Cell Lids', opts: ['cracked', 'Fair', 'Good'] },
              { key: 'gen_app', label: 'General Appearance', opts: ['Poor', 'Fair', 'Good'] },
              { key: 'gen_maint', label: 'General Maintenance', opts: ['Poor', 'Fair', 'Good'] },
              { key: 'elec_levels', label: 'Electrolyte Levels', opts: ['Poor', 'Fair', 'Correct'] },
              { key: 'defective_cells', label: 'Defective Cells', opts: ['Yes', 'No'] },
              { key: 'battery_cond', label: 'Battery Condition', opts: ['Poor', 'Fair', 'Good'] },
            ].map(item => (`;
content = content.replace(oldItems, newItems);

// Fix 5: recs JSX
const oldRecs = `          {/* RECOMMENDATIONS & WORK DONE */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>5. Rekomendasi & Catatan Akhir</Text>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.acid && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs({ ...recs, acid: !recs.acid })}>
              <Text>Battery needs acid adjustment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.capacity && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs({ ...recs, capacity: !recs.capacity })}>
              <Text>Battery needs capacity test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 16, padding: 8 }, recs.life && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs({ ...recs, life: !recs.life })}>
              <Text>Battery reaching end of life</Text>
            </TouchableOpacity>`;
const newRecs = `          {/* RECOMMENDATIONS & WORK DONE */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>5. Rekomendasi & Catatan Akhir</Text>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('acid') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('acid') ? recs.filter((r: string) => r !== 'acid') : [...recs, 'acid'])}>
              <Text>Battery needs acid adjustment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('capacity') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('capacity') ? recs.filter((r: string) => r !== 'capacity') : [...recs, 'capacity'])}>
              <Text>Battery needs capacity test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 16, padding: 8 }, recs.includes('replace') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('replace') ? recs.filter((r: string) => r !== 'replace') : [...recs, 'replace'])}>
              <Text>Battery reaching end of life</Text>
            </TouchableOpacity>`;
content = content.replace(oldRecs, newRecs);

writeFileSync(p, content);
