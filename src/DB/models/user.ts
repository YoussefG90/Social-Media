import { Document, HydratedDocument, Schema ,Types , model} from "mongoose"
import { generateHash } from "../../utils/Security/Hash";
import { emailEvent } from "../../utils/Events/email";



export enum genderEnum  {male = "male" , female = "female"}
export enum roleEnum  {user = "User" , admin = "Admin", superAdmin = "SuperAdmin"}
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
  newEmailOTP:string;
  newEmailOTPExpires:Date; 
  resetPasswordOTP:string;
  resetPasswordOTPExpires:Date; 
  confirmEmail:boolean;
  resetPassword:boolean;
  resetEmail:boolean;
  gender:genderEnum;
  role:roleEnum; 
  changeCredentialsTime:Date;
  createdAt:Date;
  updatedAt?:Date;
  freezeAt?:Date;
  freezeBy:Types.ObjectId;
  restoreAt?:Date;
  restoreBy:Types.ObjectId;
  provider:providerEnum;
  tempEmail?:string;
  twoFactorEnabled:boolean;
  twoFactorOTP:string;
  twoFactorExpires:Date; 
  friends?:Types.ObjectId[];
  block?:Types.ObjectId[];


  profileImage?:{ secure_url: string; public_id: string };
  coverImages?: { secure_url: string; public_id: string }[];
}


const userSchema = new Schema<IUser> ({
  firstName: {type :String , required:true , minlength:2 , maxlength:25},
  lastName:{type :String , required:true, minlength:2 , maxlength:25},
  email: {type :String , required:true, unique:true},
  password:{type:String,required:function(){return this.provider === providerEnum.System ? true : false}},
  phone:{type :String },
  age:{type :Number , required:true},
  tempEmail:{type :String},
  emailOTP: String,
  emailOTPExpires: Date,
  newEmailOTP:String,
  newEmailOTPExpires:Date,
  resetPasswordOTP:String,
  resetPasswordOTPExpires:Date, 
  resetEmail:{type: Boolean,default: false},
  provider:{type:String , enum:providerEnum , default: providerEnum.System},
  resetPassword: {type: Boolean,default: false},
  confirmEmail: {type: Boolean,default: false},
  twoFactorEnabled:{type: Boolean,default: false},
  twoFactorOTP:String,
  twoFactorExpires:Date,
  freezeAt:Date,
  freezeBy:{type:Schema.Types.ObjectId ,ref:"User"},
  restoreAt:Date,
  restoreBy:{type:Schema.Types.ObjectId ,ref:"User"},
  gender:{type:String , enum : genderEnum, default:genderEnum.male},
  role:{type:String , enum :roleEnum,default:roleEnum.user},
  profileImage: {secure_url: { type: String },public_id: { type: String},},
  coverImages: [{secure_url: { type: String },public_id: { type: String }}],
  friends:[{type:Schema.Types.ObjectId ,ref:"User"}],
  block:[{type:Schema.Types.ObjectId ,ref:"User"}],

},{
  timestamps:true,
  strictQuery:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

userSchema.virtual("userName").set(function (value:string) {
  const [firstName , lastName] = value.split(" ") || [];
  this.set({firstName,lastName});
}).get(function () {
  return this.firstName + " " + this.lastName;
})


userSchema.pre("save" , async function(this:HUserDocument & {wasNew:boolean ,
   confirmEmailPlainOtp:string},next
) {
  this.wasNew = this.isNew
  if (this.isModified("password")) {
    this.password = await generateHash({plaintext:this.password})
  }
  if (this.isModified("emailOTP")) {
    this.confirmEmailPlainOtp = this.emailOTP as string
    this.emailOTP = await generateHash({plaintext:this.emailOTP as string})
  }
  next()
})


userSchema.post("save" , async function (doc , next) {
  const that  = this as HUserDocument & {wasNew:boolean , confirmEmailPlainOtp:string}
  if (that.wasNew && that.confirmEmailPlainOtp) {
    emailEvent.emit("Confirm Email", { to: this.email, otp: that.confirmEmailPlainOtp }); 
  }
  next()
})



userSchema.post("findOneAndUpdate", async function (doc) {
    if (!doc) return;
    const prev = await this.model.findOne(this.getQuery()).select("role email");
    if (prev && prev.role !== doc.role && doc.email) {
      emailEvent.emit("Role Changed", {
        to: doc.email,
        otp: `Your role has been changed to ${doc.role}`,
      });
    }
});



userSchema.pre(["find" , "findOne"] , function(next){
  const query = this.getQuery()
  if (query.paranoid === false) {
    delete query.paranoid
    this.setQuery({ ...query })
  } else {
    delete query.paranoid
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }
  next()
})


export const UserModel =  model <IUser>("User" , userSchema)
export type HUserDocument =  HydratedDocument<IUser>

export default UserModel