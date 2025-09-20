import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import {postService} from "./post.service";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./post.validation"
import { commentRouter } from "../comment";
const router = Router ()

router.use("/:postId/comment" , commentRouter)

router.post('/create' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.createPost),postService.createPost)

router.patch('/:postId/like' , authentication(),
    Validation(validators.likePost),postService.likePost)

router.get('/all' , authentication() ,postService.getAllPosts)    

router.patch('/:postId' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.updatePost),postService.updatePost)

router.delete('/:postId/delete' , authentication(),
    Validation(validators.freezePost),postService.hardDeletePost)   
    
router.patch('/:postId/freeze' , authentication(),
    Validation(validators.freezePost),postService.freezePost)


export default router