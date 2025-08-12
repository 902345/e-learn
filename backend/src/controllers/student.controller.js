import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {student, studentdocs} from "../models/student.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Teacher } from "../models/teacher.model.js";
import { Sendmail } from "../utils/Nodemailer.js";

// Updated verifyEmail function using the Sendmail utility
const verifyEmail = async (Email, Firstname, createdStudent_id) => {
    const subject = "Verify your E-mail";
    const message = `
        <div style="text-align: center;">
            <p style="margin: 20px;"> Hi ${Firstname}, Please click the button below to verify your E-mail. </p>
            <img src="https://img.freepik.com/free-vector/illustration-e-mail-protection-concept-e-mail-envelope-with-file-document-attach-file-system-security-approved_1150-41788.jpg?size=626&ext=jpg&uid=R140292450&ga=GA1.1.553867909.1706200225&semt=ais" alt="Verification Image" style="width: 100%; height: auto;">
            <br>
            <a href="${process.env.BACKEND_URL}/api/student/verify?id=${createdStudent_id}">
                <button style="background-color: black; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 10px 0; cursor: pointer;">Verify Email</button>
            </a>
        </div>`;

    try {
        const result = await Sendmail(Email, subject, message);
        if (!result.success) {
            console.error("Email sending failed:", result.error);
            throw new ApiError(400, result.error);
        }
        console.log("Verification mail sent successfully to:", Email);
        return result;
    } catch (error) {
        console.error("Failed to send email verification:", error);
        // Don't throw error in signup process, just log it
        return { success: false, error: error.message };
    }
};

