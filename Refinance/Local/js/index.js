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
  const title = $('<div>')
    .addClass('subject-rate-cost')
    .text('RATE & CLOSING COST OPTIONS');

  const wrapper = $('<div>').addClass('summary-chart-wrapper');

  const tables = $('<div>').addClass('summary-tables');
  const currentLoan = $('<div>').addClass('current-loan-table');
  const summary = $('<div>').addClass('summary-table');
  const rateCost = $('<div>').addClass('rate-cost-table');
  const benefits = $('<div>').addClass('benefits-table');
  summary.append(rateCost, benefits);

  const disclaimer = $('<div>')
    .addClass('disclaimer')
    .text(
      'Your actual rate, payment, and costs could be higher. Get an official Loan Estimate before choosing a loan. ' +
      'This is not a commitment to lend and is not a loan approval. This illustration does not constitute a rate lock ' +
      'and is only estimated illustration based on information provided and current interest rates.'
    );

  summary.append(disclaimer);
  tables.append(currentLoan, summary);

  const charts = $('<div>').addClass('charts');

  wrapper.append(tables, charts);
  main.append(title, wrapper);

  return main;
}

function renderCurrentLoanTable(data) {
  if (!data || typeof data !== 'object' || typeof data.currentLoan !== 'object') return;

  const container = $('.current-loan-table');
  container.empty();

  const hideSet = new Set(data.hideCurrentRows || []);

  const table = $('<table>').addClass('current-loan');
  const tbody = $('<tbody>');

  const headerRow = $('<tr>')
    .append($('<td>').text('Current Loan').attr('colspan', 2))
    .css({ 'background-color': '#4c514f', color: '#fff' });
  tbody.append(headerRow);

  Object.entries(data.currentLoan).forEach(([key, value]) => {
    if (hideSet.has(key)) return;

    const row = $('<tr>')
      .append($('<td>').text(key))
      .append($('<td>').text(value));
    tbody.append(row);
  });

  table.append(tbody);
  container.append(table);
}
function renderTableSections(dataArray, containerSelector, options = {}) {
  const {
    titleText = null,
    titleClass = 'table-title', // дефолтний клас
    hideSet = new Set(),
    disclaimer = null,
    titleMap = {}
  } = options;

  const wrapper = $(containerSelector);
  wrapper.empty();

  if (titleText) {
    const titleDiv = $('<div/>')
      .text(titleText)
      .addClass(titleClass);
    wrapper.append(titleDiv);
  }

  dataArray.forEach((section) => {
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

  if (disclaimer) {
    const $disclaimer = $('<div>')
      .addClass('table-disclaimer')
      .text(disclaimer);

    wrapper.append($disclaimer);
  }
}
function renderTablesFromJson(data) {
  if (!Array.isArray(data?.tables)) return;

  const hideSet = new Set(data.hideTablesRows || []);
  const titleMap = {};
  (data.titles || []).forEach(obj => {
    const key = Object.keys(obj)[0];
    titleMap[key] = obj[key];
  });

  renderTableSections(data.tables, '.rate-cost-table', { hideSet, titleMap });
}
function renderBenefitsFromJson(data) {
  if (!Array.isArray(data?.benefits)) return;
  if (data?.showPowerRefinanceBenefits !== true) return;

  const hideSet = new Set(data.hideTablesRows || []);
  const titleMap = {};
  (data.titles || []).forEach(obj => {
    const key = Object.keys(obj)[0];
    titleMap[key] = obj[key];
  });

  renderTableSections(data.benefits, '.benefits-table', {
    titleText: 'Power Refinance Benefits',
    titleClass: 'benefits-title',
    disclaimer: "Power Refinance illustration demonstrates the power of applying your refinance payment savings to your new mortgage payment. Doing so can greatly reduce the amount of interest you pay over the life of your loan.",
    hideSet,
    titleMap
  });
}

function createBarChart({ canvasId, labels, color = '#2c84c5', maxY = undefined, rawValues }) {
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

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
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

              if (hasPercent) {
                return `${v.toFixed(1)}%`;
              } else if (hasDollar) {
                return `$${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(2)}`;
              } else {
                return v.toFixed(2);
              }
            }
          }
        },
        x: {
          ticks: { maxRotation: 0, minRotation: 0, padding: 10 }
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

    const allRows = [...(data.tables || []), ...(data.benefits || [])].flatMap(t => t.rows) || [];
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

    const programRow = allRows.find(r => r.Program);
    const labels = programRow?.Program?.map(p => p) || rawValues.map((_, idx) => `Option ${idx + 1}`);

    createBarChart({
      canvasId,
      labels,
      data: numericValues,
      color,
      rawValues
    });
  });
}

