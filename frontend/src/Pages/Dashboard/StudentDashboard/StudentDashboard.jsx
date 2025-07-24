import React, { useEffect, useState } from 'react'
import teachingImg from '../../Images/Teaching.svg'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import logo from '../../Images/logo.svg'

function StudentDashboard() {
  const { ID } = useParams();
  const navigator = useNavigate();
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/student/logout`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();
      
      if (response.ok && (result.statusCode === 200 || result.success)) {
        // Clear any local storage or session data if needed
        navigator('/');
      } else {
        throw new Error(result.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Student/StudentDocument/${ID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies if needed for authentication
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.data) {
          setData(result.data);
          console.log('Student data:', result.data);
        } else {
          throw new Error('No student data found');
        }

      } catch (error) {
        console.error('Error fetching student data:', error);
        setError(error.message);
        
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          navigator('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (ID) {
      getData();
    }
  }, [ID, navigator]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="font-bold text-lg mb-2">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => navigator('/')} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* navbar */}
      <nav className='bg-[#04253A] px-10 py-3 flex justify-between items-center'>
        <NavLink to="/">
          <div className='flex items-center gap-3'>
            <img src={logo} className="w-14" alt="Shiksharthee Logo" />
            <h1 className='text-2xl text-[#4E84C1] font-bold'>Shiksharthee</h1>
          </div>
        </NavLink>
        <div className='bg-[#0D199D] text-white py-2 px-5 rounded-full hover:bg-[#0a1480] transition-colors cursor-pointer'>
          <p onClick={handleLogout} className="select-none">
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </p>
        </div>
      </nav>

      <div className='bg-[#008280] flex justify-between items-center'>
        <div className='text-white font-semibold text-5xl ml-72'>
          <h1 className='mb-5 text-[#071645]'>
            Welcome to <span className='text-white'>Shiksharthee</span>
          </h1>
          <h3 className='ml-16 text-[#071645]'>
            {data.Firstname || data.firstName || 'Student'} {data.Lastname || data.lastName || ''}
          </h3>
        </div>
        <div className='m-5 mr-20'>
          <img src={teachingImg} alt="teaching" width={300} />
        </div>
      </div>

      {/* sidebar */}
      <div className='bg-[#071645] w-52 min-h-[120vh] max-h-[130vh] absolute top-20'>
        <div className='flex flex-col gap-5 text-xl items-center text-white mt-8 mb-10'>
          <img 
            src={data.profileImage || "https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png"} 
            alt="profile_img" 
            width={50}
            className="rounded-full"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/50x50/071645/ffffff?text=" + 
                (data.Firstname?.[0] || data.firstName?.[0] || 'S');
            }}
          />
          <p className="text-center px-2">
            {data.Firstname || data.firstName || 'Student'} {data.Lastname || data.lastName || ''}
          </p>
        </div>

        <div className='flex flex-col gap-1'>
          <NavLink 
            to={`/Student/Dashboard/${ID}/Search`} 
            className={({ isActive }) => 
              isActive 
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1] transition-colors" 
                : "p-3 text-center font-semibold text-[#4E84C1] hover:bg-[#0a1f3d] transition-colors"
            }
          > 
            Teacher
          </NavLink>

          <NavLink 
            to={`/Student/Dashboard/${ID}/Classes`} 
            className={({ isActive }) => 
              isActive 
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1] transition-colors" 
                : "p-3 text-center font-semibold text-[#4E84C1] hover:bg-[#0a1f3d] transition-colors"
            }
          > 
            Classes
          </NavLink>

          <NavLink 
            to={`/Student/Dashboard/${ID}/Courses`} 
            className={({ isActive }) => 
              isActive 
                ? "bg-white p-3 px-[4.61rem] text-center font-semibold text-[#4E84C1] transition-colors" 
                : "p-3 text-center font-semibold text-[#4E84C1] hover:bg-[#0a1f3d] transition-colors"
            }
          > 
            Courses
          </NavLink>
        </div>
      </div>
    </>
  )
}

export default StudentDashboard