import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  listPreviousBalances,
  createPreviousBalance,
  updatePreviousBalance,
  deletePreviousBalance,
  getPreviousBalance
} from '../controllers/previousBalance.controller.js';

const previousBalanceRouter = Router();
previousBalanceRouter.use(verifyJWT);
previousBalanceRouter.route('/').get(listPreviousBalances).post(createPreviousBalance);
previousBalanceRouter.route('/:id').get(getPreviousBalance).put(updatePreviousBalance).delete(deletePreviousBalance);

export default previousBalanceRouter;
