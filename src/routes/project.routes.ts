import express from "express";
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addTaskToProject,
    removeTaskFromProject
} from '../controllers/project.controller';
import { 
    validateRequest, 
    projectSchema, 
    addTaskToProjectSchema, 
    removeTaskFromProjectSchema 
} from '../middleware/validation.middleware';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', auth, validateRequest(projectSchema), createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, validateRequest(projectSchema), updateProject);
router.delete('/:id', auth, deleteProject);
router.post('/:id/tasks', auth, validateRequest(addTaskToProjectSchema), addTaskToProject);
router.delete('/:id/tasks', auth, validateRequest(removeTaskFromProjectSchema), removeTaskFromProject);

export default router;

