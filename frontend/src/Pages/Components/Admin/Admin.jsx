import React, { useState, useEffect } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import logo from '../../Images/logo.svg'
import Course from "./Course";
import axios from "axios";
const baseURL = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const { data } = useParams();
  const navigator = useNavigate();

  const [StudentData, setStudentData] = useState([]);
  const [TeacherData, setTeacherData] = useState([]);
  const [adminID, setAdminID] = useState(null);
  const [error, setErrors] = useState("");
  const [allmsg, setAllMsg] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getAllMsg = async () => {
      try {
        const response = await fetch(`${baseURL}/api/admin/messages/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setAllMsg(data.data)

      } catch (err) {
        console.log(err.message);
      }
    };
    getAllMsg();
  }, [])

  // Helper function to get email from user object (handles different field names)
  const getUserEmail = (user) => {
    return user.email || user.Email || user.emailAddress || user.EmailAddress || user.userEmail || null;
  };

  const Approval = async (ID, type, approve, userEmail, userName) => {
    try {
      // Enhanced debugging and validation
      console.log('Approval params:', { ID, type, approve, userEmail, userName });
      
      // More specific email validation
      if (!userEmail || userEmail.trim() === '') {
        console.error('Email is missing or empty!', { userEmail });
        setErrors('Email is required for approval');
        return;
      }

      // Validate email format (basic validation)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        console.error('Invalid email format:', userEmail);
        setErrors('Invalid email format');
        return;
      }

      const data = {
        Isapproved: approve,
        email: userEmail, // Add email for notification
        remarks: approve === 'rejected' ? 'Please resubmit with correct documents' : null
      }

      console.log('Sending approval request:', { adminID, type, ID, data });

      const response = await fetch(`${baseURL}/api/admin/${adminID}/approve/${type}/${ID}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Approval failed');
      }

      // Update local state to remove approved/rejected items
      if (type === "student") {
        setStudentData(prev => prev.filter(item => item._id !== ID));
      } else if (type === "teacher") {
        setTeacherData(prev => prev.filter(item => item._id !== ID));
      }

      console.log('Approval successful:', result);
      
      // Clear any previous errors
      setErrors("");

    } catch (error) {
      console.error('Approval error:', error);
      setErrors(error.message);
    }
  }

  // ✅ FIXED: Updated navigation to use /VarifyDoc route (frontend route)
  const docDetails = async (type, ID) => {
    console.log('Navigation params:', { type, adminID, ID });

    // FIXED: This should match your React router pattern
    // React route: /VarifyDoc/:type/:adminID/:ID
    const route = `/VarifyDoc/${type}/${adminID}/${ID}`;
    console.log('Navigating to:', route);

    navigator(route);
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/admin/${data}/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        } else {
          const result = await response.json();

          // Enhanced debugging for the fetched data
          console.log('Fetched student data:', result.data.studentsforApproval);
          console.log('Fetched teacher data:', result.data.teachersforApproval);

          // Debug: Check the structure of the first student/teacher
          if (result.data.studentsforApproval && result.data.studentsforApproval.length > 0) {
            console.log('First student object keys:', Object.keys(result.data.studentsforApproval[0]));
            console.log('First student object:', result.data.studentsforApproval[0]);
          }
          
          if (result.data.teachersforApproval && result.data.teachersforApproval.length > 0) {
            console.log('First teacher object keys:', Object.keys(result.data.teachersforApproval[0]));
            console.log('First teacher object:', result.data.teachersforApproval[0]);
          }

          setStudentData(result.data.studentsforApproval);
          setTeacherData(result.data.teachersforApproval);
          setAdminID(result.data.admin._id);
        }
      } catch (err) {
        console.log("Failed to fetch data", err);
        setErrors("Failed to fetch data");
      }
    };
    getData();
  }, [data]); // Added data as dependency

  return (
    <div className="h-[100vh]">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500 text-white p-3 mx-4 rounded-md mt-2">
          {error}
        </div>
      )}

      {/* Navbar */}
      <nav className="h-16 sm:h-20 md:h-24 lg:h-24  w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <NavLink to='/'>
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="logo"
              className="w-14 sm:h-12 md:h-14 lg:h-16 xl:h-18"
            />
            <h1 className="text-2xl text-[#4E84C1] font-bold">
              Shiksharthee
            </h1>
          </div>
        </NavLink>
        <div className="flex items-center">
          <div className="relative mr-4">
            <IoIosNotificationsOutline className="h-8 w-8 text-white" />
            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </div>
          <button onClick={() => navigator('/')} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <div className="p-4 sm:p-8 md:p-12 lg:p-10">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-2xl border-b-2 font-semibold text-white border-white">
          All New Request
        </h1>

        <div onClick={() => setOpen(prev => !prev)} className=" absolute right-10 top-[6.5rem] text-center cursor-pointer">
          <h4 className="text-white bg-green-800 p-4 w-32">Messages</h4>
        </div>

        <div onClick={() => navigator(`/admin/course/${data}`)} className=" absolute right-52 top-[6.5rem] text-center cursor-pointer">
          <h4 className="text-white bg-blue-800 p-4 w-44">Course Requests</h4>
        </div>

        {open && allmsg && (
          <div className="mt-3 w-[30rem] absolute right-10 bg-gray-700 text-gray-100 p-5">
            {allmsg.map((msg, index) => (
              <div key={index} className="bg-gray-600 mb-5 rounded-sm p-2">
                <p className="text-black">Name : <span className="text-white">{msg.name}</span></p>
                <p className=" text-light-blue-600"><span className="text-black">Email : </span>{msg.email}</p>
                <p><span className="text-black">Message : </span>{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start justify-center gap-20">
        <div className="rounded-md">
          <h4 className="text-white bg-blue-gray-900 p-4 w-40">Student Request</h4>
          {
            StudentData && StudentData.length > 0 ? StudentData.map((student) => {
              const studentEmail = getUserEmail(student);
              console.log('Student email found:', studentEmail, 'for student:', student.Firstname);
              
              return student.Isapproved === "pending" && (
                <div key={student._id} className="mt-8 p-6 bg-blue-gray-600 rounded-md">
                  <div
                    onClick={() => {
                      console.log('Clicking student:', student._id);
                      docDetails("student", student._id);
                    }}
                    className="cursor-pointer mb-4"
                  >
                    <h1 className="text-xl text-white">
                      {student.Firstname + " " + student.Lastname}
                    </h1>
                    <p className="text-gray-300">Status: {student.Isapproved}</p>
                    <p className="text-gray-300">Email: {studentEmail || 'Email not provided'}</p>
                    {/* Debug info - remove in production */}
                    <p className="text-xs text-gray-400">
                      Available fields: {Object.keys(student).join(', ')}
                    </p>
                  </div>

                  {/* Enhanced approval buttons with better error handling */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => {
                        console.log('Student object:', student);
                        console.log('Student email:', studentEmail);
                        if (!studentEmail) {
                          setErrors('Student email is missing. Available fields: ' + Object.keys(student).join(', '));
                          return;
                        }
                        Approval(student._id, "student", "approved", studentEmail, student.Firstname);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        console.log('Student object:', student);
                        console.log('Student email:', studentEmail);
                        if (!studentEmail) {
                          setErrors('Student email is missing. Available fields: ' + Object.keys(student).join(', '));
                          return;
                        }
                        Approval(student._id, "student", "rejected", studentEmail, student.Firstname);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            }) : <div className="text-white p-4">No pending student requests</div>
          }
        </div>

        <div className="rounded-md">
          <h4 className="text-white bg-blue-gray-900 p-4 w-40">Teacher Request</h4>
          {
            TeacherData && TeacherData.length > 0 ? TeacherData.map((teacher) => {
              const teacherEmail = getUserEmail(teacher);
              console.log('Teacher email found:', teacherEmail, 'for teacher:', teacher.Firstname);
              
              return teacher.Isapproved === "pending" && (
                <div key={teacher._id} className="mt-8 p-6 bg-blue-gray-600 rounded-md">
                  <div
                    onClick={() => {
                      console.log('Clicking teacher:', teacher._id);
                      docDetails("teacher", teacher._id);
                    }}
                    className="cursor-pointer mb-4"
                  >
                    <h1 className="text-xl text-white">
                      {teacher.Firstname + " " + teacher.Lastname}
                    </h1>
                    <p className="text-gray-300">Status: {teacher.Isapproved}</p>
                    <p className="text-gray-300">Email: {teacherEmail || 'Email not provided'}</p>
                    {/* Debug info - remove in production */}
                    <p className="text-xs text-gray-400">
                      Available fields: {Object.keys(teacher).join(', ')}
                    </p>
                  </div>

                  {/* Enhanced approval buttons with better error handling */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => {
                        console.log('Teacher object:', teacher);
                        console.log('Teacher email:', teacherEmail);
                        if (!teacherEmail) {
                          setErrors('Teacher email is missing. Available fields: ' + Object.keys(teacher).join(', '));
                          return;
                        }
                        Approval(teacher._id, "teacher", "approved", teacherEmail, teacher.Firstname);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        console.log('Teacher object:', teacher);
                        console.log('Teacher email:', teacherEmail);
                        if (!teacherEmail) {
                          setErrors('Teacher email is missing. Available fields: ' + Object.keys(teacher).join(', '));
                          return;
                        }
                        Approval(teacher._id, "teacher", "rejected", teacherEmail, teacher.Firstname);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            }) : <div className="text-white p-4">No pending teacher requests</div>
          }
        </div>

        <div className="rounded-md">
          <h4 className="text-white bg-red-500 p-4 w-40">Rejected Request</h4>
          {
            TeacherData && TeacherData.length > 0 ? TeacherData.map((teacher) => (
              teacher.Isapproved === "rejected" && (
                <div
                  key={teacher._id}
                  onClick={() => docDetails("teacher", teacher._id)}
                  className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                >
                  <h1 className="text-[24px] text-1xl text-white mr-3">
                    {teacher.Firstname + " " + teacher.Lastname}
                  </h1>
                  <p>Msg: <span>{teacher.Remarks}</span></p>
                </div>
              )
            )) : null
          }
          {
            StudentData && StudentData.length > 0 ? StudentData.map((student) => (
              student.Isapproved === "rejected" && (
                <div
                  key={student._id}
                  onClick={() => docDetails("student", student._id)}
                  className="flex justify-around items-center mt-8 p-8 bg-blue-gray-600 rounded-md cursor-pointer"
                >
                  <h1 className="text-[24px] text-1xl text-white mr-3">
                    {student.Firstname + " " + student.Lastname}
                  </h1>
                  <p>Msg: <span>{student.Remarks}</span></p>
                </div>
              )
            )) : null
          }
        </div>
      </div>
    </div>
  );
};

export default Admin;