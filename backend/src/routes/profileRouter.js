import express from 'express'
import profileController from '../controller/profileController.js'
import protectedRoute from '../middleware/auth.middleware.js'
const router = express.Router()

router.get('/getProfiles', protectedRoute, profileController.getProfiles)
router.post('/follow/:id', protectedRoute, profileController.postFollow)
router.get('/follow/getFollows', protectedRoute, profileController.getFollows)
router.get('/trade/getTrades', protectedRoute, profileController.getTrades)


export default router;