import { readFileSync, writeFileSync } from 'fs';

const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

if (!content.includes("import * as FileSystem")) {
  content = content.replace(
    "import * as Sharing from 'expo-sharing';",
    "import * as Sharing from 'expo-sharing';\nimport * as FileSystem from 'expo-file-system';"
  );
}

const oldLogic = `        } else {
          const { uri } = await Print.printToFileAsync({ html });
          await Sharing.shareAsync(uri, { 
            mimeType: 'application/pdf', 
            dialogTitle: 'Export PDF Laporan',
            UTI: 'com.adobe.pdf' 
          });
        }`;

const newLogic = `        } else {
          const { uri } = await Print.printToFileAsync({ html });
          const newUri = FileSystem.documentDirectory + 'Laporan.pdf';
          await FileSystem.copyAsync({ from: uri, to: newUri });
          
          await Sharing.shareAsync(newUri, { 
            mimeType: 'application/pdf', 
            dialogTitle: 'Export PDF Laporan',
            UTI: 'com.adobe.pdf' 
          });
        }`;

content = content.replace(oldLogic, newLogic);
writeFileSync(p, content);
