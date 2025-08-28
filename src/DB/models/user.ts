import { Document, HydratedDocument, Schema ,Types , model} from "mongoose"


export enum genderEnum  {male = "male" , female = "female"}
export enum roleEnum  {user = "User" , admin = "Admin"}
export enum providerEnum  {System = "System" , Google = "Google"}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  userName:string;
  email: string;
  password:string;
  age:number; 
  phone?:string;
  emailOTP:string;
  emailOTPExpires:Date; 
  resetPasswordOTP:string;
  resetPasswordOTPExpires:Date; 
  confirmEmail:boolean;
  resetPassword:boolean;
  tempEmail:string;
  gender:genderEnum;
  role:roleEnum; 
  changeCredentialsTime:Date;
  createdAt:Date;
  updatedAt?:Date;
  provider:providerEnum;
  profileImage?:string;
  coverImages?:string[];
}


const userSchema = new Schema<IUser> ({
  firstName: {type :String , required:true , minlength:2 , maxlength:25},
  lastName:{type :String , required:true, minlength:2 , maxlength:25},
  email: {type :String , required:true, unique:true},
  password:{type:String,required:function(){return this.provider === providerEnum.System ? true : false}},
  phone:{type :String },
  age:{type :Number , required:true},
  emailOTP: String,
  emailOTPExpires: Date,
  resetPasswordOTP:String,
  resetPasswordOTPExpires:Date, 
  tempEmail:String,
  provider:{type:String , enum:providerEnum , default: providerEnum.System},
  resetPassword: {type: Boolean,default: false},
  confirmEmail: {type: Boolean,default: false},
  gender:{type:String , enum : genderEnum, default:genderEnum.male},
  role:{type:String , enum :roleEnum,default:roleEnum.user},
  profileImage:{type:String},
  coverImages:[String]
},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

userSchema.virtual("userName").set(function (value:string) {
  const [firstName , lastName] = value.split(" ") || [];
  this.set({firstName,lastName});
}).get(function () {
  return this.firstName + " " + this.lastName;
})


export const UserModel =  model <IUser>("User" , userSchema)
export type HUserDocument =  HydratedDocument<IUser>

export default UserModel