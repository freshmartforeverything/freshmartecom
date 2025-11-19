import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'
import { getBannerController, upsertBannerController } from '../controllers/banner.controller.js'

const bannerRouter = Router()

bannerRouter.get('/', getBannerController)
bannerRouter.put('/', auth, admin, upsertBannerController)

export default bannerRouter


