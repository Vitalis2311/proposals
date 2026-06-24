function setColorsFromJson(data) {
  if (!data) return;
  const root = $(':root');
  //if (data.mainCellColor) root.css('--mainCellColor', data.mainCellColor);
  if (data.brandFontColor) root.css('--brandFontColor', data.brandFontColor);
  if (data.mainFontColor) root.css('--mainFontColor', data.mainFontColor);

  if (data.reportForYou) root.css('--reportForYou', data.reportForYou);
  if (data.contactInfoFontColor) root.css('--contactInfoFontColor', data.contactInfoFontColor);

  if (data.rowSecondColor) root.css('--rowSecondColor', data.rowSecondColor);
  if (data.rowBackground) root.css('--rowBackground', data.rowBackground);
  if (data.highlightFontColor) root.css('--highlightFontColor', data.highlightFontColor);
  if (data.tableBorderColor) root.css('--tableBorderColor', data.tableBorderColor);
}

function buildHeaderContainer(json) {
  const container = $('<div>').addClass('header-container');

  const logoCenter = $('<div>').addClass('logo-center');
  const logoImg = $('<img>').attr('id', 'logo').attr('src', json.brandLogo || '');
  logoCenter.append(logoImg);

  const contactCard = $('<div>').addClass('contact-card');
  const photo = $('<img>').attr('id', 'photo').attr('src', json.loPhoto || '');

  const contactInfo = $('<div>').addClass('contact-info');
  const forYou = $('<div>').attr('id', 'forYou').addClass('contact-info-foryou').text("THE REPORT WAS CREATED FOR YOU BY");
  const name = $('<div>').attr('id', 'loFullName').addClass('contact-info-name').text(json.loFullName || '');
  const company = $('<div>').attr('id', 'brandCompanyName').addClass('contact-info-company').text(json.brandCompanyName || '');

  const contactBlock = $('<div>').attr('id', 'loPhone').addClass('contact-info-contacts');
  const address = $('<div>').attr('id', 'loAddress').addClass('contacts-address').text(json.loAddress || '');
  const email = $('<div>').attr('id', 'loEmail').addClass('contacts-email').text(json.loEmail || '');
  const phone = $('<div>').addClass('contacts-phone').text(json.loPhone || '');

  const nmlsDre = $('<div>').addClass('contacts-nmls-dre');
  const nmls = $('<span>').attr('id', 'nmls').text(json.nmls ? `NMLS: ${json.nmls}` : '');
  const divider = $('<span>').addClass('divider').text(' | ');
  const dre = $('<span>').attr('id', 'dre').text(json.dre ? `DRE: ${json.dre}` : '');
  nmlsDre.append(nmls, divider, dre);

  contactBlock.append(address, email, phone, nmlsDre);

  const comunicate = $('<div>').addClass('comunicate');
  const call = $('<a>').attr('href', `tel:${json.loPhone || ''}`).html('&#128222; Call');
  const text = $('<a>').attr('href', `sms:${json.loPhone || ''}`).html('&#128172; Text');
  const emailLink = $('<a>').attr('href', `mailto:${json.loEmail || ''}`).html('<span class="email-icon">&#128233;</span> Email');
  comunicate.append(call, ' | ', text, ' | ', emailLink);

  contactInfo.append(forYou, name, company, contactBlock, comunicate);
  contactCard.append(photo, contactInfo);
  container.append(logoCenter, contactCard);

  return container;
}
function buildGreetingContainer(json) {
  const greetingContainer = $('<div>').addClass('greeting-container');
  const greeting = $('<h2>').attr('id', 'greeting').text(json.greeting || '');
  const intro = $('<p>').attr('id', 'proposalIntro').text(json.proposalIntro || '');
  greetingContainer.append(greeting, intro);

  return $('<div>').addClass('header-content').append(greetingContainer);
}
function buildMainContent() {
  const main = $('<main>');
  const title = $('<div>').addClass('subject-rate-cost').text('RATE & CLOSING COST OPTIONS');
  const wrapper = $('<div>').addClass('summary-chart-wrapper');

  const tables = $('<div>').addClass('summary-tables');
  const summary = $('<div>').addClass('summary-table');
  const rateCost = $('<div>').addClass('rate-cost-table');
  summary.append(rateCost);

  const disclaimer = $('<div>')
    .addClass('disclaimer')
    .text(
      'Your actual rate, payment, and costs could be higher. Get an official Loan Estimate before choosing a loan. ' +
      'This is not a commitment to lend and is not a loan approval. This illustration does not constitute a rate lock ' +
      'and is only estimated illustration based on information provided and current interest rates.'
    );

  summary.append(disclaimer);
  tables.append(summary);

  const charts = $('<div>').addClass('charts');

  wrapper.append(tables, charts);
  main.append(title, wrapper);
  return main;
}

