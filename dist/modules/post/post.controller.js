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
const post_service_1 = require("./post.service");
const cloud_1 = require("../../utils/Multer/cloud");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validators = __importStar(require("./post.validation"));
const comment_1 = require("../comment");
const router = (0, express_1.Router)();
router.use("/:postId/comment", comment_1.commentRouter);
router.post('/create', (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).array("attachments", 2), (0, validation_middleware_1.Validation)(validators.createPost), post_service_1.postService.createPost);
router.patch('/:postId/like', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.likePost), post_service_1.postService.likePost);
router.get('/all', (0, auth_middleware_1.authentication)(), post_service_1.postService.getAllPosts);
router.patch('/:postId', (0, auth_middleware_1.authentication)(), (0, cloud_1.cloudFiles)({ validation: cloud_1.fileValidation.Image }).array("attachments", 2), (0, validation_middleware_1.Validation)(validators.updatePost), post_service_1.postService.updatePost);
router.delete('/:postId/delete', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.freezePost), post_service_1.postService.hardDeletePost);
router.patch('/:postId/freeze', (0, auth_middleware_1.authentication)(), (0, validation_middleware_1.Validation)(validators.freezePost), post_service_1.postService.freezePost);
exports.default = router;
