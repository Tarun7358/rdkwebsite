import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { projectsApi } from '../../../api/projects';
import { ticketsApi } from '../../../api/tickets';
import { Badge, ProgressBar, TicketWorkspace } from '../../ui';

export const EmployeeDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const activeTicketId = useDashboardStore((s) => s.activeTicketId);
  const setActiveTicketId = useDashboardStore((s) => s.setActiveTicketId);
  const addToast = useAppStore((s) => s.addToast);

  const projects = useAppStore((s) => s.projects) ?? [];
  const tickets = useAppStore((s) => s.tickets) ?? [];

  // Filter assigned data
  const assignedProjects = user ? projects.filter((p) => p.assignedTo === user.email) : [];
  const assignedTickets = user ? tickets.filter((t) => t.assignedTo === user.email) : [];

  // Kanban state
  const [selectedProjId, setSelectedProjId] = useState(assignedProjects[0]?.id || '');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Tracker state
  const [isTracking, setIsTracking] = useState(false);
  const [timeSecs, setTimeSecs] = useState(0);
  const [trackLogs, setTrackLogs] = useState<Array<{ project: string; duration: string; date: string }>>([
    { project: 'Luxora Marketplace v2', duration: '03:15:00', date: 'Jul 13, 2026' },
    { project: 'Mobile App Redesign', duration: '01:45:00', date: 'Jul 12, 2026' },
  ]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync selected project ID if it gets loaded
  useEffect(() => {
    if (!selectedProjId && assignedProjects.length > 0) {
      setSelectedProjId(assignedProjects[0].id);
    }
  }, [assignedProjects, selectedProjId]);

  // Clock runner
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setTimeSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  const activeProject = projects.find((p) => p.id === selectedProjId);

  // Kanban status movements
  const handleMoveTask = async (taskId: number, currentStatus: string, direction: 'prev' | 'next') => {
    if (!selectedProjId) return;
    const stages = ['To Do', 'In Progress', 'In Review', 'Done'];
    const idx = stages.indexOf(currentStatus);
    let nextIdx = idx;
    if (direction === 'next') nextIdx = Math.min(stages.length - 1, idx + 1);
    if (direction === 'prev') nextIdx = Math.max(0, idx - 1);

    if (nextIdx === idx) return;
    const nextStatus = stages[nextIdx];

    try {
      const res = await projectsApi.updateKanban(taskId, selectedProjId, nextStatus);
      if (res.success) {
        addToast('Task status updated', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId || !newTaskTitle.trim()) return;
    try {
      const res = await projectsApi.addTask(selectedProjId, newTaskTitle.trim());
      if (res.success) {
        addToast('Task added to Kanban!', 'success');
        setNewTaskTitle('');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleTimer = () => {
    if (isTracking) {
      // Save logs
      const hrs = Math.floor(timeSecs / 3600);
      const mins = Math.floor((timeSecs % 3600) / 60);
      const secs = timeSecs % 60;
      const formatted = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      const log = {
        project: activeProject ? activeProject.name : 'General Tasks',
        duration: formatted,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setTrackLogs([log, ...trackLogs]);
      setTimeSecs(0);
      addToast(`Logged ${formatted} hours!`, 'success');
    } else {
      addToast('Timer started.', 'info');
    }
    setIsTracking(!isTracking);
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await ticketsApi.close(ticketId);
      if (res.success) {
        addToast('Ticket closed / resolved successfully.', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const formatSecs = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTicket = tickets.find((t) => t.id === activeTicketId);

  // Overview Tab
  if (activeTab === 'overview') {
    return (
      <div className="dash-overview">
        <div className="dash-card-grid">
          <div className="dash-card">
            <div className="dc-num">{assignedProjects.length}</div>
            <div className="dc-label">Assigned projects</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{assignedTickets.filter((t) => t.status === 'Active').length}</div>
            <div className="dc-label">Active tickets</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{trackLogs.length}</div>
            <div className="dc-label">Logged slots</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Active assigned projects</h3>
          {assignedProjects.length === 0 ? (
            <div style={{ padding: '2rem', background: 'var(--bg2)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
              No projects currently assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignedProjects.map((p) => (
                <div key={p.id} className="proj-item" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
                  <div className="proj-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="proj-name" style={{ fontWeight: 700 }}>{p.name}</span>
                    <Badge status={p.status} />
                  </div>
                  <ProgressBar progress={p.progress} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text3)' }}>
                    <span>{p.progress}% complete</span>
                    <span>Client: {p.client}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Kanban Tab
  if (activeTab === 'kanban') {
    const columns = ['To Do', 'In Progress', 'In Review', 'Done'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 180px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Kanban Workspace</h3>
            <select
              value={selectedProjId}
              onChange={(e) => setSelectedProjId(e.target.value)}
              style={{ padding: '0.4rem 1rem', background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px' }}
            >
              <option value="">Select project...</option>
              {assignedProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProjId && (
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="New task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                style={{ padding: '0.4rem 1rem', background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Add Task</button>
            </form>
          )}
        </div>

        {!selectedProjId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            Please select an assigned project to show the Kanban board.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            {columns.map((col) => {
              const colTasks = activeProject?.tasks?.filter((t) => t.status === col) || [];
              return (
                <div key={col} style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{col}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--card)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>{colTasks.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                    {colTasks.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textAlign: 'center', marginTop: '2rem' }}>No tasks.</div>
                    ) : (
                      colTasks.map((t) => (
                        <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{t.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <button
                              onClick={() => handleMoveTask(t.id, col, 'prev')}
                              disabled={col === 'To Do'}
                              className="btn btn-ghost"
                              style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem' }}
                            >
                              ◀
                            </button>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>ID: {t.id}</span>
                            <button
                              onClick={() => handleMoveTask(t.id, col, 'next')}
                              disabled={col === 'Done'}
                              className="btn btn-ghost"
                              style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem' }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Time Tracker Tab
  if (activeTab === 'tracker') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Time Logger</h3>

          <div style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>Active Workspace</div>
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            style={{ padding: '0.5rem 1rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '2rem', width: '250px' }}
          >
            {assignedProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div style={{ fontSize: '3rem', fontFamily: 'monospace', fontWeight: 800, marginBottom: '2rem', color: isTracking ? 'var(--blue)' : 'var(--text)' }}>
            {formatSecs(timeSecs)}
          </div>

          <button onClick={handleToggleTimer} className={`btn ${isTracking ? 'btn-outline' : 'btn-primary'}`} style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', fontWeight: 700, borderRadius: '50px' }}>
            {isTracking ? '■ Stop & Log Hours' : '▶ Start Tracking'}
          </button>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Tracking logs history</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
            {trackLogs.map((log, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.project}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{log.date}</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '0.9rem' }}>{log.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tickets Tab
  if (activeTab === 'tickets') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: 'calc(100vh - 180px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Assigned support tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                style={{
                  background: activeTicketId === t.id ? 'var(--bg2)' : 'var(--card)',
                  border: `1px solid ${activeTicketId === t.id ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text3)' }}>{t.id}</span>
                  <Badge status={t.status} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.25rem' }}>Client: {t.client}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 800 }}>{selectedTicket.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>ID: {selectedTicket.id} · Priority: {selectedTicket.priority}</span>
                </div>
                <div>
                  {selectedTicket.status === 'Active' ? (
                    <button onClick={() => handleResolveTicket(selectedTicket.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px solid #10B981', color: '#10B981' }}>
                      Mark as Resolved
                    </button>
                  ) : (
                    <Badge status={selectedTicket.status} />
                  )}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <TicketWorkspace ticket={selectedTicket} />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexDirection: 'column', gap: '0.5rem' }}>
              <span>🎫</span>
              <span>Select an assigned ticket to review details and chat.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
export default EmployeeDashboard;
