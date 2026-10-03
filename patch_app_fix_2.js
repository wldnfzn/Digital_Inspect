const fs = require('fs');

let app = fs.readFileSync('apps/app/App.tsx', 'utf-8');

const startIdx = app.indexOf("const HomeScreen = ({ navigation }: any) => {");
const endIdx = app.indexOf("const AssetDetailScreen = ({ route }: any) => {");

const replacement = `const HomeScreen = ({ navigation }: any) => {
  const { user } = React.useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inspections/my-tasks');
      setTasks(res.data.data.filter((t: any) => t.status !== 'COMPLETED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Halo, {user?.full_name}</Text>
          <Text style={styles.headerSubtitle}>Mekanik - Digital Inspect</Text>
        </View>
        <Image source={{ uri: user?.avatar_url || 'https://i.pravatar.cc/150?img=11' }} style={styles.headerAvatar} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tugas & Jadwal Saya</Text>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <>
              {tasks.filter((t:any) => t.draft_data != null).length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, {marginTop: 20, color: COLORS.primary}]}>Draft Inspeksi (Belum Selesai)</Text>
                  {tasks.filter((t:any) => t.draft_data != null).map((task: any) => (
                    <View key={task.id} style={[styles.historyCard, { borderColor: COLORS.primary, borderLeftWidth: 4 }]}>
                      <View style={styles.historyCardRow}>
                        <View>
                          <Text style={styles.historyItemTitle}>{task.asset_type === 'FORKLIFT' ? task.forklift_code : task.battery_code}</Text>
                          <Text style={styles.historyItemDesc}>{task.asset_type}</Text>
                          <Text style={[styles.historyItemDesc, { color: COLORS.primary, fontWeight: 'bold' }]}>Melanjutkan Draft...</Text>
                        </View>
                        <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => {
                          if (task.asset_type === 'FORKLIFT') navigation.navigate('InspectionForm', { id: task.forklift_id, task_id: task.id });
                          else navigation.navigate('BatteryForm', { id: task.battery_id, task_id: task.id });
                        }}>
                          <Text style={styles.primaryButtonSmallText}>Lanjut</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <Text style={[styles.sectionTitle, {marginTop: 20}]}>Tugas Baru</Text>
              {tasks.filter((t:any) => t.draft_data == null).length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 10 }}>Tidak ada tugas baru.</Text>
              ) : (
                tasks.filter((t:any) => t.draft_data == null).map((task: any) => (
                  <View key={task.id} style={[styles.historyCard, { borderColor: COLORS.attention, borderLeftWidth: 4 }]}>
                    <View style={styles.historyCardRow}>
                      <View>
                        <Text style={styles.historyItemTitle}>{task.asset_type === 'FORKLIFT' ? task.forklift_code : task.battery_code}</Text>
                        <Text style={styles.historyItemDesc}>{task.asset_type}</Text>
                      </View>
                      <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => {
                        if (task.asset_type === 'FORKLIFT') navigation.navigate('InspectionForm', { id: task.forklift_id, task_id: task.id });
                        else navigation.navigate('BatteryForm', { id: task.battery_id, task_id: task.id });
                      }}>
                        <Text style={styles.primaryButtonSmallText}>Mulai</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

`;

app = app.substring(0, startIdx) + replacement + app.substring(endIdx);

fs.writeFileSync('apps/app/App.tsx', app);
console.log('done');
