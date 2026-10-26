import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addSupplierPayment, createSupplier, deleteSupplier, getSupplier, listSuppliers } from '../controllers/supplier.controller.js';
const supplierRouter = Router();
supplierRouter.use(verifyJWT);
supplierRouter.route('/').get(listSuppliers).post(createSupplier);
supplierRouter.route('/:id').get(getSupplier).delete(deleteSupplier);
supplierRouter.post('/:id/payments', addSupplierPayment);
export default supplierRouter;
