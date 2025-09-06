"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, { new: true, ...options });
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findByIdAndUpdate({ id, update, options = { new: true } }) {
        return this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter }) {
        return await this.model.deleteOne(filter);
    }
}
exports.DataBaseRepository = DataBaseRepository;
