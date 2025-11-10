import { useState, useEffect, useCallback } from 'react';
import { projectsAPI, tasksAPI } from '../services/api';
import './ProjectDetail.css';

const ProjectDetail = ({ project, onClose, onUpdate }) => {
  const [projectTasks, setProjectTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const fetchProjectTasks = useCallback(async () => {
    try {
 
      const response = await tasksAPI.getAll({ projectId: project._id, limit: 1000 });
      const tasks = response.data.docs || response.data || [];
      setProjectTasks(tasks);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [project._id]);

  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getAll({ limit: 1000 });
      setAllTasks(response.data.docs || response.data || []);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  }, []);

  useEffect(() => {
    fetchProjectTasks();
    fetchAllTasks();
  }, [fetchProjectTasks, fetchAllTasks]);

  const handleAddTask = async () => {
    if (!selectedTaskId) return;
    
    try {
      await projectsAPI.addTask(project._id, selectedTaskId);
      fetchProjectTasks();
      setShowAddTask(false);
      setSelectedTaskId('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding task to project:', error);
      alert('Error adding task to project. Please try again.');
    }
  };

  const handleRemoveTask = async (taskId) => {
    if (!window.confirm('Remove this task from the project?')) return;
    
    try {
      await projectsAPI.removeTask(project._id, taskId);
      fetchProjectTasks();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing task from project:', error);
      alert('Error removing task from project. Please try again.');
    }
  };

  const getAvailableTasks = () => {
    const projectTaskIds = projectTasks.map(t => t._id || t.toString());
    return allTasks.filter(task => {
      const taskId = task._id || task;
      return !projectTaskIds.includes(taskId.toString());
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': '#6b7280',
      'In Progress': '#3b82f6',
      'Blocked': '#ef4444',
      'Done': '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-detail-header">
          <div>
            <h2>{project.name}</h2>
            {project.description && <p className="project-description">{project.description}</p>}
          </div>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="project-detail-content">
          <div className="project-tasks-section">
            <div className="section-header">
              <h3>Tasks ({projectTasks.length})</h3>
              <button onClick={() => setShowAddTask(true)} className="btn-primary btn-small">
                + Add Task
              </button>
            </div>

            {showAddTask && (
              <div className="add-task-form">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="task-select"
                >
                  <option value="">Select a task to add</option>
                  {getAvailableTasks().map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                <div className="add-task-actions">
                  <button onClick={handleAddTask} className="btn-primary" disabled={!selectedTaskId}>
                    Add
                  </button>
                  <button onClick={() => { setShowAddTask(false); setSelectedTaskId(''); }} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {projectTasks.length === 0 ? (
              <p className="no-tasks">No tasks in this project yet.</p>
            ) : (
              <div className="project-tasks-list">
                {projectTasks.map((task) => (
                  <div key={task._id} className="project-task-item">
                    <div className="task-item-header">
                      <h4>{task.title}</h4>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="task-item-description">{task.description}</p>
                    )}
                    <button
                      onClick={() => handleRemoveTask(task._id)}
                      className="btn-remove-task"
                    >
                      Remove from Project
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

