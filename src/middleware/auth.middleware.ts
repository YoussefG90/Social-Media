// import { decodedToken } from "../utils/Security/Token/Token";
// import { TokenTypeEnum , AuthenticationOptions } from "../utils/Security/Token/Token.Types";
// import { Request, Response, NextFunction } from "express";

// export const authentication =
//   ({ tokenType = TokenTypeEnum.access }: AuthenticationOptions = {}) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { user, decoded } =
//       (await decodedToken(
//         { authorization: req.headers.authorization, tokenType },
//         next
//       )) || {};

//     req.user = user;
//     req.decoded = decoded;
//     return next();
//   };