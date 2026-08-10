import express from 'express'
import userController from '../controller/userController.js'
import protectedRoute from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/checkUsername', userController.checkUsername)
router.get('/portfolio', protectedRoute,userController.getPortfolioSummary )
router.get('/:id/returns', protectedRoute, userController.getUserReturns)
router.get('/:id', protectedRoute, userController.getUpdatedUser)

export default router;