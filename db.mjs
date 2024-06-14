import mongoose from 'mongoose';

const connectionString = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.6";

const connectToMongo = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected Successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectToMongo;

// Call the connection function immediately when this module is imported
connectToMongo();