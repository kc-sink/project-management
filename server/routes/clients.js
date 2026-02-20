const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
  res.json(clients);
});

router.post('/', (req, res) => {
  const { name, contact_name, contact_email, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO clients (id, name, contact_name, contact_email, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, contact_name || null, contact_email || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM clients WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const { name, contact_name, contact_email, notes } = req.body;
  const db = getDb();
  db.prepare(
    'UPDATE clients SET name = ?, contact_name = ?, contact_email = ?, notes = ? WHERE id = ?'
  ).run(name, contact_name || null, contact_email || null, notes || null, req.params.id);
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Not found' });
  res.json(client);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
