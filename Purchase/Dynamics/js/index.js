let __groupAutoId = 1;

/* ---------- theme ---------- */
function setColorsFromJson(data) {
  if (!data) return;
  const root = $(':root');
  if (data.brandFontColor) root.css('--brandFontColor', data.brandFontColor);
  if (data.mainFontColor) root.css('--mainFontColor', data.mainFontColor);
  if (data.reportForYou) root.css('--reportForYou', data.reportForYou);
  if (data.contactInfoFontColor) root.css('--contactInfoFontColor', data.contactInfoFontColor);
  if (data.rowSecondColor) root.css('--rowSecondColor', data.rowSecondColor);
  if (data.rowBackground) root.css('--rowBackground', data.rowBackground);
  if (data.highlightFontColor) root.css('--highlightFontColor', data.highlightFontColor);
  if (data.tableBorderColor) root.css('--tableBorderColor', data.tableBorderColor);
}

/* ---------- header ---------- */
function buildHeaderContainer(json) {
  const container = $('<div>').addClass('header-container');

  const logoCenter = $('<div>').addClass('logo-center')
    .append($('<img>').attr('id', 'logo').attr('src', json.brandLogo || ''));

  const contactCard = $('<div>').addClass('contact-card');
  const photo = $('<img>').attr('id', 'photo').attr('src', json.loPhoto || '');

  const contactInfo = $('<div>').addClass('contact-info');
  const forYou = $('<div>').attr('id', 'forYou').addClass('contact-info-foryou')
    .text("THE REPORT WAS CREATED FOR YOU BY");
  const name = $('<div>').attr('id', 'loFullName').addClass('contact-info-name')
    .text(json.loFullName || '');
  const company = $('<div>').attr('id', 'brandCompanyName').addClass('contact-info-company')
    .text(json.brandCompanyName || '');

  const contactBlock = $('<div>').attr('id', 'loPhone').addClass('contact-info-contacts')
    .append(
      $('<div>').attr('id', 'loAddress').addClass('contacts-address').text(json.loAddress || ''),
      $('<div>').attr('id', 'loEmail').addClass('contacts-email').text(json.loEmail || ''),
      $('<div>').addClass('contacts-phone').text(json.loPhone || ''),
      $('<div>').addClass('contacts-nmls-dre').append(
        $('<span>').attr('id', 'nmls').text(json.nmls ? `NMLS: ${json.nmls}` : ''),
        $('<span>').addClass('divider').text(' | '),
        $('<span>').attr('id', 'dre').text(json.dre ? `DRE: ${json.dre}` : '')
      )
    );

  const comunicate = $('<div>').addClass('comunicate')
    .append(
      $('<a>').attr('href', `tel:${json.loPhone || ''}`).html('&#128222; Call'),
      ' | ',
      $('<a>').attr('href', `sms:${json.loPhone || ''}`).html('&#128172; Text'),
      ' | ',
      $('<a>').attr('href', `mailto:${json.loEmail || ''}`).html('<span class="email-icon">&#128233;</span> Email')
    );

  contactInfo.append(forYou, name, company, contactBlock, comunicate);
  contactCard.append(photo, contactInfo);
  container.append(logoCenter, contactCard);

  return container;
}

/* ---------- greeting ---------- */
function buildGreetingContainer(json) {
  const greetingContainer = $('<div>').addClass('greeting-container')
    .append(
      $('<h2>').attr('id', 'greeting').text(json.greeting || ''),
      $('<p>').attr('id', 'proposalIntro').text(json.proposalIntro || '')
    );
  return $('<div>').addClass('header-content').append(greetingContainer);
}

