import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URLS?.split(',');

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Razorpay instance with correct env variable names
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Routes
import studentRouter from "./routes/student.routes.js";
import teacherRouter from "./routes/teacher.routes.js";
import courseRouter from "./routes/course.routes.js";
import adminRouter from "./routes/admin.routes.js";
import paymentRouter from "./routes/payment.routes.js";

app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/course", courseRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);

// Export app
export { app };
