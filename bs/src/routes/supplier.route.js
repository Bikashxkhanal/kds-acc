import { Router } from 'express';
import { verifyJWT, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  addSupplierPayment,
  createSupplier,
  deleteSupplier,
  getSupplier,
  listSuppliers,
  updateSupplierStatus,
  getSupplierDeletePreview
} from '../controllers/supplier.controller.js';

const supplierRouter = Router();
supplierRouter.use(verifyJWT);
supplierRouter.route('/').get(listSuppliers).post(createSupplier);
supplierRouter.route('/:id/status').patch(requireAdmin, updateSupplierStatus);
supplierRouter.route('/:id/delete-preview').get(requireAdmin, getSupplierDeletePreview);
supplierRouter.route('/:id').get(getSupplier).delete(requireAdmin, deleteSupplier);
supplierRouter.post('/:id/payments', addSupplierPayment);
export default supplierRouter;
