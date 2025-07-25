import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
const baseURL = import.meta.env.VITE_BACKEND_URL;

function VarifyDoc() {
    const { type, adminID, ID } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigator = useNavigate();
    const [value, setValue] = useState("");

    const handleMessage = (event) => {
        setValue(event.target.value);
    };

    const Approval = async(id, type, approve, email) => {
        try {
            const data = {
                Isapproved: approve,
                remarks: value,
                email: email,
            }

            const response = await fetch(`${baseURL}/api/admin/${adminID}/approve/${type}/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            navigator(`/admin/${adminID}`);
        } catch (error) {
            console.error('Approval error:', error);
            setError('Failed to process approval: ' + error.message);
        }
    }

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Validate parameters
            if (!type || !adminID || !ID) {
                throw new Error('Missing required parameters');
            }

            // Validate type
            if (type !== 'student' && type !== 'teacher') {
                throw new Error('Invalid type. Must be "student" or "teacher"');
            }
            
            console.log('Fetching data for:', { type, adminID, ID });
            
            const url = `${baseURL}/api/admin/${adminID}/documents/${type}/${ID}`;
            console.log('URL being called:', url);

            const docData = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', docData.status);
            console.log('Response ok:', docData.ok);

            if (!docData.ok) {
                const errorText = await docData.text();
                console.error('Server error response:', errorText);
                throw new Error(`HTTP error! status: ${docData.status}, message: ${errorText}`);
            }

            const response = await docData.json();
            console.log('API Response:', response);
            
            if (response.success === false) {
                throw new Error(response.message || 'API returned error');
            }
            
            setData(response.data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(`Failed to fetch data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [type, adminID, ID]);

    useEffect(() => {
        getData();
    }, [getData]);

    // Debug information (remove in production)
    console.log('Current state:', { type, data, loading, error });
    console.log('URL being called:', `${baseURL}/api/admin/${adminID}/documents/${type}/${ID}`);
    console.log('Parameters:', { type, adminID, ID });

    return (
        <>
            <nav className="h-16 sm:h-20 md:h-24 lg:h-24 w-full bg-[#042439] flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
                <div className="flex items-center">
                    <h1 onClick={() => navigator(`/admin/${adminID}`)} className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-700 font-bold font-mono ml-2 cursor-pointer">
                        ◀ Back
                    </h1>
                </div>
                <div><h2 className='text-2xl text-white font-bold'>Document Details</h2></div>
                <div className="flex items-center">
                    <button onClick={() => navigator('/')} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="min-h-screen bg-gray-900 p-4">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-white text-xl">Loading document details...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500 text-xl bg-red-100 p-4 rounded max-w-2xl">
                            <h3 className="font-bold mb-2">Error:</h3>
                            <p>{error}</p>
                            <button 
                                onClick={getData} 
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Debug Information (remove in production) */}
                {process.env.NODE_ENV === 'development' && !loading && (
                    <div className="text-white mb-4 p-4 bg-gray-800 rounded">
                        <strong>Debug Info:</strong>
                        <br />Type: {type}
                        <br />AdminID: {adminID}
                        <br />ID: {ID}
                        <br />Data exists: {data ? 'Yes' : 'No'}
                        <br />theStudent exists: {data?.theStudent ? 'Yes' : 'No'}
                        <br />theTeacher exists: {data?.theTeacher ? 'Yes' : 'No'}
                    </div>
                )}

                {/* No Data State */}
                {!loading && !error && !data && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-white text-xl">No data found for this request.</div>
                    </div>
                )}

  // Replace the student content section in your VarifyDoc component with this:

{/* Student Without Documents */}
{!loading && !error && type === "student" && data && data.theStudent && !data.studentDocs && (
    <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center max-w-2xl mx-auto p-8">
            <div className="text-yellow-400 text-8xl mb-6">📄</div>
            <h2 className="text-white text-3xl font-bold mb-4">No Documents Uploaded</h2>
            <div className='text-gray-200 text-lg mb-6'>
                <p><strong>Student Name:</strong> {data.theStudent.Firstname} {data.theStudent.Lastname}</p>
                <p><strong>Email:</strong> {data.theStudent.Email}</p>
            </div>
            <p className="text-gray-300 text-lg mb-4">
                This student has registered but hasn't uploaded any documents yet.
            </p>
            <p className="text-gray-400 mb-8">
                {data.message || "Student registered but documents not uploaded yet"}
            </p>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 text-left">
                <p className="font-bold">What you can do:</p>
                <ul className="mt-2 space-y-1">
                    <li>• Ask the student to upload their documents</li>
                    <li>• Mark them as "approved" if documents aren't required</li>
                    <li>• Send them a reminder email</li>
                </ul>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
                <textarea 
                    value={value} 
                    onChange={handleMessage} 
                    className='w-full max-w-md h-32 text-black p-4 rounded-lg border' 
                    placeholder='Write a message/reminder for the student...'
                />
                
                <div className="flex gap-3 flex-wrap justify-center">
                    <button 
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors" 
                        onClick={() => Approval(data.theStudent._id, "student", "approved", data.theStudent.Email)}
                    >
                        Approve Without Documents
                    </button>
                    
                    <button 
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors" 
                        onClick={() => Approval(data.theStudent._id, "student", "reupload", data.theStudent.Email)}
                    >
                        Request Documents
                    </button>
                    
                    <button 
                        className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors" 
                        onClick={() => navigator(`/admin/${adminID}`)}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

{/* Student With Documents - Keep your existing code but add studentDocs check */}
{!loading && !error && type === "student" && data && data.theStudent && data.studentDocs && (
    <>
        <div className='flex gap-10 text-gray-200 justify-center mt-5 text-[1.3rem] flex-wrap'>
            <p>Full Name: {data.theStudent.Firstname} {data.theStudent.Lastname}</p>
            <p>Phone No: {data.studentDocs?.Phone || 'N/A'}</p>
            <p>Highest Education: {data.studentDocs?.Highesteducation || 'N/A'}</p>
            <p>Address: {data.studentDocs?.Address || 'N/A'}</p>
        </div>

        <div className='flex mt-10 justify-center gap-20 flex-wrap text-gray-200 font-bold'>
            <div className='m-5 flex flex-col gap-3'>
                <img src={data.studentDocs?.Secondary} alt="Secondary" width={500} />
                <p>10th Marksheet <span className='text-[#8DE855]'>: {data.studentDocs?.SecondaryMarks}%</span></p>
            </div>
            <div className='m-5 flex flex-col gap-3'>
                <img src={data.studentDocs?.Higher} alt="Higher" width={500} />
                <p>12th Marksheet <span className='text-[#8DE855]'>: {data.studentDocs?.HigherMarks}%</span></p>
            </div>
            <div className='m-5 flex flex-col gap-3'>
                <img src={data.studentDocs?.Aadhaar} alt="Aadhaar" width={500} />
                <p>Aadhar Card</p>
            </div>
            <div className='flex items-end mb-10 flex-col gap-10'>
                <textarea 
                    value={value} 
                    onChange={handleMessage} 
                    className='w-96 h-60 mt-6 text-black p-5' 
                    placeholder='Write reason for rejecting application...'
                />
                <div className="flex items-center gap-3 flex-wrap">
                    <button 
                        className="px-5 py-1 bg-green-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-green-900" 
                        onClick={() => Approval(data.theStudent._id, "student", "approved", data.theStudent.Email)}
                    >
                        Approve!
                    </button>
                    <button 
                        className="px-5 py-1 bg-red-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-red-900" 
                        onClick={() => Approval(data.theStudent._id, "student", "rejected", data.theStudent.Email)}
                    >
                        Reject!
                    </button>
                    <button 
                        className="px-5 py-1 bg-blue-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-blue-900" 
                        onClick={() => Approval(data.theStudent._id, "student", "reupload", data.theStudent.Email)}
                    >
                        Reupload!
                    </button>
                </div>
            </div>
        </div>
    </>
)}

                {/* Teacher Content */}
                {!loading && !error && type === "teacher" && data && data.theTeacher && (
                    <>
                        <div className='flex gap-10 text-gray-200 justify-center mt-5 text-[1.3rem] flex-wrap'>
                            <p>Full Name: {data.theTeacher.Firstname} {data.theTeacher.Lastname}</p>
                            <p>Phone No: {data.teacherDocs?.Phone || 'N/A'}</p>
                            <p>Experience: {data.teacherDocs?.Experience || 'N/A'} years</p>
                            <p>Address: {data.teacherDocs?.Address || 'N/A'}</p>
                        </div>

                        <div className='flex mt-10 justify-center gap-20 flex-wrap text-gray-200 font-bold'>
                            <div className='m-5 flex flex-col gap-3'>
                                <img src={data.teacherDocs?.Secondary} alt="Secondary" width={500} />
                                <p>10th Marksheet <span className='text-[#8DE855]'>: {data.teacherDocs?.SecondaryMarks}%</span></p>
                            </div>
                            <div className='m-5 flex flex-col gap-3'>
                                <img src={data.teacherDocs?.Higher} alt="Higher" width={500} />
                                <p>12th Marksheet <span className='text-[#8DE855]'>: {data.teacherDocs?.HigherMarks}%</span></p>
                            </div>
                            <div className='m-5 flex flex-col gap-3'>
                                <img src={data.teacherDocs?.UG} alt="UG" width={500} />
                                <p>U.G. Marksheet <span className='text-[#8DE855]'>: {data.teacherDocs?.UGmarks}</span></p>
                            </div>
                            <div className='m-5 flex flex-col gap-3'>
                                <img src={data.teacherDocs?.PG} alt="PG" width={500} />
                                <p>P.G. Marksheet <span className='text-[#8DE855]'>: {data.teacherDocs?.PGmarks}</span></p>
                            </div>
                            <div className='m-5 flex flex-col gap-3'>
                                <img src={data.teacherDocs?.Aadhaar} alt="Aadhaar" width={500} />
                                <p>Aadhar Card</p>
                            </div>
                            <div className='flex items-end mb-10 flex-col gap-10'>
                                <textarea 
                                    value={value} 
                                    onChange={handleMessage} 
                                    className='w-96 h-60 mt-6 text-black p-5' 
                                    placeholder='Write reason for rejecting application...'
                                />
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button 
                                        className="px-5 py-1 bg-green-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-green-900" 
                                        onClick={() => Approval(data.theTeacher._id, "teacher", "approved", data.theTeacher.Email)}
                                    >
                                        Approve!
                                    </button>
                                    <button 
                                        className="px-5 py-1 bg-red-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-red-900" 
                                        onClick={() => Approval(data.theTeacher._id, "teacher", "rejected", data.theTeacher.Email)}
                                    >
                                        Reject!
                                    </button>
                                    <button 
                                        className="px-5 py-1 bg-blue-600 text-lg font-bold text-white ring-1 ring-inset ring-white rounded-lg hover:scale-95 hover:bg-blue-900" 
                                        onClick={() => Approval(data.theTeacher._id, "teacher", "reupload", data.theTeacher.Email)}
                                    >
                                        Reupload!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Invalid type or missing data */}
                {!loading && !error && data && (
                    (type === "student" && !data.theStudent) ||
                    (type === "teacher" && !data.theTeacher) ||
                    (type !== "student" && type !== "teacher")
                ) && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-white text-xl">
                            Invalid request type or incomplete data.
                            <br />
                            <small>Type: {type}, Data structure may be incorrect.</small>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default VarifyDoc;