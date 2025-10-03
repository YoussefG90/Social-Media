import { GraphQLBoolean, GraphQLInt, GraphQLString } from "graphql"
import { GraphQLEnumType, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from "graphql"
import { genderEnum, HUserDocument, providerEnum, roleEnum } from "../../DB/models"
import { GraphQlUniformResponse } from "../graphql/types.gql"


export const GraphQlGenderEnum = new GraphQLEnumType({
    name:"GraphQlGenderEnum",
    values:{
        male:{value:genderEnum.male},
        female:{value:genderEnum.female}
    }
})


export const GraphQlProviderEnum = new GraphQLEnumType({
    name:"GraphQlProviderEnum",
    values:{
        Google:{value:providerEnum.Google},
        System:{value:providerEnum.System}
    }
})

export const GraphQlRoleEnum = new GraphQLEnumType({
    name:"GraphQlRoleEnum",
    values:{
        user:{value:roleEnum.user},
        admin:{value:roleEnum.admin},
        superAdmin:{value:roleEnum.superAdmin}
    }
})


export const GraphqlOneUserResponse = new GraphQLObjectType({
    name:"GraphqlOneUserResponse",
    fields:{
  _id: {type:GraphQLID},
  firstName: {type:GraphQLString},
  lastName: {type:GraphQLString},
  userName:{type:GraphQLString , resolve:(parent:HUserDocument)=>{
    return parent.gender === genderEnum.male ? `Mr:${parent.userName}` : `Mis:${parent.userName}`
  }},
  email: {type:GraphQLString},
  password:{type:GraphQLString},
  age:{type:GraphQLInt},
  phone:{type:GraphQLString},
  emailOTP:{type:GraphQLString},
  emailOTPExpires:{type:GraphQLString}, 
  newEmailOTP:{type:GraphQLString},
  newEmailOTPExpires:{type:GraphQLString},
  resetPasswordOTP:{type:GraphQLString},
  resetPasswordOTPExpires:{type:GraphQLString}, 
  confirmEmail:{type:GraphQLBoolean},
  resetPassword:{type:GraphQLBoolean},
  resetEmail:{type:GraphQLBoolean},
  gender:{type:GraphQlGenderEnum},
  role:{type:GraphQlRoleEnum},
  changeCredentialsTime:{type:GraphQLString},
  createdAt:{type:GraphQLString},
  updateAt:{type:GraphQLString},
  freezeAt:{type:GraphQLString},
  freezeBy:{type:GraphQLID},
  restoreAt:{type:GraphQLString},
  restoreBy:{type:GraphQLID},
  provider:{type:GraphQlProviderEnum},
  tempEmail:{type:GraphQLString},
  twoFactorEnabled:{type:GraphQLBoolean},
  twoFactorOTP:{type:GraphQLString},
  twoFactorExpires:{type:GraphQLString}, 
  friends:{type:new GraphQLList(GraphQLID)},
  block:{type:new GraphQLList(GraphQLID)},
    }
})

export const wellcome = new GraphQLNonNull(GraphQLString)
export const allUsers = new GraphQLList(GraphqlOneUserResponse)
export const addFollower = new GraphQLList(GraphqlOneUserResponse)
export const searchUser = GraphQlUniformResponse({
                    name:"SearchUser",
                    data: new GraphQLNonNull(GraphqlOneUserResponse),
                })

