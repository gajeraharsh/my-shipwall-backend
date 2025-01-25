import express from 'express';
import { getUsers, createUser } from '../controllers/userController';

const router = express.Router();

router.get('/', (req,res) => {
    res.send('hello world')
});
router.post('/', createUser);

export default router;