function renderTablesFromJson(data) {
  if (!Array.isArray(data?.tables)) return;

  const wrapper = $('.rate-cost-table');
  wrapper.empty();

  const hideSet = new Set(data.hideTablesRows || []);

  // створюємо map із titles
  const titleMap = {};
  (data.titles || []).forEach(obj => {
    const key = Object.keys(obj)[0];
    titleMap[key] = obj[key];
  });

  data.tables.forEach((section) => {
    const rows = section?.rows;
    if (!Array.isArray(rows)) return;

    const tableWrapper = $('<div>').addClass('table-wrapper');
    const table = $('<table>').addClass('table-section');
    const colgroup = $('<colgroup>');
    const tbody = $('<tbody>');

    const firstDataRow = rows.find(r => {
      const key = Object.keys(r).find(k => !['highlight', 'color', 'slider'].includes(k));
      return Array.isArray(r[key]) && !hideSet.has(key);
    });

    const key = firstDataRow ? Object.keys(firstDataRow).find(k => !['highlight', 'color', 'slider'].includes(k)) : null;
    const values = key ? firstDataRow[key] : [];

    colgroup.append('<col style="width: 25%">');
    values.forEach(() => colgroup.append('<col style="width: auto">'));
    table.append(colgroup);

    const hasSliderRow = rows.some(r => r.slider === true);

    rows.forEach((r) => {
      const dataKeys = Object.keys(r).filter(k => !['highlight', 'color', 'slider'].includes(k));
      if (dataKeys.length === 0) return;

      const key = dataKeys[0];
      const values = r[key];

      if (hideSet.has(key)) return;
      if (!Array.isArray(values)) return;

      const td = $('<td>').text(key);
      if (key === "") {
        td.text('');
      } else if (titleMap[key]) {
        td.attr('title', titleMap[key]);
      }

      if (r.slider === true) {
        td.append($('<span>').addClass('expand-icon'));
      }

      const row = $('<tr>').append(td);
      values.forEach(val => row.append($('<td>').text(val)));

      if (r.highlight === true) {
        row.addClass('highlight-row');
      } else if (typeof r.highlight === 'string') {
        row.css({ 'background-color': r.highlight });
      }

      if (r.color) {
        row.css({ color: r.color });
      }

      if (hasSliderRow) {
        if (r.slider === true) {
          row.addClass('slider-row');
        } else {
          row.addClass('hidden-row');
        }
      }

      tbody.append(row);
    });

    table.append(tbody);
    tableWrapper.append(table);
    wrapper.append(tableWrapper);

    if (hasSliderRow) {
      tableWrapper.addClass('collapsible-table');
      tableWrapper.on('click', function () {
        const rows = $(this).find('tr.hidden-row');
        if ($(this).hasClass('expanded')) {
          rows.stop(true, true).slideUp(200);
        } else {
          rows.stop(true, true).slideDown(200);
        }
        $(this).toggleClass('expanded');
      });
    }
  });
}

