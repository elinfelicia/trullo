import express from "express";
import {createUser, getUsers, getUserById, updateUser, deleteUser} from '../controllers/user.controller';
import {validateRequest, userSchema} from '../middleware/validation.middleware';

const router = express.Router();

router.post('/', validateRequest(userSchema), createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateRequest(userSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
