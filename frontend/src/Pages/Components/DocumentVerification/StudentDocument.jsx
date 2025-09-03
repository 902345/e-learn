import React, { useEffect, useState } from "react";
import Input from "../DocumentVerification/InputComponent/Input.jsx";
import InputUpload from "../DocumentVerification/Inputupload/InputUpload.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import logo from "../../Images/logo.svg";

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const StudentDocument = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const { Data } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Fetching student data...");
        console.log("Request URL:", `${baseURL}/api/student/StudentDocument/${Data}`);
        
        const response = await fetch(`${baseURL}/api/student/StudentDocument/${Data}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // CRITICAL: Include cookies for authentication
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          // Handle 401 specifically
          if (response.status === 401) {
            setError("Authentication failed. Please login again.");
            // Optionally redirect to login
            // navigate('/login');
            return;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("Student data received:", result);
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
        
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        setError(error.message);
      }
    };

    if (Data) {
      getData();
    }
  }, [Data, navigate]);

  const [formData, setFormData] = useState({
    Phone: "",
    Address: "",
    Highesteducation: "",
    SecondarySchool: "",
    HigherSchool: "",
    SecondaryMarks: "",
    HigherMarks: "",
    Aadhaar: null,
    Secondary: null,
    Higher: null,
  });

  // Update form data when student data is loaded
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData(prevState => ({
        ...prevState,
        Phone: data.Phone || "",
        Address: data.Address || "",
        Highesteducation: data.Highesteducation || "",
        SecondarySchool: data.SecondarySchool || "",
        HigherSchool: data.HigherSchool || "",
        SecondaryMarks: data.SecondaryMarks || "",
        HigherMarks: data.HigherMarks || "",
      }));
    }
  }, [data]);

  const handleFileChange = (fileType, e) => {
    const file = e.target.files[0];
    console.log(`File selected for ${fileType}:`, file?.name);
    
    setFormData({
      ...formData,
      [fileType]: file,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    setError("");

    // Validation
    const requiredFields = ['Phone', 'Address', 'Highesteducation', 'SecondarySchool', 'HigherSchool', 'SecondaryMarks', 'HigherMarks'];
    const missingFields = requiredFields.filter(field => !formData[field] || String(formData[field]).trim() === '');
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoader(false);
      return;
    }

    if (!formData.Aadhaar || !formData.Secondary || !formData.Higher) {
      setError("Please upload all required documents (Aadhaar, Secondary, Higher)");
      setLoader(false);
      return;
    }

    const formDataObj = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataObj.append(key, formData[key]);
      }
    });

    // Debug: Log form data contents
    console.log("Form data being sent:");
    for (let [key, value] of formDataObj.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
    }

    try {
      const uploadURL = `${baseURL}/api/student/verification/${Data}`;
      console.log("Upload URL:", uploadURL);

      const response = await fetch(uploadURL, {
        method: "POST",
        body: formDataObj,
        credentials: 'include', // CRITICAL: Include cookies for authentication
        // Don't set Content-Type header - let browser handle it for FormData
      });

      console.log("Upload response status:", response.status);
      console.log("Upload response headers:", Object.fromEntries(response.headers.entries()));

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(`Server returned non-JSON response: ${response.status}`);
      }

      console.log("Upload response data:", responseData);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please login again.");
          // Optionally redirect to login
          // navigate('/login');
        } else {
          setError(responseData.message || `Upload failed with status ${response.status}`);
        }
      } else {
        console.log("Form submitted successfully!");
        alert("Documents uploaded successfully!");
        navigate("/pending");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <RotatingLines
              visible={true}
              height="100"
              width="100"
              color="#0D286F"
              strokeWidth="5"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
            />
            <span className="text-white text-xl ml-1">Uploading...</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-[20rem] px-32 py-2 bg-[#0D286F]">
        <div className="flex items-center gap-3">
          <img src={logo} className="w-14" alt="" />
          <h1 className="text-2xl text-[#4E84C1] font-bold">Shiksharthee</h1>
        </div>
        <h2 className="text-white text-xl">Document Verification (Student)</h2>
      </div>
      <hr />

      <form onSubmit={handleSubmit}>
        <p className="text-[#4E84C1] p-5 px-10">Personal Information</p>
        <div className="flex flex-wrap gap-20 px-36 mb-10">
          <Input
            label={"First Name"}
            placeholder={"First Name"}
            value={data.Firstname || ""}
            readonly
          />
          <Input
            label={"Last Name"}
            placeholder={"Last Name"}
            value={data.Lastname || ""}
            readonly
          />
          <Input
            label={"Phone No."}
            placeholder={"Phone No."}
            value={formData.Phone}
            onChange={(e) => handleInputChange("Phone", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-wrap gap-20 px-36">
          <Input
            label={"Home Address"}
            placeholder={"Home Address"}
            value={formData.Address}
            onChange={(e) => handleInputChange("Address", e.target.value)}
            required
          />
          <Input
            label={"Highest Education"}
            placeholder={"Highest Education"}
            value={formData.Highesteducation}
            onChange={(e) =>
              handleInputChange("Highesteducation", e.target.value)
            }
            required
          />
          <InputUpload
            label={"Upload Aadhar Card"}
            placeholder={"Upload Aadhar Card"}
            value={formData.Aadhaar}
            onChange={(e) => handleFileChange("Aadhaar", e)}
            required
          />
        </div>

        <p className="text-[#4E84C1] p-5 px-10 pt-10">
          Educational Information
        </p>
        <div className="border h-full mx-36">
          <div className="flex flex-row gap-7">
            <div className="bg-[#0D286F] p-[1rem] m-3 rounded-sm">
              <p className="text-white text-sm">Secondary</p>
            </div>
            <Input
              placeholder={"10th Board Name"}
              value={formData.SecondarySchool}
              onChange={(e) =>
                handleInputChange("SecondarySchool", e.target.value)
              }
              required
            />
            <Input
              placeholder={"Total Marks (%)"}
              value={formData.SecondaryMarks}
              onChange={(e) =>
                handleInputChange("SecondaryMarks", e.target.value)
              }
              required
            />
            <div className="mt-[-1.5rem]">
              <InputUpload
                placeholder={"Upload 10th Result"}
                value={formData.Secondary}
                onChange={(e) => handleFileChange("Secondary", e)}
                required
              />
            </div>
          </div>
          <hr />
          <div className="flex flex-row gap-7">
            <div className="bg-[#0D286F] p-[1rem] m-3 rounded-sm">
              <p className="text-white text-sm">Higher Secondary</p>
            </div>
            <Input
              placeholder={"12th Board Name"}
              value={formData.HigherSchool}
              onChange={(e) =>
                handleInputChange("HigherSchool", e.target.value)
              }
              required
            />
            <Input
              placeholder={"Total Marks (%)"}
              value={formData.HigherMarks}
              onChange={(e) => handleInputChange("HigherMarks", e.target.value)}
              required
            />
            <div className="mt-[-1.5rem]">
              <InputUpload
                placeholder={"Upload 12th Result"}
                value={formData.Higher}
                onChange={(e) => handleFileChange("Higher", e)}
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-5 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="bg-[#0D286F] p-3 m-3 mt-1 rounded-md absolute right-32 bottom-5 cursor-pointer">
          <button 
            className="text-white text-sm" 
            type="submit"
            disabled={loader}
          >
            {loader ? "Uploading..." : "Submit ▶️"}
          </button>
        </div>
      </form>
    </>
  );
};

export default StudentDocument;