/* ---------- layout ---------- */
function buildMainContent() {
  const main = $('<main>');
  const title = $('<div>').addClass('subject-rate-cost').text('RATE & CLOSING COST OPTIONS');
  const wrapper = $('<div>').addClass('summary-chart-wrapper');

  const tables = $('<div>').addClass('summary-tables');
  const summary = $('<div>').addClass('summary-table');
  const rateCost = $('<div>').addClass('rate-cost-table');
  summary.append(rateCost);

  const disclaimer = $('<div>').addClass('disclaimer').text(
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

/* ---------- helpers ---------- */
function getRowKey(r) {
  return Object.keys(r).find(k => !['highlight', 'color', 'slider', 'rows'].includes(k));
}

function normalizeSectionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const headerOnly = rows.filter(r => r && r.slider === true && !Array.isArray(r.rows));
  if (headerOnly.length === 1) {
    const header = headerOnly[0];
    const children = rows.filter(r => r !== header);
    const key = getRowKey(header);
    return [{ ...header, rows: children, [key]: header[key] }];
  }
  return rows;
}

function flattenRowsRecursive(rows, out = []) {
  if (!Array.isArray(rows)) return out;
  for (const r of rows) {
    const k = getRowKey(r);
    if (!k) continue;
    out.push(r);
    if (Array.isArray(r.rows) && r.rows.length > 0) {
      flattenRowsRecursive(r.rows, out);
    }
  }
  return out;
}

function getTitleMap(data) {
  const map = {};
  (data.titles || []).forEach(obj => {
    const key = Object.keys(obj)[0];
    map[key] = obj[key];
  });
  return map;
}

/* ---------- tables ---------- */
function renderTableSections(dataArray, containerSelector, options = {}) {
  const { hideSet = new Set(), titleMap = {} } = options;
  const wrapper = $(containerSelector).empty();

  dataArray.forEach((section) => {
    let rows = normalizeSectionRows(section?.rows);
    if (!Array.isArray(rows)) return;

    const tableWrapper = $('<div>').addClass('table-wrapper');
    const table = $('<table>').addClass('table-section');
    const colgroup = $('<colgroup>');
    const tbody = $('<tbody>');

    const flat = flattenRowsRecursive(rows);
    const firstLeaf = flat.find(r => {
      const key = getRowKey(r);
      return typeof key !== 'undefined' && Array.isArray(r[key]) && !hideSet.has(key);
    });
    const values = firstLeaf ? firstLeaf[getRowKey(firstLeaf)] : [];

    colgroup.append('<col style="width: 25%">');
    values.forEach(() => colgroup.append('<col style="width: auto">'));
    table.append(colgroup);

    function renderRowObject(r, level = 0, parentId = null) {
      const key = getRowKey(r);
      if (typeof key === 'undefined' || hideSet.has(key)) return;
      const vals = r[key];
      if (!Array.isArray(vals)) return;

      const isSlider = r.slider === true;
      const groupId = isSlider ? `g${__groupAutoId++}` : null;

      const tdLabel = $('<td>').text(key || '');
      if (titleMap[key]) tdLabel.attr('title', titleMap[key]);
      if (isSlider) tdLabel.append($('<span>').addClass('expand-icon'));

      const tr = $('<tr>').append(tdLabel).attr('data-level', level).css('--lvl', level);

      if (key === '') {
        tr.addClass('section-header');
        if (typeof r.highlight === 'string') tr.css('background-color', r.highlight);
        if (r.color) tr.css('color', r.color);
      }

      vals.forEach(val => tr.append($('<td>').text(val)));

      if (r.highlight === true) tr.addClass('highlight-row');
      else if (typeof r.highlight === 'string' && key !== '') tr.css('background-color', r.highlight);
      if (r.color && key !== '') tr.css('color', r.color);

      if (isSlider) tr.addClass('slider-row').attr('data-group-id', groupId);
      if (parentId) tr.addClass('hidden-row').attr('data-parent-id', parentId);

      tbody.append(tr);

      if (Array.isArray(r.rows) && r.rows.length > 0 && isSlider) {
        for (const child of r.rows) renderRowObject(child, level + 1, groupId);
      }
    }

    rows.forEach(r => renderRowObject(r, 0, null));

    tbody.off('click.nested').on('click.nested', 'tr.slider-row', function () {
      const $header = $(this);
      const gid = $header.data('group-id');
      if (!gid) return;

      const $children = tbody.find(`tr[data-parent-id='${gid}']`);
      const isExpanded = $header.hasClass('expanded');

      if (isExpanded) {
        const stack = [...$children.get()];
        while (stack.length) {
          const node = $(stack.pop());
          node.stop(true, true).slideUp(200).removeClass('expanded');
          const childGid = node.data('group-id');
          if (childGid) {
            const nested = tbody.find(`tr[data-parent-id='${childGid}']`).get();
            stack.push(...nested);
          }
        }
      } else {
        $children.filter((_, el) => $(el).data('parent-id') === gid).stop(true, true).slideDown(200);
      }
      $header.toggleClass('expanded');
    });

    table.append(tbody);
    tableWrapper.append(table);
    wrapper.append(tableWrapper);
  });
}

function renderTablesFromJson(data) {
  if (!Array.isArray(data?.tables)) return;
  const hideSet = new Set(data.hideTablesRows || []);
  renderTableSections(data.tables, '.rate-cost-table', {
    hideSet,
    titleMap: getTitleMap(data)
  });
}

/* ---------- charts ---------- */
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

  const shortLabels = rawLabels.map(l => (l.length > 20 ? l.split(' ').slice(0, 3).join(' ') + '…' : l));
  const fullLabels = rawLabels.map(String);

  new Chart(ctx, {
    type: 'bar',
    data: { labels: shortLabels, datasets: [{ data: numericData, backgroundColor: color, borderRadius: 2, barThickness: 40 }] },
    options: {
      layout: { padding: { top: 30, bottom: 30, left: 10, right: 10 } },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { title: ctx => fullLabels[ctx[0].dataIndex] } },
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
        x: { ticks: { maxRotation: 0, minRotation: 0, padding: 10 } }
      },
      clip: false
    },
    plugins: [ChartDataLabels]
  });
}

