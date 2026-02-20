const express = require('express');
const cors = require('cors');
const path = require('path');

const teamRouter = require('./routes/team');
const clientsRouter = require('./routes/clients');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/team', teamRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);

// Serve the client-facing public view (no auth)
// The React app handles routing; serve index.html for all non-API routes
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Design Studio PM running at http://localhost:${PORT}`);
});
