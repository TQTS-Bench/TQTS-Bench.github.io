(() => {
  'use strict';
  document.querySelectorAll('[data-coming-soon]').forEach(button => {
    button.addEventListener('click', () => {
      const status = document.querySelector('#resource-status');
      status.hidden = false;
      status.textContent = `${button.dataset.comingSoon} coming soon`;
    });
  });
  const data = window.TQTS_RESULTS;
  if (!data || !Array.isArray(data.entries)) return;
  const body = document.querySelector('#results-body');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const search = document.querySelector('#search');
  let category = 'overall';
  let metric = 'overall';
  let direction = 'desc';
  const titles = { easy: 'Easy', medium: 'Medium', hard: 'Hard', overall: 'Overall' };
  const notes = {
    overall: 'Models and methods are shown together. All methods use GPT-4o-mini; model and method results do not share a common backbone.',
    method: 'All six text-to-query methods use GPT-4o-mini as the unified LLM backbone. Five methods target RDBs; PromCopilot targets TSDBs.',
    model: 'Seven large language models, evaluated directly on TQTS-Bench. Model names and scores follow the paper.'
  };
  function render() {
    const selected = data.entries.filter(entry => category === 'overall' || entry.type === category);
    const ordered = selected.slice().sort((a, b) => (direction === 'desc' ? b[metric] - a[metric] : a[metric] - b[metric]) || a.name.localeCompare(b.name));
    const ranking = selected.slice().sort((a, b) => b[metric] - a[metric]);
    const needle = search.value.trim().toLocaleLowerCase();
    const matches = ordered.filter(entry => entry.name.toLocaleLowerCase().includes(needle));
    body.replaceChildren();
    for (const entry of matches) {
      const rank = ranking.findIndex(item => item[metric] === entry[metric]) + 1;
      const row = document.createElement('tr');
      if (rank === 1) row.className = 'first-place';
      const rankCell = document.createElement('td');
      rankCell.className = 'rank';
      const rankLabel = document.createElement('span');
      rankLabel.textContent = String(rank);
      rankCell.append(rankLabel);
      const date = document.createElement('time');
      date.dateTime = data.reportingDeadline;
      date.title = data.reportingDateBasis;
      date.textContent = data.reportingDateLabel;
      const timezone = document.createElement('small');
      timezone.textContent = data.reportingTimezone;
      rankCell.append(date, timezone);
      const nameCell = document.createElement('td');
      nameCell.className = 'entry-name';
      const name = document.createElement('strong');
      name.textContent = entry.name;
      const detail = document.createElement('small');
      detail.textContent = entry.type === 'method' ? `${entry.group} / ${data.methodBackbone}` : entry.group;
      nameCell.append(name, detail);
      if (entry.projectUrl) {
        const project = document.createElement('a');
        project.href = entry.projectUrl;
        project.target = '_blank';
        project.rel = 'noopener noreferrer';
        project.className = 'project-link';
        project.textContent = 'Project documentation ↗';
        project.setAttribute('aria-label', `${entry.name} original project documentation`);
        nameCell.append(project);
      }
      row.append(rankCell, nameCell);
      for (const key of ['overall']) {
        const cell = document.createElement('td');
        cell.className = `score${key === 'overall' ? ' overall-score' : ''}`;
        cell.textContent = entry[key].toFixed(2);
        row.append(cell);
      }
      body.append(row);
    }
    if (!matches.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.className = 'empty-state';
      cell.textContent = 'No matching entries. Try another name or clear the search.';
      row.append(cell);
      body.append(row);
    }
    document.querySelector('#result-count').textContent = needle ? `${matches.length} of ${selected.length} entries` : `${selected.length} entries`;
    document.querySelector('#category-note').textContent = notes[category];
    document.querySelector('#sort-description').textContent = `Ranked by ${titles[metric]} EX, ${direction === 'desc' ? 'highest' : 'lowest'} first`;
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
    render();
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
      render();
    });
  });
  search.addEventListener('input', render);
  document.querySelector('.tabs').hidden = false;
  document.querySelector('.search-control').hidden = false;
  selectTab(tabs[0]);

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
