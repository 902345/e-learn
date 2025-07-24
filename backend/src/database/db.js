import mongoose from "mongoose";

const db = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected! DB HOST :: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default db;
