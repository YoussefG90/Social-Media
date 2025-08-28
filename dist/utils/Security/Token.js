"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.CreateLoginCredentials = exports.getSignatures = exports.DetectSignatureLevel = exports.verfiyToken = exports.generateToken = exports.TokenEnum = exports.SecretLevelEnum = exports.logoutEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = __importStar(require("../../DB/models/user"));
const error_response_1 = require("../Response/error.response");
const User_Repository_1 = require("../../DB/repository/User.Repository");
const token_1 = require("../../DB/models/token");
const Token_Repository_1 = require("../../DB/repository/Token.Repository");
var logoutEnum;
(function (logoutEnum) {
    logoutEnum["signoutFromAll"] = "signoutFromAll";
    logoutEnum["signout"] = "signout";
    logoutEnum["stayLoggedIn"] = "stayLoggedIn";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
var SecretLevelEnum;
(function (SecretLevelEnum) {
    SecretLevelEnum["Bearer"] = "Bearer";
    SecretLevelEnum["System"] = "System";
})(SecretLevelEnum || (exports.SecretLevelEnum = SecretLevelEnum = {}));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["access"] = "access";
    TokenEnum["refresh"] = "refresh";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) } }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verfiyToken = async ({ token, secret = process.env.ACCESS_TOKEN_USER_SECRET, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verfiyToken = verfiyToken;
const DetectSignatureLevel = async (role = user_1.roleEnum.user) => {
    let signatureLevel = SecretLevelEnum.Bearer;
    switch (role) {
        case user_1.roleEnum.admin:
            signatureLevel = SecretLevelEnum.System;
            break;
        default:
            signatureLevel = SecretLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
exports.DetectSignatureLevel = DetectSignatureLevel;
const getSignatures = async (signatureLevel = SecretLevelEnum.Bearer) => {
    let signatures = {
        accessSignature: "", refreshSignature: ""
    };
    switch (signatureLevel) {
        case SecretLevelEnum.System:
            signatures.accessSignature = process.env.ACCESS_TOKEN_ADMIN_SECRET;
            signatures.refreshSignature = process.env.REFRESH_TOKEN_ADMIN_SECRET;
            break;
        default:
            signatures.accessSignature = process.env.ACCESS_TOKEN_USER_SECRET;
            signatures.refreshSignature = process.env.REFRESH_TOKEN_USER_SECRET;
            break;
    }
    return signatures;
};
exports.getSignatures = getSignatures;
const CreateLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.DetectSignatureLevel)(user.role);
    const signatures = await (0, exports.getSignatures)(signatureLevel);
    const jwtid = (0, uuid_1.v4)();
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.accessSignature,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION), jwtid }
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refreshSignature,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION), jwtid }
    });
    return { accessToken, refreshToken };
};
exports.CreateLoginCredentials = CreateLoginCredentials;
const decodedToken = async ({ authorization, tokenType = TokenEnum.access }) => {
    const userModel = new User_Repository_1.UserReposirotry(user_1.default);
    const tokenModel = new Token_Repository_1.TokenRepository(token_1.TokenModel);
    const [bearerkey, token] = authorization.split(" ");
    if (!bearerkey || !token) {
        throw new error_response_1.Unauthorized("Missing Token Parts");
    }
    const signatures = await (0, exports.getSignatures)(bearerkey);
    const decoded = await (0, exports.verfiyToken)({ token,
        secret: tokenType === TokenEnum.refresh ? signatures.refreshSignature : signatures.accessSignature });
    if (!decoded?._id || !decoded?.iat) {
        throw new error_response_1.BadRequest("InValid Payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.Unauthorized("InValid Or Old Tokens");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user) {
        throw new error_response_1.NotFound("User Not Registered");
    }
    if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000) {
        throw new error_response_1.Unauthorized("InValid Or Old Tokens");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new Token_Repository_1.TokenRepository(token_1.TokenModel);
    const [result] = (await tokenModel.create({ data: [{
                jti: decoded.jti,
                expiresIn: decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRATION),
                userId: decoded._id
            }] })) || [];
    if (!result) {
        throw new error_response_1.BadRequest("Fail To Revoke Token");
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;
