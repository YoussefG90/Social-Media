import { DataBaseRepository } from "./DB.Repository";
import {IComment as TDocument} from "../models/comment"
import { Model } from "mongoose";

export class CommentRepository extends DataBaseRepository<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }
    
}