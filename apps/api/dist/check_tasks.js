"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./lib/db"));
async function clearAndRecalc() {
    await (0, db_1.default) `DELETE FROM forklift_inspection_scores`;
    await (0, db_1.default) `DELETE FROM forklift_inspections`;
    await (0, db_1.default) `DELETE FROM battery_service_reports`;
    await (0, db_1.default) `UPDATE forklifts SET health_score = 0, health_status = 'HEALTHY'`;
    await (0, db_1.default) `UPDATE batteries SET voltage = 0, status = 'STANDBY'`;
    console.log('All reports deleted and assets reset to 0');
    process.exit(0);
}
clearAndRecalc();
