import React, { useEffect, useState } from 'react';
import Camera from '../Images/Camera.png';
import Clock from '../Images/Clock.png';
import AddClass from './AddClass';
import { NavLink, useParams } from 'react-router-dom';
import { apiCall } from '../apiConfig'; // Adjust the path as needed

function TeacherClasses() {
    const [showPopup, setShowPopup] = useState(false);
    const { ID } = useParams();
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await apiCall(`/api/course/classes/teacher/${ID}`, {
                    method: 'GET',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const user = await response.json();
                setData(user.data.classes[0]?.liveClasses || []);
                console.log(user.data);

            } catch (error) {
                setError(error.message);
            }
        };
        getData();

    }, [showPopup, ID]);

    // Helper function to format time with proper padding
    const formatTime = (timing) => {
        const hours = Math.floor(timing / 60);
        const minutes = timing % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Helper function to get filtered classes for the week
    const getWeeklyClasses = () => {
        return data.filter(clas => {
            const classDate = new Date(clas.date.slice(0, 10));
            const today = new Date();
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(today.getDate() + 7);

            return classDate >= today && classDate <= oneWeekFromNow;
        });
    };

    if (error) {
        return <div className='ml-60 mt-20 text-red-500'>Error: {error}</div>;
    }

    const weeklyClasses = getWeeklyClasses();
    const nextClass = data[0];

    return (
        <div className='ml-60 mt-20 text-white flex justify-between mr-80'>
            <h1 className='absolute bottom-72 left-60 text-[#1671D8] text-2xl mt-4 mb-4 font-semibold'>Weekly Schedule</h1>

            <div className='h-[17rem] w-[30rem] overflow-auto'>
                {weeklyClasses.length > 0 ? (
                    weeklyClasses.map((clas, index) => (
                        <div key={`${clas.timing}-${index}`} className='flex items-center mb-5'>
                            <img 
                                src="https://www.pngall.com/wp-content/uploads/5/Profile-Male-PNG.png" 
                                alt="profile_img" 
                                width={30} 
                                className="rounded-full"
                            />
                            <div className='ml-5 mr-10 font-bold'>
                                <p className='text-lg'>
                                    {clas.coursename}
                                    <span className='text-black text-sm ml-3'>
                                        {clas.date.slice(0, 10)} {formatTime(clas.timing)}
                                    </span>
                                </p>
                                <span className='text-blue-500 text-sm ml-3'>
                                    {clas.title && clas.title.length > 35 
                                        ? `${clas.title.slice(0, 35)}...` 
                                        : clas.title || 'No title'
                                    }
                                </span>
                            </div>
                            <p className='text-sm bg-[#4E84C1] p-2 rounded-lg whitespace-nowrap'>
                                {clas.status}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className='text-gray-400 text-center mt-10'>
                        No classes scheduled for this week
                    </div>
                )}
            </div>

            {nextClass && (
                <NavLink to={nextClass.link || '#'} target='_blank'>
                    <div className='bg-white p-5 h-52 cursor-pointer rounded-lg text-black hover:shadow-lg transition-shadow'>
                        <div className='flex gap-3 items-center mb-5 mt-2'>
                            <img src={Clock} alt="clock" width={50} />
                            <span className='text-[#4E84C1] text-2xl font-semibold'>
                                {nextClass.date ? nextClass.date.slice(0, 10) : 'No date'}
                            </span> 
                            <span className='text-[#018280] text-2xl ml-2'>
                                {typeof nextClass.timing === 'number' ? formatTime(nextClass.timing) : 'No time'}
                            </span>
                        </div>
                        <div className='flex gap-12 items-center'>
                            <div className='ml-3'>
                                <p>Your next Class</p>
                                <p className='text-[#018280] text-3xl font-semibold'>
                                    {nextClass.coursename ? nextClass.coursename.toUpperCase() : 'NO COURSE'}
                                </p>
                                <p className='text-light-blue-700'>
                                    {nextClass.title && nextClass.title.length > 25 
                                        ? `${nextClass.title.slice(0, 25)}...` 
                                        : nextClass.title || 'No title'
                                    }
                                </p>
                            </div>
                            <img src={Camera} alt="Camera" width={70} />
                        </div>
                    </div>
                </NavLink>
            )}

            <div 
                onClick={() => setShowPopup(true)} 
                className='absolute right-10 bg-blue-900 p-2 rounded-sm cursor-pointer hover:bg-blue-800 transition-colors'
            >
                + ADD CLASS
            </div>
            
            {showPopup && (
                <AddClass onClose={() => setShowPopup(false)} />
            )}
        </div>
    );
}

export default TeacherClasses;