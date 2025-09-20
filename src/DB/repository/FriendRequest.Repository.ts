import { Model } from "mongoose";
import { DataBaseRepository} from "./DB.Repository";
import {IFriendRequest as TDocument} from "../models"

export class FriendRequestRepository extends DataBaseRepository<TDocument>{ 
    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }

}