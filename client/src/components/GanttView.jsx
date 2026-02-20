import { useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

function toGanttTask(item, type, project) {
  const start = new Date(item.start_date + 'T00:00:00');
  const end = new Date(item.end_date + 'T23:59:59');
  return {
    id: item.id,
    name: item.name,
    start,
    end,
    type,
    progress: item.status === 'completed' ? 100 : item.status === 'in_progress' ? 50 : 0,
    styles: {
      backgroundColor: item.color || project?.color || '#6366f1',
      backgroundSelectedColor: '#4f46e5',
      progressColor: '#fff',
      progressSelectedColor: '#fff',
    },
    isDisabled: false,
    project: type === 'task' ? item.work_stream_id : undefined,
    hideChildren: false,
  };
}

export default function GanttView({ project }) {
  const tasks = useMemo(() => {
    if (!project) return [];

    const items = [];

    // Project bar
    items.push({
      id: project.id,
      name: project.name,
      start: new Date(project.start_date + 'T00:00:00'),
      end: new Date(project.end_date + 'T23:59:59'),
      type: 'project',
      progress: 0,
      hideChildren: false,
      styles: { backgroundColor: '#18181b', backgroundSelectedColor: '#3f3f46' },
    });

    // Work streams + their tasks
    for (const ws of project.work_streams || []) {
      items.push({
        id: ws.id,
        name: ws.name,
        start: new Date(ws.start_date + 'T00:00:00'),
        end: new Date(ws.end_date + 'T23:59:59'),
        type: 'project',
        progress: ws.status === 'completed' ? 100 : ws.status === 'in_progress' ? 50 : 0,
        project: project.id,
        hideChildren: false,
        styles: {
          backgroundColor: ws.color,
          backgroundSelectedColor: ws.color,
        },
      });

      for (const task of ws.tasks || []) {
        items.push({
          id: task.id,
          name: task.assignee_name ? `${task.name} (${task.assignee_name})` : task.name,
          start: new Date(task.start_date + 'T00:00:00'),
          end: new Date(task.end_date + 'T23:59:59'),
          type: 'task',
          progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
          project: ws.id,
          styles: {
            backgroundColor: task.assignee_color || ws.color,
            backgroundSelectedColor: task.assignee_color || ws.color,
            progressColor: 'rgba(255,255,255,0.4)',
          },
        });
      }
    }

    // Milestones
    for (const m of project.milestones || []) {
      items.push({
        id: m.id,
        name: m.name,
        start: new Date(m.date + 'T00:00:00'),
        end: new Date(m.date + 'T23:59:59'),
        type: 'milestone',
        progress: m.status === 'completed' ? 100 : 0,
        project: project.id,
        styles: {
          backgroundColor: m.status === 'completed' ? '#10b981' : m.status === 'missed' ? '#ef4444' : '#f59e0b',
          backgroundSelectedColor: '#d97706',
        },
      });
    }

    return items;
  }, [project]);

  if (!tasks.length) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
        Add work streams and tasks to see the timeline.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Week}
        columnWidth={60}
        listCellWidth="200px"
        rowHeight={40}
        barCornerRadius={4}
        fontSize="12px"
        todayColor="rgba(99,102,241,0.08)"
        onSelect={() => {}}
        onDateChange={() => {}}
        onProgressChange={() => {}}
      />
    </div>
  );
}
