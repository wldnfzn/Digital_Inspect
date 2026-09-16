import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

if (!content.includes("import * as FileSystem")) {
  content = content.replace(
    "import * as Sharing from 'expo-sharing';",
    "import * as Sharing from 'expo-sharing';\nimport * as FileSystem from 'expo-file-system';"
  );
}

const replacer = `const { uri } = await Print.printToFileAsync({ html });
        const safeUri = FileSystem.documentDirectory + 'Laporan.pdf';
        await FileSystem.copyAsync({ from: uri, to: safeUri });
        await Sharing.shareAsync(safeUri, {`;

content = content.replace(/const \{ uri \} = await Print.printToFileAsync\(\{ html \}\);\s*await Sharing.shareAsync\(uri, \{/, replacer);

writeFileSync(p, content);
