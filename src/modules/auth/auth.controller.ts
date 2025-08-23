import  {Router} from "express"
const router = Router();
import authService from './auth.service'
import { Validation } from "../../middleware/validation.middleware";
import * as Validators from './auth.validation'
import { verify , get} from "../../middleware/otp.middleware";


router.post('/signup' ,Validation(Validators.Signup), authService.signup)
router.post('/login' ,Validation(Validators.login), authService.login)
router.patch('/verfiy-otp' ,Validation(Validators.verfiyOtp), verify)
router.post('/request-otp' ,Validation(Validators.getOtp), get)




export default router