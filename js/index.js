$(document).ready(async () => {
  const TABLE_CONFIG = {
    thRows: ['Program'],
    highlightRows: [
      'Rate',
      'Extra Monthly Payment',
      'Total Monthly Payment',
      'Total Closing Costs',
      'Estimated Total Cash to Close',
      'Payment Savings',
      'Power Refi Savings',
      'Interest Saved over 5 Years',
      'Interest Saved over Life of Loan'
    ],
    tables: [
      {
        name: "table_1",
        fields: ["Appraised Value", "Loan Amount", "Equity", "Loan-To-Value"]
      },
      {
        name: "table_2",
        fields: ["Rate", "APR", "Term"]
      },
      {
        name: "table_3",
        fields: ["Principle Interest", "Hazard Insurance", "Mortgage Insurance", "HOA", "Property Taxes", "Extra Monthly Payment", "Total Monthly Payment"]
      },
      {
        name: "table_4",
        fields: ["Points", "Lender Credit", "Lender Fees", "3Rd Party Fees", "Total Closing Costs"]
      },
      {
        name: "table_5",
        fields: ["Escrows & Prepaid Interest", "Estimated Total Cash to Close"]
      },
      {
        name: "table_6",
        fields: ["Closing Costs Included in Loan", "Pre-Paids and Impounds in Loan", "Payment Savings", "Power Refi Savings", "Interest Saved over 5 Years", "Interest Saved over Life of Loan"]
      }
    ]
  };

  // Підставляємо заголовок, контактну інформацію, логотипи
  function renderHeaderFromJson(json) {
    $('#greeting').text(json.greeting);
    $('#proposalIntro').text(json.proposalIntro);

    $('#loFullName').text(json.loFullName);
    $('#brandCompanyName').text(json.brandCompanyName);
    $('#loAddress').text(json.loAddress);
    $('#loEmail').text(json.loEmail);
    $('.contacts-phone').text(json.loPhone);
    $('#nmls').text('NMLS: ' + json.nmls);
    $('#dre').text(json.dre);

    $('#logo').attr('src', json.brandLogo);
    $('#photo').attr('src', json.loPhoto);
  }

  // Рендеримо динамічні таблиці згідно з json.tables
  function renderTablesFromJson(json) {
    const wrapper = $('.rate-cost-table');
    wrapper.empty();

    const columnCount = json.programs.length;
    const colWidth = (100 - 40) / columnCount;

    TABLE_CONFIG.tables.forEach((tableConfig, sectionIndex) => {
      const table = $('<table>').addClass('table-section');

      const colgroup = $('<colgroup>');
      colgroup.append('<col style="width: 25%">');
      json.programs.forEach(() => {
        colgroup.append(`<col style="width: ${colWidth}%">`);
      });
      table.append(colgroup);

      if (sectionIndex === 0) {
        const thead = $('<thead><tr></tr></thead>');
        TABLE_CONFIG.thRows.forEach(label => thead.find('tr').append(`<th>${label}</th>`));
        json.programs.forEach(p => thead.find('tr').append(`<th>${p}</th>`));
        table.append(thead);
      }

      const tbody = $('<tbody>');
      tableConfig.fields.forEach(label => {
        const values = json.tables[label];
        if (!values) return;

        const tr = $('<tr>');
        if (TABLE_CONFIG.highlightRows.includes(label.trim())) tr.addClass('highlight-row');

        tr.append(`<td>${label}</td>`);
        values.forEach(v => tr.append(`<td>${v}</td>`));
        tbody.append(tr);
      });

      table.append(tbody);
      wrapper.append(table);
    });
  }

  function createBarChart({
    canvasId,
    labels,
    data,
    color = '#2c84c5',
    maxY = undefined
  }) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
      console.error(`Canvas element with id "${canvasId}" not found.`);
      return;
    }

    const maxValue = Math.max(...data);
    const resolvedMaxY = maxY ?? Math.ceil(maxValue * 1.2 / 100) * 100;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: color,
          borderRadius: 2,
          barThickness: 40
        }]
      },
      options: {
        layout: {
          padding: { left: 10, right: 10, top: 0, bottom: 0 }
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            offset: 8,
            color: '#000',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: value => `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: resolvedMaxY,
            ticks: {
              callback: value => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`
            }
          },
          x: {
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              padding: 10
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  function renderCharts(data) {
    const charts = [
      {
        canvasId: 'MonthlyPaymentDifference',
        labels: data.programs,
        data: parseDollarArray(data.tables["Total Monthly Payment"]),
        color: '#acacac'
      },
      {
        canvasId: 'InterestSavedOver5Years',
        labels: data.programs,
        data: parseDollarArray(data.tables["Interest Saved over 5 Years"]),
        color: '#7cc242'
      },
      {
        canvasId: 'InterestSavedOverLifeOfLoan',
        labels: data.programs,
        data: parseDollarArray(data.tables["Interest Saved over Life of Loan"]),
        color: '#2c84c5'
      }
    ]

    charts.forEach(f => {
      createBarChart(f);
    });
  }

  function parseDollarArray(arr) {
    return arr.map(str =>
      parseFloat(str.replace(/\$/g, '').replace(/,/g, ''))
    );
  }

  function setColorsFromJson(data) {
    const root = $(':root'); // посилання на document.documentElement

    if (data.mainCellColor) root.css('--mainCellColor', data.mainCellColor);
    if (data.cellBackground) root.css('--cellBackground', data.cellBackground);
    if (data.cellSecondColor) root.css('--cellSecondColor', data.cellSecondColor);
    if (data.brandFontColor) root.css('--brandFontColor', data.brandFontColor);
    if (data.mainFontColor) root.css('--mainFontColor', data.mainFontColor);
  }

  function renderCurrentLoanTable(data) {
    const container = $('.current-loan-table');
    container.empty();

    const table = $('<table>').addClass('current-loan');
    const thead = $('<thead><tr><th colspan="2">Current Loan</th></tr></thead>');
    table.append(thead);

    const tbody = $('<tbody>');

    Object.entries(data).forEach(([key, value]) => {
      //if (key === 'ContactName') return; // skip title row

      const row = $('<tr>');
      row.append(`<td>${key}</td>`);
      row.append(`<td>${value}</td>`);
      tbody.append(row);
    });

    table.append(tbody);
    container.append(table);
  }

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

    const url = `https://marketing2025.blob.core.windows.net/proposals/${proposalId}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Data not found');
      const data = await response.json();

      setColorsFromJson(data);
      renderHeaderFromJson(data);
      renderCurrentLoanTable(data.currentLoan);
      renderTablesFromJson(data);
      renderCharts(data);
    } catch (err) {
      document.body.innerHTML = "<h2>Proposal not found</h2>";
    }
  })();
});
