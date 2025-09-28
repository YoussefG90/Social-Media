import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./chat.validation"
import { ChatService } from "./chat.service";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";


const chatServices:ChatService = new ChatService()
const router = Router({mergeParams:true})

router.get("/" , authentication() , Validation(validators.getChat), chatServices.getChat)

router.post("/group/:groupId" , authentication() ,Validation(validators.getGroup),
     chatServices.getGroup)

router.post("/group" , authentication() ,cloudFiles({validation: fileValidation.Image}).single("Image"),
   Validation(validators.createGroup), chatServices.createGroup)


export default router