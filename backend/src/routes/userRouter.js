import express from 'express'
import userController from '../controller/userController.js'

const router = express.Router()

router.post('/checkUsername', userController.checkUsername)

export default router;