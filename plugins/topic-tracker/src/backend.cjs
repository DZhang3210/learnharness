'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { TOPICS } = require('./topics.cjs');
const { buildOverview } = require('./overview.cjs');

function readState(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (value && value.version === 1 && value.known && typeof value.known === 'object') return value;
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('The topic tracker could not read its saved choices.');
  }
  return { version: 1, known: {} };
}

function writeState(file, state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2));
  fs.renameSync(temporary, file);
}

function activate(ctx) {
  if (!ctx.learning?.listSessions) throw new Error('This app build cannot list sessions for the topic tracker.');
  const file = path.join(ctx.dataDirectory, 'state.json');

  ctx.handle('overview', () => buildOverview(TOPICS, ctx.learning.listSessions(), readState(file), new Date().toISOString()));

  ctx.handle('set-known', (input = {}) => {
    const topic = TOPICS.find(t => t.id === input.id);
    if (!topic || typeof input.known !== 'boolean') throw new Error('Unknown topic.');
    const state = readState(file);
    if (input.known) state.known[topic.id] = true;
    else delete state.known[topic.id];
    writeState(file, state);
    return buildOverview(TOPICS, ctx.learning.listSessions(), state, new Date().toISOString());
  });
}

module.exports = { activate };
