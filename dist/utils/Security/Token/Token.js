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
exports.decodedToken = exports.verfiyToken = exports.CreateLoginCredentials = exports.getSignatures = exports.DetectSignatureLevel = exports.generateToken = exports.SecretLevelEnum = exports.logoutEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = __importStar(require("../../../DB/models/user"));
const error_response_1 = require("../../Response/error.response");
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
const generateToken = async ({ payload, secret = process.env.ACCESS_TOKEN_USER_SECRET, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) } }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
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
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.accessSignature,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION) }
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refreshSignature,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRATION) }
    });
    return { accessToken, refreshToken };
};
exports.CreateLoginCredentials = CreateLoginCredentials;
const verfiyToken = ({ token, signature }) => {
    if (!signature)
        throw new error_response_1.BadRequest("Signature is required");
    const decoded = (0, jsonwebtoken_1.verify)(token, signature);
    if (typeof decoded === "string")
        return null;
    return decoded;
};
exports.verfiyToken = verfiyToken;
const decodedToken = async ({ authorization = "", tokenType = TokenTypeEnum.access, }, next) => {
    const [bearer, token] = authorization?.split(" ") || [];
    if (!token || !bearer)
        throw new error_response_1.Unauthorized("Unauthorized");
    const signature = await getSignature({
        signatureEnum: bearer,
        tokenType,
    });
    const decoded = (0, exports.verfiyToken)({
        token,
        signature: tokenType === TokenTypeEnum.access ? signature.access : signature.refresh,
    });
    if (!decoded)
        throw new error_response_1.BadRequest("InValid Token");
    const user = await DBservices.findById({ model: user_1.default, id: decoded._id });
    if (!user)
        throw new error_response_1.NotFound("User Not Found");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
