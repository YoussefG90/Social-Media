import { roleEnum } from "../DB/models/user";
import { BadRequest, Forbidden } from "../utils/Response/error.response";
import { decodedToken, TokenEnum } from "../utils/Security/Token";
import type { Request, Response, NextFunction } from "express";


export const authentication = (tokenType:TokenEnum = TokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        throw new BadRequest ("Validation Error" , {
            key:"headers",
            issues:[{path:"authorization" , message:"missing authorization"}]
        })
    }
    const { user, decoded } = await decodedToken({authorization: req.headers.authorization , tokenType});

    req.user = user;
    req.decoded = decoded;
    next();
  }}


  export const authorization = (accessRoles: roleEnum[] = [] , tokenType:TokenEnum = TokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        throw new BadRequest ("Validation Error" , {
            key:"headers",
            issues:[{path:"authorization" , message:"missing authorization"}]
        })
    }
    const { user, decoded } = await decodedToken({authorization: req.headers.authorization ,tokenType});
    if (!accessRoles.includes(user.role)) {
      throw new Forbidden("Not Authorized Account")
    }

    req.user = user;
    req.decoded = decoded;
    next();
  }}