import { roleEnum } from "../../DB/models/user";


export const endPoint = {
    restore: [roleEnum.admin],
    hardDelete: [roleEnum.admin]
}