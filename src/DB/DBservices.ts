import { Model, Document, FilterQuery, PopulateOptions , Types , UpdateQuery , QueryOptions ,InsertManyOptions } from "mongoose";

interface FindOneOptions<T extends Document> {
  model: Model<T>;
  filter?: FilterQuery<T>;
  select?: string;
  populate?: (string | PopulateOptions)[];
}


interface FindByIdOptions<T extends Document> {
  model: Model<T>;
  id?: string | Types.ObjectId;
  select?: string;
  populate?: (string | PopulateOptions)[];
}

interface CreateOptions<T> {
model: Model<T>;
data: Partial<T> | Partial<T>[];
options?: InsertManyOptions;
}

interface FindOneAndUpdateOptions<T extends Document> {
  model: Model<T>;
  filter?: FilterQuery<T>;
  update: UpdateQuery<T>; 
  select?: string;
  populate?: (string | PopulateOptions)[];
  options?: QueryOptions;
}



export const findOne = async <T extends Document> ({model,filter={},select="" ,populate = []}:
     FindOneOptions<T>): Promise<T | null>=> {
    return await model.findOne(filter).select(select).populate(populate)
}

export const findById = async <T extends Document> ({model,id,select="" ,populate = []}:
     FindByIdOptions<T>): Promise<T | null>=> {
    return await model.findById(id).select(select).populate(populate)
}


export const create = async <T extends Document>({ model, data, options = {} }: CreateOptions<T>):Promise<T | T[]> => {
  const result = await model.create([data], options);
  return result as T | T[]; 
};


export const findOneAndUpdate = async <T extends Document>({model,filter = {},update,select = "",
  populate = [],options = { new: true }}: FindOneAndUpdateOptions<T>): Promise<T | null> => {
  return await model.findOneAndUpdate(filter, update, options).select(select).populate(populate);
};
