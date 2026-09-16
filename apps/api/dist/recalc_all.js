"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./lib/db"));
async function run() {
    const forklifts = await (0, db_1.default) `SELECT id FROM forklifts`;
    for (const fl of forklifts) {
        const latestReport = await (0, db_1.default) `
      SELECT health_percentage, health_status 
      FROM forklift_inspections 
      WHERE forklift_id = ${fl.id} 
      ORDER BY completed_at DESC LIMIT 1
    `;
        if (latestReport.length > 0) {
            await (0, db_1.default) `UPDATE forklifts SET health_score = ${latestReport[0].health_percentage}, health_status = ${latestReport[0].health_status} WHERE id = ${fl.id}`;
        }
        else {
            await (0, db_1.default) `UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY' WHERE id = ${fl.id}`;
        }
    }
    console.log('All forklift health scores recalculated!');
    process.exit(0);
}
run();
