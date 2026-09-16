"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./lib/db"));
async function run() {
    try {
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN capacity_ah TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN tray_size TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN cable_length_positive TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN type TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN type_of_plug TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN cable_length_negative TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN truck_brand TEXT`;
        await (0, db_1.default) `ALTER TABLE batteries ADD COLUMN serial_no TEXT`;
        console.log("Altered batteries table!");
    }
    catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
