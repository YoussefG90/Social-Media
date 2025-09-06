import { Model , CreateOptions, HydratedDocument, RootFilterQuery, ProjectionType, QueryOptions, PopulateOptions, FlattenMaps, UpdateQuery, MongooseUpdateQueryOptions, UpdateWriteOpResult } from "mongoose";

export type Lean<T> = HydratedDocument<FlattenMaps<T>>

export abstract class DataBaseRepository<TDocument> {
    constructor(protected readonly model:Model<TDocument>) {}

    async findOne({
        filter,select,options
    }:{
        filter?:RootFilterQuery<TDocument>;
        select?:ProjectionType<TDocument> | null;
        options?:QueryOptions<TDocument> | null
    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
            const doc = this.model.findOne(filter).select(select || "");
            if (options?.populate) {
                doc.populate(options.populate as PopulateOptions[])
            }
            if (options?.lean) {
                doc.lean(options.lean)
            }
        return await doc.exec()    
    }

        async updateOne({
        filter,update,options
    }:{
        filter:RootFilterQuery<TDocument>;
        update:UpdateQuery<TDocument>;
        options?:MongooseUpdateQueryOptions<TDocument> | null
    }): Promise<UpdateWriteOpResult> {
            return await this.model.updateOne(filter,{...update,$inc:{__v:1}},options)
    }

    async findOneAndUpdate({
        filter,update,options
    }: {
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndUpdate(
            filter,
            { ...update, $inc: { __v: 1 } },
            { new: true, ...options }
        )
    }

    async create({
        data,
        options,
    }:{
        data: Partial<TDocument>[];
        options?: CreateOptions | undefined;
    }): Promise<HydratedDocument<TDocument>[] | undefined> {
        return await this.model.create(data,options);
    }
}