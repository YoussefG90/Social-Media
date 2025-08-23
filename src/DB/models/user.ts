import { Document, Schema ,Types , model} from "mongoose"

export enum genderEnum  {male = "male" , female = "female"}
export enum roleEnum  {user = "User" , admin = "Admin"}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password:string;
  age:number; 
  phone:string;
  emailOTP:string;
  emailOTPExpires:Date; 
  resetPasswordOTP:string;
  resetPasswordOTPExpires:Date; 
  confirmEmail:boolean;
  resetPassword:boolean;
  tempEmail:string;
  gender:genderEnum;
  role:roleEnum; 
}


const userSchema = new Schema<IUser> ({
  firstName: {type :String , required:true},
  lastName:{type :String , required:true},
  email: {type :String , required:true, unique:true},
  password:{type :String , required:true},
  phone:{type :String , required:true},
  age:{type :Number , required:true},
  emailOTP: String,
  emailOTPExpires: Date,
  resetPasswordOTP:String,
  resetPasswordOTPExpires:Date, 
  tempEmail:String,
  resetPassword: {type: Boolean,default: false},
  confirmEmail: {type: Boolean,default: false},
  gender:{type:String , enum : {values : Object.values(genderEnum),
       message: `Only Allowed Genders are: ${Object.values(genderEnum).join(", ")}`},
       default:genderEnum.male},
  role:{type:String , enum : {values : Object.values(roleEnum),
       message:`Only Allowed Roles are : ${Object.values(genderEnum).join(", ")}`},
       default:roleEnum.user},
},{
  timestamps:true
})

const UserModel = model <IUser>("User" , userSchema)
export default UserModel