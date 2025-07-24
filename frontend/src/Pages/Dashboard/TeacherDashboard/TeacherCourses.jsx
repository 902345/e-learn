import React, { useState } from 'react';
import Popup from './Popup';

function TeacherCourses() {
  const [showPopup, setShowPopup] = useState(false);
  const [subject, setSubject] = useState('');

  const createCourse = (sub) => {
    setShowPopup(true);
    setSubject(sub);
  };

  // Subject data for better maintainability
  const subjects = [
    {
      name: 'Physics',
      image: 'https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2',
      alt: 'Physics'
    },
    {
      name: 'Chemistry',
      image: 'https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/3e546b344774eb0235acc6bf6dad7814a59d6e95',
      alt: 'Chemistry'
    },
    {
      name: 'Biology',
      image: 'https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/28ac70002ae0a676d9cfb0f298f3e453d12b5555',
      alt: 'Biology'
    },
    {
      name: 'Math',
      image: 'https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/61930117e428a1f0f7268f888a84145f93aa0664',
      alt: 'Math'
    },
    {
      name: 'Computer',
      image: 'https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/a64c93efe984ab29f1dfb9e8d8accd9ba449f272',
      alt: 'Computer'
    }
  ];

  return (
    <>
      <div className='flex gap-10 pl-48 mx-48 mt-11 flex-wrap justify-center'>
        {subjects.map((subjectItem, index) => (
          <div 
            key={index}
            className="subject cursor-pointer hover:scale-105 transition-transform duration-200 p-4 rounded-lg hover:shadow-lg" 
            onClick={() => createCourse(subjectItem.name)}
          >
            <img 
              src={subjectItem.image} 
              alt={subjectItem.alt}
              className="w-full h-auto mb-2 rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150x150?text=' + subjectItem.name;
              }}
            />
            <p className="text-center font-medium text-gray-700 hover:text-blue-600">
              {subjectItem.name}
            </p>
          </div>
        ))}
      </div>
      
      {showPopup && (
        <Popup 
          onClose={() => setShowPopup(false)} 
          subject={subject}
        />
      )}
    </>
  );
}

export default TeacherCourses;