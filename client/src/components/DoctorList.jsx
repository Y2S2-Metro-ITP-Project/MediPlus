// DoctorsList.js

import React from 'react';

const DoctorsList = ({ doctorDetails, onViewProfile }) => {
  console.log('DoctorsList props:', doctorDetails); // Log props

  const handleViewProfile = (doctor) => {
    onViewProfile(doctor); // Pass the selected doctor's details to the parent component
  };

  return (
    <div style={styles.container}>
      {doctorDetails ? (
        doctorDetails.map((doctor, index) => (
          <div key={index} style={styles.cardContainer}>
            <div style={styles.avatarContainer}>
              <span style={styles.avatar}>
                {doctor.doctorDetails.gender === 'Male' ? '🧔' : '👩'}
              </span>
            </div>
            <div style={styles.infoContainer}>
              <h3 style={styles.name}>{doctor.doctorDetails.Name}</h3>
              <p style={styles.specialization}>{doctor.doctorDetails.specialization}</p>
            </div>
            <button style={styles.button} onClick={() => handleViewProfile(doctor)}>View Profile</button> {/* Pass the selected doctor to handleViewProfile */}
          </div>
        ))
      ) : (
        <p>No doctors available</p>
      )}
    </div>
  );
};

const styles = {
  cardContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  avatarContainer: {
    marginRight: '16px',
  },
  avatar: {
    fontSize: '32px',
  },
  infoContainer: {
    flex: '1',
  },
  name: {
    margin: '0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  specialization: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#666',
  },
  button: {
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
};

export default DoctorsList;
