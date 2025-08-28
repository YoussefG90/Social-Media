import { CreateOptions, HydratedDocument, Model } from "mongoose";
import { DataBaseRepository } from "./DB.Repository";
import { NotFound } from "../../utils/Response/error.response";
import { IUser as TDocument } from "../models/user"; 


export class UserReposirotry extends DataBaseRepository<TDocument> {
    constructor(protected override readonly model:Model<TDocument> ) {
        super(model)
    }

    async createUser({
            data,
            options,
        }:{
            data: Partial<TDocument>[];
            options?: CreateOptions;
        }): Promise<HydratedDocument<TDocument>> {
            const [user] = (await this.create({data , options})) || []
            if (!user) {
                throw new NotFound("User Not Created")
            }
            return user
        }
}

