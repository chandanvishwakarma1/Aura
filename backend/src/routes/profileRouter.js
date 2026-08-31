import express from 'express'
import profileController from '../controller/profileController.js'
import protectedRoute from '../middleware/auth.middleware.js'
const router = express.Router()

router.get('/', profileController.getProfiles)
router.get('/:id', protectedRoute, profileController.getProfileById)
router.get('/:id/returns', profileController.getProfileReturns)
router.post('/follow/:id', protectedRoute, profileController.postFollow)
router.get('/follow', protectedRoute, profileController.getFollows)


export default router;