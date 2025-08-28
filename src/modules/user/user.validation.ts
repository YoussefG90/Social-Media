import {z} from 'zod';
import { logoutEnum } from '../../utils/Security/Token';


export const logout = {
    body:z.strictObject({
        flag:z.enum(logoutEnum).default(logoutEnum.signout)
    })
}