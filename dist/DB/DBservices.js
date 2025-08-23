"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneAndUpdate = exports.create = exports.findById = exports.findOne = void 0;
const findOne = async ({ model, filter = {}, select = "", populate = [] }) => {
    return await model.findOne(filter).select(select).populate(populate);
};
exports.findOne = findOne;
const findById = async ({ model, id, select = "", populate = [] }) => {
    return await model.findById(id).select(select).populate(populate);
};
exports.findById = findById;
const create = async ({ model, data, options = {} }) => {
    const result = await model.create([data], options);
    return result;
};
exports.create = create;
const findOneAndUpdate = async ({ model, filter = {}, update, select = "", populate = [], options = { new: true } }) => {
    return await model.findOneAndUpdate(filter, update, options).select(select).populate(populate);
};
exports.findOneAndUpdate = findOneAndUpdate;
