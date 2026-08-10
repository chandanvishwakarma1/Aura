import express from 'express'
import userController from '../controller/userController.js'
import protectedRoute from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/checkUsername', userController.checkUsername)
router.get('/portfolio', protectedRoute,userController.getPortfolioSummary )
router.get('/home', protectedRoute, userController.getHomeSummary)
router.get('/returns', protectedRoute, userController.getUserReturns)
router.get('/trades', protectedRoute, userController.getTrades)
router.get('/:id', protectedRoute, userController.getUpdatedUser)

export default router;