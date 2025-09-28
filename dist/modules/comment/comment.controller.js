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
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const comment_service_1 = require("./comment.service");
const cloud_1 = require("../../utils/Multer/cloud");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validators = __importStar(require("./comment.validation"));
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/create', (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).array("attachments", 2), (0, validation_middleware_1.Validation)(validators.createComment), comment_service_1.commentService.createComment);
router.delete('/:commentId/delete', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.freezeComment), comment_service_1.commentService.hardDeleteComment);
router.patch('/:commentId/freeze', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.freezeComment), comment_service_1.commentService.freezeComment);
router.post('/:commentId/reply', (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).array("attachments", 2), (0, validation_middleware_1.Validation)(validators.replyOnComment), comment_service_1.commentService.replyOnComment);
router.patch('/:postId/comment/:commentId/like', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.likePost), comment_service_1.commentService.likeComment);
router.get('/:postId', (0, auth_middleware_1.authentication)(), comment_service_1.commentService.getAllComments);
router.patch('/:postId/comment/:commentId/update', (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).array("attachments", 2), (0, validation_middleware_1.Validation)(validators.updateComment), comment_service_1.commentService.updateComment);
exports.default = router;
