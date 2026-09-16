import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

if (!content.includes("import * as FileSystem")) {
  content = content.replace(
    "import * as Sharing from 'expo-sharing';",
    "import * as Sharing from 'expo-sharing';\nimport * as FileSystem from 'expo-file-system';"
  );
}

const target = `const { uri } = await Print.printToFileAsync({ html });
          await Sharing.shareAsync(uri, { 
            mimeType: 'application/pdf', 
            dialogTitle: 'Export PDF Laporan',
            UTI: 'com.adobe.pdf' 
          });`;

const replacement = `const { uri } = await Print.printToFileAsync({ html });
          const safeUri = FileSystem.documentDirectory + 'Laporan.pdf';
          await FileSystem.copyAsync({ from: uri, to: safeUri });
          await Sharing.shareAsync(safeUri, { 
            mimeType: 'application/pdf', 
            dialogTitle: 'Export PDF Laporan',
            UTI: 'com.adobe.pdf' 
          });`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  writeFileSync(p, content);
  console.log("Success: Replaced");
} else {
  console.log("Target not found!");
}
