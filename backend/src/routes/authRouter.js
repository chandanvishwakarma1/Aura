import express from 'express';
import authController from '../controller/authController.js';

const router = express.Router();

router.post('/register', authController.postRegister);
router.post('/google', authController.postGoogle)
router.post('/requestOtp', authController.postRequestOtp)
router.post('/checkUser', authController.postCheckUser)
router.post('/login', authController.postLogin);

export default router;