/* ============================================================
   buydown.js  —  Single source of truth for buydown math.

   This file contains NO UI and NO Dataverse-specific code.
   Use the exact same file in:
     - the Dataverse web resource (the Summary popup)
     - the client portal (its own UI calls computeBuydownSchedule)

   Browser usage:   window.Buydown.computeBuydownSchedule(...)
   ============================================================ */
(function (global) {
  "use strict";

  /* If your sl_interestrate is stored as a FRACTION (e.g. 0.0675 instead
     of 6.75), set this to true. With your current setup it should be false. */
  var RATE_IS_FRACTION = false;

  /* Buydown options — values match the sl_interestratebuydowncode choice.
     "reductions" = percentage points subtracted from the note rate, per year,
     starting at year 1. After the listed years, the full note rate applies. */
  var BUYDOWN_SCHEDULES = {
    126490001: { label: "Buydown 1-1",   reductions: [1, 1] },
    126490002: { label: "Buydown 2-1",   reductions: [2, 1] },
    126490003: { label: "Buydown 3-2-1", reductions: [3, 2, 1] },
    126490004: { label: "None",          reductions: [] }
  };

  /* Paid By labels — values match the sl_paidbycode choice.
     Display only; does not affect the math. */
  var PAID_BY_LABELS = {
    126490000: "Seller Paid",
    126490001: "Lender Paid",
    126490002: "Borrower Paid"
  };

  /* Accepts either a numeric choice value (126490003) OR a text label
     ("Buydown 3-2-1"). Lets the Dataverse side pass codes and the portal
     side pass the label it already has. Returns a schedule definition. */
  function resolveBuydown(codeOrLabel) {
    if (codeOrLabel === null || codeOrLabel === undefined || codeOrLabel === "") {
      return BUYDOWN_SCHEDULES[126490004];
    }
    if (BUYDOWN_SCHEDULES[codeOrLabel]) return BUYDOWN_SCHEDULES[codeOrLabel]; // numeric code
    var wanted = String(codeOrLabel).trim().toLowerCase();
    for (var k in BUYDOWN_SCHEDULES) {
      if (BUYDOWN_SCHEDULES[k].label.toLowerCase() === wanted) return BUYDOWN_SCHEDULES[k];
    }
    return BUYDOWN_SCHEDULES[126490004]; // unknown -> treat as None
  }

  /* Accepts a numeric paid-by code OR a text label; returns the label text. */
  function resolvePaidByLabel(codeOrLabel) {
    if (codeOrLabel === null || codeOrLabel === undefined || codeOrLabel === "") return "";
    if (PAID_BY_LABELS[codeOrLabel]) return PAID_BY_LABELS[codeOrLabel]; // numeric code
    return String(codeOrLabel).trim(); // already a label
  }

  /* Standard fully-amortizing monthly principal & interest payment. */
  function monthlyPayment(principal, annualRatePercent, termMonths) {
    var monthlyRate = (annualRatePercent / 100) / 12;
    if (!principal || !termMonths) return 0;
    if (monthlyRate === 0) return principal / termMonths;
    var factor = Math.pow(1 + monthlyRate, termMonths);
    return principal * monthlyRate * factor / (factor - 1);
  }

  /* Main entry point.
       loanAmount      : number  e.g. 490507
       noteRate        : number  e.g. 6.75   (percent, per your setup)
       termMonths      : integer e.g. 360
       buydownCode     : number  e.g. 126490003
       paidByCode      : number  e.g. 126490001  (optional, display only)
     Returns:
       {
         buydownLabel, paidByLabel,
         notePayment,                 // full note-rate P&I
         rows: [ { year, interestRate, noteRatePayment, buydownPayment,
                   monthlySavings, numberOfPayments, annualSavings } ],
         totalBuydownCost             // sum of annualSavings = cost of the buydown
       }
  */
  function computeBuydownSchedule(loanAmount, noteRate, termMonths, buydown, paidBy) {
    var notePercent = RATE_IS_FRACTION ? noteRate * 100 : noteRate;
    var def = resolveBuydown(buydown);
    var notePayment = monthlyPayment(loanAmount, notePercent, termMonths);

    var rows = def.reductions.map(function (reduction, i) {
      var yearRate = notePercent - reduction;
      var buydownPayment = monthlyPayment(loanAmount, yearRate, termMonths);
      var monthlySavings = notePayment - buydownPayment;
      return {
        year: i + 1,
        interestRate: yearRate,
        noteRatePayment: notePayment,
        buydownPayment: buydownPayment,
        monthlySavings: monthlySavings,
        numberOfPayments: 12,
        annualSavings: monthlySavings * 12
      };
    });

    var totalBuydownCost = rows.reduce(function (sum, r) { return sum + r.annualSavings; }, 0);

    return {
      buydownLabel: def.label,
      paidByLabel: resolvePaidByLabel(paidBy),
      notePayment: notePayment,
      rows: rows,
      totalBuydownCost: totalBuydownCost
    };
  }

  /* ----- Formatting helpers (used only by the renderer) ----- */
  var _usd = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  function money(n) { return _usd.format(n || 0); }
  function pct(n) { return (n || 0).toFixed(3) + "%"; }

  /* Self-contained HTML table. Every element carries inline styles, so the
     returned string can be dropped into ANY container (your Details popup,
     a div, etc.) without depending on external CSS.

     Usage:
       var result = Buydown.computeBuydownSchedule(loan, rate, term, code, paidBy);
       container.innerHTML = Buydown.renderBuydownTable(result);
  */
  function renderBuydownTable(result, opts) {
    opts = opts || {};
    var showTitle = opts.showTitle !== false; // default: show
    var FONT = 'font-family:"Segoe UI",Arial,sans-serif;color:#323130;';
    var TH   = 'text-align:left;font-weight:400;color:#6b6b6b;padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;';
    var TD   = 'padding:9px 8px;border-bottom:1px solid #f1f1f1;font-size:13px;';

    var head =
      '<div style="' + FONT + '">' +
      (showTitle ? '<p style="font-size:15px;font-weight:600;margin:0 0 14px;">Rate &amp; Payment Structure</p>' : '') +
      '<table style="width:100%;border-collapse:collapse;">' +
      '<thead><tr>' +
        '<th style="' + TH + '">Year</th>' +
        '<th style="' + TH + '">Interest Rate</th>' +
        '<th style="' + TH + '">Note Rate Payment</th>' +
        '<th style="' + TH + '">Buydown Payment</th>' +
        '<th style="' + TH + '">Monthly Savings</th>' +
        '<th style="' + TH + '"># of Payments</th>' +
        '<th style="' + TH + '">Annual Monthly Savings</th>' +
      '</tr></thead><tbody>';

    var body;
    if (!result.rows.length) {
      body = '<tr><td colspan="7" style="' + TD + 'color:#6b6b6b;">' +
             'No buydown selected — payment is the full note rate.</td></tr>';
    } else {
      body = result.rows.map(function (r) {
        return '<tr>' +
          '<td style="' + TD + '">Year ' + r.year + '</td>' +
          '<td style="' + TD + '">' + pct(r.interestRate) + '</td>' +
          '<td style="' + TD + '">' + money(r.noteRatePayment) + '</td>' +
          '<td style="' + TD + 'font-weight:600;">' + money(r.buydownPayment) + '</td>' +
          '<td style="' + TD + 'color:#2f8f4e;">' + money(r.monthlySavings) + '</td>' +
          '<td style="' + TD + '">' + r.numberOfPayments + '</td>' +
          '<td style="' + TD + '">' + money(r.annualSavings) + '</td>' +
        '</tr>';
      }).join("");
    }

    var totalLabel = "Total buydown cost";
    if (result.paidByLabel) totalLabel += "  \u00B7  " + result.paidByLabel;

    var foot =
      '</tbody></table>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'margin-top:14px;padding-top:12px;border-top:1px solid #eee;font-size:14px;">' +
        '<span style="color:#6b6b6b;">' + totalLabel + '</span>' +
        '<span style="font-weight:600;">' + money(result.totalBuydownCost) + '</span>' +
      '</div></div>';

    return head + body + foot;
  }

  var api = {
    BUYDOWN_SCHEDULES: BUYDOWN_SCHEDULES,
    PAID_BY_LABELS: PAID_BY_LABELS,
    monthlyPayment: monthlyPayment,
    computeBuydownSchedule: computeBuydownSchedule,
    renderBuydownTable: renderBuydownTable
  };

  /* Works as a browser global, and as a CommonJS/AMD module for the portal build. */
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else if (typeof define === "function" && define.amd) {
    define(function () { return api; });
  } else {
    global.Buydown = api;
  }
})(typeof window !== "undefined" ? window : this);
