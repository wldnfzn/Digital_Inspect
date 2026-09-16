import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const oldCss = `                .header { display: flex; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; align-items: center; }
                .logo { width: 50px; height: 50px; background: #22c55e; color: #fff; font-size: 32px; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
                .grid-3 { display: flex; gap: 8px; margin-bottom: 8px; }
                .col { flex: 1; }
                .row { display: flex; align-items: center; margin-bottom: 4px; }
                .lbl { font-weight: bold; text-transform: uppercase; margin-right: 4px; }
                .val { flex: 1; border-bottom: 1px solid #000; padding-bottom: 1px; min-height: 12px; }`;

const newCss = `                .header { display: table; width: 100%; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
                .logo { width: 50px; height: 50px; background: #22c55e; color: #fff; font-size: 32px; font-weight: bold; text-align: center; line-height: 50px; border-radius: 8px; display: inline-block; }
                .grid-3 { display: table; width: 100%; margin-bottom: 8px; table-layout: fixed; }
                .col { display: table-cell; vertical-align: top; padding-right: 8px; }
                .row { display: table; width: 100%; margin-bottom: 4px; }
                .lbl { display: table-cell; font-weight: bold; text-transform: uppercase; white-space: nowrap; padding-right: 4px; width: 1%; }
                .val { display: table-cell; border-bottom: 1px solid #000; padding-bottom: 1px; width: auto; }`;

const oldHeader = `<div class="header">
                  <div style="width: 20%;"><div class="logo">M</div></div>
                  <div style="width: 80%; text-align: center;">`;

const newHeader = `<div class="header">
                  <div style="display: table-cell; width: 20%; vertical-align: middle;"><div class="logo">M</div></div>
                  <div style="display: table-cell; width: 80%; text-align: center; vertical-align: middle;">`;

if (content.includes('.grid-3 { display: flex')) {
  content = content.replace(oldCss, newCss);
  content = content.replace(oldHeader, newHeader);
  writeFileSync(p, content);
  console.log("Success: replaced CSS and Header");
} else {
  console.log("Could not find CSS");
}
