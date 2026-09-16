const fs = require('fs');
const code = fs.readFileSync('apps/app/App.tsx', 'utf8');
const lines = code.split('\n');
const match = lines.findIndex(l => l.includes('Broken/corroded connector'));
console.log(lines.slice(match - 30, match + 30).join('\n'));