$(document).ready(async () => {
  const json = {
    "brandFontColor": "#7CC242",
    "mainFontColor": "#4E5351",
    "reportForYou": "",
    "contactInfoFontColor": "",
    "rowSecondColor": "#7CC242",
    "rowBackground": "#f3f3f3",
    "highlightFontColor": "",
    "tableBorderColor": "",
    "brandLogo": "https://assets-usa.mkt.dynamics.com/c9c231cd-6f7f-4e83-a9cc-dfa3c1887e06/digitalassets/images/18a98667-226c-ee11-8def-000d3a8e658c?ts=638330573577879748",
    "loPhoto": "https://assets-usa.mkt.dynamics.com/c9c231cd-6f7f-4e83-a9cc-dfa3c1887e06/digitalassets/images/d5799d46-6c1d-ee11-9cbe-0022482b2789?ts=6382440294531512506",
    "loFullName": "Vitali Shabashou",
    "brandCompanyName": "ARBOR FINANCIAL GROUP",
    "loAddress": "1805 E. Garry Avenue, Santa Ana, CA 92705",
    "loEmail": "vitalis@arborfg.com",
    "loPhone": "+1 425 555 0109",
    "nmls": "23431233",
    "dre": "45645756",
    "greeting": "Hi MAGALY ROMAN",
    "proposalIntro": "Welcome to your personal rate & closing cost worksheet. Here you can compare your different loan, rate, and closing cost options. I am here to help you in any way to make the best decision for your goals. Please don't hesitate to contact me with questions.",
    "currentLoan": {
      "Appraised Value": "$680,000.00",
      "Loan Amount": "$444,444.00",
      "Equity": "$322,065.00",
      "Current Loan Amount": "$333,490.00",
      "Current Rate": "5%",
      "Current Term": "180",
      "Remaining Term": "125",
      "Current Payment (P&I)": "$3,515.00",
      "Hazard Insurance": "$85.00",
      "Mortgage Insurance": "$110.00",
      "HOA": "$13.00",
      "Flood Insurance": "$356.00",
      "Property Taxes": "$613.00",
      "Total Monthly Payment": "$4,679.00",
      "Interest Paid": "$68,104.00",
      "Remaining Interest": "$105,885.00",
      "Total Interest": "$173,989.00"
    },
    "tables": [
      {
        "rows": [
          {
            "": [
              "1",
              "2"
            ],
            "highlight": "#4c514f",
            "color": "#fff"
          },
          {
            "Appraised Value": [
              "$680,000.00",
              "$680,000.00"
            ]
          },
          {
            "Loan Amount": [
              "$333,490.00",
              "$333,490.00"
            ]
          },
          {
            "Loan-To-Value": [
              "49%",
              "49%"
            ]
          }
        ]
      },
      {
        "rows": [
          {
            "Rate": [
              "4%",
              "4.25%"
            ],
            "highlight": true
          },
          {
            "APR": [
              "4.04%",
              "4.29%"
            ]
          },
          {
            "Term": [
              "180",
              "180"
            ]
          }
        ]
      },
      {
        "rows": [
          {
            "Principle & Interest": [
              "$2,467.00",
              "$2,509.00"
            ]
          },
          {
            "Hazard Insurance": [
              "$85.00",
              "$85.00"
            ]
          },
          {
            "Mortgage Insurance": [
              "$110.00",
              "$110.00"
            ]
          },
          {
            "HOA": [
              "$13.00",
              "$13.00"
            ]
          },
          {
            "Flood Insurance": [
              "$356.00",
              "$356.00"
            ]
          },
          {
            "Property Taxes": [
              "$613.00",
              "$613.00"
            ]
          },
          {
            "Total Monthly Payment": [
              "$3,644.00",
              "$3,686.00"
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
              "0.00% ($0.00)"
            ]
          },
          {
            "Lender Credit": [
              "0.00% ($0.00)",
              "0.00% ($0.00)"
            ]
          },
          {
            "Lender Fees": [
              "$0.00",
              "$0.00"
            ]
          },
          {
            "3rd Party Fees": [
              "$0.00",
              "$0.00"
            ]
          },
          {
            "Total Closing Costs": [
              "$0.00",
              "$0.00"
            ],
            "highlight": true,
            "slider": true
          }
        ]
      },
      {
        "rows": [
          {
            "Escrows & Prepaid Interest": [
              "$0.00",
              "$0.00"
            ]
          },
          {
            "Estimated Total Cash to Close": [
              "$0.00",
              "$0.00"
            ],
            "highlight": true,
            "slider": true
          }
        ]
      },
      {
        "rows": [
          {
            "Closing Costs Included in Loan": [
              "$0.00",
              "$0.00"
            ]
          },
          {
            "Pre-Paids and Impounds in Loan": [
              "$0.00",
              "$0.00"
            ]
          },
          {
            "Payment Savings": [
              "$1,048.00",
              "$1,006.00"
            ],
            "highlight": true,
            "slider": true
          }
        ]
      }
    ],
    "benefits": [
      {
        "rows": [
          {
            "Extra Monthly Payment": [
              "$1,048.00",
              "$1,006.00"
            ],
            "highlight": false
          },
          {
            "New Term": [
              "81.25",
              "82.02"
            ],
            "highlight": true
          },
          {
            "Interest Saved over 5 Years": [
              "$20,927.00",
              "$22,240.00"
            ],
            "highlight": true
          },
          {
            "Interest Saved over Life of Loan": [
              "$62,782.00",
              "$66,721.00"
            ],
            "highlight": true
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
        "name": "Interest Saved over 5 Years",
        "color": "#7cc242"
      },
      {
        "name": "Rate",
        "color": "#FAC898"
      },
      {
        "name": "New Term",
        "color": "#2c84c5"
      }
    ],
    "titles": [
      {
        "Interest Saved over Life of Loan": "The Power Refinance is calculated by taking your monthly refinances savings and applying it to your monthly payment so you continue to make the same payment monthly. This shows you power of lowering your rate while still making the same payment."
      }
    ],
    "hideTablesRows": [],
    "hideCurrentRows": [],
    "showPowerRefinanceBenefits": true
  };

  if (typeof json !== 'object') {
    console.error('❌ JSON не визначено або неправильний формат.');
    return;
  }

  // Старт
  const $container = $('<div>').addClass('container');

  const header = buildHeaderContainer(json);
  $container.append(header);

  const greeting = buildGreetingContainer(json);
  $container.append(greeting);

  const main = buildMainContent();
  $container.append(main);

  $('body').append($container);

  setColorsFromJson(json);
  renderCurrentLoanTable(json);
  renderTablesFromJson(json);
  renderBenefitsFromJson(json);
  renderCharts(json);
});