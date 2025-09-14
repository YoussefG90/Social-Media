import {z} from 'zod'
import *as Validators from './post.validation'


export type ILikePostInputsDto = z.infer<typeof Validators.likePost.query>