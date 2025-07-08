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
  const dre = $('<span>').attr('id', 'dre').text(json.dre || '');
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
  const currentLoan = $('<div>').addClass('current-loan-table');
  const summary = $('<div>').addClass('summary-table');
  const rateCost = $('<div>').addClass('rate-cost-table');
  summary.append(rateCost);
  tables.append(currentLoan, summary);

  const charts = $('<div>').addClass('charts');

  wrapper.append(tables, charts);
  main.append(title, wrapper);
  return main;
}

function renderCurrentLoanTable(data) {
  if (!data || typeof data !== 'object') return;

  const container = $('.current-loan-table');
  container.empty();

  const table = $('<table>').addClass('current-loan');
  const tbody = $('<tbody>');

  // Один рядок — заголовок
  const headerRow = $('<tr>')
    .append($('<td>').text('Current Loan').attr('colspan', 2))
    .css({ 'background-color': '#acacac', color: '#fff' });
  tbody.append(headerRow);

  // Решта рядків
  Object.entries(data).forEach(([key, value]) => {
    const row = $('<tr>')
      .append($('<td>').text(key))
      .append($('<td>').text(value));
    tbody.append(row);
  });

  table.append(tbody);
  container.append(table);
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

    const table = $('<table>').addClass('table-section');

    // Визначення максимальної кількості колонок
    const firstDataRow = rows.find(r => {
      const key = Object.keys(r).find(k => k !== 'highlight');
      return Array.isArray(r[key]) && !hideSet.has(key);
    });

    const key = firstDataRow ? Object.keys(firstDataRow).find(k => k !== 'highlight') : null;
    const values = key ? firstDataRow[key] : [];

    // colgroup
    const colgroup = $('<colgroup>');
    colgroup.append('<col style="width: 25%">');
    values.forEach(() => colgroup.append('<col style="width: auto">'));
    table.append(colgroup);

    const tbody = $('<tbody>');

    rows.forEach(r => {
      const key = Object.keys(r).find(k => k !== 'highlight');
      const values = r[key];

      if (hideSet.has(key)) return; // ❌ Пропускаємо приховані ключі
      if (!Array.isArray(values)) return;

      const td = $('<td>').text(key);
      if (titleMap[key]) {
        td.attr('title', titleMap[key]);
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

      tbody.append(row);
    });

    table.append(tbody);
    wrapper.append(table);
  });
}

