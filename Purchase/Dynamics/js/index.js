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

$(document).ready(async () => {
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  (async () => {
    const proposalId = getUrlParameter('id');
    if (!proposalId) {
      document.body.innerHTML = "<h2>Proposal ID not specified!</h2>";
      return;
    }

    const url = `https://marketing2025.blob.core.windows.net/proposals/Purchase/${proposalId}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Data not found');
      const json = await response.json();

      const $container = $('<div>').addClass('container');
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
    } catch (err) {
      document.body.innerHTML = "<h2>Proposal not found</h2>";
    }
  })();
});
