import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import userService from "./user.service";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./user.validation"
import { TokenEnum } from "../../utils/Security/Token";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";
const router = Router()




router.patch("/profile-Image" , authentication(),
cloudFiles({validation: fileValidation.Image}).single("Image"),
Validation(validators.profileImage) , userService.profileImage)

router.patch("/cover-Image" , authentication() ,
cloudFiles({validation: fileValidation.Image}).single("Cover"),
Validation(validators.coverImage),userService.coverImage)



router.get("/profile" , authentication() , userService.profile)
router.post("/refresh-token" , authentication(TokenEnum.refresh) , userService.refreshToken)
router.post("/logout" , authentication(), Validation(validators.logout) , userService.logout)

export default router