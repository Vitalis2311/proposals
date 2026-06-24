/* ============================================================
   buydown-portal.js  —  Adds a "details" link to each scenario
   column in the proposal's "Paid By" row. Clicking it opens a
   modal with the Rate & Payment Structure (year-by-year buydown).

   Requires buydown.js to be loaded first.
   Drop-in: just add both scripts to proposal.html, no edits to
   index.js needed. It waits for the table, then attaches itself.

   In proposal.html <head>, after index.js:
     <script src="js/buydown.js"></script>
     <script src="js/buydown-portal.js"></script>
   ============================================================ */
(function () {
  "use strict";

  /* Row labels exactly as they appear in the first column of the proposal. */
  var LABELS = {
    loan:    "Loan Amount",
    rate:    "Rate",
    term:    "Term",
    buydown: "Rate Buydown",
    paidBy:  "Paid By"
  };

  /* ---------- small parsing helpers (display string -> number) ---------- */
  function parseMoney(s) { return Number(String(s).replace(/[^0-9.\-]/g, "")) || 0; }
  function parseRate(s)  { return parseFloat(String(s)) || 0; }            // "5.875%" -> 5.875
  function parseTerm(s)  { return parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0; }

  /* ---------- DOM lookup helpers ---------- */
  function findRowByLabel(label) {
    var rows = document.querySelectorAll(".rate-cost-table tr");
    for (var i = 0; i < rows.length; i++) {
      var firstTd = rows[i].querySelector("td");
      if (firstTd && firstTd.textContent.trim() === label) return rows[i];
    }
    return null;
  }
  function cellValue(row, colIndex) {
    if (!row) return "";
    var tds = row.querySelectorAll("td");
    var c = tds[colIndex + 1]; // +1 because the first td is the row label
    return c ? c.textContent.trim() : "";
  }

  /* Reads the proposal's dark header background (the "Program" row, i.e. the
     first cell of the rate-cost table) so the Details button can match it
     exactly under any theme. Returns "" if it can't be read. */
  function getHeaderBg() {
    var firstCell = document.querySelector(".rate-cost-table tr td");
    if (!firstCell) return "";
    var bg = window.getComputedStyle(firstCell).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return "";
    return bg;
  }

  /* ---------- styles (injected once) ---------- */
  function injectStyles() {
    if (document.getElementById("bd-portal-styles")) return;
    var css =
      /* the Rate Buydown value itself becomes the clickable button */
      ".bd-buydown-btn{display:inline-block;padding:4px 14px;font-size:13px;font-weight:600;" +
      "cursor:pointer;border:none;border-radius:4px;background:var(--mainFontColor,#4E5351);" +
      "color:var(--highlightFontColor,#fff);line-height:1.4;box-shadow:0 1px 2px rgba(0,0,0,.2);}" +
      ".bd-buydown-btn:hover{filter:brightness(1.12);}" +
      ".bd-buydown-btn:active{transform:translateY(1px);}" +

      /* overlay + modal */
      ".bd-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;" +
      "display:flex;align-items:center;justify-content:center;padding:20px;}" +
      ".bd-modal{background:#fff;border-radius:6px;width:940px;max-width:96vw;max-height:90vh;overflow:auto;" +
      "box-shadow:0 12px 45px rgba(0,0,0,.35);font-family:'Segoe UI',Arial,sans-serif;color:var(--mainFontColor,#4E5351);}" +
      ".bd-modal-head{display:flex;align-items:center;justify-content:space-between;" +
      "background:var(--brandFontColor,#7CC242);padding:14px 20px;}" +
      ".bd-modal-head h3{margin:0;font-size:16px;font-weight:700;letter-spacing:.3px;color:var(--highlightFontColor,#fff);}" +
      ".bd-modal-x{cursor:pointer;font-size:20px;line-height:1;color:var(--highlightFontColor,#fff);border:none;background:none;opacity:.9;}" +
      ".bd-modal-x:hover{opacity:1;}" +
      ".bd-modal-body{padding:0;}" +

      /* table styled to match the proposal's .table-section */
      ".bd-bt{width:100%;border-collapse:collapse;font-size:14px;}" +
      ".bd-bt th{background:var(--mainFontColor,#4E5351);color:#fff;font-weight:600;text-align:center;" +
      "white-space:nowrap;padding:10px 14px;border:1px solid var(--tableBorderColor,#ddd);}" +
      ".bd-bt td{padding:10px 14px;border:1px solid var(--tableBorderColor,#ddd);font-weight:500;" +
      "text-align:center;white-space:nowrap;}" +
      ".bd-bt .bd-save{color:#2f8f4e;font-weight:600;}" +
      ".bd-bt .bd-strong{font-weight:700;}" +
      ".bd-total-row td{background:var(--rowSecondColor,#7CC242);color:var(--highlightFontColor,#fff);" +
      "font-weight:700;font-size:15px;}" +
      ".bd-empty td{color:#888;font-weight:500;}" +
      ".bd-modal-foot{display:flex;justify-content:flex-end;padding:14px 20px;}" +
      ".bd-modal-foot button{padding:7px 22px;border:1px solid var(--tableBorderColor,#c9c9c9);" +
      "background:#f7f7f7;border-radius:4px;cursor:pointer;font-size:13px;color:var(--mainFontColor,#4E5351);}" +
      ".bd-modal-foot button:hover{background:#efefef;}";
    var style = document.createElement("style");
    style.id = "bd-portal-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* Themed table built to match the proposal (uses the portal's CSS vars). */
  function renderPortalTable(result) {
    var usd = new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    var head =
      '<table class="bd-bt"><thead><tr>' +
        '<th>Year</th><th>Interest Rate</th><th>Note Rate Payment</th>' +
        '<th>Buydown Payment</th><th>Monthly Savings</th><th># of Payments</th>' +
        '<th>Annual Savings</th>' +
      '</tr></thead><tbody>';

    var body;
    if (!result.rows.length) {
      body = '<tr class="bd-empty"><td colspan="7">No buydown selected — payment is the full note rate.</td></tr>';
    } else {
      body = result.rows.map(function (r) {
        return '<tr>' +
          '<td>' + r.year + '</td>' +
          '<td>' + r.interestRate.toFixed(3) + '%</td>' +
          '<td>' + usd.format(r.noteRatePayment) + '</td>' +
          '<td class="bd-strong">' + usd.format(r.buydownPayment) + '</td>' +
          '<td class="bd-save">' + usd.format(r.monthlySavings) + '</td>' +
          '<td>' + r.numberOfPayments + '</td>' +
          '<td>' + usd.format(r.annualSavings) + '</td>' +
        '</tr>';
      }).join("");
    }

    var label = "Total buydown cost";
    if (result.paidByLabel) label += "  \u00B7  " + result.paidByLabel;
    var total =
      '<tr class="bd-total-row">' +
        '<td colspan="6">' + label + '</td>' +
        '<td style="text-align:right;">' + usd.format(result.totalBuydownCost) + '</td>' +
      '</tr>';

    return head + body + total + '</tbody></table>';
  }

  /* ---------- modal ---------- */
  function openModal(result) {
    var overlay = document.createElement("div");
    overlay.className = "bd-modal-overlay";
    overlay.setAttribute("data-html2canvas-ignore", "true"); // keep it out of the PDF export

    var modal = document.createElement("div");
    modal.className = "bd-modal";
    modal.innerHTML =
      '<div class="bd-modal-body">' + renderPortalTable(result) + '</div>' +
      '<div class="bd-modal-foot"><button type="button">Close</button></div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }

    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    modal.querySelector(".bd-modal-foot button").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  }

  /* ---------- attach details links ---------- */
  function attach() {
    var paidByRow = findRowByLabel(LABELS.paidBy);
    if (!paidByRow) return false;                       // table not ready yet
    if (paidByRow.getAttribute("data-bd-attached")) return true; // already done

    var loanRow    = findRowByLabel(LABELS.loan);
    var rateRow    = findRowByLabel(LABELS.rate);
    var termRow    = findRowByLabel(LABELS.term);
    var buydownRow = findRowByLabel(LABELS.buydown);

    if (!buydownRow) { paidByRow.setAttribute("data-bd-attached", "1"); return true; }

    var paidByTds = paidByRow.querySelectorAll("td");
    var buydownTds = buydownRow.querySelectorAll("td");
    var columnCount = paidByTds.length - 1;
    var headerBg = getHeaderBg(); // paint the button like the dark header

    for (var i = 0; i < columnCount; i++) {
      var buydownText = cellValue(buydownRow, i);
      var hasBuydown = buydownText && !/^none$/i.test(buydownText);

      if (!hasBuydown) {
        // No buydown in this column -> leave "None" as plain text, and clear the
        // Paid By cell (Paid By is meaningless without a buydown).
        var noneCell = paidByTds[i + 1];
        if (noneCell) noneCell.textContent = "";
        continue;
      }

      var buydownCell = buydownTds[i + 1];
      if (!buydownCell) continue;

      var paidByText = cellValue(paidByRow, i);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bd-buydown-btn";
      btn.textContent = buydownText;                 // e.g. "Buydown 3-2-1"
      if (headerBg) btn.style.backgroundColor = headerBg;

      // Capture each column's own values so every button computes its OWN scenario.
      (function (colIndex, buydownLabel, paidBy) {
        btn.addEventListener("click", function () {
          var result = window.Buydown.computeBuydownSchedule(
            parseMoney(cellValue(loanRow, colIndex)),
            parseRate(cellValue(rateRow, colIndex)),
            parseTerm(cellValue(termRow, colIndex)),
            buydownLabel,
            paidBy
          );
          openModal(result);
        });
      })(i, buydownText, paidByText);

      buydownCell.textContent = "";                  // replace the plain text...
      buydownCell.appendChild(btn);                  // ...with the clickable value
    }

    paidByRow.setAttribute("data-bd-attached", "1");
    return true;
  }

  /* ---------- wait for the table, then attach once ---------- */
  function init() {
    injectStyles();
    if (attach()) return;            // already there
    var observer = new MutationObserver(function () {
      if (attach()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
