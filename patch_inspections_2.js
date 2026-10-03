const fs = require('fs');
let file = fs.readFileSync('apps/api/src/routes/inspections.routes.ts', 'utf-8');

// For Forklift
file = file.replace(
  "INSERT INTO forklift_inspections (task_id, forklift_id, mechanic_id, total_score, total_items, health_percentage, health_status, notes, additional_data, completed_at)\n          VALUES (${task_id || null}, ${forklift_id}, ${user.userId}, ${totalScore}, ${totalItems}, ${health_percentage}, ${health_status}, ${notes || null}, ${sql.json(finalAdditionalData)}, NOW())",
  "INSERT INTO forklift_inspections (task_id, forklift_id, mechanic_id, total_score, total_items, health_percentage, health_status, notes, additional_data, started_at, completed_at)\n          VALUES (${task_id || null}, ${forklift_id}, ${user.userId}, ${totalScore}, ${totalItems}, ${health_percentage}, ${health_status}, ${notes || null}, ${sql.json(finalAdditionalData)}, ${startedAt || null}, NOW())"
);

// For Battery
file = file.replace(
  "const finalReportData = { ...(full_report_data || {}), service_report_no: serviceReportNo };",
  "const finalReportData = { ...(full_report_data || {}), service_report_no: serviceReportNo };\n      const startedAt = full_report_data?.started_at ? new Date(full_report_data.started_at) : null;"
);
file = file.replace(
  "INSERT INTO battery_service_reports (task_id, battery_id, mechanic_id, voltage_reading, full_report_data, completed_at)\n          VALUES (${task_id || null}, ${battery_id}, ${user.userId}, ${voltage_reading || null}, ${sql.json(finalReportData)}, NOW())",
  "INSERT INTO battery_service_reports (task_id, battery_id, mechanic_id, voltage_reading, full_report_data, started_at, completed_at)\n          VALUES (${task_id || null}, ${battery_id}, ${user.userId}, ${voltage_reading || null}, ${sql.json(finalReportData)}, ${startedAt || null}, NOW())"
);

fs.writeFileSync('apps/api/src/routes/inspections.routes.ts', file);
console.log('done');
