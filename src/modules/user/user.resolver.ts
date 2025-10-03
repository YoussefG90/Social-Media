import { genderEnum, HUserDocument } from "../../DB/models";
import { graphAuthorization } from "../../middleware/auth.middleware";
import { graphValidation } from "../../middleware/validation.middleware";
import { IAuthGraph } from "../graphql/schema.interface.gql";
import { endPoint } from "./user.authorization";
import { IUserGql, UserServices } from "./user.service";
import * as Validators from "./user.validation"


export class UserResolver {
    private userService:UserServices = new UserServices()
    constructor(){}

    wellcome = async (parent:unknown,args:{name:string},context:IAuthGraph):Promise<string> => {
        await graphValidation<{name:string}>(Validators.welcome,args)
        await graphAuthorization(endPoint.welcome,context.user.role)    
        return this.userService.welcome(context.user)
    }

    allUsers = async (parent:unknown,args:{gender:genderEnum},context:IAuthGraph
        ):Promise<HUserDocument[]> => {
            return await this.userService.allUsers(args,context.user) 
    }

    searchUser = (parent:unknown,args:{email:string}):{message:string;StatusCode:number;data:IUserGql} =>{
               return this.userService.searchUser(args)
    }

    addFollower = (parent:unknown,args:{friendId:number,myId:number}):IUserGql[] =>{
                return this.userService.addFollower(args)  
    }
}