import { Request, Response } from "express";
import Task from "../models/task.model";
import { ITask } from "../models/task.model";

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const task: ITask = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });

    }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const tasks: ITask[] = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const task: ITask | null = await Task.findById(req.params.id).populate('assignedTo', 'name email');
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const task: ITask | null = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const task: ITask | null = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            res.status(404).json({message: 'Task not found'});
            return;
        }
        res.status(200).json({message: 'Task deleted'});
    } catch (error) {
        res.status(500).json({error: (error as Error).message});
    }
};
