import React, { useEffect, useState } from 'react'
import Camera from '../Images/Camera.png'
import Clock from '../Images/Clock.png'
import { NavLink, useParams } from 'react-router-dom'

function StudentClasses() {
    const { ID } = useParams();
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/course/classes/student/${ID}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const user = await response.json();
                
                // Check if the expected data structure exists
                if (user.data && user.data.classes && user.data.classes[0] && user.data.classes[0].liveClasses) {
                    setData(user.data.classes[0].liveClasses);
                    console.log(user.data.classes[0].liveClasses);
                } else {
                    setData([]);
                    console.warn('Unexpected data structure:', user);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
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

    // Helper function to format time
    const formatTime = (timing) => {
        if (typeof timing !== 'number') return '';
        const hours = Math.floor(timing / 60);
        const minutes = timing % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (typeof dateString !== 'string') return '';
        return dateString.slice(0, 10);
    };

    // Filter classes for the upcoming week
    const getUpcomingClasses = () => {
        return data.filter(clas => {
            if (!clas.date) return false;
            
            const classDate = new Date(clas.date.slice(0, 10));
            const today = new Date();
            const oneWeekFromNow = new Date(today);
            oneWeekFromNow.setDate(today.getDate() + 7);

            return classDate >= today && classDate <= oneWeekFromNow;
        });
    };

    // Get next upcoming class
    const getNextClass = () => {
        const upcomingClasses = getUpcomingClasses();
        if (upcomingClasses.length === 0) return null;
        
        // Sort by date and time to get the next class
        return upcomingClasses.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() === dateB.getTime()) {
                return a.timing - b.timing;
            }
            return dateA - dateB;
        })[0];
    };

    const upcomingClasses = getUpcomingClasses();
    const nextClass = getNextClass();

    if (loading) {
        return (
            <div className='ml-60 mt-20 text-white flex justify-center items-center h-64'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
                    <p>Loading classes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='ml-60 mt-20 text-white flex justify-center items-center h-64'>
                <div className='text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                    <p className='font-bold'>Error loading classes</p>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className='mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='ml-60 mt-20 text-white flex justify-between mr-60'>
            <h1 className='absolute bottom-72 left-60 text-[#1671D8] text-2xl mt-4 mb-4 font-semibold'>
                Weekly Schedule
            </h1>

            <div className='h-[17rem] w-[30rem] overflow-auto'>
                {upcomingClasses.length === 0 ? (
                    <div className='flex items-center justify-center h-full text-gray-400'>
                        <p>No upcoming classes this week</p>
                    </div>
                ) : (
                    upcomingClasses.map((clas, index) => (
                        <div key={`${clas.timing}-${index}`} className='flex items-center mb-5'>
                            <img 
                                src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png" 
                                alt="profile_img" 
                                width={30}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/30x30?text=U';
                                }}
                            />
                            <div className='ml-5 mr-10 font-bold'>
                                <p className='text-lg'>
                                    {clas.coursename || 'Course Name'}
                                    <span className='text-black text-sm ml-3'>
                                        {formatDate(clas.date)} {formatTime(clas.timing)}
                                    </span>
                                </p>
                                <span className='text-blue-500 text-sm ml-3'>
                                    {clas.title ? `${clas.title.slice(0, 35)}...` : 'Class Title'}
                                </span>
                            </div>
                            <p className='text-sm bg-[#4E84C1] p-2 rounded-lg'>
                                {clas.status || 'Scheduled'}
                            </p>
                        </div>
                    ))
                )}
            </div>
            
            {nextClass ? (
                <NavLink to={nextClass.link || '#'} target='_blank'>
                    <div className='bg-white p-5 h-52 cursor-pointer rounded-lg text-black hover:shadow-lg transition-shadow'>
                        <div className='flex gap-3 items-center mb-5 mt-2'>
                            <img src={Clock} alt="clock" width={50} />
                            <span className='text-[#4E84C1] text-2xl font-semibold'>
                                {formatDate(nextClass.date)}
                            </span> 
                            <span className='text-[#018280] text-2xl ml-2'>
                                {formatTime(nextClass.timing)}
                            </span>
                        </div>
                        <div className='flex gap-12 items-center'>
                            <div className='ml-3'>
                                <p>Your next Class</p>
                                <p className='text-[#018280] text-3xl font-semibold'>
                                    {nextClass.coursename || 'Course Name'}
                                </p>
                                <p className='text-light-blue-700'>
                                    {nextClass.title ? `${nextClass.title.slice(0, 25)}...` : 'Class Title'}
                                </p>
                            </div>
                            <img src={Camera} alt="Camera" width={70}/>
                        </div>
                    </div>
                </NavLink>
            ) : (
                <div className='bg-gray-100 p-5 h-52 rounded-lg text-gray-500 flex items-center justify-center'>
                    <div className='text-center'>
                        <img src={Camera} alt="Camera" width={70} className='mx-auto mb-3 opacity-50'/>
                        <p>No upcoming classes</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentClasses