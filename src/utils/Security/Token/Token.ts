import jwt from 'jsonwebtoken';
import { JwtPayload } from "jsonwebtoken";
import { NextFunction } from "express";
import * as DBservices from '../../../DB/DBservices'
import  {SignatureTypeEnum,  GenerateAccessToken,  GenerateRefreshToken, 
     GetSignatureOptions,  SignatureResult,VerifyToken,TokenTypeEnum,
     DecodedToken,
     UserType,
     Tokens,} from "./Token.Types"
import UserModel, { roleEnum , IUser} from '../../../DB/models/user';
import { BadRequest, NotFound, Unauthorized } from '../../Response/error.response';




export const generateToken = ({
  payload = {},
  signature = process.env.ACCESS_TOKEN_USER_SECRET as string,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION)}
}: GenerateAccessToken) => {
  return jwt.sign(payload, signature, options);
};

export const generateRefreshToken = ({payload={} ,
    signature = process.env.REFRESH_TOKEN_USER_SECRET as string ,
    options = {expiresIn : Number(process.env.REFRESH_TOKEN_EXPIRATION)}
}:GenerateRefreshToken) => {
    return jwt.sign(payload, signature ,options)
}

export const verfiyToken = ({ token, signature }: VerifyToken): DecodedToken | null => {
  if (!signature) throw new BadRequest("Signature is required");
  const decoded = jwt.verify(token, signature) as string | JwtPayload;
  if (typeof decoded === "string") return null;
  return decoded as DecodedToken;
};

export const getSignature = async (
  { signatureEnum = SignatureTypeEnum.bearer }: GetSignatureOptions = {}
): Promise<SignatureResult> => {
  let signatures: SignatureResult = { access: undefined, refresh: undefined };

  switch (signatureEnum) {
    case SignatureTypeEnum.system:
      signatures.access = process.env.ACCESS_TOKEN_ADMIN_SECRET;
      signatures.refresh = process.env.REFRESH_TOKEN_ADMIN_SECRET;
      break;

    default:
      signatures.access = process.env.ACCESS_TOKEN_USER_SECRET;
      signatures.refresh = process.env.REFRESH_TOKEN_USER_SECRET;
      break;
  }

  return signatures;
};








export const decodedToken = async (
  {
    authorization = "",
    tokenType = TokenTypeEnum.access,
  }: { authorization?: string; tokenType?: TokenTypeEnum },
  next: NextFunction
): Promise<{ user: IUser; decoded: DecodedToken } | void> => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!token || !bearer) throw new Unauthorized("Unauthorized");

const signature = await getSignature({
  signatureEnum: bearer as SignatureTypeEnum,
  tokenType,
});

  const decoded = verfiyToken({
  token,
  signature: tokenType === TokenTypeEnum.access ? signature.access! : signature.refresh!,
});


  if (!decoded) throw new BadRequest("InValid Token");

  // if (
  //   decoded.jti &&
  //   (await servicesDB.findOne<{ jti: string }>({ model: RevokeToken, filter: { jti: decoded.jti } }))
  // ) {
  //   return next(new Error("In-Vaild Tokens", { cause: 401 }));
  // }

  const user = await DBservices.findById<IUser>({ model: UserModel, id: decoded._id });
  if (!user) throw new NotFound("User Not Found");

  // if (user.userTokens && decoded.iat * 1000 < new Date(user.userTokens).getTime()) {
  //   return next(new Error("In-Vaild Tokens", { cause: 401 }));
  // }

  // if (user.changeTokensTime?.getTime() > decoded.iat * 1000) {
  //   return next(new Error("In-Vaild Tokens", { cause: 401 }));
  // }

  return { user, decoded };
};








export const generateNewTokens = async (
  { user }: { user: UserType }
): Promise<Tokens> => {
  const signature = await getSignature({
    signatureEnum: user.role !== roleEnum.user
      ? SignatureTypeEnum.system
      : SignatureTypeEnum.bearer
  });

  const accessToken =  generateToken({
    payload: { _id: user._id },
    signature: signature.access as string,
    options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) }
  });

  const refreshToken = generateToken({
    payload: { _id: user._id },
    signature: signature.refresh as string,
    options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) }
  });

  return { accessToken, refreshToken };
};
