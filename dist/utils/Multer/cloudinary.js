"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolderByPrefix = exports.destroyResources = exports.uploadFiles = exports.destroyFile = exports.uploadFile = exports.cloud = void 0;
const cloudinary_1 = require("cloudinary");
const cloud = () => {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true,
    });
    return cloudinary_1.v2;
};
exports.cloud = cloud;
const uploadFile = async ({ file, path = "general", }) => {
    return await (0, exports.cloud)().uploader.upload(file.path, {
        folder: `${process.env.APP_NAME}/${path}`,
    });
};
exports.uploadFile = uploadFile;
const destroyFile = async ({ public_id, }) => {
    return await (0, exports.cloud)().uploader.destroy(public_id);
};
exports.destroyFile = destroyFile;
const uploadFiles = async ({ files, path = "general", }) => {
    const attachments = [];
    for (const file of files) {
        const { secure_url, public_id } = await (0, exports.uploadFile)({ file, path });
        attachments.push({ secure_url, public_id });
    }
    return attachments;
};
exports.uploadFiles = uploadFiles;
const destroyResources = async ({ public_ids, options = { type: "upload", resource_type: "Image" }, }) => {
    return await (0, exports.cloud)().api.delete_resources(public_ids, options);
};
exports.destroyResources = destroyResources;
const deleteFolderByPrefix = async ({ prefix, }) => {
    return await (0, exports.cloud)().api.delete_resources_by_prefix(`${process.env.APP_NAME}/${prefix}`);
};
exports.deleteFolderByPrefix = deleteFolderByPrefix;
