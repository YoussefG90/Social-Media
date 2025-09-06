import {z} from 'zod';
import { freezeAccount, hardDelete, logout, restoreAccount } from "./user.validation";

export type ILogoutDto = z.infer<typeof logout.body>
export type IFreezeAccountDto = z.infer<typeof freezeAccount.params>
export type IRestoreAccountDto = z.infer<typeof restoreAccount.params>
export type IHardDeleteDto = z.infer<typeof hardDelete.params>