import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.middleware";
import userService from "./user.service";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./user.validation"
import { TokenEnum } from "../../utils/Security/Token";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";
import { endPoint } from "./user.authorization";
const router = Router()

router.post("/:userId/sendFriendRequest" , authentication(),
   Validation(validators.sendFriendRequest) , userService.sendFriendRequest)

router.patch("/acceptFriendRequest/:requestId" , authentication(),
   Validation(validators.acceptFriendRequest) , userService.acceptFriendRequest)

router.patch("/:userId/change-role" , authorization(endPoint.dashboard) ,
    Validation(validators.changeRole) , userService.changeRole)

router.delete("{/:userId}/freeze-profile" , authentication(), 
    Validation(validators.freezeAccount), userService.freezeAccount)

router.patch("/:userId/restore-account" , authorization(endPoint.restore), 
    Validation(validators.restoreAccount), userService.restoreAccount)    

router.delete("/:userId" , authorization(endPoint.hardDelete), 
    Validation(validators.hardDelete), userService.hardDelete)


router.patch("/profile-Image" , authentication(),
cloudFiles({validation: fileValidation.Image}).single("Image"),
Validation(validators.profileImage) , userService.profileImage)

router.patch("/cover-Image" , authentication() ,
cloudFiles({validation: fileValidation.Image}).single("Cover"),
Validation(validators.coverImage),userService.coverImage)


router.patch("/update" , authentication() ,Validation(validators.updateBasicInfo) , userService.updateBasicInfo)
router.patch("/update-password" , authentication() ,Validation(validators.updatePassword) , userService.updatePassword)
router.patch("/update-password" , authentication() ,Validation(validators.updatePassword) , userService.updatePassword)
router.patch("/update-email" , authentication() , userService.updateEmail)
router.get("/profile" , authentication() , userService.profile)
router.get("/dashboard" , authorization(endPoint.dashboard) , userService.dashboard)
router.post("/refresh-token" , authentication(TokenEnum.refresh) , userService.refreshToken)
router.post("/logout" , authentication(), Validation(validators.logout) , userService.logout)

export default router