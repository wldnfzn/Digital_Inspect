const fs = require('fs');
let code = fs.readFileSync('apps/app/App.tsx', 'utf8');

// Fix recommendations toggles
code = code.replace(
  /<TouchableOpacity style={\[styles\.scoreBtn, \{ marginBottom: 8, padding: 8 \}, recs\.acid && \{ backgroundColor: '#FEF3C7' \}\]} onPress=\{\(\) => setRecs\(\{ \.\.\.recs, acid: !recs\.acid \}\)\}>/g,
  `<TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('acid') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('acid') ? recs.filter(r => r !== 'acid') : [...recs, 'acid'])}>`
);

code = code.replace(
  /<TouchableOpacity style={\[styles\.scoreBtn, \{ marginBottom: 8, padding: 8 \}, recs\.capacity && \{ backgroundColor: '#FEF3C7' \}\]} onPress=\{\(\) => setRecs\(\{ \.\.\.recs, capacity: !recs\.capacity \}\)\}>/g,
  `<TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('capacity') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('capacity') ? recs.filter(r => r !== 'capacity') : [...recs, 'capacity'])}>`
);

code = code.replace(
  /<TouchableOpacity style={\[styles\.scoreBtn, \{ marginBottom: 16, padding: 8 \}, recs\.life && \{ backgroundColor: '#FEF3C7' \}\]} onPress=\{\(\) => setRecs\(\{ \.\.\.recs, life: !recs\.life \}\)\}>/g,
  `<TouchableOpacity style={[styles.scoreBtn, { marginBottom: 16, padding: 8 }, recs.includes('replace') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('replace') ? recs.filter(r => r !== 'replace') : [...recs, 'replace'])}>`
);

// Fix workDone string/array
code = code.replace(
  /const \[workDone, setWorkDone\] = useState\(\['', '', ''\]\);/g,
  `const [workDone, setWorkDone] = useState('');`
);

fs.writeFileSync('apps/app/App.tsx', code);
console.log('Fixed recs in App.tsx');
