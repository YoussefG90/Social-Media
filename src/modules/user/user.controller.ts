import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import userService from "./user.service";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./user.validation"
import { TokenEnum } from "../../utils/Security/Token";
const router = Router()

router.get("/profile" , authentication() , userService.profile)
router.post("/refresh-token" , authentication(TokenEnum.refresh) , userService.refreshToken)
router.post("/logout" , authentication(), Validation(validators.logout) , userService.logout)

export default router