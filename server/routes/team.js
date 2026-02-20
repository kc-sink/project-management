const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const members = db.prepare('SELECT * FROM team_members ORDER BY name').all();
  res.json(members);
});

router.post('/', (req, res) => {
  const { name, role, email, color } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'name and role are required' });
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO team_members (id, name, role, email, color) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, role, email || null, color || '#6366f1');
  res.status(201).json(db.prepare('SELECT * FROM team_members WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, role, email, color } = req.body;
  const db = getDb();
  db.prepare(
    'UPDATE team_members SET name = ?, role = ?, email = ?, color = ? WHERE id = ?'
  ).run(name, role, email || null, color || '#6366f1', req.params.id);
  const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Not found' });
  res.json(member);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