function createBarChart({ canvasId, labels, data, color = '#2c84c5', maxY = undefined, rawValues }) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !Array.isArray(data) || data.length === 0) return;

  const maxValue = Math.max(...data);
  const resolvedMaxY = maxY ?? Math.ceil(maxValue * 1.2 / 100) * 100;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color,
        borderRadius: 2,
        barThickness: 40
      }]
    },
    options: {
      layout: { padding: { left: 10, right: 10 } },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'end',
          offset: 8,
          color: '#000',
          font: { weight: 'bold', size: 14 },
          formatter: (v, ctx) => rawValues?.[ctx.dataIndex] ?? ''
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: resolvedMaxY,
          ticks: {
            callback: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`
          }
        },
        x: { ticks: { maxRotation: 0, minRotation: 0, padding: 10 } }
      }
    },
    plugins: [ChartDataLabels]
  });
}
function renderCharts(data) {
  if (!Array.isArray(data?.charts)) return;

  const chartContainer = $('.charts');
  chartContainer.empty();

  data.charts.forEach((chart, i) => {
    const { name, color } = chart;
    if (!name) return;

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

    const programRow = allRows.find(r => r.Program);
    const labels = programRow?.Program?.map(p => p) || rawValues.map((_, idx) => `Option ${idx + 1}`);

    createBarChart({
      canvasId,
      labels,
      data: numericValues,
      color,
      rawValues // передається для formatter
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
    "loPhoto": "https://assets-usa.mkt.dynamics.com/c9c231cd-6f7f-4e83-a9cc-dfa3c1887e06/digitalassets/images/c66f2aa1-f4f0-4a16-b71d-8569dce74169?ts=638206678303297526",
    "loFullName": "Ryan O'Meara",
    "brandCompanyName": "Arbor Financial Group",
    "loAddress": "2345 Main St, Irvine, CA 92614",
    "loEmail": "ryan@arborfg.com",
    "loPhone": "(949) 242-7266",
    "nmls": "123456",
    "dre": "DRE: 02145142",
    "greeting": "Hi Vitali!",
    "proposalIntro": "Welcome to your personal rate & closing cost worksheet. Here you can compare your different loan, rate, and closing cost options. I am here to help you in any way to make the best decision for your goals. Please don't hesitate to contact me with questions.",
    "currentLoan": {
      "Appraised Value": "$265,000.00",
      "Loan Amount": "$255,725.00",
      "Equity": "$0.00",
      "Current Loan Amount": "$450,000.00",
      "Current Rate": "4.75",
      "Current Payment (P&I)": "$1,357.00",
      "Current Term": "360",
      "Remaining Term": "285",
      "Hazard Insurance": "$35.00",
      "Mortgage Insurance": "$180.00",
      "HOA": "$278.00",
      "Property Taxes": "$238.00",
      "AVM Value": "$0.00"
    },
    "tables": [
      {
        "rows": [
          { "Program": ["Conv 30 Yr Fixed", "FHA 30 Yr Fixed", "VA 30 Yr Fixed"], "highlight": "#4c514f", "color": "#fff" },
          { "Appraised Value": ["$999,999.00", "$899,000.00", "$799,000.00"] },
          { "Loan Amount": ["$660,000.00", "$500,000.00", "$450,000.00"] },
          { "Equity": ["$339,999.00", "$399,000.00", "$349,000.00"] },
          { "Loan-To-Value": ["66%", "56%", "56%"] }
        ]
      },
      {
        "rows": [
          { "Rate": ["4.0%", "4.5%", "3.8%"], "highlight": true },
          { "APR": ["4.05%", "4.5%", "3.95%"] },
          { "Term": ["298", "300", "295"] }
        ]
      },
      {
        "rows": [
          { "Principle & Interest": ["$3,497.00", "$3,250.00", "$3,100.00"] },
          { "Hazard Insurance": ["$85.00", "$100.00", "$100.00"] },
          { "Mortgage Insurance": ["$0.00", "$120.00", "$0.00"] },
          { "HOA": ["$0.00", "$50.00", "$0.00"] },
          { "Property Taxes": ["$800.00", "$720.00", "$600.00"] },
          { "Extra Monthly Payment": ["$261.00", "$0.00", "$0.00"], "highlight": true },
          { "Total Monthly Payment": ["$4,643.00", "$4,230.00", "$3,800.00"], "highlight": true }
        ]
      },
      {
        "rows": [
          { "Points": ["0.00% ($0.00)", "0.00% ($0.00)", "0.00% ($0.00)"] },
          { "Lender Credit": ["0.00% ($0.00)", "0.00% ($0.00)", "0.00% ($0.00)"] },
          { "Lender Fees": ["$2,500.00", "$2,500.00", "$2,400.00"] },
          { "3Rd Party Fees": ["$1,200.00", "$1,300.00", "$1,200.00"] },
          { "Total Closing Costs": ["$0.00", "$0.00", "$0.00"], "highlight": true }
        ]
      },
      {
        "rows": [
          { "Escrows & Prepaid Interest": ["$0.00", "$0.00", "$0.00"] },
          { "Estimated Total Cash to Close": ["$0.00", "$0.00", "$0.00"], "highlight": true }
        ]
      },
      {
        "rows": [
          { "Closing Costs Included in Loan": ["$2,000.00", "$1,000.00", "$0.00"] },
          { "Pre-Paids and Impounds in Loan": ["$3,500.00", "$2,800.00", "$1,000.00"] },
          { "Payment Savings": ["$261.00", "$261.00", "$261.00"], "highlight": true },
          { "Power Refi Savings": ["$154,872.00", "$154,872.00", "$154,872.00"], "highlight": true },
          { "Interest Saved over 5 Years": ["$34,823.00", "$121,234.00", "$11,357.11"], "highlight": true },
          { "Interest Saved over Life of Loan": ["$318,569.00", "$10,230.00", "$56,011.20"], "highlight": true }
        ]
      }
    ],
    "charts": [
      {
        "name": "Rate",
        "color": "#4c514f"
      },
      {
        "name": "Interest Saved over 5 Years",
        "color": "#7cc242"
      },
      {
        "name": "Interest Saved over Life of Loan",
        "color": "#2c84c5"
      }
    ],
    "titles": [
      { "Rate": "Rate.............." },
      { "Interest Saved over 5 Years": "Interest Saved over 5 Years................" }
    ],
    "hideTablesRows": ["APR", "Rate" , "Extra Monthly Payment"]
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
  renderCurrentLoanTable(json.currentLoan);
  renderTablesFromJson(json);
  renderCharts(json);
});