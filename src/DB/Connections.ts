import {connect} from "mongoose";
import UserModel from "./models/user";

const connectDB = async (): Promise<void> => {
    try {
         await connect(process.env.URI as string);
         await UserModel.syncIndexes()
         console.log("Successce To Connect DB ⚡"); 
    } catch (error : unknown) {
        console.error("Fail To Connect DB 💀", (error as Error).message ?? error);
    }

}

export default connectDB