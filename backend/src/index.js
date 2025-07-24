import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

// Add this to your main server file after dotenv.config()
console.log("=== Cloudinary Configuration Check ===");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Present" : "❌ Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing");
console.log("=====================================");

import db from './database/db.js';
import { app } from './app.js';

console.log("Using Mongo URI:", process.env.MONGO_URI);  // ✅ Use correct env key

db()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed !!!", err);
  });
