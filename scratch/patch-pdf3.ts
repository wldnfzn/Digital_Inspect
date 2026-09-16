import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const t1 = "const { uri } = await Print.printToFileAsync({ html });";
const idx = content.indexOf(t1);

if (idx !== -1 && !content.includes('FileSystem.copyAsync')) {
    const nextClose = content.indexOf('        }', idx);
    const newBlock = `const { uri } = await Print.printToFileAsync({ html });
        const safeUri = FileSystem.documentDirectory + 'Laporan.pdf';
        await FileSystem.copyAsync({ from: uri, to: safeUri });
        await Sharing.shareAsync(safeUri, {
          mimeType: 'application/pdf', 
          dialogTitle: 'Export PDF Laporan',
          UTI: 'com.adobe.pdf' 
        });\n`;
    
    content = content.substring(0, idx) + newBlock + content.substring(nextClose);
    writeFileSync(p, content);
    console.log("Success");
} else {
    console.log("Not found or already patched");
}
