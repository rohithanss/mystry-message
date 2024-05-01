import mongoose from "mongoose";

interface ConnectionObject  {
    isConnected? : number
}

const connection: ConnectionObject = {};

async function dbConnect():Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to databse");
        return;
    }

    try{
        const db = await mongoose.connect(process.env.DB_URI || '', {});
        connection.isConnected = db.connections[0].readyState;
        console.log('DB Connected Successfully', db);
    }catch(error){
        console.log("Database connection failed", error);
        process.exit(1);
    }
}

export default dbConnect;