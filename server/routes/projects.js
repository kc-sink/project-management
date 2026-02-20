const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = express.Router();

// Get all projects with client info
router.get('/', (req, res) => {
  const db = getDb();
  const projects = db.prepare(`
    SELECT p.*, c.name AS client_name, c.contact_name, c.contact_email
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    ORDER BY p.start_date DESC
  `).all();
  res.json(projects);
});

// Get single project with full detail (work streams, tasks, milestones)
router.get('/:id', (req, res) => {
  const db = getDb();
  const project = db.prepare(`
    SELECT p.*, c.name AS client_name, c.contact_name, c.contact_email
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const workStreams = db.prepare(
    'SELECT * FROM work_streams WHERE project_id = ? ORDER BY sort_order, start_date'
  ).all(req.params.id);

  for (const ws of workStreams) {
    ws.tasks = db.prepare(`
      SELECT t.*, tm.name AS assignee_name, tm.color AS assignee_color, tm.role AS assignee_role
      FROM tasks t
      LEFT JOIN team_members tm ON tm.id = t.assignee_id
      WHERE t.work_stream_id = ?
      ORDER BY t.sort_order, t.start_date
    `).all(ws.id);
  }

  project.work_streams = workStreams;
  project.milestones = db.prepare(
    'SELECT * FROM milestones WHERE project_id = ? ORDER BY date'
  ).all(req.params.id);

  res.json(project);
});

// Create project
router.post('/', (req, res) => {
  const { client_id, name, description, status, start_date, end_date } = req.body;
  if (!client_id || !name || !start_date || !end_date)
    return res.status(400).json({ error: 'client_id, name, start_date, end_date are required' });

  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO projects (id, client_id, name, description, status, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, client_id, name, description || null, status || 'active', start_date, end_date);

  const project = db.prepare(`
    SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON c.id = p.client_id WHERE p.id = ?
  `).get(id);
  res.status(201).json(project);
});

// Update project
router.put('/:id', (req, res) => {
  const { client_id, name, description, status, start_date, end_date } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE projects SET client_id = ?, name = ?, description = ?, status = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `).run(client_id, name, description || null, status, start_date, end_date, req.params.id);

  const project = db.prepare(`
    SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON c.id = p.client_id WHERE p.id = ?
  `).get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// Delete project
router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// --- Work Streams ---
router.get('/:id/workstreams', (req, res) => {
  const db = getDb();
  const workStreams = db.prepare(
    'SELECT * FROM work_streams WHERE project_id = ? ORDER BY sort_order, start_date'
  ).all(req.params.id);

  for (const ws of workStreams) {
    ws.tasks = db.prepare(`
      SELECT t.*, tm.name AS assignee_name, tm.color AS assignee_color
      FROM tasks t
      LEFT JOIN team_members tm ON tm.id = t.assignee_id
      WHERE t.work_stream_id = ?
      ORDER BY t.sort_order, t.start_date
    `).all(ws.id);
  }
  res.json(workStreams);
});

router.post('/:id/workstreams', (req, res) => {
  const { name, description, start_date, end_date, status, color, sort_order } = req.body;
  if (!name || !start_date || !end_date)
    return res.status(400).json({ error: 'name, start_date, end_date are required' });

  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO work_streams (id, project_id, name, description, start_date, end_date, status, color, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, name, description || null, start_date, end_date,
    status || 'not_started', color || '#6366f1', sort_order ?? 0);

  res.status(201).json(db.prepare('SELECT * FROM work_streams WHERE id = ?').get(id));
});

router.put('/:projectId/workstreams/:id', (req, res) => {
  const { name, description, start_date, end_date, status, color, sort_order } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE work_streams SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, color = ?, sort_order = ?
    WHERE id = ? AND project_id = ?
  `).run(name, description || null, start_date, end_date, status, color, sort_order ?? 0,
    req.params.id, req.params.projectId);

  const ws = db.prepare('SELECT * FROM work_streams WHERE id = ?').get(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Not found' });
  res.json(ws);
});

router.delete('/:projectId/workstreams/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM work_streams WHERE id = ? AND project_id = ?')
    .run(req.params.id, req.params.projectId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// --- Tasks ---
router.post('/:projectId/workstreams/:wsId/tasks', (req, res) => {
  const { name, description, start_date, end_date, status, assignee_id, sort_order } = req.body;
  if (!name || !start_date || !end_date)
    return res.status(400).json({ error: 'name, start_date, end_date are required' });

  const db = getDb();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO tasks (id, work_stream_id, name, description, start_date, end_date, status, assignee_id, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.wsId, name, description || null, start_date, end_date,
    status || 'not_started', assignee_id || null, sort_order ?? 0);

  const task = db.prepare(`
    SELECT t.*, tm.name AS assignee_name, tm.color AS assignee_color
    FROM tasks t LEFT JOIN team_members tm ON tm.id = t.assignee_id
    WHERE t.id = ?
  `).get(id);
  res.status(201).json(task);
});

router.put('/:projectId/workstreams/:wsId/tasks/:id', (req, res) => {
  const { name, description, start_date, end_date, status, assignee_id, sort_order } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE tasks SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, assignee_id = ?, sort_order = ?
    WHERE id = ? AND work_stream_id = ?
  `).run(name, description || null, start_date, end_date, status, assignee_id || null,
    sort_order ?? 0, req.params.id, req.params.wsId);

  const task = db.prepare(`
    SELECT t.*, tm.name AS assignee_name, tm.color AS assignee_color
    FROM tasks t LEFT JOIN team_members tm ON tm.id = t.assignee_id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

router.delete('/:projectId/workstreams/:wsId/tasks/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM tasks WHERE id = ? AND work_stream_id = ?')
    .run(req.params.id, req.params.wsId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// --- Milestones ---
router.get('/:id/milestones', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY date').all(req.params.id));
});

router.post('/:id/milestones', (req, res) => {
  const { name, date, status, notes } = req.body;
  if (!name || !date) return res.status(400).json({ error: 'name and date are required' });
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO milestones (id, project_id, name, date, status, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.params.id, name, date, status || 'upcoming', notes || null);
  res.status(201).json(db.prepare('SELECT * FROM milestones WHERE id = ?').get(id));
});

router.put('/:projectId/milestones/:id', (req, res) => {
  const { name, date, status, notes } = req.body;
  const db = getDb();
  db.prepare(
    'UPDATE milestones SET name = ?, date = ?, status = ?, notes = ? WHERE id = ? AND project_id = ?'
  ).run(name, date, status, notes || null, req.params.id, req.params.projectId);
  const m = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

router.delete('/:projectId/milestones/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM milestones WHERE id = ? AND project_id = ?')
    .run(req.params.id, req.params.projectId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
