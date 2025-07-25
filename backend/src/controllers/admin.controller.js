import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { admin } from "../models/admin.model.js";
import { student, studentdocs } from "../models/student.model.js";
import { Teacher, Teacherdocs } from "../models/teacher.model.js";
import { contact } from "../models/contact.model.js";
import { course } from "../models/course.model.js";
import { Sendmail } from "../utils/Nodemailer.js";
import mongoose from "mongoose"; // ✅ ADD THIS LINE

const adminSignUp = asyncHandler(async(req,res)=>{
    const {username, password} = req.body

    if([username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedAdmin = await admin.findOne({ username})

    if(existedAdmin){
        throw new ApiError(400, "admin already exist")
    }

    const newAdmin = await admin.create({
        username,
        password,
    })

    if(!newAdmin){
        throw new ApiError(400, "failed to add admin")
    }

    return res 
    .status(200)
    .json(new ApiResponse(400,{}, "admin added successfully"))

})

const generateAccessAndRefreshTokens = async (admindID) =>{ 
    try {
        
        const Admin = await admin.findById(admindID)
        
        const Accesstoken = Admin.generateAccessToken()
        const Refreshtoken = Admin.generateRefreshToken()

        Admin.Refreshtoken = Refreshtoken
        await Admin.save({validateBeforeSave:false})

        return{Accesstoken, Refreshtoken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const adminLogin = asyncHandler(async(req,res)=>{

    const {username, password} = req.body

    if([username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const loggedAdmin = await admin.findOne({username})

    if(!loggedAdmin){
        throw new ApiError(400, "admin does not exist")
    }

    const passwordCheck = await loggedAdmin.isPasswordCorrect(password)

    if(!passwordCheck){
        throw new ApiError(400, "Password is incorrect")
    }

    const temp_admin = loggedAdmin._id

    const {Accesstoken, Refreshtoken} =  await generateAccessAndRefreshTokens(temp_admin)

    const loggedadmin = await admin.findById(temp_admin).select("-password -Refreshtoken")

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res 
    .status(200)
    .cookie("Accesstoken", Accesstoken, options)
    .cookie("Refreshtoken", Refreshtoken, options)
    .json(new ApiResponse(200,{admin:loggedadmin}, "logged in successfully"))
})

const adminLogout = asyncHandler(async(req,res)=>{

    await admin.findByIdAndUpdate(
        req.Admin._id,
        {
            $set:{
                Refreshtoken:undefined,
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("Accesstoken", options)
    .clearCookie("Refreshtoken",  options)
    .json(new ApiResponse(200, {}, "admin logged out"))
})

const forApproval = asyncHandler(async(req,res)=>{

    const adminID = req.params.adminID

    if(!adminID){
        throw new ApiError(400, "not authorized")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(400, "admin not found")
    }


    const studentsforApproval = await student.find({
        Isverified: true
    })

    const teachersforApproval = await Teacher.find({
        Isverified: true
    })

    if(!studentsforApproval && !teachersforApproval){
        return res
        .status(200)
        .json(new ApiResponse(200, loggedAdmin, "No pending student or teacher"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{admin:loggedAdmin, studentsforApproval
    , teachersforApproval}, "fetched successfully"))
})

const approveStudent = asyncHandler(async(req,res)=>{

    const adminID = req.params.adminID

    if(!adminID){
        throw new ApiError(400, "not authorized")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(400, "admin not found")
    }


    const studentID = req.params.studentID


    if(!studentID){
        throw new ApiError(400, "student id is required")
    }

    const toApprove = req.body.Isapproved

    const email = req.body.email

    const remarks = req.body.remarks || null

    if (!toApprove || (toApprove != "approved" && toApprove != "rejected" && toApprove !== "reupload")) {
        throw new ApiError(400, "Please choose 'approve' or 'reject' or 'reupload'");
    }

    const theStudent = await student.findOneAndUpdate({_id: studentID}, {$set: {Isapproved:toApprove, Remarks: remarks}},  { new: true })
    
    if(!theStudent){
        throw new ApiError(400,"faild to approve or reject || student not found")
    }

    
    console.log("email", email);

    await Sendmail(email, `Document Verification Status`, 
        `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #4CAF50; text-align: center;">Document Verification Status!</h1>
            <p style="font-size: 16px; text-align: center;">We have completed the verification process for the documents you submitted. Your document verification status is: ${toApprove}</p>
            <p style="font-size: 16px;">Remarks: ${remarks}</p>
            <p style="font-size: 16px;">Best regards,</p>
            <p style="font-size: 16px;"><strong>The Shiksharthee Team</strong></p>
            <p style="font-size: 14px;">&copy; 2024 Shiksharthee. All rights reserved.</p>
            </body>
        </html>`
    )

    return res
    .status(200)
    .json(new ApiResponse(200, theStudent, `task done successfully`))

})

const approveTeacher = asyncHandler(async(req,res)=>{

    const adminID = req.params.adminID

    if(!adminID){
        throw new ApiError(400, "not authorized")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(400, "admin not found")
    }


    const teacherID = req.params.teacherID

    if(!teacherID){
        throw new ApiError(400, "student id is required")
    }

    const toApprove = req.body.Isapproved
    const email = req.body.email
    const remarks = req.body.remarks || null

    if (!toApprove || (toApprove !== "approved" && toApprove !== "rejected" && toApprove !== "reupload")) {
        throw new ApiError(400, "Please choose 'approve' or 'reject' or 'reupload'");
    }

    const theTeacher = await Teacher.findOneAndUpdate({_id: teacherID}, {$set: {Isapproved:toApprove, Remarks: remarks}},  { new: true })
    
    if(!theTeacher){
        throw new ApiError(400,"faild to approve or reject || student not found")
    }

    await Sendmail(email, `Document Verification Status`, 
        `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #4CAF50; text-align: center;">Document Verification Status!</h1>
            <p style="font-size: 16px; text-align: center;">We have completed the verification process for the documents you submitted. Your document verification status is: ${toApprove}</p>
            <p style="font-size: 16px;">Remarks: ${remarks}</p>
            <p style="font-size: 16px;">Best regards,</p>
            <p style="font-size: 16px;"><strong>The Shiksharthee Team</strong></p>
            <p style="font-size: 14px;">&copy; 2024 Shiksharthee. All rights reserved.</p>
            </body>
        </html>`
    )

    return res
    .status(200)
    .json(new ApiResponse(200, theTeacher, `task done successfully`))

})

const checkStudentDocuments = asyncHandler(async(req,res)=>{
    console.log('checkStudentDocuments called with params:', req.params);
    
    const adminID = req.params.adminID
    const studentID = req.params.studentID

    console.log('AdminID:', adminID, 'StudentID:', studentID);

    if(!adminID){
        throw new ApiError(400, "Admin ID is required")
    }
    
    if(!studentID){
        throw new ApiError(400, "Student ID is required")
    }

    if(!mongoose.Types.ObjectId.isValid(adminID)){
        throw new ApiError(400, "Invalid Admin ID format")
    }
    
    if(!mongoose.Types.ObjectId.isValid(studentID)){
        throw new ApiError(400, "Invalid Student ID format")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(404, "Admin not found")
    }

    const theStudent = await student.findById(studentID)

    if(!theStudent){
        throw new ApiError(404, "Student not found")
    }

    const docID = theStudent.Studentdetails

    // ✅ FIXED: Handle case where student doesn't have documents
    if(!docID){
        console.log('Student found but no documents uploaded yet');
        
        return res
        .status(200)
        .json(new ApiResponse(200, {
            loggedAdmin, 
            theStudent, 
            studentDocs: null,
            message: "Student registered but documents not uploaded yet"
        }, "Student found but no documents uploaded"))
    }

    const studentDocs = await studentdocs.findById(docID)
    
    if(!studentDocs){
        // Documents reference exists but document not found
        console.log('Document reference exists but documents not found');
        
        return res
        .status(200)
        .json(new ApiResponse(200, {
            loggedAdmin, 
            theStudent, 
            studentDocs: null,
            message: "Document reference exists but documents not found"
        }, "Document reference found but documents missing"))
    }

    console.log('Successfully retrieved student documents');
    
    return res
    .status(200)
    .json(new ApiResponse(200, {
        loggedAdmin, 
        theStudent, 
        studentDocs
    }, "documents retrieved successfully"))
})

const checkTeacherDocuments = asyncHandler(async(req,res)=>{
    console.log('checkTeacherDocuments called with params:', req.params);
    
    const adminID = req.params.adminID
    const teacherID = req.params.teacherID

    console.log('AdminID:', adminID, 'TeacherID:', teacherID);

    if(!adminID){
        throw new ApiError(400, "Admin ID is required")
    }

    if(!teacherID){
        throw new ApiError(400, "Teacher ID is required")
    }

    // ✅ FIXED: Remove the require() and use the imported mongoose
    if(!mongoose.Types.ObjectId.isValid(adminID)){
        throw new ApiError(400, "Invalid Admin ID format")
    }
    
    if(!mongoose.Types.ObjectId.isValid(teacherID)){
        throw new ApiError(400, "Invalid Teacher ID format")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(404, "Admin not found")
    }

    const theTeacher = await Teacher.findById(teacherID)

    if(!theTeacher){
        throw new ApiError(404, "Teacher not found")
    }

    const docID = theTeacher.Teacherdetails

    if(!docID){
        throw new ApiError(404, "Documents not found, please ask teacher to upload documents")
    }

    const teacherDocs = await Teacherdocs.findById(docID)
    
    if(!teacherDocs){
        throw new ApiError(404, "Failed to retrieve teacher documents")
    }

    console.log('Successfully retrieved teacher documents');

    return res
    .status(200)
    .json(new ApiResponse(200, {loggedAdmin, theTeacher, teacherDocs}, "documents retrieved successfully"))
})

const getDocumentsByType = asyncHandler(async(req, res) => {
    console.log('getDocumentsByType called with params:', req.params);
    
    const { adminID, type, ID } = req.params;
    
    console.log('AdminID:', adminID, 'Type:', type, 'ID:', ID);

    if (!adminID) {
        throw new ApiError(400, "Admin ID is required");
    }
    
    if (!ID) {
        throw new ApiError(400, "Document ID is required");
    }
    
    if (!type || (type !== 'student' && type !== 'teacher')) {
        throw new ApiError(400, "Invalid type. Must be 'student' or 'teacher'");
    }

    if (!mongoose.Types.ObjectId.isValid(adminID)) {
        throw new ApiError(400, "Invalid Admin ID format");
    }
    
    if (!mongoose.Types.ObjectId.isValid(ID)) {
        throw new ApiError(400, "Invalid ID format");
    }

    const loggedAdmin = await admin.findById(adminID);

    if (!loggedAdmin) {
        throw new ApiError(404, "Admin not found");
    }

    if (type === 'student') {
        const theStudent = await student.findById(ID);

        if (!theStudent) {
            throw new ApiError(404, "Student not found");
        }

        const docID = theStudent.Studentdetails;

        // ✅ Handle students without documents
        if (!docID) {
            console.log('Student found but no documents uploaded yet');
            
            return res
                .status(200)
                .json(new ApiResponse(200, {
                    loggedAdmin, 
                    theStudent, 
                    studentDocs: null,
                    message: "Student registered but documents not uploaded yet"
                }, "Student found but no documents uploaded"));
        }

        const studentDocs = await studentdocs.findById(docID);
        
        if (!studentDocs) {
            return res
                .status(200)
                .json(new ApiResponse(200, {
                    loggedAdmin, 
                    theStudent, 
                    studentDocs: null,
                    message: "Document reference exists but documents not found"
                }, "Document reference found but documents missing"));
        }

        console.log('Successfully retrieved student documents');
        
        return res
            .status(200)
            .json(new ApiResponse(200, { loggedAdmin, theStudent, studentDocs }, "documents retrieved successfully"));
            
    } else if (type === 'teacher') {
        const theTeacher = await Teacher.findById(ID);

        if (!theTeacher) {
            throw new ApiError(404, "Teacher not found");
        }

        const docID = theTeacher.Teacherdetails;

        // For teachers, documents are required, so keep the original error behavior
        if (!docID) {
            throw new ApiError(404, "Documents not found, please ask teacher to upload documents");
        }

        const teacherDocs = await Teacherdocs.findById(docID);
        
        if (!teacherDocs) {
            throw new ApiError(404, "Failed to retrieve teacher documents");
        }

        console.log('Successfully retrieved teacher documents');

        return res
            .status(200)
            .json(new ApiResponse(200, { loggedAdmin, theTeacher, teacherDocs }, "documents retrieved successfully"));
    }
});

const sendmessage = asyncHandler(async(req,res)=>{
    const {name, message, email} = req.body;

    if([name, message, email].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const contactUs = await contact.create({
        name,
        email,
        message
    })

    const createdContactUs = await contact.findById(contactUs._id)

    if(!contactUs){
        throw new ApiError(400, "failed to send message")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {contactUs: createdContactUs}, "message sent successfully"))
})

const allmessages = asyncHandler(async(req,res)=>{
    
    const messages = await contact.find({
        status:false,
    }).sort({ _id: -1 });
    
    if(!messages){
        return res
        .status(200)
        .json(new ApiResponse(200, {}, "no new messages"))
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, messages, "messages fetched"))
})

const readMessage = asyncHandler(async(req,res)=>{

    const messageID = req.body.messageID;

    console.log(messageID);

    const isdone = await contact.findByIdAndUpdate({_id: messageID}, {$set:{status:true}}, {new:true})

    if(!isdone){
        throw new ApiError(400, "error occured while updating the status")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, isdone, "status updated successfully"))
})

const toapproveCourse = asyncHandler(async(req,res)=>{

    const adminID = req.params.adminID

    if(!adminID){
        throw new ApiError(400, "not authorized")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(400, "admin not found")
    }

   
    
    const courseForApproval = await course.find({isapproved:false}).populate("enrolledteacher") 

    return res.status(200).json(new ApiResponse(200, courseForApproval,"fetched successfully"))

})

const approveCourse = asyncHandler(async(req,res)=>{

    const adminID = req.params.adminID

    if(!adminID){
        throw new ApiError(400, "not authorized")
    }

    const loggedAdmin = await admin.findById(adminID)

    if(!loggedAdmin){
        throw new ApiError(400, "admin not found")
    }

    const courseID = req.params.courseID

    if(!courseID){
        throw new ApiError(400, "course id is required")
    }

    const toApprove = req.body.Isapproved

    if(toApprove){
        const theCourse = await course.findOneAndUpdate({_id: courseID}, {$set: {isapproved:toApprove}},  { new: true })

        if(!theCourse){
            throw new ApiError(400,"faild to approve or reject")
        }

        const Fname = req.body.Firstname;

        Sendmail(req.body.email, `Course Approval Update`, 
            `<html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #4CAF50; text-align: center;">Congratulations!</h1>
                <p style="font-size: 16px; text-align: center;">Dear ${Fname},</p>
                <p style="font-size: 16px; text-align: center;">We are delighted to inform you that your course ( ${theCourse.coursename} ) submission has been reviewed and approved by our team.</p>
                <p style="font-size: 16px;">Thank you for being a part of our educational community. We look forward to seeing your course make a positive impact on learners around the world.</p>
                <p style="font-size: 16px;">Best regards,</p>
                <p style="font-size: 16px;"><strong>The Shiksharthee Team</strong></p>
                <p style="font-size: 14px;">&copy; 2024 Shiksharthee. All rights reserved.</p>
                </body>
            </html>
        `)

        return res
        .status(200)
        .json(new ApiResponse(200, theCourse, `Course approved successfully`))
    }

    else{
        const theCourse = await course.findByIdAndDelete({_id: courseID}, {new:true})
        const Fname = req.body.Firstname;

        Sendmail(req.body.email, `Course Approval Update`, 
            `<html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #4CAF50; text-align: center;">Course Submission Update!</h1>
                <p style="font-size: 16px; text-align: center;">Dear ${Fname},</p>
                <p style="font-size: 16px; text-align: center;">After a thorough evaluation, we regret to inform you that your course, <strong>( ${theCourse.coursename} )</strong>, does not meet the requirements for approval at this time.</p>
                <p style="font-size: 16px;">Thank you for your understanding and continued commitment to providing quality education.</p>
                <p style="font-size: 16px;">Best regards,</p>
                <p style="font-size: 16px;"><strong>The Shiksharthee Team</strong></p>
                <p style="font-size: 14px;">&copy; 2024 Shiksharthee. All rights reserved.</p>
                </body>
            </html>
        `)

        return res
        .status(200)
        .json(new ApiResponse(200,{},`Course rejected successfully`))
    }
})

export {adminSignUp, adminLogin,  getDocumentsByType, forApproval, approveStudent, approveTeacher, checkStudentDocuments, checkTeacherDocuments, adminLogout, sendmessage, allmessages,readMessage, toapproveCourse, approveCourse}