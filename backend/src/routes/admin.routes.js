import { Router } from "express";
import { adminLogin, adminLogout, getDocumentsByType, adminSignUp, approveStudent, approveTeacher, checkStudentDocuments, checkTeacherDocuments, forApproval, sendmessage, allmessages, readMessage, toapproveCourse, approveCourse } from "../controllers/admin.controller.js";
import { authAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.use((req, res, next) => {
    console.log(`[Admin Router] Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

router.route("/signup").post(adminSignUp)

router.route("/login").post(adminLogin)

router.route("/:adminID/approve").post(authAdmin, forApproval)

router.route("/:adminID/approve/student/:studentID").post(authAdmin, approveStudent)

router.route("/:adminID/approve/teacher/:teacherID").post(authAdmin, approveTeacher)

// Fixed routes - make sure parameter names match the controller
router.route("/:adminID/documents/student/:studentID").get(authAdmin, checkStudentDocuments)

// This should match your frontend call exactly
router.route("/:adminID/documents/teacher/:teacherID").get(authAdmin, checkTeacherDocuments)

router.get('/admin/:adminID/documents/:type/:ID', getDocumentsByType);

router.route("/logout").post(authAdmin, adminLogout)

router.route("/contact-us").post(sendmessage)

router.route("/messages/all").get(authAdmin, allmessages)

router.route("/message/read").patch(authAdmin, readMessage)

router.route("/:adminID/approve/course").get(authAdmin, toapproveCourse)

router.route("/:adminID/approve/course/:courseID").post(authAdmin, approveCourse)

export default router;
