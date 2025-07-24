import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

import path from "path";

const uploadOnCloudinary = async (localFilePath) => {
    try{
        console.log("=== Cloudinary Upload Debug ===");
        console.log("1. File path received:", localFilePath);
        
        if(!localFilePath) {
            console.log("2. No file path provided");
            return null;
        }
        
        // Normalize the path for cross-platform compatibility
        const normalizedPath = path.resolve(localFilePath);
        console.log("2. Normalized path:", normalizedPath);
        
        // Check if file exists
        if (!fs.existsSync(normalizedPath)) {
            console.log("3. File does not exist at path:", normalizedPath);
            
            // Try alternative path formats
            const alternativePath = localFilePath.replace(/\\/g, '/');
            console.log("   Trying alternative path:", alternativePath);
            
            if (!fs.existsSync(alternativePath)) {
                console.log("   Alternative path also doesn't exist");
                return null;
            } else {
                console.log("   Alternative path exists! Using it.");
                localFilePath = alternativePath;
            }
        } else {
            localFilePath = normalizedPath;
        }
        
        // Rest of your upload code...
        console.log("4. File exists, proceeding with upload...");
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        
        console.log("5. Upload successful!");
        
        // Delete local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        
        return response;
        
    } catch(err){
        console.log("❌ Cloudinary upload error:", err);
        return null;
    }
}

export {uploadOnCloudinary}