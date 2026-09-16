export const getBatteryHtml = (data: any) => {
  const d = data?.full_report_data || {};
  const c = d.charger || {};
  const o = d.other_info || {};
  const cells = d.cells || Array.from({ length: 40 });

  const renderCheckbox = (label: string, isChecked: boolean) => `
    <div style="display: flex; align-items: center; gap: 4px;">
      <div style="width: 12px; height: 12px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px;">
        ${isChecked ? 'X' : ''}
      </div>
      <span>${label}</span>
    </div>
  `;

  const renderBox = (label: string, isChecked: boolean) => `
    <div style="border: 1px solid #000; padding: 2px 8px; font-weight: bold; ${isChecked ? 'background-color: #000; color: #fff;' : 'color: #000;'}">
      ${label}
    </div>
  `;

  let rowsHtml = '';
  for(let i=0; i<20; i++) {
    rowsHtml += `
      <tr style="border-bottom: 1px solid #000;">
        <td style="border-right: 1px solid #000; font-weight: bold; text-align: center;">${i + 1}</td>
        <td style="border-right: 1px solid #000; text-align: center;">${cells[i]?.sg || ''}</td>
        <td style="border-right: 1px solid #000; text-align: center;">${cells[i]?.v || cells[i]?.volts || ''}</td>
        <td style="border-right: 1px solid #000; font-weight: bold; text-align: center;">${i + 21}</td>
        <td style="border-right: 1px solid #000; text-align: center;">${cells[i + 20]?.sg || ''}</td>
        <td style="text-align: center;">${cells[i + 20]?.v || cells[i + 20]?.volts || ''}</td>
      </tr>
    `;
  }

  return `
    <html>
      <head>
        <style>
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @page { margin: 10px 20px; }
          body { font-family: sans-serif; font-size: 10px; padding: 0; margin: 0; line-height: 1.2; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .font-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .uppercase { text-transform: uppercase; }
          .border-black { border: 1px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-r { border-right: 1px solid #000; }
          .w-8 { width: 32px; display: inline-block; }
          .w-16 { width: 64px; display: inline-block; }
          .w-24 { width: 96px; display: inline-block; }
          .w-32 { width: 128px; display: inline-block; }
          .flex-1 { flex: 1; }
          .p-2 { padding: 8px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mt-2 { margin-top: 8px; }
          .gap-2 { gap: 8px; }
          .gap-4 { gap: 16px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        </style>
      </head>
      <body>
        <div style="display: flex; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; align-items: center;">
          <div style="width: 25%;">
            <div style="width: 48px; height: 48px; background: #1e40af; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; position: relative; overflow: hidden;">
               <div style="position: absolute; bottom: 0; width: 100%; height: 50%; background: #dc2626;"></div>
               <span style="position: relative; z-index: 10;">d</span>
            </div>
          </div>
          <div style="width: 75%; text-align: center;">
            <h1 style="font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">PT. MULTIDAYA ANUGRAH PERKASA</h1>
            <p style="font-weight: bold; font-size: 9px; margin: 0;">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423 - Indonesia</p>
            <p style="font-weight: bold; font-size: 9px; margin: 0;">Tel. (62-21) 8240 1141, 82404163</p>
          </div>
        </div>

        <div style="border: 1px solid #000; margin-bottom: 8px;">
          <h2 style="text-align: center; font-weight: bold; font-size: 14px; border-bottom: 1px solid #000; margin: 0; padding: 4px; background: #f3f4f6;">BATTERY SERVICE REPORT</h2>
          
          <div style="display: flex; gap: 16px; padding: 8px; font-size: 9px;">
            <div style="flex: 1;">
              <div class="flex mb-1"><span class="w-8">1.</span><span class="w-24">Client</span><span>: ${data?.customer_name || ''}</span></div>
              <div class="flex mb-1"><span class="w-8"></span><span class="w-24">Address</span><span>: ${data?.customer_address || ''}</span></div>
              <div class="flex mb-1"><span class="w-8"></span><span class="w-24"></span><span>: </span></div>
              <div class="flex mb-1"><span class="w-8"></span><span class="w-24" style="width: 120px;">Contact Person/Dept</span><span>: ${d.contact_person || ''}</span></div>
              <div class="flex"><span class="w-8"></span><span class="w-32" style="width: 170px;">Nature Of Complaint/Service needed</span><span>: ${d.complaint || ''}</span></div>
            </div>
            <div style="flex: 1;">
              <div class="flex mb-1"><span class="w-16">BSR No.</span><span>: ${d.service_report_no || ''}</span></div>
              <div class="flex mb-1"><span class="w-16">Date</span><span>: ${new Date(data?.completed_at || Date.now()).toLocaleDateString()}</span></div>
              <div class="flex" style="margin-top: 12px;"><span class="w-16">Tel. No.</span><span>: ${d.tel_no || ''}</span></div>
            </div>
          </div>
        </div>

        <div style="border: 1px solid #000; border-top: none; padding: 8px; font-size: 9px;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <div style="flex: 1;">
              <div class="flex mb-1"><span class="w-8">2.</span><span class="w-24">Battery Cap</span><span>: ${d.battery_cap || ''}</span><span style="margin-left: 16px;">Ah.Voltage: ${d.ah_voltage || ''}</span></div>
              <div class="flex mb-1"><span class="w-8"></span><span class="w-24">Tray Size</span><span>: ${d.tray_size || ''}</span></div>
              <div class="flex mb-1"><span class="w-8"></span><span class="w-24">Cable Length</span><span>:Positive <span style="border-bottom: 1px solid #000; min-width: 40px; display: inline-block;">${d.cable_pos || ''}</span> mm</span></div>
            </div>
            <div style="flex: 1;">
              <div class="flex mb-1"><span class="w-24">Type</span><span>: ${d.type || ''}</span></div>
              <div class="flex mb-1"><span class="w-24">Type of Plug</span><span>: ${d.type_of_plug || ''}</span></div>
              <div class="flex mb-1"><span class="w-24">Negative</span><span>: <span style="border-bottom: 1px solid #000; min-width: 40px; display: inline-block;">${d.cable_neg || ''}</span> mm</span></div>
            </div>
          </div>

          <div class="flex" style="align-items: flex-start; margin-bottom: 4px;">
            <span class="w-8">3.</span><span class="w-32">Truck Brand/Model</span><span>: ${d.truck_brand || data?.brand || data?.model || ''}</span>
          </div>
          <div class="flex mb-2">
            <span class="w-8"></span><span class="w-32">Serial No.</span><span>: ${data?.asset_code || ''}</span>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center"><span class="w-8">4.</span><span style="margin-right: 16px;">Battery Condition During Servicing</span></div>
            ${renderCheckbox('Fully Charge', d.condition_during_servicing === 'Fully Charge')}
            ${renderCheckbox('Before Charging', d.condition_during_servicing === 'Before Charging')}
            ${renderCheckbox('IN Operation', d.condition_during_servicing === 'IN Operation')}
          </div>
        </div>

        <div style="display: flex; border: 1px solid #000; border-top: none;">
          <div style="width: 45%; border-right: 1px solid #000; padding: 8px;">
            <span class="font-bold mb-1 block" style="display: block;">5. READINGS</span>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 8px;">
              <thead>
                <tr style="border-bottom: 1px solid #000; background: #f3f4f6;">
                  <th style="border-right: 1px solid #000; padding: 2px;">No.</th>
                  <th style="border-right: 1px solid #000; padding: 2px;">S.G</th>
                  <th style="border-right: 1px solid #000; padding: 2px;">Volts</th>
                  <th style="border-right: 1px solid #000; padding: 2px;">No.</th>
                  <th style="border-right: 1px solid #000; padding: 2px;">S.G</th>
                  <th style="padding: 2px;">Volts</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div style="width: 55%; padding: 8px; display: flex; flex-direction: column;">
            <div style="margin-bottom: 16px;">
              <span class="font-bold mb-1 block" style="display: block;">6. CHARGER</span>
              <div style="margin-left: 16px; font-size: 9px;">
                 <div class="flex"><span class="w-24">Brand/Model</span><span>: ${c.brand || ''}</span></div>
                 <div class="flex"><span class="w-24">Input Rating</span><span>: ${c.input || ''}</span></div>
                 <div class="flex"><span class="w-24">output Rating</span><span>: ${c.output || ''}</span></div>
                 <div class="flex"><span class="w-24">Condition</span><span>: ${c.condition || ''}</span></div>
              </div>
            </div>

            <div>
              <span class="font-bold mb-1 block" style="display: block;">7. OTHER BATTERY INFORMATION</span>
              <div style="margin-left: 16px; font-size: 9px; line-height: 1.5;">
                 <div class="flex justify-between items-center" style="padding-right: 8px;">
                    <span class="w-32">Tray</span>
                    <div class="flex gap-2">
                      ${renderBox('Corrosion', o.tray === 'Corrosion')}
                      ${renderBox('Fair', o.tray === 'Fair')}
                      ${renderBox('Good', o.tray === 'Good')}
                    </div>
                 </div>
                 <div><span>intercell connectors</span></div>
                 <div class="flex items-center" style="justify-content: flex-end; padding-right: 8px;">
                    <div class="flex gap-2">
                      ${renderBox('Broken', o.intercell === 'Broken')}
                      ${renderBox('Corroded', o.intercell === 'Corroded')}
                      ${renderBox('Good', o.intercell === 'Good')}
                    </div>
                 </div>
                 <div class="flex"><span>Broken/cooroded connector No. : </span><span style="border-bottom: 1px solid #000; flex: 1; margin-left: 4px;">${o.broken_connector_no || ''}</span></div>
                 <div class="flex justify-between items-center" style="padding-right: 8px; margin-top: 4px;">
                    <span class="w-32">Cell Lids</span>
                    <div class="flex gap-2">
                      ${renderBox('Cracked', o.lids === 'Cracked')}
                      ${renderBox('Fair', o.lids === 'Fair')}
                      ${renderBox('Good', o.lids === 'Good')}
                    </div>
                 </div>
                 <div class="flex"><span>Cracked Cell Lid No. </span><span style="border-bottom: 1px solid #000; flex: 1; margin-left: 4px;">${o.cracked_lid_no || ''}</span></div>
                 
                 <div class="flex justify-between items-center" style="padding-right: 8px; margin-top: 8px;">
                    <span class="w-32">General Appearance</span>
                    <div class="flex gap-2">
                      ${renderBox('Poor', o.appearance === 'Poor')}
                      ${renderBox('Fair', o.appearance === 'Fair')}
                      ${renderBox('Good', o.appearance === 'Good')}
                    </div>
                 </div>
                 <div class="flex justify-between items-center" style="padding-right: 8px;">
                    <span class="w-32">General Maintenance</span>
                    <div class="flex gap-2">
                      ${renderBox('Poor', o.maintenance === 'Poor')}
                      ${renderBox('Fair', o.maintenance === 'Fair')}
                      ${renderBox('Good', o.maintenance === 'Good')}
                    </div>
                 </div>
                 <div class="flex justify-between items-center" style="padding-right: 8px;">
                    <span class="w-32">Electrolyte levels</span>
                    <div class="flex gap-2">
                      ${renderBox('Poor', o.electrolyte === 'Poor')}
                      ${renderBox('Fair', o.electrolyte === 'Fair')}
                      ${renderBox('Correct', o.electrolyte === 'Correct')}
                    </div>
                 </div>
                 <div style="margin-top: 4px;">
                    <span>Cells Detected</span><br/>
                    <div class="flex items-center gap-2">
                      <span>Cell No :</span><span style="border-bottom: 1px solid #000; width: 48px; text-align: center;">${o.cell_no_1 || ''}</span>
                      <span style="border-bottom: 1px solid #000; width: 48px; text-align: center;">${o.cell_no_2 || ''}</span>
                      <span>Low Level</span>
                    </div>
                 </div>
                 <div class="flex justify-between items-center" style="margin-top: 4px; padding-right: 8px;">
                    <div class="flex" style="flex-direction: column;">
                      <span>Any defective</span>
                      <span>Cells Detected</span>
                    </div>
                    <div class="flex items-center gap-2">
                      ${renderBox('Yes', o.defective === 'Yes')}
                      <span>Suspect Cell No. <span style="border-bottom: 1px solid #000; width: 32px; display: inline-block; text-align: center;">${o.suspect_cell_no || ''}</span></span>
                      ${renderBox('No', o.defective === 'No')}
                    </div>
                 </div>
                 <div class="flex justify-between items-center" style="margin-top: 4px; padding-right: 8px;">
                    <span class="w-32">Battery's condition</span>
                    <div class="flex gap-2">
                      ${renderBox('Poor', o.condition === 'Poor')}
                      ${renderBox('Fair', o.condition === 'Fair')}
                      ${renderBox('Good', o.condition === 'Good')}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div style="border: 1px solid #000; border-top: none; padding: 8px; font-size: 9px;">
          <div style="margin-bottom: 8px;">
            <span class="font-bold block mb-1" style="display: block;">8. RECOMMENDATIONS :</span>
            <div style="margin-left: 16px; line-height: 1.5;">
              ${renderCheckbox('Battery needs acid adjusment', Array.isArray(d.recommendations) ? d.recommendations.includes('acid') : false)}
              ${renderCheckbox('Battery needs capacity test', Array.isArray(d.recommendations) ? d.recommendations.includes('capacity') : false)}
              ${renderCheckbox('Battery Reaching end of normal useful life, advised to prepare for new replacement', Array.isArray(d.recommendations) ? d.recommendations.includes('replace') : false)}
            </div>
          </div>
          <div>
            <span class="font-bold block mb-1" style="display: block;">9. WORK DONE ON BATTERY :</span>
            <div style="border-bottom: 1px solid #000; height: 16px; margin-top: 8px; margin-bottom: 4px;">${Array.isArray(d.work_done) ? (d.work_done[0] || '') : ''}</div>
            <div style="border-bottom: 1px solid #000; height: 16px; margin-bottom: 4px;">${Array.isArray(d.work_done) ? (d.work_done[1] || '') : ''}</div>
            <div style="border-bottom: 1px solid #000; height: 16px; margin-bottom: 4px;">${Array.isArray(d.work_done) ? (d.work_done[2] || '') : ''}</div>
          </div>
        </div>

        <div class="flex justify-between" style="margin-top: 32px; font-size: 9px;">
          <div style="width: 50%;">
            <p style="margin-bottom: 32px;">Serviced by / Checked by</p>
            <div class="flex"><span class="w-16">Name :</span><span style="border-bottom: 1px solid #000; flex: 1; margin-right: 16px;">${data?.mechanic || ''}</span></div>
            <div class="flex" style="margin-top: 4px;"><span class="w-16">Date :</span><span style="border-bottom: 1px solid #000; flex: 1; margin-right: 16px;">${new Date(data?.completed_at || Date.now()).toLocaleDateString()}</span></div>
          </div>
          <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-end;">
            <div style="width: 192px; text-align: center; margin-top: auto;">
              <div style="border-top: 1px solid #000; padding-top: 4px; width: 100%;">Customer official stamp & signature</div>
              <div style="font-size: 7px; text-align: right; margin-top: 8px;">Form no. 028 Rev.0 Date 10-02-16</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
