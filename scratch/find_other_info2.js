const fs = require('fs');
const code = fs.readFileSync('apps/app/App.tsx', 'utf8');
const lines = code.split('\n');
const match = lines.findIndex(l => l.includes('broken_connector_no'));
console.log(lines.slice(match - 30, match + 30).join('\n'));
