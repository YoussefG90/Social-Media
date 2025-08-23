import {z} from 'zod'
import *as Validators from '../auth.validation'


export type ISignupInputs = z.infer<typeof Validators.Signup.body>
export type ILoginInputs = z.infer<typeof Validators.login.body>