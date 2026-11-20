// The Topics page: every study topic, its status from your sessions, and
// buttons that open a pre-filled Teach or Practice draft.

const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h7"/></svg>';

const STATUS = {
  new: 'Not started',
  known: 'Already known',
  taught: 'Taught',
  practised: 'Practised',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function ago(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
}

export function activate(ctx) {
  function teach(row) { ctx.app.openNewSession({ mode: 'teach', text: row.teachText }); }
  function practise(row) { ctx.app.openNewSession({ mode: 'practice', text: row.practiceText }); }

  function button(label, onClick, primary) {
    const b = el('button', primary ? 'tt-button tt-primary' : 'tt-button', label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  function topicActions(row, setKnown) {
    const actions = el('div', 'tt-actions');
    actions.append(button('Teach', () => teach(row), row.status === 'new'));
    if (row.status === 'taught' || row.status === 'practised') actions.append(button('Practice', () => practise(row), row.status === 'taught'));
    if (row.latestSessionId) actions.append(button('Open last', () => ctx.app.openSession(row.latestSessionId)));
    if (row.status === 'new' || row.status === 'known') {
      const label = el('label', 'tt-known');
      const box = el('input');
      box.type = 'checkbox';
      box.checked = row.known;
      box.addEventListener('change', () => setKnown(row.id, box.checked));
      label.append(box, document.createTextNode(' Already know it'));
      actions.append(label);
    }
    return actions;
  }

  function card(title, rows, empty, render) {
    const box = el('section', 'tt-card');
    box.append(el('h2', 'tt-card-title', title));
    if (!rows.length) box.append(el('p', 'tt-muted', empty));
    for (const row of rows) box.append(render(row));
    return box;
  }

  function render(root, data, setKnown) {
    root.replaceChildren();
    const byId = new Map(data.topics.map(t => [t.id, t]));
    const { counts } = data;

    const head = el('header', 'tt-head');
    const done = counts.taught + counts.practised + counts.known;
    head.append(el('p', 'tt-muted', `${done} of ${counts.total} covered · ${counts.practised} practised · ${counts.taught} taught, not yet practised · ${counts.known} already known`));
    const bar = el('div', 'tt-bar');
    const fill = el('div', 'tt-bar-fill');
    fill.style.width = `${Math.round((done / Math.max(1, counts.total)) * 100)}%`;
    bar.append(fill);
    head.append(bar);
    root.append(head);

    const cards = el('div', 'tt-cards');
    const next = data.nextUp ? byId.get(data.nextUp) : null;
    cards.append(card('Next new topic', next ? [next] : [], 'Every topic has been started.', row => {
      const line = el('div', 'tt-line');
      line.append(el('div', 'tt-name', `${row.name}`), el('div', 'tt-muted tt-small', row.section), topicActions(row, setKnown));
      return line;
    }));
    const practiseRow = row => {
      const line = el('div', 'tt-line');
      line.append(el('div', 'tt-name', row.name), el('div', 'tt-muted tt-small', `Last session ${ago(row.lastActivity)}`), topicActions(row, setKnown));
      return line;
    };
    cards.append(card('Ready to practise', data.readyToPractise.map(id => byId.get(id)), 'Topics appear here once a Teach session exists for them.', practiseRow));
    cards.append(card('Worth revisiting', data.revisit.map(id => byId.get(id)), 'Practised topics show up here after two weeks without a session.', practiseRow));
    root.append(cards);

    const sections = new Map();
    for (const row of data.topics) {
      if (!sections.has(row.section)) sections.set(row.section, []);
      sections.get(row.section).push(row);
    }
    for (const [section, rows] of sections) {
      const covered = rows.filter(r => r.status !== 'new').length;
      const details = el('details', 'tt-section');
      details.open = covered < rows.length && covered > 0;
      const summary = el('summary', 'tt-summary');
      summary.append(el('span', 'tt-name', section), el('span', 'tt-muted tt-small', ` ${covered}/${rows.length}`));
      details.append(summary);
      const list = el('div', 'tt-list');
      for (const row of rows) {
        const line = el('div', `tt-row tt-${row.status}`);
        const info = el('div', 'tt-info');
        info.append(el('span', 'tt-name', row.name), el('span', `tt-chip tt-chip-${row.status}`, STATUS[row.status]));
        if (row.lastActivity) info.append(el('span', 'tt-muted tt-small', ago(row.lastActivity)));
        line.append(info, topicActions(row, setKnown));
        list.append(line);
      }
      details.append(list);
      root.append(details);
    }
  }

  ctx.registerView({
    id: 'topics',
    name: 'Topics',
    mount(container, signal) {
      const root = el('div', 'tt-root');
      container.append(root);
      root.append(el('p', 'tt-muted', 'Loading topics…'));
      const showError = error => {
        if (signal.aborted) return;
        root.replaceChildren(el('p', 'tt-error', error?.message || 'The topic tracker could not load.'));
      };
      const setKnown = (id, known) => {
        ctx.call('set-known', { id, known }).then(data => { if (!signal.aborted) render(root, data, setKnown); }).catch(showError);
      };
      const load = () => ctx.call('overview').then(data => { if (!signal.aborted) render(root, data, setKnown); }).catch(showError);
      void load();
      const stop = ctx.onResync(() => { void load(); });
      return () => { stop(); container.replaceChildren(); };
    },
  });
  ctx.registerAction({ id: 'open', name: 'Topics', icon, run: () => ctx.app.openView('topics') });
  ctx.placeAction({ id: 'open-sidebar', actionId: 'open', location: 'sidebar' });
}
