import { readFileSync, writeFileSync } from 'fs';

const p = 'apps/app/App.tsx';
let content = readFileSync(p, 'utf8');

const handlePrintStart = content.indexOf('const handlePrint = async () => {');
const htmlCheck = content.indexOf("const html = type === 'battery' ? getBatteryHtml(data) : forkliftHtml;");

const prefix = content.slice(0, handlePrintStart);
const suffix = content.slice(content.indexOf('if (Platform.OS === \'web\') {', htmlCheck));

const newHandlePrint = `  const handlePrint = async () => {
    try {
      const dt = new Date(data.completed_at || Date.now()).toLocaleDateString();
      let html = '';
      
      if (type === 'battery') {
        html = getBatteryHtml(data);
      } else {
        const grouped = (data.scores || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.category_name]) acc[curr.category_name] = [];
          acc[curr.category_name].push(curr);
          return acc;
        }, {});

        const checklistHtml = Object.entries(grouped).map(([catName, items]: [string, any]) => \`
          <div style="break-inside: avoid; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">
              <span>\${catName}</span>
              <span style="letter-spacing: 2px; font-weight: normal;">1 2 3</span>
            </div>
            \${items.map((item: any, idx: number) => \`
              <div style="display: flex; border: 1px solid #000; border-bottom: none; font-size: 8px; align-items: stretch;">
                <div style="width: 15px; border-right: 1px solid #000; text-align: center; padding: 2px 0;">\${idx + 1}</div>
                <div style="flex: 1; padding: 2px 4px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${item.item_name}</div>
                <div style="display: flex; width: 45px; border-left: 1px solid #000;">
                  <div style="width: 33.3%; border-right: 1px solid #000; text-align: center; padding-top: 2px;">\${item.score === 1 ? 'X' : ''}</div>
                  <div style="width: 33.3%; border-right: 1px solid #000; text-align: center; padding-top: 2px;">\${item.score === 2 ? 'X' : ''}</div>
                  <div style="width: 33.3%; text-align: center; padding-top: 2px;">\${item.score === 3 ? 'X' : ''}</div>
                </div>
              </div>
            \`).join('')}
            <div style="border-top: 1px solid #000;"></div>
          </div>
        \`).join('');

        const buildRows = (arr: any[]) => {
          let rows = '';
          for(let i=0; i<Math.max(5, arr?.length || 0); i++) {
            const p = arr?.[i] || {};
            rows += \`
              <tr>
                <td style="text-align: center; height: 16px;">\${p.qty || ''}</td>
                <td style="text-transform: uppercase;">\${p.description || ''}</td>
                <td style="text-transform: uppercase;">\${p.part_no || ''}</td>
              </tr>
            \`;
          }
          return rows;
        };

        const svcFlags = ['Warranty Service', 'Contract Service', 'Non-Contract Service'].map(svc => \`
          <div style="display: flex; align-items: center; margin-bottom: 2px;">
            <div style="width: 10px; height: 10px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 10px; font-weight: bold; margin-right: 4px;">
              \${data.additional_data?.service_type === svc ? 'X' : ''}
            </div>
            <span style="font-weight: bold; text-transform: uppercase;">\${svc}</span>
          </div>
        \`).join('');

        const condFlags = ['Indoor', 'Outdoor', 'Wet/Dry', 'Dusty', 'Aggressive'].map(cond => \`
          <div style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; text-transform: uppercase; margin-right: 4px;">
            \${Array.isArray(data.additional_data?.working_conditions) ? (data.additional_data.working_conditions.includes(cond) ? '☑' : '☐') : '☐'} \${cond}
          </div>
        \`).join('');

        const actionFlags = ['Under Guarantee', 'To Be Charged', 'Urgently', 'Immediate'].map(flag => \`
          <div style="display: flex; align-items: center;">
            <div style="width: 10px; height: 10px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 10px; margin-right: 4px;">
              \${Array.isArray(data.additional_data?.action_flags) ? (data.additional_data.action_flags.includes(flag) ? 'X' : '') : ''}
            </div>
            <span>\${flag}</span>
          </div>
        \`).join('');

        html = \`
          <html>
            <head>
              <style>
                @page { margin: 10px 20px; }
                body { font-family: sans-serif; font-size: 10px; padding: 0; margin: 0; line-height: 1.2; }
                .header { display: flex; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; align-items: center; }
                .logo { width: 50px; height: 50px; background: #22c55e; color: #fff; font-size: 32px; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
                .grid-3 { display: flex; gap: 8px; margin-bottom: 8px; }
                .col { flex: 1; }
                .row { display: flex; align-items: center; margin-bottom: 4px; }
                .lbl { font-weight: bold; text-transform: uppercase; margin-right: 4px; }
                .val { flex: 1; border-bottom: 1px solid #000; padding-bottom: 1px; min-height: 12px; }
                
                .columns-3 { column-count: 3; column-gap: 16px; margin-bottom: 16px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9px; }
                th, td { border: 1px solid #000; padding: 2px 4px; text-align: left; }
                th { background: #f3f4f6; }
              </style>
            </head>
            <body>
              <div class="header">
                <div style="width: 20%;"><div class="logo">M</div></div>
                <div style="width: 80%; text-align: center;">
                  <h1 style="margin: 0 0 4px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">PT UNITED MULTILIFT PERKASA</h1>
                  <p style="margin: 0; font-weight: bold; font-size: 10px;">Jl. Wibawa Mukti No. 28 Jatiasih, Bekasi 17423</p>
                  <p style="margin: 0; font-weight: bold; font-size: 10px;">Tel. 021 - 8240 1141 (Hunting)</p>
                  <p style="margin: 0; font-size: 10px;">www.multiliftperkasa.com • e-mail: marketing@multiliftperkasa.com</p>
                </div>
              </div>

              <div class="grid-3">
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 60px;">CLIENT</div><div class="val">\${data.customer_name || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">ADDRESS</div><div class="val">\${data.customer_address || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">MODEL</div><div class="val">\${data.model || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 60px;">YEAR</div><div class="val">\${data.year || ''}</div></div>
                </div>
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 70px;">PRODUCT</div><div class="val">FORKLIFT</div></div>
                  <div class="row"><div class="lbl" style="width: 70px;">HOUR METER</div><div class="val">\${data.additional_data?.hour_meter || ''}</div></div>
                  <div class="row"><div class="lbl" style="width: 70px;">SERIAL NO</div><div class="val">\${data.asset_code || ''}</div></div>
                </div>
                <div class="col">
                  <div class="row"><div class="lbl" style="width: 100px;">DATE</div><div class="val">\${dt}</div></div>
                  <div class="row"><div class="lbl" style="width: 100px;">SERVICE REPORT NO.</div><div class="val">\${data.additional_data?.service_report_no || ''}</div></div>
                  <div style="margin-top: 8px; font-size: 9px;">\${svcFlags}</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 9px;">
                <div class="lbl" style="width: 120px;">WORKING CONDITION</div>
                \${condFlags}
              </div>

              <div class="columns-3">
                \${checklistHtml}
              </div>

              <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold;">Report of any other works carried out:</p>
                  <div style="border-bottom: 1px solid #000; min-height: 40px; font-style: italic; padding: 4px;">\${data.notes || ''}</div>
                </div>
                <div style="width: 250px; font-size: 10px;">
                  <p style="margin: 0;"><strong>Report:</strong> Col. 1 - Item requires Immediate repair resp. replacement</p>
                  <p style="margin: 0 0 0 40px;">Col. 2 - Item requires Attention</p>
                  <p style="margin: 0 0 0 40px;">Col. 3 - Item is in order / completed</p>
                </div>
              </div>

              <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; text-align: center;">Based on above report we used</p>
                  <table>
                    <thead><tr><th style="width: 30px; text-align: center;">QTY</th><th>DESCRIPTION</th><th style="width: 60px;">PART. No</th></tr></thead>
                    <tbody>\${buildRows(data.additional_data?.parts_used)}</tbody>
                  </table>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: bold; text-align: center;">We recommend you to order</p>
                  <table>
                    <thead><tr><th style="width: 30px; text-align: center;">QTY</th><th>DESCRIPTION</th><th style="width: 60px;">PART. No</th></tr></thead>
                    <tbody>\${buildRows(data.additional_data?.parts_recommended)}</tbody>
                  </table>
                </div>
              </div>

              <p style="font-weight: bold; font-size: 8px; text-transform: uppercase; text-align: center; margin-bottom: 16px;">
                Signing of the report constitute an intruction for works to be carried out where an official order may or may not follow
              </p>

              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
                <div style="text-align: center; width: 180px;">
                  <div style="height: 50px; border-bottom: 1px solid #000; margin-bottom: 4px;"></div>
                  <p style="margin: 0; font-weight: bold; text-transform: uppercase;">SERVICE PERFORMED BY</p>
                  <p style="margin: 2px 0 0 0; text-transform: uppercase;">\${data.mechanic || ''}</p>
                </div>
                
                <div style="border: 1px solid #000; width: 220px; text-align: center;">
                  <div style="border-bottom: 1px solid #000; padding: 4px; font-weight: bold; font-size: 9px;">
                    The client was informend about the found<br/>Detect and the danger resulting therefrom
                  </div>
                  <div style="padding: 4px; display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
                    <div>WORKING HOURS:</div>
                    <div>DATE:</div>
                    <div>TO:</div>
                  </div>
                </div>
                
                <div style="text-align: center; width: 180px;">
                  <div style="height: 50px; border-bottom: 1px solid #000; margin-bottom: 4px;"></div>
                  <p style="margin: 0; font-weight: bold; text-transform: uppercase;">CLIENT SIGNATURE & STAMP</p>
                  <p style="margin: 2px 0 0 0; text-transform: uppercase; font-size: 8px;">NAME IN BLOCK LETTER<br/>PLEASE SUBMIT QUOTATION</p>
                </div>
              </div>

              <div style="display: flex; justify-content: center; gap: 24px; font-weight: bold; text-transform: uppercase; font-size: 9px;">
                \${actionFlags}
              </div>
            </body>
          </html>
        \`;
      }

`;

writeFileSync(p, prefix + newHandlePrint + suffix);