function createBarChart({ canvasId, labels: rawLabels, color = '#2c84c5', maxY = undefined, rawValues }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !Array.isArray(rawValues) || rawValues.length === 0) return;

  const numericData = rawValues.map(val => {
    if (typeof val === 'string') {
      const isNegative = val.includes('(') && val.includes(')');
      const cleaned = val.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : (isNegative ? -parsed : parsed);
    }
    return typeof val === 'number' ? val : 0;
  });

  const minVal = Math.min(...numericData);
  const maxVal = Math.max(...numericData);
  const rangePadding = (maxVal - minVal) * 0.2 || Math.abs(maxVal) * 0.2;

  const resolvedMinY = minVal >= 0 ? 0 : minVal - rangePadding;
  const resolvedMaxY = maxY ?? (maxVal <= 0 ? 0 : maxVal + rangePadding);

  // Shortened labels for display on axis
  const shortLabels = rawLabels.map(label => {
    if (label.length > 20) {
      return label.split(' ').slice(0, 3).join(' ') + '…';
    }
    return label;
  });

  const fullLabels = rawLabels.map(String); // full for tooltip

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [{
        data: numericData,
        backgroundColor: color,
        borderRadius: 2,
        barThickness: 40
      }]
    },
    options: {
      layout: {
        padding: { top: 30, bottom: 30, left: 10, right: 10 }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => fullLabels[ctx[0].dataIndex]
          }
        },
        datalabels: {
          anchor: ctx => numericData[ctx.dataIndex] >= 0 ? 'end' : 'start',
          align: ctx => numericData[ctx.dataIndex] >= 0 ? 'end' : 'start',
          offset: 8,
          color: ctx => numericData[ctx.dataIndex] >= 0 ? '#2c7c2c' : '#000',
          font: { size: 12 },
          formatter: (v, ctx) => rawValues?.[ctx.dataIndex] ?? ''
        }
      },
      scales: {
        y: {
          min: resolvedMinY,
          max: resolvedMaxY,
          ticks: {
            callback: v => {
              const hasPercent = rawValues?.some(val => typeof val === 'string' && val.includes('%'));
              const hasDollar = rawValues?.some(val => typeof val === 'string' && val.includes('$'));

              if (hasPercent) return `${v.toFixed(1)}%`;
              if (hasDollar) return `$${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(2)}`;
              return v.toFixed(2);
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            padding: 10
          }
        }
      },
      clip: false
    },
    plugins: [ChartDataLabels]
  });
}
function renderCharts(data) {
  if (!Array.isArray(data?.charts)) return;

  const chartContainer = $('.charts');
  chartContainer.empty();

  const hiddenRows = data?.hideTablesRows ?? [];

  data.charts.forEach((chart, i) => {
    const { name, color } = chart;
    if (!name || hiddenRows.includes(name)) return;

    const allRows = data.tables?.flatMap(t => t.rows) || [];
    const row = allRows.find(r => r[name]);
    if (!row || !Array.isArray(row[name])) return;

    const rawValues = row[name];
    const numericValues = rawValues.map(val =>
      parseFloat(val.replace(/[$,%]/g, '').replace(/,/g, '')) || 0
    );

    const canvasId = `chart-${i}`;
    const chartBlock = $(`
      <div class="chart-container">
        <div class="chart-header">${name}</div>
        <canvas id="${canvasId}" height="150"></canvas>
      </div>
    `);
    chartContainer.append(chartBlock);

    const programRow = allRows.find(r =>
      Array.isArray(r["Program"]) || Array.isArray(r[""])
    );
    const labels =
      Array.isArray(programRow?.["Program"]) ? programRow["Program"] :
        Array.isArray(programRow?.[""]) ? programRow[""] :
          rawValues.map((_, idx) => `Option ${idx + 1}`);

    createBarChart({
      canvasId,
      labels,
      data: numericValues,
      color,
      rawValues
    });
  });
}

// ==== PDF helpers (jsPDF v2) ====
function saveAsPdfStrict({ orientation = 'p', fileName = 'report_A4_portrait.pdf', source = '#container', margin = 10 } = {}) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error('jsPDF is not loaded'); return;
  }
  const { jsPDF } = window.jspdf;
  const el = document.querySelector(source);
  if (!el) { console.error('PDF source element not found:', source); return; }

  const domWidthPx = Math.round(el.scrollWidth || el.getBoundingClientRect().width);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation });
  const pageWidthMm = doc.internal.pageSize.getWidth();
  const pageHeightMm = doc.internal.pageSize.getHeight();
  const contentWidthMm = pageWidthMm - margin * 2;
  const contentHeightMm = pageHeightMm - margin * 2;

  html2canvas(el, {
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: domWidthPx
  }).then((canvas) => {
    const pxPerMm = canvas.width / contentWidthMm;
    const fullHeightMm = canvas.height / pxPerMm;
    if (fullHeightMm <= contentHeightMm) {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, fullHeightMm);
      doc.save(fileName);
      return;
    }

    const pageSlicePx = Math.floor(contentHeightMm * pxPerMm);
    let renderedPx = 0, pageIndex = 0;

    while (renderedPx < canvas.height) {
      const sliceH = Math.min(pageSlicePx, canvas.height - renderedPx);

      const tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = sliceH;

      const tctx = tmp.getContext('2d');
      tctx.drawImage(
        canvas,
        0, renderedPx, canvas.width, sliceH,
        0, 0, canvas.width, sliceH
      );

      const img = tmp.toDataURL('image/jpeg', 0.95);
      const hMm = sliceH / pxPerMm;

      if (pageIndex > 0) doc.addPage();
      doc.addImage(img, 'JPEG', margin, margin, contentWidthMm, hMm);

      renderedPx += sliceH;
      pageIndex++;
    }

    doc.save(fileName);
  });
}
function addPdfButton() {
  const $pdfBtnContainer = $(`
    <div class="no-print" style="display:flex;gap:8px;margin:12px 0;">
      <button id="pdfPortrait" title="Download PDF"></button>
    </div>
  `);
  $('body').prepend($pdfBtnContainer);

  $('#pdfPortrait').on('click', () => saveAsPdfStrict({
    orientation: 'p',
    fileName: 'Rate and Closing Cost Options.pdf',
    source: '#container'
  }));
}

