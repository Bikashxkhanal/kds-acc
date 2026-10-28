import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getPurchases,
  createPurchase,
  getPurchase,
  updatePurchase,
  deletePurchase,
  addPurchasePayment,
  getDashboard,
  getSalesVsPurchase,
  getVehicleRevenue
} from '../controllers/business.controller.js';

const businessRouter = Router();
businessRouter.get('/dashboard', verifyJWT, getDashboard);
businessRouter.get('/dashboard/sales-vs-purchase', verifyJWT, getSalesVsPurchase);
businessRouter.get('/dashboard/vehicle-revenue', verifyJWT, getVehicleRevenue);
businessRouter.route('/purchases').get(verifyJWT, getPurchases).post(verifyJWT, createPurchase);
businessRouter.route('/purchases/:id')
  .get(verifyJWT, getPurchase)
  .put(verifyJWT, updatePurchase)
  .delete(verifyJWT, deletePurchase);
businessRouter.post('/purchases/:id/payments', verifyJWT, addPurchasePayment);
export default businessRouter;
