import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateTime from './DateTime';

function AddClass({ onClose }) {
  const { ID } = useParams();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [CourseId, setCourseId] = useState('');
  const [allowedDays, setCurrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const DAY = [
    "Sunday",    
    "Monday",    
    "Tuesday",   
    "Wednesday", 
    "Thursday",  
    "Friday",    
    "Saturday"   
  ];
  
  function setToMidnight(dateTimeString) {
    // Create a new Date object from the input string
    let date = new Date(dateTimeString);
    
    // Extract the time part
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    
    let totalMinutes = (hours * 60) + minutes;
    date.setUTCHours(0, 0, 0, 0);
    let modifiedDateTimeString = date.toISOString();
    
    const DATETIME = [totalMinutes, modifiedDateTimeString];
    
    return DATETIME;
  }

  useEffect(() => {
    const getCourses = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course/Teacher/${ID}/enrolled`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();

        if (res.data && Array.isArray(res.data)) {
          setCourses(res.data);
          // Set first approved course as default
          const firstApprovedCourse = res.data.find(course => course.isapproved);
          if (firstApprovedCourse) {
            setCourseId(firstApprovedCourse._id);
          }
          console.log('Teacher courses:', res.data);
        } else {
          setCourses([]);
          console.warn('Unexpected data structure:', res);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (ID) {
      getCourses();
    }
  }, [ID]); 

  useEffect(() => {
    if (CourseId && courses.length > 0) {
      const filteredData = courses.filter(course => course._id === CourseId);
      setCurrData(filteredData[0]?.schedule || []);
      console.log("Selected course schedule:", filteredData[0]?.schedule);
    }
  }, [CourseId, courses]);
  
  const validateForm = () => {
    if (!note.trim()) {
      alert('Please enter a class title!');
      return false;
    }
    if (!date) {
      alert('Please select a date and time!');
      return false;
    }
    if (!link.trim()) {
      alert('Please enter a class link!');
      return false;
    }
    if (!CourseId) {
      alert('Please select a course!');
      return false;
    }
    return true;
  };

  const addCourses = async () => {
    if (!validateForm()) return;

    const currentDate = new Date();
    const givenDate = new Date(date);

    if (currentDate > givenDate) {
      alert('Please choose a future date and time!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const modifyDate = setToMidnight(date);

      const data = {
        title: note.trim(),
        timing: modifyDate[0],
        date: modifyDate[1],
        link: link.trim(),
        status: 'upcoming',
      };

      console.log("Adding class:", data);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course/${CourseId}/teacher/${ID}/add-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || `HTTP error! status: ${response.status}`);
      }

      alert(res.message || 'Class added successfully!');

      if (res.statusCode === 200 || response.ok) {
        // Reset form
        setDate('');
        setLink('');
        setNote('');
        onClose();
      }
    } catch (error) {
      console.error('Error adding class:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-700'>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg text-center max-w-md'>
          <h3 className='text-red-600 font-bold text-lg mb-2'>Error Loading Courses</h3>
          <p className='text-gray-700 mb-4'>{error}</p>
          <div className='space-x-4'>
            <button 
              onClick={() => window.location.reload()} 
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
            >
              Retry
            </button>
            <button 
              onClick={onClose} 
              className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const approvedCourses = courses.filter(course => course.isapproved);

  if (approvedCourses.length === 0) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg text-center max-w-md'>
          <h3 className='text-yellow-600 font-bold text-lg mb-2'>No Approved Courses</h3>
          <p className='text-gray-700 mb-4'>You don't have any approved courses to add classes to.</p>
          <button 
            onClick={onClose} 
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='w-[60%] max-w-4xl h-[70%] bg-blue-gray-700 text-white rounded-md relative overflow-y-auto'>
        <div 
          className='absolute top-2 right-2 w-9 h-9 bg-[#E2B659] rounded-xl cursor-pointer flex items-center justify-center hover:bg-[#d4a347] transition-colors' 
          onClick={handleClose}
          disabled={submitting}
        >
          ✖️
        </div>
        
        <div className='flex justify-center mt-5 gap-10 border-b-2 py-5 px-4'>
          <p className='text-2xl font-semibold'>Create Next Class</p>
          <select 
            value={CourseId} 
            onChange={(e) => setCourseId(e.target.value)} 
            className='text-gray-900 rounded-md px-2 py-1 border-0 outline-0 min-w-[200px]'
            disabled={submitting}
          >
            {approvedCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.coursename?.toUpperCase() || 'COURSE'} 
                {course.schedule && course.schedule.length > 0 && (
                  ` [${course.schedule.map(day => DAY[day.day] || 'Unknown').join(', ')}]`
                )}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center justify-around my-20 mx-5'>
          <div className='flex gap-5 text-black items-center'>
            <label className='text-xl text-white'>Date & Time:</label>
            <DateTime setDate={setDate} allowedDays={allowedDays} disabled={submitting} />
          </div>
        </div>

        <div className='m-10 flex items-center justify-center gap-20 mb-20 flex-wrap'>
          <div className='flex gap-5 items-center'>
            <label className='text-xl'>Link:</label>
            <input 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              type="url" 
              className='border-0 outline-0 text-gray-900 py-2 px-3 rounded-sm min-w-[250px]'
              placeholder="https://meet.google.com/..."
              disabled={submitting}
            />
          </div>

          <div className='flex gap-5 items-center'>
            <label className='text-xl'>Title:</label>
            <input 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              type="text" 
              className='border-0 outline-0 text-gray-900 py-2 px-3 rounded-sm min-w-[250px]'
              placeholder="Class topic or title"
              disabled={submitting}
            />
          </div>
        </div>

        {error && (
          <div className='mx-10 mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            <p className='font-bold'>Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className='flex items-center justify-center pb-6'>
          <button
            onClick={addCourses} 
            disabled={submitting}
            className='bg-[#E2B659] w-32 text-center py-2 rounded-sm text-brown-900 text-xl cursor-pointer hover:bg-[#d4a347] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {submitting ? 'Adding...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddClass;