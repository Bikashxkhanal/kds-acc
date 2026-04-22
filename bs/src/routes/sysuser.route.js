import Router from 'express'
import { login, logout, verifyMe} from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';


const sysUserRouter = Router();

sysUserRouter.route("/login").post(login);
sysUserRouter.route("/logout").post(verifyJWT, logout);
sysUserRouter.route("/me").get(verifyJWT, verifyMe);

export {
    sysUserRouter
}