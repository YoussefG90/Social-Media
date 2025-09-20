import {z} from 'zod'
import *as Validators from './comment.validation'


export type ILikePostInputsDto = z.infer<typeof Validators.likePost.query>