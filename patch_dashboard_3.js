const fs = require('fs');
let file = fs.readFileSync('apps/api/src/routes/dashboard.routes.ts', 'utf-8');

file = file.replace(
  "SELECT mechanic_id, DATE(completed_at), MIN(completed_at) as min_date, MAX(completed_at) as max_date, COUNT(*) as c FROM (\n            SELECT mechanic_id, completed_at FROM forklift_inspections WHERE ${filterCompleted}\n            UNION ALL\n            SELECT mechanic_id, completed_at FROM battery_service_reports WHERE ${filterCompleted}\n          ) as r GROUP BY mechanic_id, DATE(completed_at)",
  "SELECT mechanic_id, SUM(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as duration_minutes FROM (\n            SELECT mechanic_id, completed_at, started_at FROM forklift_inspections WHERE ${filterCompleted} AND started_at IS NOT NULL\n            UNION ALL\n            SELECT mechanic_id, completed_at, started_at FROM battery_service_reports WHERE ${filterCompleted} AND started_at IS NOT NULL\n          ) as r GROUP BY mechanic_id"
);
file = file.replace(
  "SELECT u.full_name as mechanic_name, COUNT(*) as count, COALESCE(SUM(EXTRACT(EPOCH FROM (max_date - min_date))/60), 0) as total_minutes FROM (",
  "SELECT u.full_name as mechanic_name, COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM ("
);

// We need to fix the query logic since the inner query now returns SUM of duration
file = file.replace(
  "SELECT u.full_name as mechanic_name, COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_minutes FROM (\n          SELECT mechanic_id, SUM(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as duration_minutes FROM (\n            SELECT mechanic_id, completed_at, started_at FROM forklift_inspections WHERE ${filterCompleted} AND started_at IS NOT NULL\n            UNION ALL\n            SELECT mechanic_id, completed_at, started_at FROM battery_service_reports WHERE ${filterCompleted} AND started_at IS NOT NULL\n          ) as r GROUP BY mechanic_id\n        ) as combined\n        JOIN users u ON combined.mechanic_id = u.id\n        GROUP BY u.full_name\n        ORDER BY count DESC",
  `SELECT u.full_name as mechanic_name, 
               (SELECT COUNT(*) FROM forklift_inspections WHERE mechanic_id = u.id AND \${filterCompleted}) +
               (SELECT COUNT(*) FROM battery_service_reports WHERE mechanic_id = u.id AND \${filterCompleted}) as count,
               COALESCE(combined.duration_minutes, 0) as total_minutes
        FROM users u
        LEFT JOIN (
          SELECT mechanic_id, SUM(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as duration_minutes 
          FROM (
            SELECT mechanic_id, completed_at, started_at FROM forklift_inspections WHERE \${filterCompleted} AND started_at IS NOT NULL
            UNION ALL
            SELECT mechanic_id, completed_at, started_at FROM battery_service_reports WHERE \${filterCompleted} AND started_at IS NOT NULL
          ) as r GROUP BY mechanic_id
        ) combined ON u.id = combined.mechanic_id
        WHERE u.role = 'MECHANIC'
        ORDER BY count DESC`
);

fs.writeFileSync('apps/api/src/routes/dashboard.routes.ts', file);
console.log('done');
