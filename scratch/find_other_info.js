const fs = require('fs');
const code = fs.readFileSync('apps/app/App.tsx', 'utf8');
const lines = code.split('\n');
const match = lines.findIndex(l => l.includes('Other Battery Information'));
console.log(lines.slice(match - 5, match + 20).join('\n'));
