import  {Router} from "express"
const router = Router();
import authService from './auth.service'
import { Validation } from "../../middleware/validation.middleware";
import * as Validators from './auth.validation'
import otp from "../../middleware/otp.middleware";
import { authentication } from "../../middleware/auth.middleware";


router.patch("/two-factor" , authentication(), Validation(Validators.twoFactorAuthentication) , otp.twoFactor)
router.post('/signup' ,Validation(Validators.Signup), authService.signup)
router.post('/signupWithGmail' ,Validation(Validators.signupWithGmail), authService.signupWithGmail)
router.post('/login' ,Validation(Validators.login), authService.login)
router.post('/login-with-2Fa' ,Validation(Validators.twoFactorAuthenticationLogin), authService.loginWithTwoFactorAuthentication)
router.post('/loginWithGmail' ,Validation(Validators.signupWithGmail), authService.loginWithGmail)
router.patch('/verfiy-otp' ,Validation(Validators.verfiyOtp), otp.verify)
router.post('/request-otp' ,Validation(Validators.getOtp), otp.get)
router.patch('/forget-password' ,Validation(Validators.forgetPassword), authService.forgetPassword)




export default router