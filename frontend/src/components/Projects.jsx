import { useState, useEffect } from 'react';
import { projectsAPI, tasksAPI } from '../services/api';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll({ limit: 1000 });
      setTasks(response.data.docs || response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject._id, formData);
      } else {
        await projectsAPI.create(formData);
      }
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(id);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter((task) => task.projectId?._id === projectId || task.projectId === projectId);
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects">
      <div className="projects-header">
        <h1>Projects</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProject ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingProject ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="no-data">No projects yet. Create your first project!</p>
        ) : (
          projects.map((project) => {
            const projectTasks = getProjectTasks(project._id);
            return (
              <div key={project._id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className="task-count">{projectTasks.length} tasks</span>
                </div>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                {projectTasks.length > 0 && (
                  <div className="project-tasks">
                    <h4>Tasks:</h4>
                    <ul>
                      {projectTasks.slice(0, 5).map((task) => (
                        <li key={task._id}>{task.title}</li>
                      ))}
                      {projectTasks.length > 5 && (
                        <li>...and {projectTasks.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="project-actions">
                  <button onClick={() => handleEdit(project)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Projects;

