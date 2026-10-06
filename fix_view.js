const fs = require('fs');
const path = require('path');
const file = 'apps/web/src/pages/TicketsPage.tsx';

let content = fs.readFileSync(file, 'utf8');

// Add viewTicket state
content = content.replace(
  "const [assignData, setAssignData] = useState({ mechanic_id: '', leader_notes: '' });",
  "const [assignData, setAssignData] = useState({ mechanic_id: '', leader_notes: '' });\n  const [viewTicket, setViewTicket] = useState<any>(null);"
);

// Modify handleSubmit to also close viewTicket modal
content = content.replace(
  "const handleSubmit = async (id: string) => {",
  "const handleSubmit = async (id: string) => {\n    setViewTicket(null);"
);

// Add the viewTicket modal before the assigningTicket modal
const viewModalCode = `
      <Modal open={!!viewTicket} onClose={() => setViewTicket(null)}>
        <Modal.Header onClose={() => setViewTicket(null)}>Detail Tiket: {viewTicket?.ticket_code}</Modal.Header>
        <Modal.Body>
          {viewTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{viewTicket.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Aset</p>
                  <p className="text-sm font-medium text-gray-900">{viewTicket.forklift_code || viewTicket.battery_code} ({viewTicket.asset_type})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tipe Keluhan</p>
                  <p className="text-sm font-medium text-gray-900">{viewTicket.issue_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <div className="mt-1">{renderStatus(viewTicket.status)}</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Deskripsi Keluhan</p>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100 whitespace-pre-wrap">{viewTicket.issue_description}</div>
              </div>
              {viewTicket.sales_notes && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Catatan Tambahan</p>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100 whitespace-pre-wrap">{viewTicket.sales_notes}</div>
                </div>
              )}
              {viewTicket.mechanic_name && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mekanik</p>
                  <div className="text-sm font-medium text-gray-900">{viewTicket.mechanic_name}</div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewTicket(null)}>Tutup</Button>
          {viewTicket?.status === 'DRAFT' && (user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
            <Button variant="primary" onClick={() => handleSubmit(viewTicket.id)}>Submit Tiket</Button>
          )}
        </Modal.Footer>
      </Modal>
`;

content = content.replace(
  "<Modal open={!!assigningTicket} onClose={() => setAssigningTicket(null)}>",
  viewModalCode + "\n      <Modal open={!!assigningTicket} onClose={() => setAssigningTicket(null)}>"
);

// Replace the direct "Submit" button on the table with "Detail" button for ALL tickets, not just DRAFT.
// Actually, let's just make the "Detail" button always appear for everyone!
// Wait, currently we have:
const oldSubmitStr = `{t.status === 'DRAFT' && (user?.role === UserRole.SALES || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER) && (
                          <Button variant="ghost" size="sm" icon="send" onClick={() => handleSubmit(t.id)}>Submit</Button>
                        )}`;

const detailBtnStr = `<Button variant="ghost" size="sm" icon="visibility" onClick={() => setViewTicket(t)}>Detail</Button>`;

// If we replace the Submit button with the Detail button, the user can click Detail to see the Modal.
content = content.replace(oldSubmitStr, detailBtnStr);

fs.writeFileSync(file, content);
console.log('Done modifying view tickets');
