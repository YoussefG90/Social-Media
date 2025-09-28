import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware";
import {commentService} from "./comment.service";
import { cloudFiles, fileValidation } from "../../utils/Multer/cloud";
import { Validation } from "../../middleware/validation.middleware";
import * as validators from "./comment.validation"
const router = Router ({mergeParams:true})


router.post('/create' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.createComment),commentService.createComment)

router.delete('/:commentId/delete' , authentication(),
    Validation(validators.freezeComment),commentService.hardDeleteComment)
    

router.patch('/:commentId/freeze' , authentication(),
    Validation(validators.freezeComment),commentService.freezeComment)

router.post('/:commentId/reply' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.replyOnComment),commentService.replyOnComment)

router.patch('/:postId/comment/:commentId/like' , authentication(),
    Validation(validators.likePost),commentService.likeComment)

router.get('/:postId' , authentication() ,commentService.getAllComments)    

router.patch('/:postId/comment/:commentId/update' , authentication(),
    cloudFiles({validation: fileValidation.Image}).array("attachments" , 2),
    Validation(validators.updateComment),commentService.updateComment)


export default router