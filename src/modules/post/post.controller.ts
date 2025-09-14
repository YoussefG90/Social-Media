import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import postService from "./post.service";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./post.validation"
const router = Router ()


router.post('/create' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.createPost),postService.createPost)

router.patch('/:postId/like' , authentication(),
    Validation(validators.likePost),postService.likePost)



export default router