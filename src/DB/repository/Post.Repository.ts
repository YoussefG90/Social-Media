import { DataBaseRepository } from "./DB.Repository";
import {IPost as TDocument} from "../models/post"
import { Model } from "mongoose";

export class PostRepository extends DataBaseRepository<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }
    
}