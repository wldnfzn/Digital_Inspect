const fs = require('fs');
const code = fs.readFileSync('apps/app/App.tsx', 'utf8');
const start = code.indexOf('const AssetDetailScreen');
const str = code.substring(start + 2500, start + 3500);
console.log(str);
