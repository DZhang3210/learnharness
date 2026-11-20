'use strict';
// Pure: topics + session summaries + saved choices in, the tracker's picture out.
// A session counts for a topic when its title (its first message) starts with
// the text the tracker pre-fills, e.g. "Teach me: Bellman Equations".

const TEACH_PREFIX = 'Teach me: ';
const PRACTICE_PREFIX = 'Practice: ';
const REVISIT_AFTER_DAYS = 14;
const LIST_LIMIT = 5;

function sessionText(kind, topicName) {
  return (kind === 'practice' ? PRACTICE_PREFIX : TEACH_PREFIX) + topicName;
}

function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Titles may be cut short with an ellipsis, so a long topic still matches its truncated title. */
function titleMatches(title, expected) {
  const t = normalize(title);
  const key = normalize(expected);
  if (t.startsWith(key)) return t.length === key.length || !/[a-z0-9]/.test(t[key.length]);
  const cut = t.replace(/(…|\.\.\.)$/, '').trim();
  return cut !== t && cut.length >= 20 && key.startsWith(cut);
}

function later(a, b) { return !a || (b && b > a) ? b : a; }

function daysBetween(from, to) {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000;
}

/**
 * @param topics   [{ id, name, section }]
 * @param sessions [{ id, title, kind, updatedAt }]
 * @param state    { known: { [topicId]: true } }
 * @param now      ISO time
 */
function buildOverview(topics, sessions, state, now) {
  const known = state?.known ?? {};
  const rows = topics.map(topic => {
    const match = kind => sessions
      .filter(s => (s.kind === 'practice' ? 'practice' : 'teach') === kind && titleMatches(s.title, sessionText(kind, topic.name)))
      .map(s => ({ id: s.id, title: s.title, updatedAt: s.updatedAt }))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    const teach = match('teach');
    const practice = match('practice');
    const lastTaught = teach[0]?.updatedAt ?? null;
    const lastPractised = practice[0]?.updatedAt ?? null;
    const lastActivity = later(lastTaught, lastPractised);
    const status = practice.length ? 'practised' : teach.length ? 'taught' : known[topic.id] ? 'known' : 'new';
    const latest = [...teach, ...practice].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0] ?? null;
    return {
      ...topic, status, known: known[topic.id] === true, lastActivity,
      teachCount: teach.length, practiceCount: practice.length, latestSessionId: latest?.id ?? null,
      teachText: sessionText('teach', topic.name), practiceText: sessionText('practice', topic.name),
    };
  });
  const oldestFirst = (a, b) => (a.lastActivity < b.lastActivity ? -1 : 1);
  const counts = { total: rows.length, new: 0, known: 0, taught: 0, practised: 0 };
  for (const row of rows) counts[row.status] += 1;
  return {
    counts,
    nextUp: rows.find(row => row.status === 'new')?.id ?? null,
    readyToPractise: rows.filter(row => row.status === 'taught').sort(oldestFirst).slice(0, LIST_LIMIT).map(row => row.id),
    revisit: rows
      .filter(row => row.status === 'practised' && daysBetween(row.lastActivity, now) >= REVISIT_AFTER_DAYS)
      .sort(oldestFirst).slice(0, LIST_LIMIT).map(row => row.id),
    topics: rows,
  };
}

module.exports = { buildOverview, titleMatches, sessionText, REVISIT_AFTER_DAYS };
