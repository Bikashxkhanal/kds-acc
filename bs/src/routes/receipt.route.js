import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { downloadReceipt } from '../controllers/receipt.controller.js';
const receiptRouter=Router(); receiptRouter.get('/:type/:id/download',verifyJWT,downloadReceipt); export default receiptRouter;
