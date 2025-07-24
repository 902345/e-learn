import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiCall } from '../apiConfig'; // Adjust the path as needed

function Popup({ onClose, subject }) {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const { ID } = useParams();
  const dateGap = 3; // 3 hours

  const [day, setDay] = useState({
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
  });

  const [dayValue, setDayValue] = useState({
    sun: '',
    mon: '',
    tue: '',
    wed: '',
    thu: '',
    fri: '',
    sat: '',
  });

  const dayIndex = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const handleCheckboxChange = (dayName) => {
    setDay((prevDay) => ({ ...prevDay, [dayName]: !prevDay[dayName] }));
  };

  const addCourse = async () => {
    // Validation
    const selectedDays = Object.keys(day)
      .filter((d) => day[d])
      .map((d) => ({
        day: dayIndex[d],
        starttime: dayValue[d] ? convertTimeToMinutes(dayValue[d]) : null,
        endtime: dayValue[d] ? convertTimeToMinutes(dayValue[d]) + dateGap * 60 : null,
      }));

    const hasMissingTime = selectedDays.some((d) => d.starttime === null);

    if (hasMissingTime) {
      alert('Please fill in the time for all selected days.');
      return;
    }

    const invalidTimeRange = selectedDays.some((d) => {
      const startTime = d.starttime;
      const endTime = d.endtime;
      if (startTime >= endTime) {
        alert('Start time must be earlier than end time.');
        return true;
      }
      if ((endTime - startTime) > 3 * 60) {
        alert('End time should not be more than 3 hours after start time.');
        return true;
      }
      return false;
    });

    if (invalidTimeRange) {
      return;
    }

    if (desc.trim() === '') {
      alert('Please fill in the description.');
      return;
    }

    if (selectedDays.length === 0) {
      alert('Please select at least one day and time.');
      return;
    }

    setLoading(true);

    try {
      const data = {
        coursename: subject.toLowerCase(),
        description: desc.trim(),
        schedule: selectedDays,
      };

      console.log('Sending data:', data);

      // Call API using the updated apiCall function
      const response = await apiCall(`/api/course/${subject}/create/${ID}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);
      
      if (response.ok) {
        alert(responseData.message || 'Course created successfully!');
        onClose();
      } else {
        alert(responseData.message || 'Failed to create course. Please try again.');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('An error occurred while creating the course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const convertMinutesToTime = (minutes) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center z-50'>
      <div className='bg-[#008280] w-[30rem] h-fit py-4 mt-1 rounded-md relative'>
        <div
          className='absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2 hover:bg-gray-100 transition-colors'
          onClick={onClose}
        >
          ✖️
        </div>
        
        <div className='text-center my-10 text-white text-3xl font-semibold'>
          <p>{subject}</p>
        </div>
        
        <div className='m-5 flex flex-col gap-4 text-white text-xl'>
          <div>
            <label htmlFor='coursename'>Coursename: </label>
            <input
              id='coursename'
              type='text'
              className='bg-[#32B0AE] p-2 rounded-md w-52 border-0 outline-0'
              value={subject}
              readOnly
            />
          </div>

          <div>
            <label className='block mb-2'>Timing: </label>
            {Object.keys(day).map((d) => (
              <div
                key={d}
                className='flex items-center justify-center gap-2 mb-2'
              >
                <input
                  type='checkbox'
                  checked={day[d]}
                  onChange={() => handleCheckboxChange(d)}
                  className='mr-2'
                />
                <label className='w-16 text-left'>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </label>
                <input
                  className='w-[7rem] rounded-sm text-black pl-2 py-1'
                  type='time'
                  placeholder='Start Time'
                  value={dayValue[d]}
                  onChange={(e) =>
                    setDayValue({ ...dayValue, [d]: e.target.value })
                  }
                  disabled={!day[d]}
                />
                <span className='text-sm'>to</span>
                <input
                  className='w-[7rem] rounded-sm text-black pl-2 py-1 bg-gray-200'
                  type='time'
                  readOnly
                  placeholder='End Time'
                  value={
                    dayValue[d] && day[d]
                      ? convertMinutesToTime(
                          convertTimeToMinutes(dayValue[d]) + dateGap * 60
                        )
                      : ''
                  }
                />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor='description'>Description: </label>
            <textarea
              id='description'
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className='bg-[#32B0AE] p-2 rounded-md w-full ml-3 border-0 outline-0 resize-none h-20'
              placeholder='Enter course description...'
              maxLength={500}
            />
            <div className='text-sm text-gray-300 ml-3 mt-1'>
              {desc.length}/500 characters
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center mt-7'>
          <button
            onClick={addCourse}
            disabled={loading}
            className={`px-10 py-3 rounded-md text-xl font-semibold transition-colors ${
              loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-[#335699] text-white cursor-pointer hover:bg-[#2a4578]'
            }`}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;