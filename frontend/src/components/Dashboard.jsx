import { useEffect, useState } from 'react';
import { tasksAPI, projectsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    tasksByStatus: {},
    totalProjects: 0,
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.getAll({ limit: 1000 }),
        projectsAPI.getAll(),
      ]);

      const tasks = tasksRes.data.docs || tasksRes.data || [];
      const projects = projectsRes.data || [];

      const tasksByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalTasks: tasks.length,
        tasksByStatus,
        totalProjects: projects.length,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks by Status</h3>
          <div className="status-breakdown">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-label">{status}:</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
            {Object.keys(stats.tasksByStatus).length === 0 && (
              <p className="no-data">No tasks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

