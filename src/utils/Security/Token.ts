import { v4 as uuid } from 'uuid';
import {sign , verify} from 'jsonwebtoken';
import type {JwtPayload, Secret , SignOptions} from "jsonwebtoken";
import UserModel, { roleEnum , HUserDocument} from '../../DB/models/user';
import { BadRequest, NotFound, Unauthorized } from '../Response/error.response';
import { UserReposirotry } from '../../DB/repository/User.Repository';
import { HTokenDocument, TokenModel } from '../../DB/models/token';
import { TokenRepository } from '../../DB/repository/Token.Repository';



export enum logoutEnum {signoutFromAll = "signoutFromAll" , signout = "signout" , stayLoggedIn="stayLoggedIn"}
export enum SecretLevelEnum {Bearer = "Bearer" , System = "System"}
export enum TokenEnum {access = "access" , refresh = "refresh"}


export const generateToken = async ({
  payload,
  secret = process.env.ACCESS_TOKEN_USER_SECRET as string,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION)}
}: {
    payload: object
    secret?: Secret;
    options?: SignOptions;
}) => {
  return sign(payload, secret, options);
};


export const verfiyToken = async ({  
  token,
  secret = process.env.ACCESS_TOKEN_USER_SECRET as string,
}: {
    token: string
    secret?: Secret;
}): Promise<JwtPayload> => {
  return verify(token, secret) as JwtPayload;
};


export const DetectSignatureLevel = async (role:roleEnum = roleEnum.user):Promise<SecretLevelEnum> => {
    let signatureLevel : SecretLevelEnum = SecretLevelEnum.Bearer
    switch (role) {
      case roleEnum.admin:
          signatureLevel = SecretLevelEnum.System
        break;
    
      default:
          signatureLevel = SecretLevelEnum.Bearer
        break;
    }
    return signatureLevel
}


export const getSignatures = async (
  signatureLevel : SecretLevelEnum = SecretLevelEnum.Bearer
):Promise<{accessSignature:string , refreshSignature:string}> => {
  let signatures :{accessSignature:string , refreshSignature:string} = {
    accessSignature : "", refreshSignature : ""
  }
  switch (signatureLevel) {
    case SecretLevelEnum.System:
        signatures.accessSignature = process.env.ACCESS_TOKEN_ADMIN_SECRET as string;
        signatures.refreshSignature = process.env.REFRESH_TOKEN_ADMIN_SECRET as string;
      break;
  
    default:
      signatures.accessSignature = process.env.ACCESS_TOKEN_USER_SECRET as string;
      signatures.refreshSignature = process.env.REFRESH_TOKEN_USER_SECRET as string;
      break;
  }

  return signatures
}


export const CreateLoginCredentials = async (user:HUserDocument) => {
  const signatureLevel = await DetectSignatureLevel(user.role)
  const signatures = await getSignatures(signatureLevel)
  const jwtid = uuid()
    const accessToken = await generateToken({
      payload:{_id:user._id},
      secret:signatures.accessSignature,
      options : {expiresIn : Number(process.env.ACCESS_TOKEN_EXPIRATION) , jwtid}
    })
    const refreshToken = await generateToken({
      payload:{_id:user._id},
      secret : signatures.refreshSignature ,
      options : {expiresIn : Number(process.env.REFRESH_TOKEN_EXPIRATION) , jwtid}
    })

    return  {accessToken , refreshToken}
}


export const decodedToken = async ({
  authorization , tokenType = TokenEnum.access
} : {
  authorization:string , tokenType?:TokenEnum
}) => {

  const userModel = new UserReposirotry(UserModel)
  const tokenModel = new TokenRepository(TokenModel)
  const [bearerkey , token] = authorization.split(" ")
  if (!bearerkey || !token) {
    throw new Unauthorized("Missing Token Parts")
  }
  const signatures = await getSignatures(bearerkey as SecretLevelEnum)
  const decoded = await verfiyToken({token , 
    secret:tokenType === TokenEnum.refresh ? signatures.refreshSignature : signatures.accessSignature})
  if (!decoded?._id || !decoded?.iat) {
    throw new BadRequest("InValid Payload")
  }  
  if (await tokenModel.findOne({filter:{jti:decoded.jti}})) {
    throw new Unauthorized("InValid Or Old Tokens")
  }
  const user = await userModel.findOne({filter:{_id:decoded._id}})
  if (!user) {
    throw new NotFound("User Not Registered")
  }
  if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000) {
    throw new Unauthorized("InValid Or Old Tokens")
  }

  return {user , decoded}
}


export const createRevokeToken = async (decoded:JwtPayload):Promise<HTokenDocument> => {
  const tokenModel = new TokenRepository(TokenModel)
  const [result] = (await tokenModel.create({data:[{
             jti:decoded.jti as string,
             expiresIn:(decoded.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRATION),
             userId:decoded._id
    }]})) || []
  if (!result) {
  throw new BadRequest("Fail To Revoke Token")
  }
    return result
}