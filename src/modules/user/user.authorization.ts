import { roleEnum } from "../../DB/models/user";


export const endPoint = {
    welcome:[roleEnum.user , roleEnum.admin],
    restore: [roleEnum.admin],
    hardDelete: [roleEnum.admin],
    dashboard: [roleEnum.admin , roleEnum.superAdmin]
}