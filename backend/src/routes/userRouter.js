import express from 'express'
import userController from '../controller/userController.js'
import protectedRoute, { internalRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/checkUsername', userController.checkUsername)
router.post('/deviceToken', protectedRoute, userController.postDeviceToken)
router.post('/notify/trade', internalRoute, userController.postTradeNotification)

router.get('/portfolio', protectedRoute,userController.getPortfolioSummary )
router.get('/position/:id', protectedRoute, userController.getPositionById)
router.get('/follow/profile/:id', protectedRoute, userController.getFollowByProfileId)
router.get('/home', protectedRoute, userController.getHomeSummary)
router.get('/returns', protectedRoute, userController.getUserReturns)
router.get('/recentTrades', protectedRoute, userController.getRecentTrades)
router.get('/trades', protectedRoute, userController.getTrades)
router.get('/trade/:id', protectedRoute, userController.getTradeById)
router.get('/:id', protectedRoute, userController.getUpdatedUser)

export default router;