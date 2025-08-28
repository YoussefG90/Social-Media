import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../../DB/models/user";


declare module "express-serve-static-core" {
    interface Request {
        user?:HUserDocument,
        decoded?:JwtPayload
    }
}