const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'apps/web/src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') && f !== 'DashboardPage.tsx' && f !== 'LoginPage.tsx');

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace old page wrappers
  content = content.replace(/className="p-md sm:p-lg[^"]*"/g, 'className="p-gutter-lg space-y-gutter-lg"');
  content = content.replace(/className="p-8 max-w-7xl mx-auto[^"]*"/g, 'className="p-gutter-lg space-y-gutter-lg"');
  content = content.replace(/className="p-md sm:p-lg/g, 'className="p-gutter-lg space-y-gutter-lg');

  // Replace old headings (e.g. font-headline-xl -> font-headline-lg font-bold)
  content = content.replace(/font-headline-xl text-headline-xl text-on-background/g, 'font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold');
  content = content.replace(/font-headline-lg text-headline-lg mb-[0-9]+/g, 'font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mb-space-md');
  
  // Replace old cards (border border-outline-variant -> border-none, rounded-xl, etc)
  content = content.replace(/bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-sm');
  content = content.replace(/bg-surface-container-lowest rounded-lg border border-outline-variant p-4 shadow-sm/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-sm');
  content = content.replace(/bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-sm');
  content = content.replace(/bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-sm');
  content = content.replace(/bg-surface-container-lowest border border-outline-variant rounded-lg p-4/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-sm');

  // Buttons primary
  content = content.replace(/bg-primary text-on-primary px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-primary\/90/g, 'bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2 rounded-lg shadow-sm transition-colors duration-150');
  content = content.replace(/bg-primary text-on-primary px-4 py-2 rounded hover:bg-primary-container font-bold/g, 'bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2 rounded-lg shadow-sm transition-colors duration-150');
  content = content.replace(/bg-primary text-on-primary px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-primary-container/g, 'bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2 rounded-lg shadow-sm transition-colors duration-150');

  // Secondary buttons
  content = content.replace(/border border-outline text-on-surface px-4 py-2 rounded text-sm font-bold hover:bg-surface-container-low/g, 'border border-outline-variant text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg hover:bg-surface-container-low transition-colors duration-150');
  content = content.replace(/border border-outline-variant text-on-surface px-4 py-2 rounded hover:bg-surface-container-low font-bold/g, 'border border-outline-variant text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg hover:bg-surface-container-low transition-colors duration-150');
  content = content.replace(/border border-outline-variant text-on-surface-variant hover:text-on-surface px-4 py-2 rounded text-sm font-bold/g, 'border border-outline-variant text-on-surface font-label-md text-label-md px-space-md py-2 rounded-lg hover:bg-surface-container-low transition-colors duration-150');
  
  // Table head
  content = content.replace(/bg-surface-container-low text-on-surface-variant border-b border-outline-variant/g, 'bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider');
  
  // Modals
  content = content.replace(/bg-surface-container-lowest rounded-lg max-w-lg w-full p-md shadow-xl/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-xl max-w-lg w-full');
  content = content.replace(/bg-surface-container-lowest rounded-lg max-w-4xl w-full p-md shadow-xl/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-xl max-w-4xl w-full');
  content = content.replace(/bg-surface-container-lowest rounded-lg max-w-3xl w-full p-md shadow-xl/g, 'bg-surface-container-lowest p-space-lg rounded-xl shadow-xl max-w-3xl w-full');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

// Modify index.css to hide scrollbars globally (especially for sidebar)
const cssPath = path.join(__dirname, 'apps/web/src/index.css');
let cssContent = fs.readFileSync(cssPath, 'utf-8');
if (!cssContent.includes('::-webkit-scrollbar')) {
  cssContent += `\n
@layer base {
  ::-webkit-scrollbar {
    display: none;
  }
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}
`;
  fs.writeFileSync(cssPath, cssContent, 'utf-8');
}

console.log('Done transforming pages and index.css');
