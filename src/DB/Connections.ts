import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.URI) {
          throw new Error("URI is not defined"); 
         }
         const uri: string = process.env.URI;
         await mongoose.connect(uri);
         console.log("Successce To Connect DB ⚡"); 
    } catch (error : unknown) {
        console.error("Fail To Connect DB 💀", (error as Error).message ?? error);
    }

}

export default connectDB