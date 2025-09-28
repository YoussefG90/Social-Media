import { HChatDocument } from "../../DB/models";
import { HUserDocument } from "../../DB/models/user";



export interface IUserResponse {
    user:Partial<HUserDocument>;
    group:Partial<HChatDocument>[]
}