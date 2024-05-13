import React from 'react';

const DoctorsList = ({ doctorDetails, onViewProfile }) => {
  console.log('DoctorsList props:', doctorDetails);

  const handleViewProfile = (doctor) => {
    onViewProfile(doctor);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {doctorDetails ? (
        doctorDetails.map((doctor, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-2xl">
                {doctor.doctorDetails.gender == 'Male' ? '🧔' : '👩'}
              </span>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Dr {doctor.doctorDetails.Name}</h3>
              <p className="text-gray-600">{doctor.doctorDetails.specialization}</p>
            </div>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
              onClick={() => handleViewProfile(doctor)}
            >
              View Profile
            </button>
          </div>
        ))
      ) : (
        <p>No doctors available</p>
      )}
    </div>
  );
};

export default DoctorsList;