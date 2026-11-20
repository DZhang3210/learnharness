'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildOverview, titleMatches } = require('../src/overview.cjs');
const { TOPICS } = require('../src/topics.cjs');

const topics = [
  { id: 'dot-product', name: 'Dot product', section: 'Linear Algebra' },
  { id: 'rope', name: 'RoPE', section: 'LLMs' },
  { id: 'bellman', name: 'Bellman Equations', section: 'Reinforcement Learning' },
  { id: 'ddpm', name: 'Diffusion Reverse Process (DDIM / DDPM)', section: 'Generative Modelling' },
];
const NOW = '2026-11-20T12:00:00.000Z';
const at = days => new Date(Date.parse(NOW) - days * 86_400_000).toISOString();

test('statuses come from session titles and kinds', () => {
  const sessions = [
    { id: 't1', kind: 'teach', title: 'Teach me: RoPE', updatedAt: at(3) },
    { id: 't2', kind: 'teach', title: 'Teach me: Bellman Equations', updatedAt: at(30) },
    { id: 'p1', kind: 'practice', title: 'Practice: Bellman Equations', updatedAt: at(20) },
  ];
  const o = buildOverview(topics, sessions, { known: {} }, NOW);
  const status = Object.fromEntries(o.topics.map(t => [t.id, t.status]));
  assert.deepEqual(status, { 'dot-product': 'new', rope: 'taught', bellman: 'practised', ddpm: 'new' });
  assert.equal(o.topics.find(t => t.id === 'bellman').latestSessionId, 'p1');
  assert.equal(o.nextUp, 'dot-product');
  assert.deepEqual(o.readyToPractise, ['rope']);
  assert.deepEqual(o.revisit, ['bellman']);
  assert.deepEqual(o.counts, { total: 4, new: 2, known: 0, taught: 1, practised: 1 });
});

test('a teach session never counts as practice, and vice versa', () => {
  const o = buildOverview(topics, [{ id: 'x', kind: 'teach', title: 'Practice: RoPE', updatedAt: at(1) }], { known: {} }, NOW);
  assert.equal(o.topics.find(t => t.id === 'rope').status, 'new');
});

test('"Already know it" is skipped for next-up, but sessions still win', () => {
  const o = buildOverview(topics, [{ id: 't', kind: 'teach', title: 'Teach me: RoPE', updatedAt: at(1) }], { known: { 'dot-product': true, rope: true } }, NOW);
  assert.equal(o.topics.find(t => t.id === 'dot-product').status, 'known');
  assert.equal(o.topics.find(t => t.id === 'rope').status, 'taught');
  assert.equal(o.nextUp, 'bellman');
});

test('recently practised topics are not yet worth revisiting', () => {
  const o = buildOverview(topics, [{ id: 'p', kind: 'practice', title: 'Practice: RoPE', updatedAt: at(2) }], { known: {} }, NOW);
  assert.deepEqual(o.revisit, []);
});

test('title matching respects word boundaries and truncated titles', () => {
  assert.ok(titleMatches('Teach me: RoPE', 'Teach me: RoPE'));
  assert.ok(titleMatches('teach me:  rope — and more', 'Teach me: RoPE'));
  assert.ok(!titleMatches('Teach me: Reinforcement learning', 'Teach me: RoPE'));
  assert.ok(!titleMatches('Teach me: S4D', 'Teach me: S4'));
  assert.ok(titleMatches('Teach me: Diffusion Reverse Process (DDI…', 'Teach me: Diffusion Reverse Process (DDIM / DDPM)'));
  assert.ok(!titleMatches('Teach me…', 'Teach me: RoPE'));
});

test('the built-in list has every topic once, with unique ids', () => {
  assert.equal(TOPICS.length, 123);
  assert.equal(new Set(TOPICS.map(t => t.id)).size, TOPICS.length);
});
