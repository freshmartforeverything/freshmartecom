import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, GuestCashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, adminListAllOrdersController } from '../controllers/order.controller.js'
import { admin } from '../middleware/Admin.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post("/guest/cash-on-delivery",GuestCashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/admin/all', auth, admin, adminListAllOrdersController)

export default orderRouter