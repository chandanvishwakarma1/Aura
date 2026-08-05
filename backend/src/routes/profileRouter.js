import express from 'express'
import profileController from '../controller/profileController.js'
import protectedRoute from '../middleware/auth.middleware.js'
const router = express.Router()

router.get('/', protectedRoute, profileController.getProfiles)
router.get('/:id', protectedRoute, profileController.getProfileById)
router.get('/:id/returns', protectedRoute, profileController.getProfileReturns)
router.post('/follow/:id', protectedRoute, profileController.postFollow)
router.get('/follow', protectedRoute, profileController.getFollows)
router.get('/trade', protectedRoute, profileController.getTrades)


export default router;