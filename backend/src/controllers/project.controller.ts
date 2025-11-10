import { Request, Response } from "express";
import Project, { IProject } from "../models/project.model";
import Task from "../models/task.model";

export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project: IProject = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const projects: IProject[] = await Project.find()
            .populate('tasks', 'title description status');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
        const project: IProject | null = await Project.findById(req.params.id)
            .populate('tasks', 'title description status assignedTo createdAt finishedBy tags');
        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project: IProject | null = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('tasks', 'title description status');
        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project: IProject | null = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        // Optionally: Remove projectId from all tasks that belonged to this project
        await Task.updateMany(
            { projectId: req.params.id },
            { $unset: { projectId: 1 } }
        );
        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const addTaskToProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.body;
        const project: IProject | null = await Project.findById(req.params.id);
        
        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        // Add task to project's tasks array if not already present
        if (!project.tasks.includes(taskId as any)) {
            project.tasks.push(taskId as any);
            await project.save();
        }

        // Update task's projectId
        task.projectId = req.params.id as any;
        await task.save();

        const updatedProject = await Project.findById(req.params.id)
            .populate('tasks', 'title description status');
        
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const removeTaskFromProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.body;
        const project: IProject | null = await Project.findById(req.params.id);
        
        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        // Remove task from project's tasks array
        project.tasks = project.tasks.filter(
            (id) => id.toString() !== taskId
        ) as any;
        await project.save();

        // Remove projectId from task
        await Task.findByIdAndUpdate(taskId, { $unset: { projectId: 1 } });

        const updatedProject = await Project.findById(req.params.id)
            .populate('tasks', 'title description status');
        
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

