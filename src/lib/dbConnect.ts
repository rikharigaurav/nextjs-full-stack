import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function connectDB(): Promise<void> {
    if(connection.isConnected){
        console.log("Already Connected to DataBase")
        return ;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URL || '', {} )

        connection.isConnected = db.connections[0].readyState

        console.log("DB Connected Successfully")

    } catch (error) {
        throw new Error("Error connecting to database")

        process.exit
    }
}

export default connectDB;
