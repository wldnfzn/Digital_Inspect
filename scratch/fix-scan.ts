import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const regex = /const ScanScreen = \(\{ route, navigation \}: any\) => \{[\s\S]*?\n\};\n\nconst RiwayatScreen/m;

const newCode = `const ScanScreen = ({ route, navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = React.useState(false);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{marginBottom: 12}}>Aplikasi butuh akses kamera untuk scan QR Aset</Text>
        <Button title="Izinkan Akses Kamera" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: any) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      if (parsed.type && parsed.id) {
        const { expected_asset_id, task_id } = route.params || {};
        if (expected_asset_id && expected_asset_id !== parsed.id) {
          alert('Error: QR Code yang di-scan tidak sesuai dengan aset pada tugas ini!');
          setTimeout(() => setScanned(false), 2000);
          return;
        }

        navigation.navigate('AssetDetail', { 
          type: parsed.type, 
          id: parsed.id, 
          task_id: task_id, 
          fromScan: true 
        });

        navigation.setParams({ task_id: undefined, expected_asset_id: undefined });
      } else {
        alert('Format QR tidak valid untuk sistem ini.');
        setTimeout(() => setScanned(false), 2000);
      }
    } catch(e) {
      alert('QR Code tidak dikenali: ' + data);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
       {isFocused && (
         <CameraView
           style={{ flex: 1 }}
           facing="back"
           onBarcodeScanned={handleBarcodeScanned}
           barcodeScannerSettings={{
             barcodeTypes: ['qr'],
           }}
         />
       )}
       <View style={{position: 'absolute', top: 60, width: '100%', alignItems: 'center'}}>
         {route.params?.task_id && (
           <View style={{ backgroundColor: '#F59E0B', padding: 8, borderRadius: 8, marginBottom: 8 }}>
             <Text style={{ fontWeight: 'bold' }}>Selesaikan Scan untuk Tugas Aktif</Text>
           </View>
         )}
       </View>
       <View style={{position: 'absolute', bottom: 60, width: '100%', alignItems: 'center'}}>
         <Text style={{color: 'white', backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 8, fontSize: 16}}>Arahkan kamera ke QR Code Aset</Text>
         {scanned && <ActivityIndicator size="large" color="#fff" style={{marginTop: 20}} />}
       </View>
    </View>
  );
};

const RiwayatScreen`;

content = content.replace(regex, newCode);
writeFileSync(p, content);
console.log('Fixed ScanScreen');
