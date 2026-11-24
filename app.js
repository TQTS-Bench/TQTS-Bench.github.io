'use strict';
(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function select(tab) {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { event.preventDefault(); select(tabs[next]); tabs[next].focus(); }
    });
  });
  document.getElementById('search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    const rows = [...document.querySelectorAll('tbody tr')];
    rows.forEach(row => { row.hidden = !row.dataset.name.includes(query); });
    document.getElementById('search-empty').hidden = rows.some(row => !row.hidden);
  });
  const data = window.TQTS_DISCOVERY;
  const status = document.getElementById('sync-status');
  const list = document.getElementById('paper-list');
  const date = value => value ? new Date(value).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}) : 'Not yet checked';
  const checkedAt = value => value ? new Date(value).toLocaleString('en-US', {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : 'Not yet checked';
  const el = (tag, text, cls) => { const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls; return node; };
  if (!data || data.schemaVersion !== 2) { status.textContent = 'Paper discovery is temporarily unavailable.'; return; }
  status.textContent = data.lastAttemptStatus === 'failed'
    ? `Latest check could not complete. Last successful check: ${checkedAt(data.lastSuccessfulSync)}. Previously confirmed papers are retained.`
    : `Last checked: ${checkedAt(data.lastSuccessfulSync)} · ${data.papers.length} matched ${data.papers.length === 1 ? 'paper' : 'papers'}`;
  if (!data.papers.length) {
    const empty = el('div', null, 'empty-state');
    empty.append(el('h3', 'No confirmed papers yet'), el('p', 'Papers will appear here when a citation to TQTS-Bench or an evaluation on the benchmark can be confirmed.'));
    list.append(empty);
  }
  for (const paper of data.papers) {
    const article = el('article', null, 'paper-entry');
    const time = el('time', date(paper.published)); time.dateTime = paper.published;
    article.append(time, el('h3', paper.title), el('p', paper.evidence?.text || 'References TQTS-Bench.'));
    const links = el('div', null, 'entry-links');
    for (const [label, url] of [['Paper', paper.url], ['Code', paper.codeUrl]]) {
      if (!url || !/^https:\/\//i.test(url)) continue;
      const link = el('a', `[${label}]`); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link);
    }
    article.append(links); list.append(article);
  }
})();