function renderCharts(data) {
  if (!Array.isArray(data?.charts)) return;
  const chartContainer = $('.charts').empty();
  const hiddenRows = data?.hideTablesRows ?? [];

  data.charts.forEach((chart, i) => {
    const { name, color } = chart;
    if (!name || hiddenRows.includes(name)) return;

    const allRows = data.tables?.flatMap(t => t.rows) || [];
    const row = allRows.find(r => r[name]);
    if (!row || !Array.isArray(row[name])) return;

    const rawValues = row[name];
    const canvasId = `chart-${i}`;
    const chartBlock = $(`
      <div class="chart-container">
        <div class="chart-header">${name}</div>
        <canvas id="${canvasId}" height="150"></canvas>
      </div>
    `);
    chartContainer.append(chartBlock);

    const programRow = allRows.find(r => Array.isArray(r["Program"]) || Array.isArray(r[""]));
    const labels =
      Array.isArray(programRow?.["Program"]) ? programRow["Program"] :
        Array.isArray(programRow?.[""]) ? programRow[""] :
          rawValues.map((_, idx) => `Option ${idx + 1}`);

    createBarChart({ canvasId, labels, color, rawValues });
  });
}

/* ---------- PDF ---------- */
function saveAsPdfStrict({ orientation = 'p', fileName = 'report_A4_portrait.pdf', source = '#container', margin = 10 } = {}) {
  if (!window.jspdf?.jsPDF) { console.error('jsPDF is not loaded'); return; }
  const { jsPDF } = window.jspdf;
  const el = document.querySelector(source);
  if (!el) { console.error('PDF source element not found:', source); return; }

  const domWidthPx = Math.round(el.scrollWidth || el.getBoundingClientRect().width);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation });
  const pageWidthMm = doc.internal.pageSize.getWidth();
  const pageHeightMm = doc.internal.pageSize.getHeight();
  const contentWidthMm = pageWidthMm - margin * 2;
  const contentHeightMm = pageHeightMm - margin * 2;

  html2canvas(el, { scale: 1, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', windowWidth: domWidthPx })
    .then((canvas) => {
      const pxPerMm = canvas.width / contentWidthMm;
      const fullHeightMm = canvas.height / pxPerMm;

      if (fullHeightMm <= contentHeightMm) {
        doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, contentWidthMm, fullHeightMm);
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
        tctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

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

/* ---------- boot ---------- */
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

      const $container = $('<div>').attr("id", "container").addClass('container');
      $container.append(buildHeaderContainer(json));
      $container.append(buildGreetingContainer(json));
      $container.append(buildMainContent());
      $('body').append($container);

      setColorsFromJson(json);
      renderTablesFromJson(json);
      renderCharts(json);
      addPdfButton();
    } catch (err) {
      document.body.innerHTML = "<h2>Proposal not found</h2>";
    }
  })();
});
