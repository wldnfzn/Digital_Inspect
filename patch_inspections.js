const fs = require('fs');

let api = fs.readFileSync('apps/api/src/routes/inspections.routes.ts', 'utf-8');

// 1. Add ticket completion to POST /forklift
api = api.replace(
  "await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id}`;\n      }",
  "const updatedTask = await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id} RETURNING ticket_id`;\n        if (updatedTask[0]?.ticket_id) {\n          await tx`UPDATE service_tickets SET status = 'COMPLETED', completed_at = NOW() WHERE id = ${updatedTask[0].ticket_id}`;\n        }\n      }"
);

// 2. Add ticket completion to POST /battery
api = api.replace(
  "await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id}`;\n      }",
  "const updatedTask = await tx`UPDATE inspection_tasks SET status = 'COMPLETED' WHERE id = ${task_id} RETURNING ticket_id`;\n        if (updatedTask[0]?.ticket_id) {\n          await tx`UPDATE service_tickets SET status = 'COMPLETED', completed_at = NOW() WHERE id = ${updatedTask[0].ticket_id}`;\n        }\n      }"
);

// 3. Add PUT /tasks/:id/draft
const draftEndpoint = `
inspectionsRoutes.put('/tasks/:id/draft', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const { draft_data, started_at } = await c.req.json();
    
    await sql\`
      UPDATE inspection_tasks 
      SET draft_data = \${sql.json(draft_data)}, 
          started_at = COALESCE(started_at, \${started_at ? new Date(started_at) : null})
      WHERE id = \${id} AND assigned_to = \${user.userId}
    \`;
    
    return c.json({ status: 'ok' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
`;
api = api.replace("export default inspectionsRoutes;", `${draftEndpoint}\nexport default inspectionsRoutes;`);

// 4. Update the SELECT queries to include ticket_id, draft_data, started_at
api = api.replace(
  "t.id, t.asset_type, t.forklift_id, t.battery_id, t.assigned_to, t.assigned_by, t.scheduled_date, t.status, t.created_at",
  "t.id, t.asset_type, t.forklift_id, t.battery_id, t.assigned_to, t.assigned_by, t.scheduled_date, t.status, t.created_at, t.ticket_id, t.draft_data, t.started_at"
);
api = api.replace(
  "t.id, t.asset_type, t.forklift_id, t.battery_id, t.assigned_to, t.assigned_by, t.scheduled_date, t.status, t.created_at",
  "t.id, t.asset_type, t.forklift_id, t.battery_id, t.assigned_to, t.assigned_by, t.scheduled_date, t.status, t.created_at, t.ticket_id, t.draft_data, t.started_at"
);

// Update POST inspections to extract started_at from additional_data or body and save it
api = api.replace(
  "const finalAdditionalData = { ...(additional_data || {}), service_report_no: serviceReportNo };",
  "const finalAdditionalData = { ...(additional_data || {}), service_report_no: serviceReportNo };\n      const startedAt = additional_data?.started_at ? new Date(additional_data.started_at) : null;"
);
api = api.replace(
  "INSERT INTO forklift_inspections (task_id, forklift_id, mechanic_id, total_score, total_items, health_percentage, health_status, notes, additional_data, completed_at)",
  "INSERT INTO forklift_inspections (task_id, forklift_id, mechanic_id, total_score, total_items, health_percentage, health_status, notes, additional_data, completed_at)" // not changing table
);
// Wait, I will just add startedAt to additional_data, it's already there!

fs.writeFileSync('apps/api/src/routes/inspections.routes.ts', api);
console.log('done');
