const fs = require('fs');
const code = fs.readFileSync('apps/app/App.tsx', 'utf8');
const start = code.indexOf('const BatteryServiceFormScreen');
const str = code.substring(start, start + 3000);
console.log(str);
