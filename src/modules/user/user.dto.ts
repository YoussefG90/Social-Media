import {z} from 'zod';
import { freezeAccount, hardDelete, logout, restoreAccount, updateBasicInfo, updatePassword } from "./user.validation";

export type ILogoutDto = z.infer<typeof logout.body>
export type IFreezeAccountDto = z.infer<typeof freezeAccount.params>
export type IRestoreAccountDto = z.infer<typeof restoreAccount.params>
export type IHardDeleteDto = z.infer<typeof hardDelete.params>
export type UpdateBasicInfoDto = z.infer<typeof updateBasicInfo.body>;
export type UpdatePassword = z.infer<typeof updatePassword.body>;