const generateAccessAndRefreshTokens = async (stdID) => { 
    try {
        const std = await student.findById(stdID);
        
        if (!std) {
            throw new ApiError(404, "Student not found");
        }
        
        const Accesstoken = std.generateAccessToken();
        const Refreshtoken = std.generateRefreshToken();

        std.Refreshtoken = Refreshtoken;
        await std.save({validateBeforeSave: false});

        return {Accesstoken, Refreshtoken};

    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const signup = asyncHandler(async (req, res) => {
    try {
        console.log("Signup request received:", req.body);
        
        const {Firstname, Lastname, Email, Password} = req.body;

        // Input validation
        if ([Firstname, Lastname, Email, Password].some((field) => 
            !field || field.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required");
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email.trim())) {
            throw new ApiError(400, "Invalid email format");
        }

        // Password validation
        if (Password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        // Check if student already exists
        const existedStudent = await student.findOne({ Email: Email.trim() });
        if (existedStudent) {
            throw new ApiError(400, "Student already exists");
        }

        // Check if email belongs to a teacher
        const checkTeach = await Teacher.findOne({Email: Email.trim()});
        if (checkTeach) {
            throw new ApiError(400, "Email belongs to a teacher");
        }

        // Create new student
        const newStudent = await student.create({
            Email: Email.trim(),
            Firstname: Firstname.trim(),
            Lastname: Lastname.trim(),
            Password,
            Studentdetails: null,
        });

        const createdStudent = await student.findById(newStudent._id).select("-Password");
        
        if (!createdStudent) {
            throw new ApiError(500, "Student registration failed");
        }
        
        // Send verification email (non-blocking)
        try {
            await verifyEmail(Email.trim(), Firstname.trim(), newStudent._id);
            console.log("Verification email sent successfully");
        } catch (emailError) {
            console.error("Email verification failed but continuing:", emailError);
            // Don't fail the signup process if email fails
        }

        return res.status(201).json(
            new ApiResponse(201, createdStudent, "Signup successful. Please check your email for verification.")
        );
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
});

const mailVerified = asyncHandler(async(req, res) => {
    const id = req.query.id;

    if (!id) {
        throw new ApiError(400, "Verification ID is required");
    }

    try {
        const updatedInfo = await student.updateOne(
            { _id: id }, 
            { $set: { Isverified: true } }
        );

        if (updatedInfo.matchedCount === 0) {
            return res.status(404).send(`
            <div style="text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h1 style="font-size: 36px; font-weight: bold; padding: 20px; color: red;">Student Not Found</h1>
                <h4>The verification link is invalid or expired.</h4>
                <button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; margin: 20px;" onclick="window.location.href = '${process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',')[0] : 'http://localhost:5173'}';">Go Back Home</button>
            </div>
            `);
        }

        if (updatedInfo.modifiedCount === 0) {
            // Student found but already verified
            return res.send(`
            <div style="text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <img src="https://cdn-icons-png.flaticon.com/128/4436/4436481.png" alt="Verify Email Icon" style="width: 100px; height: 100px;">
                <h1 style="font-size: 36px; font-weight: bold; padding: 20px;">Already Verified</h1>
                <h4>Your email address was already verified.</h4>
                <button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; margin: 20px;" onclick="window.location.href = '${process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',')[0] : 'http://localhost:5173'}';">Go Back Home</button>
            </div>
            `);
        }

        return res.send(`
        <div style="text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <img src="https://cdn-icons-png.flaticon.com/128/4436/4436481.png" alt="Verify Email Icon" style="width: 100px; height: 100px;">
            <h1 style="font-size: 36px; font-weight: bold; padding: 20px;">Email Verified Successfully!</h1>
            <h4>Your email address was successfully verified. You can now login.</h4>
            <button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; margin: 20px;" onclick="window.location.href = '${process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',')[0] : 'http://localhost:5173'}';">Go Back Home</button>
        </div>
        `);
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).send(`
        <div style="text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 36px; font-weight: bold; padding: 20px; color: red;">Verification Failed</h1>
            <h4>There was an error verifying your email. Please try again or contact support.</h4>
            <button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; margin: 20px;" onclick="window.location.href = '${process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',')[0] : 'http://localhost:5173'}';">Go Back Home</button>
        </div>
        `);
    }
});

const login = asyncHandler(async(req, res) => {
    try {
        console.log("Login attempt for:", req.body.Email);
        
        const { Email, Password } = req.body;

        if ([Email, Password].some((field) => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const StdLogin = await student.findOne({ Email: Email.trim() });

        if (!StdLogin) {
            throw new ApiError(404, "Student does not exist");
        }

        if (!StdLogin.Isverified) {
            throw new ApiError(401, "Email is not verified. Please check your email for verification link.");
        }

        const StdPassCheck = await StdLogin.isPasswordCorrect(Password);

        if (!StdPassCheck) {
            throw new ApiError(401, "Invalid credentials");
        }

        const {Accesstoken, Refreshtoken} = await generateAccessAndRefreshTokens(StdLogin._id);

        const loggedInStd = await student.findById(StdLogin._id).select("-Password -Refreshtoken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        };

        console.log("Login successful for:", Email);

        return res
        .status(200)
        .cookie("Accesstoken", Accesstoken, options)
        .cookie("Refreshtoken", Refreshtoken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInStd,
                accessToken: Accesstoken
            }, "Login successful")
        );
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
});

const logout = asyncHandler(async(req, res) => {
    try {
        await student.findByIdAndUpdate(
            req.Student._id,
            {
                $unset: {
                    Refreshtoken: 1
                }
            },
            {
                new: true
            }
        );
        
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        };

        return res
        .status(200)
        .clearCookie("Accesstoken", options)
        .clearCookie("Refreshtoken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.error("Logout error:", error);
        throw new ApiError(500, "Error during logout");
    }
});

const getStudent = asyncHandler(async(req, res) => {
    try {
        const user = req.Student;
        const id = req.params.id;
        
        if (!user || !id) {
            throw new ApiError(400, "Invalid request");
        }
        
        if (req.Student._id.toString() !== id) {
            throw new ApiError(403, "Unauthorized access");
        }
        
        return res
        .status(200)
        .json(new ApiResponse(200, user, "Student data retrieved successfully"));
    } catch (error) {
        console.error("Get student error:", error);
        throw error;
    }
});

const addStudentDetails = asyncHandler(async(req, res) => {
    try {
        const id = req.params.id;
        if (req.Student._id.toString() !== id) {
            throw new ApiError(403, "Not authorized");
        }

        const {Phone, Address, Highesteducation, SecondarySchool, HigherSchool, SecondaryMarks, HigherMarks} = req.body;

        if ([Phone, Address, Highesteducation, SecondarySchool, HigherSchool, SecondaryMarks, HigherMarks].some((field) => 
            !field || field.toString().trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // Phone number validation (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(Phone.trim())) {
            throw new ApiError(400, "Invalid phone number format. Please enter a valid 10-digit Indian phone number.");
        }

        // Check if phone number already exists
        const alreadyExist = await studentdocs.findOne({Phone: Phone.trim()});
        if (alreadyExist) {
            throw new ApiError(400, "Phone number already exists");
        }

        // Validate marks
        const secMarks = parseFloat(SecondaryMarks);
        const highMarks = parseFloat(HigherMarks);
        
        if (isNaN(secMarks) || isNaN(highMarks) || secMarks < 0 || highMarks < 0 || secMarks > 100 || highMarks > 100) {
            throw new ApiError(400, "Invalid marks. Please enter valid percentage between 0-100.");
        }

        // File validation
        const AadhaarLocalPath = req.files?.Aadhaar?.[0]?.path;
        const SecondaryLocalPath = req.files?.Secondary?.[0]?.path;
        const HigherLocalPath = req.files?.Higher?.[0]?.path;

        if (!AadhaarLocalPath) {
            throw new ApiError(400, "Aadhaar document is required");
        }

        if (!SecondaryLocalPath) {
            throw new ApiError(400, "Secondary marksheet is required");
        }

        if (!HigherLocalPath) {
            throw new ApiError(400, "Higher secondary marksheet is required");
        }

        // Upload files to Cloudinary
        console.log("Uploading documents to Cloudinary...");
        const [Aadhaar, Secondary, Higher] = await Promise.all([
            uploadOnCloudinary(AadhaarLocalPath),
            uploadOnCloudinary(SecondaryLocalPath),
            uploadOnCloudinary(HigherLocalPath)
        ]);

        if (!Aadhaar?.url || !Secondary?.url || !Higher?.url) {
            throw new ApiError(400, "Failed to upload documents. Please try again.");
        }

        // Create student details
        const studentdetails = await studentdocs.create({
            Phone: Phone.trim(),
            Address: Address.trim(),
            Highesteducation: Highesteducation.trim(),
            SecondarySchool: SecondarySchool.trim(),
            HigherSchool: HigherSchool.trim(),
            SecondaryMarks: secMarks,
            HigherMarks: highMarks,
            Aadhaar: Aadhaar.url,
            Secondary: Secondary.url,
            Higher: Higher.url,
        });

        // Update student with details
        const theStudent = await student.findOneAndUpdate(
            {_id: id}, 
            {$set: {Isapproved: "pending", Studentdetails: studentdetails._id}},  
            { new: true }
        ).select("-Password -Refreshtoken");
        
        if (!theStudent) {
            throw new ApiError(400, "Failed to update student details");
        }

        console.log("Student details added successfully for:", theStudent.Email);

        return res
        .status(200)
        .json(new ApiResponse(200, theStudent, "Documents uploaded successfully and sent for approval"));

    } catch (error) {
        console.error("Add student details error:", error);
        throw error;
    }
});

const forgetPassword = asyncHandler(async(req, res) => {
    try {
        const { Email } = req.body;

        if (!Email || Email.trim() === "") {
            throw new ApiError(400, "Email is required");
        }
       
        const User = await student.findOne({Email: Email.trim()});

        if (!User) {
            throw new ApiError(404, "No account found with this email address");
        }

        await User.generateResetToken();
        await User.save();

        const resetToken = `${process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',')[0] : 'http://localhost:5173'}/student/forgetpassword/${User.forgetPasswordToken}`;
        const subject = 'RESET PASSWORD';
        const message = `
            <div style="text-align: center; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Dear ${User.Firstname} ${User.Lastname},</p>
                <p>We have received a request to reset your password. To proceed, please click on the following button:</p>
                <br>
                <a href="${resetToken}" target="_blank" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                <br><br>
                <p>If the button does not work, you can copy and paste the following URL into your browser:</p>
                <p style="word-break: break-all;">${resetToken}</p>
                <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <br>
                <p>Thank you for being a valued member of the Shiksharthee community.</p>
                <p>Best regards,<br>The Shiksharthee Team</p>
            </div>`;

        const result = await Sendmail(Email.trim(), subject, message);
        
        if (!result.success) {
            throw new ApiError(400, "Failed to send reset password email");
        }

        console.log("Password reset email sent to:", Email);

        res.status(200).json({
            success: true,
            message: `Reset password email has been sent to ${Email} successfully`
        });

    } catch (error) {
        console.error("Forget password error:", error);
        throw error;
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            throw new ApiError(400, "Both password and confirm password are required");
        }

        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        const user = await student.findOne({
            forgetPasswordToken: token,
            forgetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Password reset token is invalid or expired. Please request a new password reset.');
        }

        user.Password = password;
        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;

        await user.save();

        console.log("Password reset successful for:", user.Email);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
});

export {
    signup,
    mailVerified,
    login, 
    logout, 
    addStudentDetails,
    getStudent, 
    forgetPassword,
    resetPassword
}