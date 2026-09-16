import { readFileSync, writeFileSync } from 'fs';
const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const regex = /const RiwayatScreen = \(\{ navigation \}: any\) => \{[\s\S]*?\n\};\n\nconst ReportDetailScreen/m;

const newCode = `const RiwayatScreen = ({ navigation }: any) => {
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
          <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 20 }}>Tidak ada riwayat yang sesuai dengan filter.</Text>
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
              {item.asset_type === 'FORKLIFT' ? \`Health Score: \${item.score}%\` : \`Voltage: \${item.score}V\`}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ReportDetailScreen`;

content = content.replace(regex, newCode);
writeFileSync(p, content);
