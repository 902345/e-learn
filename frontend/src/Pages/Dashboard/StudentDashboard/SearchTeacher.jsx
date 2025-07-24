import React, { useState } from 'react'
import Search from '../../Components/Searchbtn/Search'

function SearchTeacher() {
  const [popup, setPopup] = useState(false);
  const [formData, setFormData] = useState({
    teacherName: '',
    courseName: '',
    likedAboutCourse: '',
    effortLevel: '',
    knowledgeLevel: '',
    communicationLevel: '',
    wouldRecommend: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Feedback submitted successfully!');
        setPopup(false);
        // Reset form
        setFormData({
          teacherName: '',
          courseName: '',
          likedAboutCourse: '',
          effortLevel: '',
          knowledgeLevel: '',
          communicationLevel: '',
          wouldRecommend: ''
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    setPopup(false);
  };

  return (
    <div className='ml-56'>
      <Search onSearchClick={() => setPopup(true)} />
      {popup && (
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-[#5be0de] w-[70vw] px-14 py-10 rounded-sm relative max-h-[90vh] overflow-y-auto'>
            <div className='absolute top-2 right-2 w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center' onClick={closePopup}>
              ✖️
            </div>

            <form onSubmit={handleSubmit}>
              <p className='text-3xl'>Student Feedback Form</p>
              <p className='border-b-2 py-2'>Please help us improve our courses by filling out this student feedback form. We highly appreciate your involvement. Thank you!</p>

              <div className='flex flex-col gap-3 my-5 pb-5 border-b-2'>
                <label>Teacher / Instructor</label>
                <input 
                  type="text" 
                  className='p-2' 
                  placeholder='Teacher / Instructor Name'
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  required
                />
                <label>Course Name</label>
                <input 
                  type="text" 
                  className='p-2' 
                  placeholder='Course Name'
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                />
                <label>What you like about this course?</label>
                <textarea 
                  className='p-2 min-h-[80px]' 
                  placeholder='Please describe what you liked about this course'
                  name="likedAboutCourse"
                  value={formData.likedAboutCourse}
                  onChange={handleInputChange}
                />
              </div>

              <p className='font-bold'>Please rate each following statement : </p>
              
              <div className='my-3'>
                <div className='flex gap-1 items-center mb-3'>
                  <p className='mr-[1.65rem] min-w-[250px]'>Level of effort invested in course</p>
                  <div className='flex gap-4'>
                    {['Very Good', 'Good', 'Fair', 'Poor', 'Very Poor'].map((option) => (
                      <label key={option} className='flex items-center gap-1'>
                        <input 
                          name="effortLevel" 
                          type="radio" 
                          value={option}
                          checked={formData.effortLevel === option}
                          onChange={handleInputChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='flex gap-1 items-center mb-3'>
                  <p className='mr-4 min-w-[250px]'>Level of knowledge on the Subject</p>
                  <div className='flex gap-4'>
                    {['Very Good', 'Good', 'Fair', 'Poor', 'Very Poor'].map((option) => (
                      <label key={option} className='flex items-center gap-1'>
                        <input 
                          name="knowledgeLevel" 
                          type="radio" 
                          value={option}
                          checked={formData.knowledgeLevel === option}
                          onChange={handleInputChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='flex gap-1 items-center mb-3'>
                  <p className='mr-[5.48rem] min-w-[250px]'>Level of communication</p>
                  <div className='flex gap-4'>
                    {['Very Good', 'Good', 'Fair', 'Poor', 'Very Poor'].map((option) => (
                      <label key={option} className='flex items-center gap-1'>
                        <input 
                          name="communicationLevel" 
                          type="radio" 
                          value={option}
                          checked={formData.communicationLevel === option}
                          onChange={handleInputChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className='py-3'>
                <p className='pb-3'>Would you recommend this course to other students?</p>
                <div className='flex gap-6'>
                  <label className='flex items-center gap-1'>
                    <input 
                      name="wouldRecommend" 
                      type="radio" 
                      value="Yes"
                      checked={formData.wouldRecommend === 'Yes'}
                      onChange={handleInputChange}
                    />
                    <span>Yes</span>
                  </label>
                  <label className='flex items-center gap-1'>
                    <input 
                      name="wouldRecommend" 
                      type="radio" 
                      value="No"
                      checked={formData.wouldRecommend === 'No'}
                      onChange={handleInputChange}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className='flex justify-center gap-4'>
                <button 
                  type="submit" 
                  className='w-[10rem] bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </button>
                <button 
                  type="button" 
                  className='w-[10rem] bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600'
                  onClick={closePopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div> 
  )
}

export default SearchTeacher