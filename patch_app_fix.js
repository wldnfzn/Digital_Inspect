const fs = require('fs');

let app = fs.readFileSync('apps/app/App.tsx', 'utf-8');

app = app.replace(
  "          ) : (\n            \n            {tasks.filter",
  "          ) : (\n            <>\n            {tasks.filter"
);
app = app.replace(
  "                      <Text style={styles.historyItemDesc}>{task.asset_type}</Text>\n                    </View>\n                    <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => {\n                      if (task.asset_type === 'FORKLIFT') navigation.navigate('InspectionForm', { id: task.forklift_id, task_id: task.id });\n                      else navigation.navigate('BatteryForm', { id: task.battery_id, task_id: task.id });\n                    }}>\n                      <Text style={styles.primaryButtonSmallText}>Mulai</Text>\n                    </TouchableOpacity>\n                  </View>\n                </View>\n              ))\n            )}",
  "                      <Text style={styles.historyItemDesc}>{task.asset_type}</Text>\n                    </View>\n                    <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => {\n                      if (task.asset_type === 'FORKLIFT') navigation.navigate('InspectionForm', { id: task.forklift_id, task_id: task.id });\n                      else navigation.navigate('BatteryForm', { id: task.battery_id, task_id: task.id });\n                    }}>\n                      <Text style={styles.primaryButtonSmallText}>Mulai</Text>\n                    </TouchableOpacity>\n                  </View>\n                </View>\n              ))\n            )}\n            </>"
);

fs.writeFileSync('apps/app/App.tsx', app);
console.log('done');
