import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text as RNText, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput as RNTextInput, ActivityIndicator, Keyboard, Platform, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './src/lib/api';
import * as Location from 'expo-location';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { getBatteryHtml } from './src/utils/print-html';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Colors from PRD
const COLORS = {
  primary: '#1E40AF',
  secondary: '#3B82F6',
  healthy: '#16A34A',
  attention: '#F59E0B',
  critical: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textMuted: '#64748B'
};

const Text = (props: any) => <RNText {...props} style={[{color: COLORS.textPrimary}, props.style]} />;
const TextInput = (props: any) => <RNTextInput placeholderTextColor={COLORS.textMuted} {...props} style={[{color: COLORS.textPrimary}, props.style]} />;

// --- AUTH CONTEXT ---
export const AuthContext = React.createContext<{user: any, login: any, logout: any}>({
  user: null, login: async () => {}, logout: async () => {}
});

// --- SCREENS ---

const LoginScreen = () => {
  const [email, setEmail] = useState('budi@ump.co.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = React.useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', padding: 20 }]}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 30 }}>
        UMP Digital Inspect
      </Text>
      
      <View style={{ backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, elevation: 2 }}>
        {error ? <Text style={{ color: COLORS.critical, marginBottom: 10 }}>{error}</Text> : null}
        
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.primaryButton, { marginTop: 20 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const { user } = React.useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Refresh tasks whenever HomeScreen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inspections/my-tasks');
      // Filter only non-completed tasks
      setTasks(res.data.data.filter((t: any) => t.status !== 'COMPLETED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>🔶 UMP Digital Inspect</Text>
          <Text style={styles.greeting}>Halo, {user?.full_name?.split(' ')[0] || 'Mekanik'} 👋</Text>
        </View>

        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.scanButtonIcon}>📷</Text>
          <Text style={styles.scanButtonText}>SCAN QR CODE</Text>
          <Text style={styles.scanButtonSubtext}>Tap untuk mulai scan aset</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tugas & Jadwal Saya</Text>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : tasks.length === 0 ? (
            <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 20 }}>Tidak ada tugas berjalan.</Text>
          ) : (
            tasks.map((task: any) => (
              <View key={task.id} style={[styles.historyCard, { borderColor: COLORS.attention, borderLeftWidth: 4 }]}>
                <View style={styles.historyCardRow}>
                  <View>
                    <Text style={styles.historyCardTitle}>
                      {task.asset_type === 'FORKLIFT' ? '🏗️' : '🔋'} {task.asset_type === 'FORKLIFT' ? task.forklift_code : task.battery_code} ({task.asset_type})
                    </Text>
                    <Text style={[styles.historyCardSubtext, { color: COLORS.attention, fontWeight: 'bold' }]}>
                      📅 {new Date(task.scheduled_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.healthBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <Text style={[styles.healthBadgeText, { color: '#B45309' }]}>{task.status}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.primaryButton, { marginTop: 12, paddingVertical: 10 }]} 
                  onPress={() => navigation.navigate('AssetDetail', { type: task.asset_type.toLowerCase(), id: task.asset_type === 'FORKLIFT' ? task.forklift_id : task.battery_id, task_id: task.id })}
                >
                  <Text style={styles.primaryButtonText}>Lihat Detail & Mulai</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

import { useIsFocused } from '@react-navigation/native';

const ScanScreen = ({ route, navigation }: any) => {
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
  
    // Kamera sering ngebug di Android jika tetap dipasang (mounted) saat tidak fokus
    if (!isFocused) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

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

const RiwayatScreen = ({ navigation }: any) => {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Filters
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('ALL'); // ALL, FORKLIFT, BATTERY
  const [filterDate, setFilterDate] = React.useState('ALL'); // ALL, TODAY, WEEK, MONTH

  React.useEffect(() => {
    const fetchHistory = () => {
      api.get('/inspections/my-history')
        .then(res => setHistory(res.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    const unsubscribe = navigation.addListener('focus', fetchHistory);
    return unsubscribe;
  }, [navigation]);

  const filteredHistory = history.filter(item => {
    // 1. Text Search
    if (search && !item.asset_code.toLowerCase().includes(search.toLowerCase()) && !item.asset_type.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // 2. Type Filter
    if (filterType !== 'ALL' && item.asset_type !== filterType) {
      return false;
    }
    // 3. Date Filter
    if (filterDate !== 'ALL') {
      const itemDate = new Date(item.date);
      const now = new Date();
      if (filterDate === 'TODAY') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (filterDate === 'WEEK') {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        if (itemDate < lastWeek) return false;
      } else if (filterDate === 'MONTH') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        if (itemDate < lastMonth) return false;
      }
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Riwayat Inspeksi</Text>
        {/* Search & Filters */}
        <View style={{ marginBottom: 20 }}>
          <TextInput 
            style={[styles.input, { marginBottom: 10 }]} 
            placeholder="Cari kode aset atau tipe..." 
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {['ALL', 'FORKLIFT', 'BATTERY'].map(t => (
              <TouchableOpacity 
                key={t}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: filterType === t ? COLORS.primary : '#E5E7EB', borderRadius: 20, marginRight: 8 }}
                onPress={() => setFilterType(t)}
              >
                <Text style={{ color: filterType === t ? '#fff' : '#374151', fontSize: 12, fontWeight: 'bold' }}>
                  {t === 'ALL' ? 'Semua Tipe' : t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'ALL', label: 'Semua Waktu' },
              { id: 'TODAY', label: 'Hari Ini' },
              { id: 'WEEK', label: '7 Hari Terakhir' },
              { id: 'MONTH', label: '30 Hari Terakhir' }
            ].map(d => (
              <TouchableOpacity 
                key={d.id}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: filterDate === d.id ? COLORS.secondary : '#E5E7EB', borderRadius: 20, marginRight: 8 }}
                onPress={() => setFilterDate(d.id)}
              >
                <Text style={{ color: filterDate === d.id ? '#fff' : '#374151', fontSize: 12, fontWeight: 'bold' }}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : filteredHistory.length === 0 ? (
          <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 20 }}>Tidak ada riwayat yang sesuai.</Text>
        ) : filteredHistory.map((item: any) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.historyCard}
            onPress={() => navigation.navigate('ReportDetail', { id: item.id, type: item.asset_type.toLowerCase() })}
          >
            <View style={styles.historyCardRow}>
              <Text style={styles.historyCardTitle}>{item.asset_code} ({item.asset_type})</Text>
              <Text style={styles.textMuted}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.historyCardSubtext}>
              {item.asset_type === 'FORKLIFT' ? `Health Score: ${item.score}%` : `Voltage: ${item.score}V`}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ReportDetailScreen = ({ route }: any) => {
  const { id, type } = route.params;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/inspections/${type}/${id}`)
      .then(res => setData(res.data.data))
      .catch(console.error);
  }, [id, type]);

  const handlePrint = async () => {
    try {
      const dt = new Date(data.completed_at || Date.now()).toLocaleDateString();
      let html = '';

      if (type === 'battery') {
        html = getBatteryHtml(data);
      } else {
        const grouped = (data.scores || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.category_name]) acc[curr.category_name] = [];
          acc[curr.category_name].push(curr);
          return acc;
        }, {});

        const checklistHtml = Object.entries(grouped).map(([catName, items]: [string, any]) => `
          <div style="break-inside: avoid; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">
              <span>${catName}</span>
              <span style="letter-spacing: 2px; font-weight: normal;">1 2 3</span>
            </div>
            ${items.map((item: any, idx: number) => `
              <div style="display: flex; border: 1px solid #000; border-bottom: none; font-size: 8px; align-items: stretch;">
                <div style="width: 15px; border-right: 1px solid #000; text-align: center; padding: 2px 0;">${idx + 1}</div>
                <div style="flex: 1; padding: 2px 4px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.item_name}</div>
                <div style="display: flex; width: 45px; border-left: 1px solid #000;">
                  <div style="width: 33.3%; border-right: 1px solid #000; text-align: center; padding-top: 2px;">${item.score === 1 ? 'X' : ''}</div>
                  <div style="width: 33.3%; border-right: 1px solid #000; text-align: center; padding-top: 2px;">${item.score === 2 ? 'X' : ''}</div>
                  <div style="width: 33.3%; text-align: center; padding-top: 2px;">${item.score === 3 ? 'X' : ''}</div>
                </div>
              </div>
            `).join('')}
            <div style="border-top: 1px solid #000;"></div>
          </div>
        `).join('');

        const buildRows = (arr: any[]) => {
          let rows = '';
          for(let i=0; i<Math.max(5, arr?.length || 0); i++) {
            const p = arr?.[i] || {};
            rows += `
              <tr>
                <td style="text-align: center; height: 16px;">${p.qty || ''}</td>
                <td style="text-transform: uppercase;">${p.description || ''}</td>
                <td style="text-transform: uppercase;">${p.part_no || ''}</td>
              </tr>
            `;
          }
          return rows;
        };

        const svcFlags = ['Warranty Service', 'Contract Service', 'Non-Contract Service'].map(svc => `
          <div style="display: flex; align-items: center; margin-bottom: 2px;">
            <div style="width: 10px; height: 10px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 10px; font-weight: bold; margin-right: 4px;">
              ${data.additional_data?.service_type === svc ? 'X' : ''}
            </div>
            <span style="font-weight: bold; text-transform: uppercase;">${svc}</span>
          </div>
        `).join('');

        const condFlags = ['Indoor', 'Outdoor', 'Wet/Dry', 'Dusty', 'Aggressive'].map(cond => `
          <div style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; text-transform: uppercase; margin-right: 4px;">
            ${Array.isArray(data.additional_data?.working_conditions) ? (data.additional_data.working_conditions.includes(cond) ? '☑' : '☐') : '☐'} ${cond}
          </div>
        `).join('');

        const actionFlags = ['Under Guarantee', 'To Be Charged', 'Urgently', 'Immediate'].map(flag => `
          <div style="display: flex; align-items: center;">
            <div style="width: 10px; height: 10px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 10px; margin-right: 4px;">
              ${Array.isArray(data.additional_data?.action_flags) ? (data.additional_data.action_flags.includes(flag) ? 'X' : '') : ''}
            </div>
            <span>${flag}</span>
          </div>
        `).join('');

        html = `
          <html>
            <head>
              <style>
                @page { margin: 10px 20px; }
                body { font-family: sans-serif; font-size: 10px; padding: 0; margin: 0; line-height: 1.2; }
                .header { display: table; width: 100%; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
                .logo { width: 50px; height: 50px; background: #22c55e; color: #fff; font-size: 32px; font-weight: bold; text-align: center; line-height: 50px; border-radius: 8px; display: inline-block; }
                .grid-3 { display: table; width: 100%; margin-bottom: 8px; table-layout: fixed; }
                .col { display: table-cell; vertical-align: top; padding-right: 8px; }
                .row { display: table; width: 100%; margin-bottom: 4px; }
                .lbl { display: table-cell; font-weight: bold; text-transform: uppercase; white-space: nowrap; padding-right: 4px; width: 1%; }
                .val { display: table-cell; border-bottom: 1px solid #000; padding-bottom: 1px; width: auto; }
                
                .columns-3 { column-count: 3; column-gap: 16px; margin-bottom: 16px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9px; }
                th, td { border: 1px solid #000; padding: 2px 4px; text-align: left; }
                th { background: #f3f4f6; }
              </style>
            </head>
            <body>
              <div class="header">
                <div style="display: table-cell; width: 20%; vertical-align: middle;"><div class="logo">M</div></div>
                <div style="display: table-cell; width: 80%; text-align: center; vertical-align: middle;">
                  <h1 style="margin: 0 0 4px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">PT UNITED MULTILIFT PERKASA</h1>
                  <p style="margin: 0; font-weight: bold; font-size: 10px;">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423</p>
                  <p style="margin: 0; font-weight: bold; font-size: 10px;">Tel. 021 - 8240 1141 (Hunting)</p>
                  <p style="margin: 0; font-size: 10px;">www.multiliftperkasa.com • e-mail: marketing@multiliftperkasa.com</p>
                </div>
              </div>

              <div class="grid-3">
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 60px;">CLIENT</div><div class="val">${data.customer_name || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">ADDRESS</div><div class="val">${data.customer_address || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">MODEL</div><div class="val">${data.model || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">YEAR</div><div class="val">${data.year || ''}</div></div>
                </div>
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 70px;">PRODUCT</div><div class="val">FORKLIFT</div></div>
                  <div class="row"><div class="lbl" style="width: 70px;">HOUR METER</div><div class="val">${data.additional_data?.hour_meter || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 70px;">SERIAL NO</div><div class="val">${data.asset_code || ''}</div></div>
                </div>
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 100px;">DATE</div><div class="val">${dt}</div></div>
                  <div class="row"><div class="lbl" style="width: 100px;">SERVICE REPORT NO.</div><div class="val">${data.additional_data?.service_report_no || ''}</div></div>
                  <div style="margin-top: 8px; font-size: 9px;">${svcFlags}</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 9px;">
                <div class="lbl" style="width: 120px;">WORKING CONDITION</div>
                ${condFlags}
              </div>

              <div class="columns-3">
                ${checklistHtml}
              </div>

              <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold;">Report of any other works carried out:</p>
                  <div style="border-bottom: 1px solid #000; min-height: 40px; font-style: italic; padding: 4px;">${data.notes || ''}</div>
                </div>
                <div style="width: 250px; font-size: 10px;">
                  <p style="margin: 0;"><strong>Report:</strong> Col. 1 - Item requires Immediate repair resp. replacement</p>
                  <p style="margin: 0 0 0 40px;">Col. 2 - Item requires Attention</p>
                  <p style="margin: 0 0 0 40px;">Col. 3 - Item is in order / completed</p>
                </div>
              </div>

              <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; text-align: center;">Based on above report we used</p>
                  <table>
                    <thead><tr><th style="width: 30px; text-align: center;">QTY</th><th>DESCRIPTION</th><th style="width: 60px;">PART. No</th></tr></thead>
                    <tbody>${buildRows(data.additional_data?.parts_used)}</tbody>
                  </table>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; text-align: center;">We recommend you to order</p>
                  <table>
                    <thead><tr><th style="width: 30px; text-align: center;">QTY</th><th>DESCRIPTION</th><th style="width: 60px;">PART. No</th></tr></thead>
                    <tbody>${buildRows(data.additional_data?.parts_recommended)}</tbody>
                  </table>
                </div>
              </div>

              <p style="font-weight: bold; font-size: 8px; text-transform: uppercase; text-align: center; margin-bottom: 16px;">
                Signing of the report constitute an intruction for works to be carried out where an official order may or may not follow
              </p>

              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
                <div style="text-align: center; width: 180px;">
                  <div style="height: 50px; border-bottom: 1px solid #000; margin-bottom: 4px;"></div>
                  <p style="margin: 0; font-weight: bold; text-transform: uppercase;">SERVICE PERFORMED BY</p>
                  <p style="margin: 2px 0 0 0; text-transform: uppercase;">${data.mechanic || ''}</p>
                </div>
                
                <div style="border: 1px solid #000; width: 220px; text-align: center;">
                  <div style="border-bottom: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">
                    The client was informend about the found<br/>Detect and the danger resulting therefrom
                  </div>
                  <div style="padding: 4px; display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
                    <div>WORKING HOURS:</div>
                    <div>DATE:</div>
                    <div>TO:</div>
                  </div>
                </div>
                
                <div style="text-align: center; width: 180px;">
                  <div style="height: 50px; border-bottom: 1px solid #000; margin-bottom: 4px;"></div>
                  <p style="margin: 0; font-weight: bold; text-transform: uppercase;">CLIENT SIGNATURE & STAMP</p>
                  <p style="margin: 2px 0 0 0; text-transform: uppercase; font-size: 8px;">NAME IN BLOCK LETTER<br/>PLEASE SUBMIT QUOTATION</p>
                </div>
              </div>

              <div style="display: flex; justify-content: center; gap: 24px; font-weight: bold; text-transform: uppercase; font-size: 9px;">
                ${actionFlags}
              </div>
            </body>
          </html>
        `;
      }

      if (Platform.OS === 'web') {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(html);
        iframe.contentWindow?.document.close();
        
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        };
      } else {
        const { base64 } = await Print.printToFileAsync({ html, base64: true });
        const safeUri = FileSystem.cacheDirectory + 'Laporan.pdf';
        await FileSystem.writeAsStringAsync(safeUri, base64 || '', { encoding: FileSystem.EncodingType.Base64 });
        
        await Sharing.shareAsync(safeUri, { 
          mimeType: 'application/pdf', 
          dialogTitle: 'Export PDF Laporan',
          UTI: 'com.adobe.pdf' 
        });
      }
    } catch (e: any) {
      console.error('Error generating PDF:', e);
      alert('Gagal membuat PDF: ' + (e.message || e));
    }
  };

  if (!data) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={[styles.primaryButton, { marginBottom: 16 }]} onPress={handlePrint}>
          <Text style={styles.primaryButtonText}>📄 Export PDF</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Report Detail - {data.asset_code}</Text>
          <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 12, marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLORS.primary, marginBottom: 8 }}>
              No: {data.additional_data?.service_report_no || data.full_report_data?.service_report_no || 'N/A'}
            </Text>
            {type === 'forklift' && (
              <>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Model: {data.model || '-'}</Text>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>Tahun: {data.year || '-'}</Text>
              </>
            )}
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Client: {data.customer_name || 'Internal'}</Text>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Alamat: {data.customer_address || '-'}</Text>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Mekanik: {data.mechanic}</Text>
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Waktu: {data.additional_data?.started_at ? new Date(data.additional_data.started_at).toLocaleString() : '-'} s/d {new Date(data.completed_at).toLocaleString()}</Text>
            {data.additional_data?.location && (
              <Text style={{ fontSize: 12, marginBottom: 4 }}>Lokasi: {data.additional_data.location.latitude.toFixed(4)}, {data.additional_data.location.longitude.toFixed(4)}</Text>
            )}
          </View>

          {type === 'forklift' && data.additional_data && (
            <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLORS.primary, marginBottom: 8, borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 4 }}>General Data</Text>
              <Text style={{ fontSize: 12, marginBottom: 4 }}>Hour Meter: {data.additional_data.hour_meter || '-'}</Text>
              <Text style={{ fontSize: 12, marginBottom: 4 }}>Tipe Service: {data.additional_data.service_type || '-'}</Text>
              <Text style={{ fontSize: 12, marginBottom: 4 }}>Kondisi: {data.additional_data.working_conditions?.join(', ') || '-'}</Text>
            </View>
          )}

          {data.additional_data?.parts_used?.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLORS.primary, marginBottom: 8 }}>Based On Above Report We Used</Text>
              <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderBottomWidth: 1, borderColor: COLORS.border }}>
                  <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12 }}>Qty</Text>
                  <Text style={{ flex: 3, fontWeight: 'bold', fontSize: 12 }}>Description</Text>
                  <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12 }}>Part No.</Text>
                </View>
                {data.additional_data.parts_used.map((p: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', padding: 8, borderBottomWidth: i === data.additional_data.parts_used.length - 1 ? 0 : 1, borderColor: COLORS.border }}>
                    <Text style={{ flex: 1, fontSize: 12 }}>{p.qty}</Text>
                    <Text style={{ flex: 3, fontSize: 12 }}>{p.description}</Text>
                    <Text style={{ flex: 2, fontSize: 12 }}>{p.part_no}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {data.additional_data?.parts_recommended?.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLORS.primary, marginBottom: 8 }}>We Recomend You To Order</Text>
              <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderBottomWidth: 1, borderColor: COLORS.border }}>
                  <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12 }}>Qty</Text>
                  <Text style={{ flex: 3, fontWeight: 'bold', fontSize: 12 }}>Description</Text>
                  <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12 }}>Part No.</Text>
                </View>
                {data.additional_data.parts_recommended.map((p: any, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', padding: 8, borderBottomWidth: i === data.additional_data.parts_recommended.length - 1 ? 0 : 1, borderColor: COLORS.border }}>
                    <Text style={{ flex: 1, fontSize: 12 }}>{p.qty}</Text>
                    <Text style={{ flex: 3, fontSize: 12 }}>{p.description}</Text>
                    <Text style={{ flex: 2, fontSize: 12 }}>{p.part_no}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {data.additional_data?.action_flags?.length > 0 && (
            <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: COLORS.primary, marginBottom: 4 }}>Action Flags:</Text>
              <Text style={{ fontSize: 12 }}>{data.additional_data.action_flags.join(', ')}</Text>
            </View>
          )}
        </View>

        {type === 'forklift' && data.scores && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Checklist Items</Text>
            <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderBottomWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12 }}>Category</Text>
                <Text style={{ flex: 3, fontWeight: 'bold', fontSize: 12 }}>Item</Text>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>Score</Text>
              </View>
              {data.scores.map((s: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', padding: 8, borderBottomWidth: idx === data.scores.length - 1 ? 0 : 1, borderColor: COLORS.border, alignItems: 'center' }}>
                  <Text style={{ flex: 2, fontSize: 11 }}>{s.category_name}</Text>
                  <View style={{ flex: 3 }}>
                    <Text style={{ fontSize: 11 }}>{s.item_name}</Text>
                    {s.photo_url && <Text style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>(Bukti Foto)</Text>}
                  </View>
                  <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: s.score === 3 ? COLORS.healthy : s.score === 2 ? COLORS.attention : COLORS.critical }}>
                    {s.score}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Total Health Score: {data.health_percentage}%</Text>
            {data.notes && <Text style={{ marginTop: 8 }}>Catatan: {data.notes}</Text>}
          </View>
        )}

        {type === 'battery' && data.full_report_data && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hasil Service Baterai</Text>
            <Text style={{ fontWeight: 'bold' }}>Kondisi: {data.full_report_data.condition_during_servicing}</Text>
            <Text style={{ marginTop: 8, fontStyle: 'italic' }}>Lihat web admin untuk detail 40 cell dan charger.</Text>
            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>Work Done:</Text>
            <Text>{data.full_report_data.work_done || '-'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};



const AssetDetailScreen = ({ route, navigation }: any) => {
  const { type, id, task_id } = route.params;
  const isBattery = type === 'battery';
  const [asset, setAsset] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (id) {
      api.get(`/${isBattery ? 'batteries' : 'forklifts'}/${id}`)
        .then(res => setAsset(res.data.data))
        .catch(console.error);

      api.get(`/inspections/asset/${id}?type=${type}`)
        .then(res => setHistory(res.data.data))
        .catch(console.error);
    }
  }, [id, type]);

  if (!asset) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.assetId} numberOfLines={1}>{asset.asset_code}</Text>
              <Text style={styles.assetType} numberOfLines={1}>{asset.model || asset.brand || 'Unknown Model'}</Text>
              <Text style={styles.assetCustomer} numberOfLines={2}>{asset.customer_name || 'No Customer'}</Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: isBattery ? '#F3F4F6' : '#DCFCE7', borderColor: isBattery ? '#E5E7EB' : '#BBF7D0', paddingVertical: 8, paddingHorizontal: 12, flexShrink: 0 }]}>
              <Text style={[styles.healthBadgeText, { color: isBattery ? '#374151' : '#166534', fontSize: 16 }]}>
                {isBattery ? (asset.voltage ? `${asset.voltage}V` : 'Standby') : `🟢 ${asset.health_score}%`}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Riwayat Inspeksi Aset Ini</Text>
        {history.length === 0 ? (
          <Text style={{ color: '#6B7280', fontStyle: 'italic', marginBottom: 16 }}>Belum ada riwayat inspeksi.</Text>
        ) : (
          history.slice(0, 3).map((h, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.historyCardTitle}>
                  {isBattery ? `Inspeksi Baterai` : `Inspeksi Forklift`}
                </Text>
                <Text style={{ fontWeight: 'bold', color: isBattery ? '#4B5563' : (h.score >= 80 ? '#16A34A' : '#D97706') }}>
                  {isBattery ? `${h.score}V` : `${h.score}%`}
                </Text>
              </View>
              <Text style={styles.historyCardSubtext}>
                {new Date(h.date).toLocaleDateString()} - oleh {h.mechanic_name}
              </Text>
            </View>
          ))
        )}

        {route.params?.fromScan ? (
          isBattery ? (
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={() => navigation.navigate('BatteryForm', { id, task_id, asset })}>
              <Text style={styles.primaryButtonText}>Mulai Service Baterai</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={() => navigation.navigate('InspectionForm', { id, task_id, asset })}>
              <Text style={styles.primaryButtonText}>Mulai Inspeksi Checklist</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 20, backgroundColor: '#F59E0B' }]} 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Scan', params: { task_id: task_id, expected_asset_id: id } })}
          >
            <Text style={[styles.primaryButtonText, { color: '#000' }]}>📸 Scan QR Fisik untuk Mulai</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const InspectionFormScreen = ({ route, navigation }: any) => {
  const { id, task_id } = route.params;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCatIdx, setCurrentCatIdx] = useState(0);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [scores, setScores] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [hourMeter, setHourMeter] = useState('');
  const [workingConditions, setWorkingConditions] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState('');
  
  // New features state
  const [isStarted, setIsStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [partsUsed, setPartsUsed] = useState<any[]>([]);
  const [partsRecommended, setPartsRecommended] = useState<any[]>([]);
  const [actionFlags, setActionFlags] = useState<string[]>([]);

  useEffect(() => {
    api.get('/settings/templates/forklift')
      .then(res => {
        setCategories(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <View style={styles.container}><Text>Loading items...</Text></View>;
  if (categories.length === 0) return <Text style={{ padding: 20 }}>No template found.</Text>;

  const handleStart = async () => {
    setStartedAt(new Date().toISOString());
    setIsStarted(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    } catch (e) {
      console.log('Location error', e);
    }
  };

  if (!isStarted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.pageTitle, { textAlign: 'center', marginBottom: 8 }]}>Siap Memulai Inspeksi?</Text>
          <Text style={{ textAlign: 'center', marginBottom: 24, color: COLORS.textMuted }}>Sistem akan mencatat waktu dan lokasi Anda secara otomatis.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>🚀 Mulai Inspeksi Sekarang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentCategory = categories[currentCatIdx];
  const currentItem = currentCategory?.items?.[currentItemIdx];
  const isLastItem = currentCatIdx === categories.length - 1 && currentItemIdx === currentCategory.items.length - 1;

  const currentScoreItem = scores.find(s => s.item_id === currentItem?.id);
  const currentScore = currentScoreItem?.score || null;

  const handleTakePhoto = async (autoAdvance = true) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Maaf, butuh izin kamera untuk mengambil foto kerusakan.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setScores(prev => {
          const newScores = [...prev];
          const idx = newScores.findIndex(s => s.item_id === currentItem.id);
          if (idx !== -1) {
            const asset = result.assets[0];
            newScores[idx].photo_url = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          }
          return newScores;
        });

        if (autoAdvance && !isLastItem) {
          if (currentItemIdx < currentCategory.items.length - 1) {
            setCurrentItemIdx(currentItemIdx + 1);
          } else {
            setCurrentCatIdx(currentCatIdx + 1);
            setCurrentItemIdx(0);
          }
        }
      }
    } catch (error) {
      console.log('Error taking photo', error);
    }
  };

  const handleScore = async (scoreVal: number) => {
    setScores(prev => {
      const filtered = prev.filter(s => s.item_id !== currentItem.id);
      return [...filtered, { item_id: currentItem.id, score: scoreVal }];
    });

    if (scoreVal === 1) {
      // Automatically launch camera for score 1 (Bad/Rusak)
      await handleTakePhoto(true);
      return; 
    }
    
    if (!isLastItem) {
      if (currentItemIdx < currentCategory.items.length - 1) {
        setCurrentItemIdx(currentItemIdx + 1);
      } else {
        setCurrentCatIdx(currentCatIdx + 1);
        setCurrentItemIdx(0);
      }
    }
  };

  const submitInspection = async () => {
    Keyboard.dismiss();
    if (isLastItem && (!hourMeter || !serviceType || workingConditions.length === 0)) {
      alert('Harap lengkapi Data Umum (Hour Meter, Working Condition, Service Type)');
      return;
    }

    try {
      await api.post('/inspections/forklift', {
        task_id: task_id || null,
        forklift_id: id,
        items: scores,
        notes,
        additional_data: {
          hour_meter: hourMeter,
          working_conditions: workingConditions,
          service_type: serviceType,
          started_at: startedAt,
          location,
          parts_used: partsUsed.filter(p => p.qty || p.description),
          parts_recommended: partsRecommended.filter(p => p.qty || p.description),
          action_flags: actionFlags
        }
      });
      alert('Inspeksi Selesai!');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      alert('Gagal: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.textMuted}>Kategori: {currentCategory.name}</Text>
          <Text style={styles.greeting}>{currentItem?.name}</Text>
          <Text style={styles.cameraInstruction}>Beri nilai kondisi komponen ini.</Text>
        </View>

        <View style={{ gap: 12, marginBottom: 24 }}>
          <TouchableOpacity style={[styles.scoreBtn, currentScore === 3 && { backgroundColor: '#DCFCE7', borderColor: COLORS.healthy }]} onPress={() => handleScore(3)}>
            <Text style={[styles.scoreBtnText, currentScore === 3 && { color: COLORS.healthy }]}>🟢 Baik (Score 3)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.scoreBtn, currentScore === 2 && { backgroundColor: '#FEF3C7', borderColor: COLORS.attention }]} onPress={() => handleScore(2)}>
            <Text style={[styles.scoreBtnText, currentScore === 2 && { color: COLORS.attention }]}>🟡 Cukup (Score 2)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.scoreBtn, currentScore === 1 && { backgroundColor: '#FEE2E2', borderColor: COLORS.critical }]} onPress={() => handleScore(1)}>
            <Text style={[styles.scoreBtnText, currentScore === 1 && { color: COLORS.critical }]}>🔴 Buruk (Score 1)</Text>
          </TouchableOpacity>
        </View>

        {currentScore === 1 && !currentScoreItem?.photo_url && (
          <View style={{ marginTop: 10, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' }}>
            <Text style={{ color: '#991B1B', fontWeight: 'bold', marginBottom: 8 }}>⚠️ Wajib Sertakan Bukti Foto</Text>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#DC2626' }]} onPress={() => handleTakePhoto(false)}>
              <Text style={styles.primaryButtonText}>📸 Ambil Foto Kerusakan</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLastItem && (
          <View style={{ marginTop: 20, paddingBottom: 40 }}>
            <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>Data Umum (Wajib)</Text>
            
            <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 12 }}>Hour Meter</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="Masukkan angka Hour Meter..." 
              keyboardType="numeric"
              value={hourMeter}
              onChangeText={setHourMeter}
            />

            <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>Working Condition (Pilih satu/lebih)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['Indoor', 'Outdoor', 'Wet/Dry', 'Dusty', 'Aggressive'].map(cond => {
                const isSelected = workingConditions.includes(cond);
                return (
                  <TouchableOpacity 
                    key={cond}
                    onPress={() => setWorkingConditions(prev => isSelected ? prev.filter(c => c !== cond) : [...prev, cond])}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isSelected ? COLORS.primary : COLORS.border, backgroundColor: isSelected ? '#E0E7FF' : COLORS.surface }}
                  >
                    <Text style={{ color: isSelected ? COLORS.primary : COLORS.textPrimary, fontWeight: isSelected ? 'bold' : 'normal', fontSize: 12 }}>{cond}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>Tipe Service</Text>
            <View style={{ gap: 8 }}>
              {['Warranty Service', 'Contract Service', 'Non-Contract Service'].map(svc => (
                <TouchableOpacity 
                  key={svc}
                  onPress={() => setServiceType(svc)}
                  style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: serviceType === svc ? COLORS.primary : COLORS.border, backgroundColor: serviceType === svc ? '#E0E7FF' : COLORS.surface }}
                >
                  <Text style={{ color: serviceType === svc ? COLORS.primary : COLORS.textPrimary, fontWeight: serviceType === svc ? 'bold' : 'normal' }}>{svc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* NEW TABLES */}
            <View style={{ marginTop: 24, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>Based On Above Report We Used</Text>
              {partsUsed.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Qty" value={p.qty} onChangeText={t => { const newP = [...partsUsed]; newP[i].qty = t; setPartsUsed(newP); }} />
                  <TextInput style={[styles.textInput, { flex: 3 }]} placeholder="Description" value={p.description} onChangeText={t => { const newP = [...partsUsed]; newP[i].description = t; setPartsUsed(newP); }} />
                  <TextInput style={[styles.textInput, { flex: 2 }]} placeholder="Part No." value={p.part_no} onChangeText={t => { const newP = [...partsUsed]; newP[i].part_no = t; setPartsUsed(newP); }} />
                </View>
              ))}
              <TouchableOpacity onPress={() => setPartsUsed([...partsUsed, { qty: '', description: '', part_no: '' }])}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Tambah Baris</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 24, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>We Recomend You To Order</Text>
              {partsRecommended.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Qty" value={p.qty} onChangeText={t => { const newP = [...partsRecommended]; newP[i].qty = t; setPartsRecommended(newP); }} />
                  <TextInput style={[styles.textInput, { flex: 3 }]} placeholder="Description" value={p.description} onChangeText={t => { const newP = [...partsRecommended]; newP[i].description = t; setPartsRecommended(newP); }} />
                  <TextInput style={[styles.textInput, { flex: 2 }]} placeholder="Part No." value={p.part_no} onChangeText={t => { const newP = [...partsRecommended]; newP[i].part_no = t; setPartsRecommended(newP); }} />
                </View>
              ))}
              <TouchableOpacity onPress={() => setPartsRecommended([...partsRecommended, { qty: '', description: '', part_no: '' }])}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Tambah Baris</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 24, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16 }}>
              <Text style={{ fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 }}>Action Flags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['Under Guarantee', 'To Be Charged', 'Urgently', 'Immediate'].map(flag => {
                  const isSelected = actionFlags.includes(flag);
                  return (
                    <TouchableOpacity 
                      key={flag}
                      onPress={() => setActionFlags(prev => isSelected ? prev.filter(c => c !== flag) : [...prev, flag])}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isSelected ? COLORS.primary : COLORS.border, backgroundColor: isSelected ? '#E0E7FF' : COLORS.surface }}
                    >
                      <Text style={{ color: isSelected ? COLORS.primary : COLORS.textPrimary, fontWeight: isSelected ? 'bold' : 'normal', fontSize: 12 }}>{flag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Catatan Tambahan</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="Tambahkan catatan jika ada..." 
              multiline 
              numberOfLines={3} 
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        )}
      </ScrollView>

      {isLastItem && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border }}>
          <TouchableOpacity style={styles.primaryButton} onPress={submitInspection}>
            <Text style={styles.primaryButtonText}>Kirim Laporan ({scores.length} Item)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const BatteryServiceFormScreen = ({ route, navigation }: any) => {
  const { id, task_id, asset } = route.params;
  
  // Header Info
  const [assetCode, setAssetCode] = useState(asset?.asset_code || '');
  const [brand, setBrand] = useState(asset?.brand || '');
  const [voltage, setVoltage] = useState(asset?.voltage ? asset.voltage.toString() : '');
  const [customer, setCustomer] = useState(asset?.customer_id || '');
  const [condDuringServ, setCondDuringServ] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [complaint, setComplaint] = useState('');
  
  // 40 cells state: { sg: string, v: string }
  const [cells, setCells] = useState(Array(40).fill({ sg: '', v: '' }));
  
  const [charger, setCharger] = useState({ brand: '', input: '', output: '', condition: '' });
  
  const [otherInfo, setOtherInfo] = useState({
    tray: 'Good', intercell: 'Good', lids: 'Good',
    appearance: 'Good', maintenance: 'Good', electrolyte: 'Correct',
    defective: 'No', condition: 'Good',
    broken_connector_no: '', cracked_lid_no: '', cell_no_1: '', cell_no_2: '', suspect_cell_no: ''
  });
  
  const [recs, setRecs] = useState<string[]>([]);
  const [workDone, setWorkDone] = useState('');
  
  const updateCell = (index: number, key: 'sg'|'v', val: string) => {
    const newCells = [...cells];
    newCells[index] = { ...newCells[index], [key]: val };
    setCells(newCells);
  };

  const submitBattery = async () => {
    try {
      const fullData = {
        contact_person: contactPerson,
        complaint: complaint,
        ah_voltage: voltage,
        condition_during_servicing: condDuringServ,
        cells,
        charger,
        other_info: otherInfo,
        recommendations: recs,
        work_done: workDone.split('\n')
      };

      await api.post('/inspections/battery', {
        task_id: task_id || null,
        battery_id: id,
        voltage_reading: voltage, // Pass the voltage from the form
        full_report_data: fullData
      });
      alert('Service Baterai Selesai!');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e: any) {
      alert('Gagal: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Service Report Baterai</Text>
        
        {/* HEADER INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data & Keluhan</Text>
          <TextInput style={styles.textInput} placeholder="Contact Person/Dept" value={contactPerson} onChangeText={setContactPerson} />
          <TextInput style={styles.textInput} placeholder="Nature Of Complaint/Service needed" value={complaint} onChangeText={setComplaint} />
          <TextInput style={styles.textInput} placeholder="Voltage" value={voltage} onChangeText={setVoltage} />
        </View>

        {/* CONDITION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Kondisi Saat Servis</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {['Fully Charge', 'Before Charging', 'IN Operation'].map(cond => (
              <TouchableOpacity 
                key={cond} 
                style={[styles.scoreBtn, { padding: 8 }, condDuringServ === cond && { backgroundColor: '#DCFCE7', borderColor: COLORS.healthy }]}
                onPress={() => setCondDuringServ(cond)}
              >
                <Text style={condDuringServ === cond ? { color: COLORS.healthy } : {}}>{cond}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 40 CELLS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Pembacaan Cell (1-40)</Text>
          <Text style={styles.textMuted}>Isi S.G dan Volts untuk setiap cell.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 320, gap: 8 }}>
              {cells.map((cell, idx) => (
                <View key={idx} style={{ width: '47%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: COLORS.primary }}>Cell {idx + 1}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TextInput 
                      style={[styles.textInput, { flex: 1, height: 32, padding: 4, fontSize: 12 }]} 
                      placeholder="S.G" 
                      keyboardType="decimal-pad"
                      value={cell.sg}
                      onChangeText={v => updateCell(idx, 'sg', v)}
                    />
                    <TextInput 
                      style={[styles.textInput, { flex: 1, height: 32, padding: 4, fontSize: 12 }]} 
                      placeholder="Volts" 
                      keyboardType="decimal-pad"
                      value={cell.v}
                      onChangeText={v => updateCell(idx, 'v', v)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* CHARGER */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Charger</Text>
          {['brand', 'input', 'output', 'condition'].map(key => (
            <TextInput 
              key={key}
              style={[styles.textInput, { marginBottom: 8 }]} 
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)} 
              value={(charger as any)[key]}
              onChangeText={v => setCharger({ ...charger, [key]: v })}
            />
          ))}
        </View>

        {/* OTHER INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Informasi Lain</Text>
          {[
            { key: 'tray', label: 'Tray', opts: ['Corrosion', 'Fair', 'Good'] },
            { key: 'intercell', label: 'Intercell Conn', opts: ['Broken', 'Corroded', 'Good'] },
            { key: 'lids', label: 'Cell Lids', opts: ['Cracked', 'Fair', 'Good'] },
            { key: 'appearance', label: 'Appearance', opts: ['Poor', 'Fair', 'Good'] },
            { key: 'maintenance', label: 'General Maintenance', opts: ['Poor', 'Fair', 'Good'] },
            { key: 'electrolyte', label: 'Electrolyte', opts: ['Poor', 'Fair', 'Correct'] },
            { key: 'defective', label: 'Any defective Cells Detected', opts: ['Yes', 'No'] },
            { key: 'condition', label: 'Condition', opts: ['Poor', 'Fair', 'Good'] },
          ].map(item => (
            <View key={item.key} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, marginBottom: 4 }}>{item.label}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {item.opts.map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.scoreBtn, { padding: 6, flex: 1 }, (otherInfo as any)[item.key] === opt && { backgroundColor: '#DCFCE7', borderColor: COLORS.healthy }]}
                    onPress={() => setOtherInfo({ ...otherInfo, [item.key]: opt })}
                  >
                    <Text style={{ fontSize: 12, textAlign: 'center' }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TextInput style={[styles.textInput, { marginBottom: 8 }]} placeholder="Broken/corroded connector No." value={otherInfo.broken_connector_no} onChangeText={t => setOtherInfo({...otherInfo, broken_connector_no: t})} />
          <TextInput style={[styles.textInput, { marginBottom: 8 }]} placeholder="Cracked Cell Lid No." value={otherInfo.cracked_lid_no} onChangeText={t => setOtherInfo({...otherInfo, cracked_lid_no: t})} />
          <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
            <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Low Level Cell No 1" value={otherInfo.cell_no_1} onChangeText={t => setOtherInfo({...otherInfo, cell_no_1: t})} />
            <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Low Level Cell No 2" value={otherInfo.cell_no_2} onChangeText={t => setOtherInfo({...otherInfo, cell_no_2: t})} />
          </View>
          <TextInput style={[styles.textInput, { marginBottom: 16 }]} placeholder="Suspect Cell No." value={otherInfo.suspect_cell_no} onChangeText={t => setOtherInfo({...otherInfo, suspect_cell_no: t})} />
        </View>

        {/* RECOMMENDATIONS & WORK DONE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Rekomendasi & Catatan Akhir</Text>
          <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('acid') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('acid') ? recs.filter(r => r !== 'acid') : [...recs, 'acid'])}>
            <Text>Battery needs acid adjustment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 8, padding: 8 }, recs.includes('capacity') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('capacity') ? recs.filter(r => r !== 'capacity') : [...recs, 'capacity'])}>
            <Text>Battery needs capacity test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.scoreBtn, { marginBottom: 16, padding: 8 }, recs.includes('replace') && { backgroundColor: '#FEF3C7' }]} onPress={() => setRecs(recs.includes('replace') ? recs.filter(r => r !== 'replace') : [...recs, 'replace'])}>
            <Text>Battery reaching end of life</Text>
          </TouchableOpacity>
          
          <TextInput 
            style={[styles.textInput, { height: 80 }]} 
            placeholder="Work done on battery..." 
            multiline 
            numberOfLines={3} 
            value={workDone}
            onChangeText={setWorkDone}
          />
        </View>

      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border }}>
        <TouchableOpacity style={styles.primaryButton} onPress={submitBattery}>
          <Text style={styles.primaryButtonText}>Selesai & Kirim Baterai Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const ProfilScreen = () => {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={styles.avatarPlaceholder}><Text style={{fontSize: 40}}>👤</Text></View>
          <Text style={styles.greeting}>{user?.full_name || 'Budi Santoso'}</Text>
          <Text style={styles.textMuted}>{user?.role || 'Mekanik'}</Text>
        </View>
        <TouchableOpacity 
          onPress={logout}
          style={[styles.primaryButton, { marginTop: 40, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.critical }]}
        >
          <Text style={[styles.primaryButtonText, { color: COLORS.critical }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- NAVIGATORS ---

const TabNavigator = () => (
  <Tab.Navigator 
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: () => <Text>🏠</Text> }} />
    <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarIcon: () => <Text>📷</Text> }} />
    <Tab.Screen name="Riwayat" component={RiwayatScreen} options={{ tabBarIcon: () => <Text>📋</Text> }} />
    <Tab.Screen name="Profil" component={ProfilScreen} options={{ tabBarIcon: () => <Text>👤</Text> }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = React.useContext(AuthContext);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Detail Aset' }} />
            <Stack.Screen name="InspectionForm" component={InspectionFormScreen} options={{ title: 'Form Inspeksi Forklift' }} />
            <Stack.Screen name="BatteryForm" component={BatteryServiceFormScreen} options={{ title: 'Service Baterai' }} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Detail Riwayat' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    Keyboard.dismiss();
    const res = await api.post('/auth/login', { email, password: pass });
    const { token, user: userData } = res.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    Keyboard.dismiss();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <AppNavigator />
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 24, marginTop: 20 },
  appTitle: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 20, marginTop: 10 },
  
  scanButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 24, alignItems: 'center',
    marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  scanButtonIcon: { fontSize: 48, marginBottom: 8 },
  scanButtonText: { color: COLORS.surface, fontSize: 18, fontWeight: 'bold' },
  scanButtonSubtext: { color: '#DBEAFE', fontSize: 14, marginTop: 4 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  statLabel: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  
  historyCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  historyCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyCardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  historyCardSubtext: { fontSize: 14, color: COLORS.textMuted },
  
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  healthBadgeText: { fontSize: 12, fontWeight: 'bold' },
  
  primaryButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: 'bold' },
  
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cameraFrame: { width: 250, height: 250, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cameraText: { color: COLORS.primary, fontWeight: 'bold' },
  cameraInstruction: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 10 },
  
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  textMuted: { color: COLORS.textMuted, fontSize: 14 },
  
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  assetId: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4, fontFamily: 'monospace' },
  assetType: { fontSize: 16, color: COLORS.textPrimary, marginBottom: 4 },
  assetCustomer: { fontSize: 14, color: COLORS.textMuted },
  
  scoreBtn: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center' },
  scoreBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  
  criticalActionBox: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  uploadBtn: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FCA5A5', borderStyle: 'dashed', marginBottom: 12 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  textInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, textAlignVertical: 'top' },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 16 }
});
