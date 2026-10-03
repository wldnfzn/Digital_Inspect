const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'apps/web/src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') && f !== 'DashboardPage.tsx' && f !== 'LoginPage.tsx');

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace `return (\n    <>` with `return (\n    <div className="w-full flex flex-col p-gutter-lg space-y-gutter-lg max-w-[1600px] mx-auto print:p-0 print:space-y-0">`
  content = content.replace(/return\s*\(\s*<>/g, 'return (\n    <div className="w-full flex flex-col p-gutter-lg space-y-gutter-lg max-w-[1600px] mx-auto print:p-0 print:space-y-0">');
  
  // Replace `</>\n  );` at the end of the file with `</div>\n  );`
  // We can just find the last `</>` before `);`
  const lastReturnMatch = content.lastIndexOf('</>');
  if (lastReturnMatch !== -1) {
    content = content.substring(0, lastReturnMatch) + '</div>' + content.substring(lastReturnMatch + 3);
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

console.log('Done wrapping pages!');
