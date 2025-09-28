"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async find({ filter, select, options }) {
        const doc = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async paginate({ filter = {}, select, options = {}, page = "all", size = 5 }) {
        let docsCount = undefined;
        let pages = undefined;
        if (page !== "all") {
            page = Math.floor(page < 1 ? 1 : page);
            options.limit = Math.floor(size < 1 || !size ? 5 : size);
            options.skip = (page - 1) * options.limit;
            docsCount = await this.model.countDocuments(filter);
            pages = Math.ceil(docsCount / options.limit);
        }
        const result = await this.find({ filter, select, options });
        return { docsCount, pages, limit: options.limit, currentPage: page !== "all" ? page : undefined, result };
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
        if (Array.isArray(update)) {
            update.push({
                $set: { __v: { $add: ["$__v", 1] } }
            });
            return await this.model.updateOne(filter || {}, update, options);
        }
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
    async deleteMany({ filter }) {
        return await this.model.deleteMany(filter);
    }
}
exports.DataBaseRepository = DataBaseRepository;
