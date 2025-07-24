import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Popup from './Popup';
import axios from 'axios';

function StudentCourses() {
  const { ID } = useParams();
  const [data, setData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [subDetails, setSubDetails] = useState({});
  const [subD, setSubD] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupLoading, setPopupLoading] = useState(false);

  // Configure axios base URL
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
  }, []);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course/student/${ID}/enrolled`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();
        
        if (user.data && Array.isArray(user.data)) {
          setData(user.data);
          console.log('Enrolled courses:', user.data);
        } else {
          setData([]);
          console.warn('Unexpected data structure:', user);
        }

      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (ID) {
      getData();
    }
  }, [ID]);

  const openPopup = async (sub) => {
    setSubDetails(sub);
    setPopupLoading(true);
    
    try {
      const response = await axios.get(`/api/course/${sub.coursename}`);
      setSubD(response.data.data);
      setPopup(true);
    } catch (error) {
      console.error('Error fetching course details:', error);
      // Still open popup with available data
      setPopup(true);
    } finally {
      setPopupLoading(false);
    }
  };

  // Helper function to format time
  const formatTime = (timeInMinutes) => {
    if (typeof timeInMinutes !== 'number') return '';
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const price = {
    math: 700,
    physics: 800,
    computer: 1000,
    chemistry: 600,
    biology: 500,
  };

  const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Updated image URLs - using placeholder images since Figma URLs may not work
  const Image = {
    "physics": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=60&h=60&fit=crop&crop=center",
    "chemistry": "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=60&h=60&fit=crop&crop=center",
    "biology": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=60&fit=crop&crop=center",
    "math": "https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=60&h=60&fit=crop&crop=center",
    "computer": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=60&h=60&fit=crop&crop=center",
  };

  // Fallback image
  const getFallbackImage = (coursename) => {
    return `https://via.placeholder.com/60x60/042439/ffffff?text=${coursename.charAt(0).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64 mt-12'>
        <div className='text-center text-white'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-64 mt-12'>
        <div className='text-center bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded'>
          <p className='font-bold mb-2'>Error loading courses</p>
          <p className='mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex justify-center items-center h-64 mt-12'>
        <div className='text-center text-white'>
          <p className='text-xl mb-2'>No enrolled courses found</p>
          <p className='text-gray-400'>You haven't enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex gap-10 pl-[12rem] mt-12 flex-wrap justify-center mb-2'>
        {data.map(sub => (
          <div 
            key={sub._id} 
            className="text-white rounded-md bg-[#042439] cursor-pointer text-center p-3 w-[15rem] hover:bg-[#0a3a52] transition-colors duration-200 shadow-lg hover:shadow-xl"
            onClick={() => openPopup(sub)}
          >
            <div className='flex justify-center items-center gap-3 mb-3'>
              <img 
                src={Image[sub.coursename] || getFallbackImage(sub.coursename)} 
                alt={sub.coursename}
                width={60}
                height={60}
                onError={(e) => {
                  e.target.src = getFallbackImage(sub.coursename);
                }}
                className="rounded-full"
              />
              <p className='font-semibold text-lg'>{sub.coursename?.toUpperCase() || 'COURSE'}</p>
            </div>
            
            <p className='mt-5 text-gray-300 text-sm text-center px-2 leading-relaxed'>
              {sub.description || 'Course description not available'}
            </p>

            {sub.schedule && sub.schedule.length > 0 && (
              <div className='mt-4'>
                <p className='text-blue-400 font-bold mb-2'>Schedule:</p>
                <div className='text-xs text-gray-300 bg-[#1a3c52] p-2 rounded'>
                  {sub.schedule.map((daytime, index) => (
                    <div key={index} className='mb-1'>
                      {daysName[daytime.day] || 'Unknown'}: {' '}
                      {formatTime(daytime.starttime)} - {formatTime(daytime.endtime)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {price[sub.coursename] && (
              <div className='mt-4 pt-3 border-t border-gray-600'>
                <p className='text-green-400 font-semibold'>
                  Fee: ₹{price[sub.coursename]}
                </p>
              </div>
            )}

            {popupLoading && subDetails._id === sub._id && (
              <div className='mt-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto'></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {popup && (
        <Popup 
          onClose={() => setPopup(false)} 
          subject={subDetails} 
          allSubject={subD}
        />
      )}
    </>
  )
}

export default StudentCourses