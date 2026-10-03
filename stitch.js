const fs = require('fs');

const oldStr = fs.readFileSync('temp_dash.tsx', 'utf8');
const modalStart = oldStr.indexOf('{selectedReport && !loadingDetail && (');
let modalEnd = oldStr.lastIndexOf('</div>\n  );\n};');
if (modalEnd === -1) modalEnd = oldStr.lastIndexOf('</div>\r\n  );\r\n};');

const modalCode = oldStr.substring(modalStart, modalEnd);

const genStr = fs.readFileSync('apps/web/generate.js', 'utf8');
const parts = genStr.split('{/* Detail Modal (Simplified for brevity but retains printability) */}');

const escapedModal = modalCode.replace(/\\`/g, '\\\\`').replace(/\\$/g, '\\\\$');

const newContent = parts[0] + escapedModal + "\n    </div>\n  );\n};\n\`;\nfs.writeFileSync('apps/web/src/pages/DashboardPage.tsx', code);\nconsole.log('Done!');\n";

fs.writeFileSync('apps/web/generate.js', newContent);
