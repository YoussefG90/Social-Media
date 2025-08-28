import { DataBaseRepository } from "./DB.Repository";
import {IToken as TDocument} from "../models/token"
import { Model } from "mongoose";

export class TokenRepository extends DataBaseRepository<TDocument>{
    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }
    
}