import React from 'react';

export const BatteryPrintLayout = ({ report }: { report: any }) => {
  const d = report?.full_report_data || {};
  const c = d.charger || {};
  const o = d.other_info || {};
  const cells = d.cells || Array.from({ length: 40 });

  const renderCheckbox = (label: string, isChecked: boolean) => (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 border border-black flex items-center justify-center text-[10px]">
        {isChecked ? 'X' : ''}
      </div>
      <span>{label}</span>
    </div>
  );

  const renderBox = (label: string, isChecked: boolean) => (
    <div 
      className={`border border-black px-2 py-0.5 font-bold ${isChecked ? 'bg-black text-white' : 'text-black'}`}
      style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' as any }}
    >
      {label}
    </div>
  );

  return (
    <div className="hidden print:block text-[10px] leading-tight font-sans bg-white text-black p-4">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex border-b-2 border-black pb-2 mb-2 items-center">
        <div className="w-1/4">
          <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden">
             <div className="absolute bottom-0 w-full h-1/2 bg-red-600"></div>
             <span className="relative z-10 text-white shadow-sm">d</span>
          </div>
        </div>
        <div className="w-3/4 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider mb-1">PT. MULTIDAYA ANUGRAH PERKASA</h1>
          <p className="font-bold text-[9px]">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423 - Indonesia</p>
          <p className="font-bold text-[9px]">Tel. (62-21) 8240 1141, 82404163</p>
        </div>
      </div>

      <div className="border border-black mb-2">
        <h2 className="text-center font-bold text-sm border-b border-black py-1 bg-gray-100">BATTERY SERVICE REPORT</h2>
        
        {/* Section 1 */}
        <div className="grid grid-cols-2 gap-4 p-2 text-[9px]">
          <div>
            <div className="flex mb-1"><span className="w-8">1.</span><span className="w-24">Client</span><span>: {report?.customer_name || ''}</span></div>
            <div className="flex mb-1"><span className="w-8"></span><span className="w-24">Address</span><span>: {report?.customer_address || ''}</span></div>
            <div className="flex mb-1"><span className="w-8"></span><span className="w-24"></span><span>: </span></div>
            <div className="flex mb-1"><span className="w-8"></span><span className="w-24">Contact Person/Dept</span><span>: {d.contact_person || ''}</span></div>
            <div className="flex"><span className="w-8"></span><span className="w-32">Nature Of Complaint/Service needed</span><span>: {d.complaint || ''}</span></div>
          </div>
          <div>
            <div className="flex mb-1"><span className="w-16">BSR No.</span><span>: {d.service_report_no || ''}</span></div>
            <div className="flex mb-1"><span className="w-16">Date</span><span>: {new Date(report?.completed_at || Date.now()).toLocaleDateString()}</span></div>
            <div className="flex mt-3"><span className="w-16">Tel. No.</span><span>: {d.tel_no || ''}</span></div>
          </div>
        </div>
      </div>

      {/* Section 2, 3, 4 */}
      <div className="border-b border-l border-r border-black p-2 text-[9px]">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="flex mb-1"><span className="w-8">2.</span><span className="w-24">Battery Cap</span><span>: {d.battery_cap || ''}</span><span className="ml-4">Ah.Voltage: {d.ah_voltage || ''}</span></div>
            <div className="flex mb-1"><span className="w-8"></span><span className="w-24">Tray Size</span><span>: {d.tray_size || ''}</span></div>
            <div className="flex mb-1"><span className="w-8"></span><span className="w-24">Cable Length</span><span>:Positive <span className="border-b border-black min-w-[40px] inline-block">{d.cable_pos || ''}</span> mm</span></div>
          </div>
          <div>
            <div className="flex mb-1"><span className="w-24">Type</span><span>: {d.type || ''}</span></div>
            <div className="flex mb-1"><span className="w-24">Type of Plug</span><span>: {d.type_of_plug || ''}</span></div>
            <div className="flex mb-1"><span className="w-24">Negative</span><span>: <span className="border-b border-black min-w-[40px] inline-block">{d.cable_neg || ''}</span> mm</span></div>
          </div>
        </div>

        <div className="flex mb-1">
          <span className="w-8">3.</span><span className="w-32">Truck Brand/Model</span><span>: {d.truck_brand || report?.brand || report?.model || ''}</span>
        </div>
        <div className="flex mb-2">
          <span className="w-8"></span><span className="w-32">Serial No.</span><span>: {report?.asset_code || ''}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center"><span className="w-8">4.</span><span className="mr-4">Battery Condition During Servicing</span></div>
          {renderCheckbox('Fully Charge', d.condition_during_servicing === 'Fully Charge')}
          {renderCheckbox('Before Charging', d.condition_during_servicing === 'Before Charging')}
          {renderCheckbox('IN Operation', d.condition_during_servicing === 'IN Operation')}
        </div>
      </div>

      {/* Main Content Split: Readings & Info */}
      <div className="flex border-b border-l border-r border-black">
        {/* Readings Left */}
        <div className="w-[45%] border-r border-black p-2">
          <span className="font-bold mb-1 block">5. READINGS</span>
          <table className="w-full border-collapse border border-black text-center text-[8px]">
            <thead>
              <tr className="border-b border-black font-bold bg-gray-100">
                <th className="border-r border-black p-0.5">No.</th>
                <th className="border-r border-black p-0.5">S.G</th>
                <th className="border-r border-black p-0.5">Volts</th>
                <th className="border-r border-black p-0.5">No.</th>
                <th className="border-r border-black p-0.5">S.G</th>
                <th className="p-0.5">Volts</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="border-b border-black">
                  <td className="border-r border-black font-bold">{i + 1}</td>
                  <td className="border-r border-black">{cells[i]?.sg || ''}</td>
                  <td className="border-r border-black">{cells[i]?.v || cells[i]?.volts || ''}</td>
                  <td className="border-r border-black font-bold">{i + 21}</td>
                  <td className="border-r border-black">{cells[i + 20]?.sg || ''}</td>
                  <td>{cells[i + 20]?.v || cells[i + 20]?.volts || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side: Charger, Info, Recommendations */}
        <div className="w-[55%] p-2 flex flex-col">
          {/* Charger */}
          <div className="mb-4">
            <span className="font-bold mb-1 block">6. CHARGER</span>
            <div className="ml-4 text-[9px]">
               <div className="flex"><span className="w-24">Brand/Model</span><span>: {c.brand || ''}</span></div>
               <div className="flex"><span className="w-24">Input Rating</span><span>: {c.input || ''}</span></div>
               <div className="flex"><span className="w-24">output Rating</span><span>: {c.output || ''}</span></div>
               <div className="flex"><span className="w-24">Condition</span><span>: {c.condition || ''}</span></div>
            </div>
          </div>

          {/* Other Info */}
          <div className="mb-4">
            <span className="font-bold mb-1 block">7. OTHER BATTERY INFORMATION</span>
            <div className="ml-4 space-y-1 text-[9px]">
               <div className="flex justify-between items-center pr-2">
                  <span className="w-32">Tray</span>
                  <div className="flex gap-2">
                    {renderBox('Corrosion', o.tray === 'Corrosion')}
                    {renderBox('Fair', o.tray === 'Fair')}
                    {renderBox('Good', o.tray === 'Good')}
                  </div>
               </div>
               <div><span>intercell connectors</span></div>
               <div className="flex justify-end items-center pr-2">
                  <div className="flex gap-2">
                    {renderBox('Broken', o.intercell === 'Broken')}
                    {renderBox('Corroded', o.intercell === 'Corroded')}
                    {renderBox('Good', o.intercell === 'Good')}
                  </div>
               </div>
               <div className="flex"><span>Broken/cooroded connector No. : </span><span className="border-b border-black flex-1 ml-1">{o.broken_connector_no || ''}</span></div>
                 <div className="flex justify-between items-center pr-2 mt-1">
                    <span className="w-32">Cell Lids</span>
                    <div className="flex gap-2">
                      {renderBox('Cracked', o.lids === 'Cracked')}
                      {renderBox('Fair', o.lids === 'Fair')}
                      {renderBox('Good', o.lids === 'Good')}
                    </div>
                 </div>
                 <div className="flex"><span>Cracked Cell Lid No. </span><span className="border-b border-black flex-1 ml-1">{o.cracked_lid_no || ''}</span></div>
                 <div className="flex justify-between items-center pr-2 mt-2">
                    <span className="w-32">General Appearance</span>
                    <div className="flex gap-2">
                      {renderBox('Poor', o.appearance === 'Poor')}
                      {renderBox('Fair', o.appearance === 'Fair')}
                      {renderBox('Good', o.appearance === 'Good')}
                    </div>
                 </div>
                 <div className="flex justify-between items-center pr-2">
                    <span className="w-32">General Maintenance</span>
                    <div className="flex gap-2">
                      {renderBox('Poor', o.maintenance === 'Poor')}
                      {renderBox('Fair', o.maintenance === 'Fair')}
                      {renderBox('Good', o.maintenance === 'Good')}
                    </div>
                 </div>
                 <div className="flex justify-between items-center pr-2">
                    <span className="w-32">Electrolyte levels</span>
                    <div className="flex gap-2">
                      {renderBox('Poor', o.electrolyte === 'Poor')}
                      {renderBox('Fair', o.electrolyte === 'Fair')}
                      {renderBox('Correct', o.electrolyte === 'Correct')}
                    </div>
                 </div>
                 <div className="flex flex-col mt-2">
                    <div className="flex">
                      <span className="w-32">Cells Detected</span>
                      <span>Cell No : <span className="border-b border-black w-12 inline-block text-center">{o.cell_no_1 || ''}</span> <span className="border-b border-black w-12 inline-block text-center">{o.cell_no_2 || ''}</span> Low Level</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center pr-2 mt-2">
                    <div className="w-32 flex flex-col leading-tight">
                      <span>Any defective</span>
                      <span>Cells Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderBox('Yes', o.defective === 'Yes')}
                      <span>Suspect Cell No. <span className="border-b border-black w-8 inline-block text-center">{o.suspect_cell_no || ''}</span></span>
                      {renderBox('No', o.defective === 'No')}
                    </div>
                 </div>
                 <div className="flex justify-between items-center pr-2 mt-1">
                    <span className="w-32">Battery's condition</span>
                    <div className="flex gap-2">
                      {renderBox('Poor', o.condition === 'Poor')}
                      {renderBox('Fair', o.condition === 'Fair')}
                      {renderBox('Good', o.condition === 'Good')}
                    </div>
                 </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 8 & 9 */}
      <div className="border-b border-l border-r border-black p-2 text-[9px]">
        <div className="mb-2">
          <span className="font-bold mb-1 block">8. RECOMMENDATIONS :</span>
          <div className="ml-4 space-y-1">
            {renderCheckbox('Battery needs acid adjusment', Array.isArray(d.recommendations) ? d.recommendations.includes('acid') : false)}
            {renderCheckbox('Battery needs capacity test', Array.isArray(d.recommendations) ? d.recommendations.includes('capacity') : false)}
            {renderCheckbox('Battery Reaching end of normal useful life, advised to prepare for new replacement', Array.isArray(d.recommendations) ? d.recommendations.includes('replace') : false)}
          </div>
        </div>
        <div>
          <span className="font-bold block mb-1">9. WORK DONE ON BATTERY :</span>
          <div className="border-b border-black h-4 mt-2 mb-1 px-1">{d.work_done?.[0] || ''}</div>
          <div className="border-b border-black h-4 mb-1 px-1">{d.work_done?.[1] || ''}</div>
          <div className="border-b border-black h-4 mb-1 px-1">{d.work_done?.[2] || ''}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-8 text-[9px]">
        <div className="w-1/2">
          <p className="mb-8">Serviced by / Checked by</p>
          <div className="flex"><span className="w-12">Name :</span><span className="border-b border-black flex-1 mr-4">{report?.mechanic || ''}</span></div>
          <div className="flex mt-1"><span className="w-12">Date :</span><span className="border-b border-black flex-1 mr-4">{new Date(report?.completed_at || Date.now()).toLocaleDateString()}</span></div>
        </div>
        <div className="w-1/2 flex flex-col items-end">
          <div className="w-48 text-center mt-auto">
            <div className="border-t border-black pt-1 w-full">Customer official stamp & signature</div>
            <div className="text-[7px] text-right mt-2">Form no. 028 Rev.0 Date 10-02-16</div>
          </div>
        </div>
      </div>

    </div>
  );
};
