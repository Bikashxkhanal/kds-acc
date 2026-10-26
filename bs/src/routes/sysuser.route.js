import Router from 'express'
import { login, logout, verifyMe, listUsers, createUser, updateUserRoleStatus, resetUserPassword, changeOwnPassword } from '../controllers/user.controller.js'
import { verifyJWT, requireAdmin } from '../middlewares/auth.middleware.js';


const sysUserRouter = Router();

sysUserRouter.route("/login").post(login);
sysUserRouter.route("/logout").post(verifyJWT, logout);
sysUserRouter.route("/me").get(verifyJWT, verifyMe);
sysUserRouter.route('/users').get(verifyJWT, requireAdmin, listUsers).post(verifyJWT, requireAdmin, createUser);
sysUserRouter.route('/users/:id').patch(verifyJWT, requireAdmin, updateUserRoleStatus);
sysUserRouter.route('/users/:id/reset-password').post(verifyJWT, requireAdmin, resetUserPassword);
sysUserRouter.route('/change-password').post(verifyJWT, changeOwnPassword);

export {
    sysUserRouter
}