$(document).ready(async () => {
  const json = {
    "brandFontColor": "#002262",
    "mainFontColor": "#4E5351",
    "reportForYou": "",
    "contactInfoFontColor": "",
    "rowSecondColor": "#002262",
    "rowBackground": "#f3f3f3",
    "highlightFontColor": "",
    "tableBorderColor": "",
    "brandLogo": "https://assets-usa.mkt.dynamics.com/c9c231cd-6f7f-4e83-a9cc-dfa3c1887e06/digitalassets/images/69f915dc-a442-ef11-8409-7c1e52001521?ts=638566429413613631",
    "loPhoto": "6",
    "loFullName": "Vitali Shabashou",
    "brandCompanyName": "America's Choice Lending Group",
    "loAddress": "1805 E. Garry Avenue, Santa Ana, CA 92705",
    "loEmail": "vitalis@arborfg.com",
    "loPhone": "+1 425 555 0109",
    "nmls": "23431233",
    "dre": "45645756",
    "greeting": "Hi Tom Bricks",
    "proposalIntro": "",
    "tables": [
        {
            "rows": [
                {
                    "Program": [
                        "1",
                        "2",
                        "3"
                    ],
                    "highlight": "#4c514f",
                    "color": "#fff"
                },
                {
                    "Purchase Price": [
                        "$1,200,000.00",
                        "$1,200,000.00",
                        "$1,200,000.00"
                    ]
                },
                {
                    "Down Payment": [
                        "$240,000.00",
                        "$240,000.00",
                        "$240,000.00"
                    ]
                },
                {
                    "Loan Amount": [
                        "$960,000.00",
                        "$960,000.00",
                        "$960,000.00"
                    ]
                },
                {
                    "Loan-To-Value": [
                        "80%",
                        "80%",
                        "80%"
                    ]
                }
            ]
        },
        {
            "rows": [
                {
                    "Rate": [
                        "5%",
                        "6%",
                        "5%"
                    ],
                    "highlight": false
                },
                {
                    "Rate Buydown": [
                        "Buydown 3-2-1",
                        "Buydown 1-1",
                        "None"
                    ]
                },
                {
                    "Paid By": [
                        "Lender Paid",
                        "Seller Paid",
                        "Seller Paid"
                    ]
                },
                {
                    "APR": [
                        "5.01%",
                        "6.01%",
                        "5.01%"
                    ]
                },
                {
                    "Term": [
                        "380",
                        "380",
                        "380"
                    ]
                }
            ]
        },
        {
            "rows": [
                {
                    "Principle & Interest": [
                        "$5,038.00",
                        "$5,649.00",
                        "$5,038.00"
                    ]
                },
                {
                    "Hazard Insurance": [
                        "$222.00",
                        "$222.00",
                        "$222.00"
                    ]
                },
                {
                    "Mortgage Insurance": [
                        "",
                        "",
                        ""
                    ]
                },
                {
                    "HOA": [
                        "$0.00",
                        "$0.00",
                        "$0.00"
                    ]
                },
                {
                    "Property Taxes": [
                        "$0.00",
                        "$0.00",
                        "$0.00"
                    ]
                },
                {
                    "Total Monthly Payment": [
                        "$5,265.00",
                        "$5,876.00",
                        "$5,265.00"
                    ],
                    "highlight": true,
                    "slider": true
                }
            ]
        },
        {
            "rows": [
                {
                    "Points": [
                        "0.00% ($0.00)",
                        "0.00% ($0.00)",
                        "0.00% ($0.00)"
                    ]
                },
                {
                    "Lender Credit": [
                        "0.08% ($720.00)",
                        "0.08% ($720.00)",
                        "0.08% ($720.00)"
                    ]
                },
                {
                    "Lender Fees": [
                        "$333.00",
                        "$333.00",
                        "$333.00"
                    ],
                    "rows": [
                        {
                            "Document Preparation Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Processing Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Underwriting Fee": [
                                "$333.00",
                                "$333.00",
                                "$333.00"
                            ],
                            "highlight": "#EBEBEB"
                        }
                    ],
                    "slider": true
                },
                {
                    "3rd Party Fees": [
                        "$1,323.00",
                        "$1,323.00",
                        "$1,323.00"
                    ],
                    "rows": [
                        {
                            "Appraisal Fee": [
                                "$1,223.00",
                                "$1,223.00",
                                "$1,223.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Attorney Fee": [
                                "$100.00",
                                "$100.00",
                                "$100.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Credit Report Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Flood Certificate Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "HOA Certification Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "HOA Insurance Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "MERS Registration Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Tax Service": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Verification Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Pest Inspection Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Abstract or Title Search": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Borrower's Closing Protection Letter Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Document Prep Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Endorsement Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Notary Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Recording Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Settlement or Closing Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Sub Escrow Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Title Examination": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Title Insurance Binder": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Courier Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Electronic Document Delivery Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Lender's Title Policy": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Title - Wire Fee": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Recording Fees - Deed": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Recording Fees - Mortgage": [
                                "$0.00",
                                "$0.00",
                                "$0.00"
                            ],
                            "highlight": "#EBEBEB"
                        }
                    ],
                    "slider": true
                },
                {
                    "UFMIP/FF/GF/SP": [
                        "$0.00",
                        "$0.00",
                        "$0.00"
                    ]
                },
                {
                    "Prepaids": [
                        "$360.33",
                        "$0.00",
                        "$0.00"
                    ],
                    "rows": [
                        {
                            "Hazard Insurance Premium": [
                                "1 mo * $222.00 = $222.00",
                                "0 mo * $222.00 = $0.00",
                                "0 mo * $222.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Mortgage Insurance Premium": [
                                "1 mo * $5.00 = $5.00",
                                "0 mo * $5.00 = $0.00",
                                "0 mo * $5.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Property Taxes": [
                                "1 mo * $0.00 = $0.00",
                                "0 mo * $0.00 = $0.00",
                                "0 mo * $0.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Prepaid Interest": [
                                "1 d * $133.33 = $133.33",
                                "0 d * $160.00 = $0.00",
                                "0 d * $133.33 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        }
                    ],
                    "highlight": false,
                    "slider": true
                },
                {
                    "Escrows": [
                        "$0.00",
                        "$0.00",
                        "$0.00"
                    ],
                    "rows": [
                        {
                            "Hazard Insurance Reserve": [
                                "0 mo * $222.00 = $0.00",
                                "0 mo * $222.00 = $0.00",
                                " mo * $0.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Mortgage Insurance Reserve": [
                                "0 mo * $5.00 = $0.00",
                                "0 mo * $5.00 = $0.00",
                                "0 mo * $5.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        },
                        {
                            "Property Taxes Reserve": [
                                "0 mo * $0.00 = $0.00",
                                "0 mo * $0.00 = $0.00",
                                "0 mo * $0.00 = $0.00"
                            ],
                            "highlight": "#EBEBEB"
                        }
                    ],
                    "highlight": false,
                    "slider": true
                },
                {
                    "Estimated Total Cash to Close": [
                        "$241,296.00",
                        "$240,936.00",
                        "$240,936.00"
                    ],
                    "highlight": "#EBEBEB"
                },
                {
                    "Total Closing Costs": [
                        "$936.00",
                        "$936.00",
                        "$936.00"
                    ],
                    "highlight": false,
                    "slider": true
                }
            ]
        },
        {
            "rows": [
                {
                    "Monthly Savings": [
                        "$611.00",
                        "$0.00",
                        "$611.00"
                    ],
                    "highlight": false
                },
                {
                    "5 Year Savings": [
                        "$36,680.00",
                        "$0.00",
                        "$36,680.00"
                    ],
                    "highlight": false
                },
                {
                    "Closing Cost Savings": [
                        "$0.00",
                        "$0.00",
                        "$0.00"
                    ],
                    "highlight": false
                }
            ]
        }
    ],
    "charts": [
        {
            "name": "Total Monthly Payment",
            "color": "#4c514f"
        },
        {
            "name": "Monthly Savings",
            "color": "#7cc242"
        },
        {
            "name": "5 Year Savings",
            "color": "#FAC898"
        },
        {
            "name": "Closing Cost Savings",
            "color": "#2c84c5"
        }
    ],
    "hideTablesRows": [
        "Mortgage Insurance"
    ]
};

  if (typeof json !== 'object') {
    console.error('❌ JSON не визначено або неправильний формат.');
    return;
  }

  // Старт
  const $container = $('<div>').attr("id", "container").addClass('container');

  const header = buildHeaderContainer(json);
  $container.append(header);

  const greeting = buildGreetingContainer(json);
  $container.append(greeting);

  const main = buildMainContent();
  $container.append(main);

  $('body').append($container);

  setColorsFromJson(json);
  renderTablesFromJson(json);
  renderCharts(json);

  addPdfButton();
});