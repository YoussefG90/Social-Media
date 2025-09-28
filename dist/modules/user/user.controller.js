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
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_service_1 = __importDefault(require("./user.service"));
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validators = __importStar(require("./user.validation"));
const Token_1 = require("../../utils/Security/Token");
const cloud_1 = require("../../utils/Multer/cloud");
const user_authorization_1 = require("./user.authorization");
const chat_1 = require("../chat");
const router = (0, express_1.Router)();
router.use("/:userId/chat", chat_1.chatRouter);
router.patch("/:userId/block", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.block), user_service_1.default.block);
router.patch("/:userId/unFriend", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.unFriend), user_service_1.default.unFriend);
router.post("/:userId/sendFriendRequest", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.sendFriendRequest), user_service_1.default.sendFriendRequest);
router.patch("/acceptFriendRequest/:requestId", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.acceptFriendRequest), user_service_1.default.acceptFriendRequest);
router.patch("/:userId/change-role", (0, auth_middleware_1.authorization)(user_authorization_1.endPoint.dashboard), (0, validation_middleware_1.Validation)(validators.changeRole), user_service_1.default.changeRole);
router.delete("{/:userId}/freeze-profile", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.freezeAccount), user_service_1.default.freezeAccount);
router.patch("/:userId/restore-account", (0, auth_middleware_1.authorization)(user_authorization_1.endPoint.restore), (0, validation_middleware_1.Validation)(validators.restoreAccount), user_service_1.default.restoreAccount);
router.delete("/:userId", (0, auth_middleware_1.authorization)(user_authorization_1.endPoint.hardDelete), (0, validation_middleware_1.Validation)(validators.hardDelete), user_service_1.default.hardDelete);
router.patch("/profile-Image", (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).single("Image"), (0, validation_middleware_1.Validation)(validators.profileImage), user_service_1.default.profileImage);
router.patch("/cover-Image", (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).single("Cover"), (0, validation_middleware_1.Validation)(validators.coverImage), user_service_1.default.coverImage);
router.patch("/update", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.updateBasicInfo), user_service_1.default.updateBasicInfo);
router.patch("/update-password", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.updatePassword), user_service_1.default.updatePassword);
router.patch("/update-password", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.updatePassword), user_service_1.default.updatePassword);
router.patch("/update-email", (0, auth_middleware_1.authentication)(), user_service_1.default.updateEmail);
router.get("/profile", (0, auth_middleware_1.authentication)(), user_service_1.default.profile);
router.get("/dashboard", (0, auth_middleware_1.authorization)(user_authorization_1.endPoint.dashboard), user_service_1.default.dashboard);
router.post("/refresh-token", (0, auth_middleware_1.authentication)(Token_1.TokenEnum.refresh), user_service_1.default.refreshToken);
router.post("/logout", (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.logout), user_service_1.default.logout);
exports.default = router;
