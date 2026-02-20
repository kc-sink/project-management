import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE = '/api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get(`${BASE}/projects`);
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { projects, loading, reload: load };
}

export function useProject(id) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await axios.get(`${BASE}/projects/${id}`);
    setProject(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { project, loading, reload: load };
}

export function useTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get(`${BASE}/team`);
    setTeam(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { team, loading, reload: load };
}

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await axios.get(`${BASE}/clients`);
    setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { clients, loading, reload: load };
}

// Generic CRUD helpers
export const api = {
  // Projects
  createProject: (data) => axios.post(`${BASE}/projects`, data),
  updateProject: (id, data) => axios.put(`${BASE}/projects/${id}`, data),
  deleteProject: (id) => axios.delete(`${BASE}/projects/${id}`),

  // Work streams
  createWorkStream: (projectId, data) => axios.post(`${BASE}/projects/${projectId}/workstreams`, data),
  updateWorkStream: (projectId, id, data) => axios.put(`${BASE}/projects/${projectId}/workstreams/${id}`, data),
  deleteWorkStream: (projectId, id) => axios.delete(`${BASE}/projects/${projectId}/workstreams/${id}`),

  // Tasks
  createTask: (projectId, wsId, data) => axios.post(`${BASE}/projects/${projectId}/workstreams/${wsId}/tasks`, data),
  updateTask: (projectId, wsId, id, data) => axios.put(`${BASE}/projects/${projectId}/workstreams/${wsId}/tasks/${id}`, data),
  deleteTask: (projectId, wsId, id) => axios.delete(`${BASE}/projects/${projectId}/workstreams/${wsId}/tasks/${id}`),

  // Milestones
  createMilestone: (projectId, data) => axios.post(`${BASE}/projects/${projectId}/milestones`, data),
  updateMilestone: (projectId, id, data) => axios.put(`${BASE}/projects/${projectId}/milestones/${id}`, data),
  deleteMilestone: (projectId, id) => axios.delete(`${BASE}/projects/${projectId}/milestones/${id}`),

  // Team
  createTeamMember: (data) => axios.post(`${BASE}/team`, data),
  updateTeamMember: (id, data) => axios.put(`${BASE}/team/${id}`, data),
  deleteTeamMember: (id) => axios.delete(`${BASE}/team/${id}`),

  // Clients
  createClient: (data) => axios.post(`${BASE}/clients`, data),
  updateClient: (id, data) => axios.put(`${BASE}/clients/${id}`, data),
  deleteClient: (id) => axios.delete(`${BASE}/clients/${id}`),
};
