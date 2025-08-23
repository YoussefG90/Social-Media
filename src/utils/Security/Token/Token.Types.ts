import jwt from 'jsonwebtoken';
import { JwtPayload } from "jsonwebtoken";
import { roleEnum } from '../../../DB/models/user';
import { Types } from "mongoose";



export enum logoutEnum {signoutFromAll = "signoutFromAll" , signout = "signout" , stayLoggedIn="stayLoggedIn"}


export interface GenerateAccessToken {
  payload: object | string | Buffer;
  signature?: string;
  options?: jwt.SignOptions;
}

export interface GenerateRefreshToken {
  payload: object | string | Buffer;
  signature?: string;
  options?: jwt.SignOptions;
}

export interface VerifyToken {
  token: string;
  signature?: string;
}

export enum SignatureTypeEnum {
  bearer = "bearer",
  system = "system",
}

export interface SignatureResult {
  access?: string| undefined;
  refresh?: string| undefined;
}

export interface GetSignatureOptions {
  signatureEnum?: SignatureTypeEnum;
  tokenType?: TokenTypeEnum;
}


export enum TokenTypeEnum {
  access = "access",
  refresh = "refresh",
}

export type DecodedToken = JwtPayload & {
  _id: string;
  jti?: string;
  iat: number;
  exp: number;
};

export type Signature = { access: string; refresh: string };

export declare function getSignature(params: {
  signatureEnum?: SignatureTypeEnum;
  tokenType: TokenTypeEnum;
}): Promise<SignatureResult>;

export declare function verfiyToken(params: {
  token: string;
  signature: string;
}): Promise<DecodedToken | null>;


export interface UserType {
  _id: string| Types.ObjectId;
  role: roleEnum; 
}


export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthenticationOptions = {
  tokenType?: TokenTypeEnum;
};

