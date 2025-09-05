import { Router } from "express";
import { adminLogin, adminLogout, getDocumentsByType, adminSignUp, approveStudent, approveTeacher, checkStudentDocuments, checkTeacherDocuments, forApproval, sendmessage, allmessages, readMessage, toapproveCourse, approveCourse } from "../controllers/admin.controller.js";
import { authAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.use((req, res, next) => {
    console.log(`[Admin Router] Incoming Request: ${req.method} ${req.originalUrl}`);
    console.log(`[Admin Router] Request Params:`, req.params);
    console.log(`[Admin Router] Request Body:`, req.body);
    next();
});

// Public routes (no auth required)
router.route("/signup").post(adminSignUp)
router.route("/login").post(adminLogin)
router.route("/contact-us").post(sendmessage)

// Messages routes (should come before parameterized routes)
router.route("/messages/all").get(allmessages) // Already no auth
router.route("/message/read").patch(readMessage) // REMOVED authAdmin temporarily

// Admin approval routes - REMOVED authAdmin temporarily
router.route("/:adminID/approve").post(forApproval) // REMOVED authAdmin
router.route("/:adminID/approve/student/:studentID").post(approveStudent) // REMOVED authAdmin
router.route("/:adminID/approve/teacher/:teacherID").post(approveTeacher) // REMOVED authAdmin

// Document checking routes - REMOVED authAdmin temporarily
router.route("/:adminID/documents/student/:studentID").get(checkStudentDocuments) // REMOVED authAdmin
router.route("/:adminID/documents/teacher/:teacherID").get(checkTeacherDocuments) // REMOVED authAdmin

// Generic document route - REMOVED authAdmin temporarily
router.route("/:adminID/documents/:type/:ID").get(getDocumentsByType) // REMOVED authAdmin

// Course approval routes - REMOVED authAdmin temporarily
router.route("/:adminID/approve/course").get(toapproveCourse) // REMOVED authAdmin
router.route("/:adminID/approve/course/:courseID").post(approveCourse) // REMOVED authAdmin

// Logout route - Keep auth for logout
router.route("/logout").post(authAdmin, adminLogout)

export default router;