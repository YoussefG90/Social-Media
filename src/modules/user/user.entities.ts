import { HUserDocument } from "../../DB/models/user";



export interface IUserResponse {
    user:Partial<HUserDocument>
}