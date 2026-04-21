import Router from 'express'
import { login, logout } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';


const sysUserRouter = Router();

sysUserRouter.route("/login").post(login);
sysUserRouter.route("/logout").post(verifyJWT, logout);

export {
    sysUserRouter
}