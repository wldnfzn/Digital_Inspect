const fs = require('fs');

let app = fs.readFileSync('apps/app/App.tsx', 'utf-8');

// 1. IMPORT AsyncStorage
if (!app.includes("import AsyncStorage from '@react-native-async-storage/async-storage'")) {
  app = app.replace("import React", "import AsyncStorage from '@react-native-async-storage/async-storage';\nimport React");
}

// 2. Patch InspectionFormScreen
// First, we need to extract draft loading logic.
// Find the useEffect where we fetch templates.
let useEffectForklift = app.indexOf("api.get('/settings/templates/forklift')");
let useEffForkliftStart = app.lastIndexOf("useEffect(() => {", useEffectForklift);
let useEffForkliftEnd = app.indexOf("}, []);", useEffForkliftStart) + 7;

let replacementForklift = `
  useEffect(() => {
    const loadDraftAndTemplate = async () => {
      try {
        const res = await api.get('/settings/templates/forklift');
        setCategories(res.data.data || []);
        
        // Try to load from API (if drafted)
        if (task_id) {
          const taskRes = await api.get('/inspections/my-tasks');
          const task = taskRes.data.data.find((t: any) => t.id === task_id);
          let draft = null;
          
          if (task && task.draft_data) {
            draft = task.draft_data;
          } else {
            const localDraftStr = await AsyncStorage.getItem('draft_forklift_' + task_id);
            if (localDraftStr) draft = JSON.parse(localDraftStr);
          }
          
          if (draft) {
            if (draft.startedAt) { setStartedAt(draft.startedAt); setIsStarted(true); }
            if (draft.currentCatIdx !== undefined) setCurrentCatIdx(draft.currentCatIdx);
            if (draft.currentItemIdx !== undefined) setCurrentItemIdx(draft.currentItemIdx);
            if (draft.scores) setScores(draft.scores);
            if (draft.notes) setNotes(draft.notes);
            if (draft.hourMeter) setHourMeter(draft.hourMeter);
            if (draft.workingConditions) setWorkingConditions(draft.workingConditions);
            if (draft.serviceType) setServiceType(draft.serviceType);
            if (draft.location) setLocation(draft.location);
            if (draft.partsUsed) setPartsUsed(draft.partsUsed);
            if (draft.partsRecommended) setPartsRecommended(draft.partsRecommended);
            if (draft.actionFlags) setActionFlags(draft.actionFlags);
          } else if (task && task.started_at) {
            setStartedAt(task.started_at);
            setIsStarted(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDraftAndTemplate();
  }, [task_id]);

  // Auto-Save Effect
  useEffect(() => {
    if (!isStarted || !task_id) return;
    
    const draft = {
      startedAt, currentCatIdx, currentItemIdx, scores, notes, hourMeter, workingConditions, serviceType, location, partsUsed, partsRecommended, actionFlags
    };
    
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem('draft_forklift_' + task_id, JSON.stringify(draft));
        await api.put('/inspections/tasks/' + task_id + '/draft', { draft_data: draft, started_at: startedAt });
      } catch (e) {
        console.log('Auto-save error', e);
      }
    };
    
    const timer = setTimeout(saveDraft, 1000); // Debounce 1s
    return () => clearTimeout(timer);
  }, [isStarted, currentCatIdx, currentItemIdx, scores, notes, hourMeter, workingConditions, serviceType, location, partsUsed, partsRecommended, actionFlags]);
`;

app = app.substring(0, useEffForkliftStart) + replacementForklift + app.substring(useEffForkliftEnd);


// 3. Patch BatteryFormScreen
let useEffectBattery = app.indexOf("useEffect(() => {", app.indexOf("const BatteryServiceFormScreen"));
let useEffBatteryEnd = app.indexOf("}, []);", useEffectBattery) + 7;

let replacementBattery = `
  useEffect(() => {
    const loadDraft = async () => {
      if (task_id) {
        try {
          const taskRes = await api.get('/inspections/my-tasks');
          const task = taskRes.data.data.find((t: any) => t.id === task_id);
          let draft = null;
          
          if (task && task.draft_data) {
            draft = task.draft_data;
          } else {
            const localDraftStr = await AsyncStorage.getItem('draft_battery_' + task_id);
            if (localDraftStr) draft = JSON.parse(localDraftStr);
          }
          
          if (draft) {
            if (draft.startedAt) { setStartedAt(draft.startedAt); setIsStarted(true); }
            if (draft.cells) setCells(draft.cells);
            if (draft.accessories) setAccessories(draft.accessories);
            if (draft.cables) setCables(draft.cables);
            if (draft.connectors) setConnectors(draft.connectors);
            if (draft.overall_condition) setOverallCondition(draft.overall_condition);
            if (draft.cleaning_done !== undefined) setCleaningDone(draft.cleaning_done);
            if (draft.notes) setNotes(draft.notes);
            if (draft.currentStep !== undefined) setCurrentStep(draft.currentStep);
          } else if (task && task.started_at) {
            setStartedAt(task.started_at);
            setIsStarted(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadDraft();
  }, [task_id]);

  useEffect(() => {
    if (!isStarted || !task_id) return;
    const draft = {
      startedAt, cells, accessories, cables, connectors, overall_condition: overallCondition, cleaning_done: cleaningDone, notes, currentStep
    };
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem('draft_battery_' + task_id, JSON.stringify(draft));
        await api.put('/inspections/tasks/' + task_id + '/draft', { draft_data: draft, started_at: startedAt });
      } catch (e) {
        console.log('Auto-save error', e);
      }
    };
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [isStarted, currentStep, cells, accessories, cables, connectors, overallCondition, cleaningDone, notes]);
`;

app = app.substring(0, useEffectBattery) + replacementBattery + app.substring(useEffBatteryEnd);


// 4. Update HomeScreen to show Drafts separately
let homeScreenIdx = app.indexOf("const HomeScreen =");
let renderTasksEnd = app.indexOf("</ScrollView>", homeScreenIdx);
let homeTasksPartStart = app.indexOf("tasks.map((task: any)", homeScreenIdx);
let homeTasksPartEnd = app.indexOf("</ScrollView>", homeTasksPartStart);

let replacementHomeTasks = `
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
`;

app = app.substring(0, homeTasksPartStart) + replacementHomeTasks + app.substring(homeTasksPartEnd);

// Clear draft on complete POST
app = app.replace("await api.post('/inspections/forklift', payload);", "await api.post('/inspections/forklift', payload);\n      if(task_id) await AsyncStorage.removeItem('draft_forklift_' + task_id);");
app = app.replace("await api.post('/inspections/battery', payload);", "await api.post('/inspections/battery', payload);\n      if(task_id) await AsyncStorage.removeItem('draft_battery_' + task_id);");


fs.writeFileSync('apps/app/App.tsx', app);
console.log('done');
