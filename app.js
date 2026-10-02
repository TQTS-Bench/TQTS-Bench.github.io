(() => {
  'use strict';
  document.querySelectorAll('[data-coming-soon]').forEach(button => button.addEventListener('click', () => {
    const status = document.querySelector('#resource-status');
    status.hidden = false;
    status.textContent = `${button.dataset.comingSoon} coming soon`;
  }));
  const baseline = window.TQTS_RESULTS;
  if (!baseline || !Array.isArray(baseline.entries)) return;
  const discovery = window.TQTS_DISCOVERY || { papers: [], reportedResults: [], lastSuccessfulSync: null };
  const papers = Array.isArray(discovery.papers) ? discovery.papers : [];
  const reported = Array.isArray(discovery.reportedResults) ? discovery.reportedResults : [];
  const paperById = new Map(papers.map(paper => [paper.id, paper]));
  const scoreByPaperId = new Map(reported.map(result => [result.paperId, result]));
  const body = document.querySelector('#results-body');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const search = document.querySelector('#search');
  let category = 'overall';
  let metric = 'overall';
  let direction = 'desc';
  let scoreView = 'verified';
  let paperLimit = 10;
  const notes = {
    overall: 'Models and methods are shown together. All methods use GPT-4o-mini; model and method results do not share a common backbone.',
    method: 'All six text-to-query methods use GPT-4o-mini as the unified LLM backbone. Five methods target RDBs; PromCopilot targets TSDBs.',
    model: 'Seven large language models, evaluated directly on TQTS-Bench. Model names and scores follow the paper.'
  };
  const safeDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };
  const formatDate = value => { const date = safeDate(value); return date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date) : 'Date unavailable'; };
  function externalLink(label, url, className) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (className) link.className = className;
    return link;
  }
  function badge(label, variant) {
    const element = document.createElement('span');
    element.className = `source-badge ${variant}`;
    element.textContent = label;
    return element;
  }
  const categoryCount = (entries, selectedCategory) => selectedCategory === 'overall' ? entries.length : entries.filter(entry => entry.type === selectedCategory).length;
  function renderScores() {
    const entries = scoreView === 'verified' ? baseline.entries : reported;
    const selected = entries.filter(entry => category === 'overall' || entry.type === category);
    const ordered = selected.slice().sort((a, b) => (direction === 'desc' ? b[metric] - a[metric] : a[metric] - b[metric]) || a.name.localeCompare(b.name));
    const ranking = selected.slice().sort((a, b) => b[metric] - a[metric]);
    const needle = search.value.trim().toLocaleLowerCase();
    const matches = ordered.filter(entry => entry.name.toLocaleLowerCase().includes(needle));
    body.replaceChildren();
    for (const entry of matches) {
      const rank = ranking.findIndex(item => item[metric] === entry[metric]) + 1;
      const paper = entry.paperId ? paperById.get(entry.paperId) : null;
      const row = document.createElement('tr');
      if (rank === 1) row.className = 'first-place';
      const rankCell = document.createElement('td');
      rankCell.className = 'rank';
      const rankLabel = document.createElement('span');
      rankLabel.textContent = String(rank);
      const date = document.createElement('time');
      date.dateTime = paper ? paper.published.slice(0, 10) : (entry.publishedAt || baseline.reportingDeadline);
      date.title = paper ? 'Paper publication date (UTC)' : (entry.publishedAt ? 'Leaderboard publication date.' : baseline.reportingDateBasis);
      date.textContent = paper ? formatDate(paper.published) : (entry.publishedAt ? formatDate(entry.publishedAt) : baseline.reportingDateLabel);
      const timezone = document.createElement('small');
      timezone.textContent = 'UTC';
      rankCell.append(rankLabel, date, timezone);
      const nameCell = document.createElement('td');
      nameCell.className = 'entry-name';
      const name = document.createElement('strong');
      name.textContent = entry.name;
      const detail = document.createElement('small');
      detail.textContent = paper || entry.source === 'user-submitted' ? entry.group : (entry.type === 'method' ? `${entry.group} / ${baseline.methodBackbone}` : entry.group);
      const labels = document.createElement('div');
      labels.className = 'source-labels';
      labels.append(badge(paper ? 'Auto-collected' : (entry.source === 'user-submitted' ? 'User-submitted' : 'Benchmark baseline'), paper ? 'auto' : (entry.source === 'user-submitted' ? 'submitted' : 'baseline')));
      if (paper) labels.append(badge('Paper-reported', 'reported'));
      nameCell.append(name, detail, labels);
      if (entry.projectUrl) {
        const project = externalLink('Project documentation ↗', entry.projectUrl, 'project-link');
        project.setAttribute('aria-label', `${entry.name} original project documentation`);
        nameCell.append(project);
      }
      if (paper) {
        const evidence = document.createElement('details');
        evidence.className = 'score-evidence';
        const summary = document.createElement('summary');
        summary.textContent = 'Evidence';
        const explanation = document.createElement('p');
        explanation.textContent = `v${entry.paperVersion} · ${entry.metric} · ${entry.scope}. ${entry.evidenceText}`;
        evidence.append(summary, explanation, externalLink('View paper ↗', entry.evidenceUrl));
        nameCell.append(evidence);
      }
      const scoreCell = document.createElement('td');
      scoreCell.className = 'score overall-score';
      scoreCell.textContent = entry.overall.toFixed(2);
      row.append(rankCell, nameCell, scoreCell);
      body.append(row);
    }
    if (!matches.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.className = 'empty-state';
      cell.textContent = scoreView === 'reported' && !reported.length ? 'No papers have reported an unambiguous Overall EX result on TQTS-Bench yet.' : 'No matching entries. Try another name or clear the search.';
      row.append(cell);
      body.append(row);
    }
    document.querySelector('#result-count').textContent = needle ? `${matches.length} of ${selected.length} entries` : `${selected.length} entries`;
    document.querySelector('#category-note').textContent = scoreView === 'verified' ? notes[category] : 'Scores in this view are reported in paper abstracts and have not been independently verified. Only explicit Overall EX claims are included.';
    document.querySelector('#sort-description').textContent = `Ranked by Overall EX, ${direction === 'desc' ? 'highest' : 'lowest'} first`;
    for (const tab of tabs) tab.querySelector('span').textContent = String(categoryCount(entries, tab.dataset.category));
    for (const th of document.querySelectorAll('[data-metric]')) {
      const active = th.dataset.metric === metric;
      th.setAttribute('aria-sort', active ? (direction === 'desc' ? 'descending' : 'ascending') : 'none');
      th.querySelector('span').textContent = active ? (direction === 'desc' ? '↓' : '↑') : '↕';
    }
  }
  function selectTab(tab) {
    category = tab.dataset.category;
    metric = 'overall';
    direction = 'desc';
    for (const item of tabs) {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    }
    document.querySelector('#results-panel').setAttribute('aria-labelledby', tab.id);
    renderScores();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectTab(tabs[next]);
    });
  });
  document.querySelectorAll('[data-sort]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const next = button.dataset.sort;
      direction = next === metric && direction === 'desc' ? 'asc' : 'desc';
      metric = next;
      renderScores();
    });
  });
  search.addEventListener('input', renderScores);
  document.querySelector('.tabs').hidden = false;
  document.querySelector('.search-control').hidden = false;
  document.querySelector('#reported-count').textContent = String(reported.length);
  selectTab(tabs[0]);
  function selectScoreView(value) {
    scoreView = value;
    for (const button of document.querySelectorAll('[data-score-view]')) button.setAttribute('aria-pressed', String(button.dataset.scoreView === value));
    document.querySelector('#human-reference').hidden = value === 'reported';
    document.querySelector('.reading-notes').hidden = value === 'reported';
    selectTab(tabs[0]);
  }
  document.querySelectorAll('[data-score-view]').forEach(button => button.addEventListener('click', () => selectScoreView(button.dataset.scoreView)));
  const paperSearch = document.querySelector('#paper-search');
  const hasCode = document.querySelector('#paper-has-code');
  const paperList = document.querySelector('#papers-list');
  document.querySelector('#paper-count').textContent = String(papers.length);
  function renderPapers() {
    const needle = paperSearch.value.trim().toLocaleLowerCase();
    const matches = papers.filter(paper => {
      if (hasCode.checked && !paper.codeUrl) return false;
      return `${paper.title} ${paper.abstract} ${paper.authors.join(' ')}`.toLocaleLowerCase().includes(needle);
    });
    paperList.replaceChildren();
    for (const paper of matches.slice(0, paperLimit)) {
      const card = document.createElement('article');
      card.className = 'paper-card';
      const heading = document.createElement('h3');
      heading.append(externalLink(paper.title, paper.url));
      const metadata = document.createElement('p');
      metadata.className = 'paper-meta';
      metadata.textContent = `${formatDate(paper.published)} · ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}`;
      const labels = document.createElement('div');
      labels.className = 'source-labels';
      labels.append(badge('Auto-collected', 'auto'));
      if (scoreByPaperId.has(paper.id)) labels.append(badge('Paper-reported result', 'reported'));
      const summary = document.createElement('p');
      summary.className = 'paper-summary';
      summary.textContent = paper.abstract;
      const links = document.createElement('div');
      links.className = 'paper-links';
      links.append(externalLink('Paper ↗', paper.url));
      if (paper.codeUrl) links.append(externalLink('Code ↗', paper.codeUrl));
      if (scoreByPaperId.has(paper.id)) {
        const resultButton = document.createElement('button');
        resultButton.type = 'button';
        resultButton.textContent = 'View result →';
        resultButton.addEventListener('click', () => {
          selectScoreView('reported');
          search.value = scoreByPaperId.get(paper.id).name;
          renderScores();
          document.querySelector('#leaderboard').scrollIntoView();
        });
        links.append(resultButton);
      }
      card.append(heading, metadata, labels, summary, links);
      paperList.append(card);
    }
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'papers-empty';
      empty.textContent = papers.length ? 'No papers match these filters.' : 'No matching papers have been collected yet.';
      paperList.append(empty);
    }
    document.querySelector('#papers-visible-count').textContent = `${Math.min(matches.length, paperLimit)} of ${matches.length} papers`;
    document.querySelector('#show-more-papers').hidden = matches.length <= paperLimit;
  }
  paperSearch.addEventListener('input', () => { paperLimit = 10; renderPapers(); });
  hasCode.addEventListener('change', () => { paperLimit = 10; renderPapers(); });
  document.querySelector('#show-more-papers').addEventListener('click', () => { paperLimit += 10; renderPapers(); });
  const lastSync = safeDate(discovery.lastSuccessfulSync);
  if (lastSync) document.querySelector('#sync-note').textContent = `Last successful arXiv sync: ${formatDate(discovery.lastSuccessfulSync)} (UTC).${Date.now() - lastSync.getTime() > 72 * 60 * 60 * 1000 ? ' Updates may be delayed.' : ''}`;
  renderPapers();
  const grid = document.querySelector('#tsdb-grid');
  const expand = document.querySelector('#toggle-tsdbs');
  grid.classList.add('is-collapsed');
  expand.hidden = false;
  expand.addEventListener('click', () => {
    const collapsed = grid.classList.toggle('is-collapsed');
    expand.setAttribute('aria-expanded', String(!collapsed));
    expand.textContent = collapsed ? 'Show all 22 tiles ↓' : 'Show fewer tiles ↑';
  });
})();
