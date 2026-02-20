import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import ClientView from './pages/ClientView';

export default function App() {
  return (
    <Routes>
      {/* Client-facing public view (no sidebar) */}
      <Route path="/client/:projectId" element={<ClientView />} />

      {/* Internal app */}
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/clients" element={<ClientsPage />} />
      </Route>
    </Routes>
  );
}
