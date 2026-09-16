import sql from './lib/db';
async function run() {
  try {
    await sql`ALTER TABLE batteries ADD COLUMN capacity_ah TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN tray_size TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN cable_length_positive TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN type TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN type_of_plug TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN cable_length_negative TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN truck_brand TEXT`;
    await sql`ALTER TABLE batteries ADD COLUMN serial_no TEXT`;
    console.log("Altered batteries table!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
