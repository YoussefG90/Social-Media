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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const auth_service_1 = __importDefault(require("./auth.service"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const Validators = __importStar(require("./auth.validation"));
const otp_middleware_1 = __importDefault(require("../../middleware/otp.middleware"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
router.patch("/two-factor", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(Validators.twoFactorAuthentication), otp_middleware_1.default.twoFactor);
router.post('/signup', (0, validation_middleware_1.Validation)(Validators.Signup), auth_service_1.default.signup);
router.post('/signupWithGmail', (0, validation_middleware_1.Validation)(Validators.signupWithGmail), auth_service_1.default.signupWithGmail);
router.post('/login', (0, validation_middleware_1.Validation)(Validators.login), auth_service_1.default.login);
router.post('/login-with-2Fa', (0, validation_middleware_1.Validation)(Validators.twoFactorAuthenticationLogin), auth_service_1.default.loginWithTwoFactorAuthentication);
router.post('/loginWithGmail', (0, validation_middleware_1.Validation)(Validators.signupWithGmail), auth_service_1.default.loginWithGmail);
router.patch('/verfiy-otp', (0, validation_middleware_1.Validation)(Validators.verfiyOtp), otp_middleware_1.default.verify);
router.post('/request-otp', (0, validation_middleware_1.Validation)(Validators.getOtp), otp_middleware_1.default.get);
router.patch('/forget-password', (0, validation_middleware_1.Validation)(Validators.forgetPassword), auth_service_1.default.forgetPassword);
exports.default = router;
