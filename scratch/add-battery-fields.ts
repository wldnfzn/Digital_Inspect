import { readFileSync, writeFileSync } from 'fs';

const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const start = content.indexOf('const BatteryServiceFormScreen = ({ route, navigation }: any) => {');
const end = content.indexOf("const updateCell = (index: number, key: 'sg'|'v', val: string) => {", start);

let newLines = `const BatteryServiceFormScreen = ({ route, navigation }: any) => {
  const { id, task_id } = route.params;
  
  // Header Info
  const [contactPerson, setContactPerson] = useState('');
  const [complaint, setComplaint] = useState('');
  const [batteryCap, setBatteryCap] = useState('');
  const [voltage, setVoltage] = useState('');
  const [type, setType] = useState('');
  const [traySize, setTraySize] = useState('');
  const [typeOfPlug, setTypeOfPlug] = useState('');
  const [cablePos, setCablePos] = useState('');
  const [cableNeg, setCableNeg] = useState('');
  const [truckBrand, setTruckBrand] = useState('');
  
  const [condDuringServ, setCondDuringServ] = useState('');
  
  // 40 cells state: { sg: string, v: string }
  const [cells, setCells] = useState(Array(40).fill({ sg: '', v: '' }));
  
  const [charger, setCharger] = useState({ brand: '', input: '', output: '', condition: '' });
  
  const [otherInfo, setOtherInfo] = useState({
    tray: 'Good', intercell: 'Good', lids: 'Good',
    appearance: 'Good', maintenance: 'Good', electrolyte: 'Correct',
    defective: 'No', condition: 'Good',
    broken_connector_no: '', cracked_lid_no: '', cell_no_1: '', cell_no_2: '', suspect_cell_no: ''
  });
  
  // Recommendations array
  const [recs, setRecs] = useState<string[]>([]);
  // Work done array (up to 3 strings)
  const [workDone, setWorkDone] = useState(['', '', '']);
  
  `;

content = content.substring(0, start) + newLines + content.substring(end);

// Now update submitBattery
const submitStart = content.indexOf('const submitBattery = async () => {');
const submitEnd = content.indexOf("await api.post('/inspections/battery'", submitStart);

let newSubmit = `const submitBattery = async () => {
    try {
      const fullData = {
        contact_person: contactPerson,
        complaint: complaint,
        battery_cap: batteryCap,
        voltage: voltage,
        type: type,
        tray_size: traySize,
        type_of_plug: typeOfPlug,
        cable_length_pos: cablePos,
        cable_length_neg: cableNeg,
        truck_brand: truckBrand,
        condition_during_servicing: condDuringServ,
        cells,
        charger,
        other_info: otherInfo,
        recommendations: recs,
        work_done: workDone
      };

      `;

content = content.substring(0, submitStart) + newSubmit + content.substring(submitEnd);

// Now update JSX
const renderStart = content.indexOf('<Text style={styles.pageTitle}>Service Report Baterai</Text>');
const renderEnd = content.indexOf('{/* CONDITION */}');

let newRender = `<Text style={styles.pageTitle}>Service Report Baterai</Text>
        
        {/* HEADER INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data & Keluhan</Text>
          <TextInput style={styles.input} placeholder="Contact Person/Dept" value={contactPerson} onChangeText={setContactPerson} />
          <TextInput style={styles.input} placeholder="Nature Of Complaint/Service needed" value={complaint} onChangeText={setComplaint} />
          <TextInput style={styles.input} placeholder="Battery Cap (Ah)" value={batteryCap} onChangeText={setBatteryCap} />
          <TextInput style={styles.input} placeholder="Voltage" value={voltage} onChangeText={setVoltage} />
          <TextInput style={styles.input} placeholder="Type" value={type} onChangeText={setType} />
          <TextInput style={styles.input} placeholder="Tray Size" value={traySize} onChangeText={setTraySize} />
          <TextInput style={styles.input} placeholder="Type of Plug" value={typeOfPlug} onChangeText={setTypeOfPlug} />
          <View style={{flexDirection:'row', gap: 8}}>
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Cable Length Positive (mm)" value={cablePos} onChangeText={setCablePos} />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Cable Length Negative (mm)" value={cableNeg} onChangeText={setCableNeg} />
          </View>
          <TextInput style={styles.input} placeholder="Truck Brand/Model" value={truckBrand} onChangeText={setTruckBrand} />
        </View>

        `;

content = content.substring(0, renderStart) + newRender + content.substring(renderEnd);

writeFileSync(p, content);
