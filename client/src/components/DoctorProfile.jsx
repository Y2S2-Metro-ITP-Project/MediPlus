import React, { useState, useEffect } from 'react';

const DoctorProfile = ({ doctor, onBack }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (doctorId) => {
    try {
      console.log('Fetching bookings for doctorId:', doctorId);
      const response = await fetch(`/api/booking/getBookingsForDoctor/${doctorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setSessions(data);
      setLoading(false);
      console.log('Fetched bookings for doctor:', data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DoctorProfile doctor:', doctor);
    if (doctor && doctor.doctorDetails && doctor.doctorDetails.userId) {
      fetchBookings(doctor.doctorDetails.userId);
    }
  }, [doctor]);

  const handleSessionClick = () => {
    alert('Session is not available');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const groupSessionsByDateAndSessionType = () => {
    const groupedSessions = {};
    sessions.forEach((session) => {
      const date = new Date(session.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const sessionType = session.time.includes('AM') ? 'Morning' : 'Evening'; // Check if session is in the morning or evening
      const key = `${date}-${sessionType}`;
      if (!groupedSessions[key]) {
        groupedSessions[key] = [];
      }
      groupedSessions[key].push(session);
    });
    return groupedSessions;
  };

  const groupedSessions = groupSessionsByDateAndSessionType();

  return (
    <div className="containers">
      <div className="header">
        <span>{doctor.doctorDetails.specialization}</span>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
      <div className="profile-info">
        <img src={doctor.doctorDetails.employeeimg} alt="Avatar" className="avatar" />
        <div>
          <div className="name">{doctor.doctorDetails.Name}</div>
          <div className="hospital">{doctor.doctorDetails.specialization}</div>
        </div>
      </div>
      {Object.entries(groupedSessions).map(([key, bookings]) => {
        const [date, sessionType] = key.split('-');
        return (
          <div key={key}>
            <h2>{date}</h2>
            <h3>{sessionType} session</h3>
            {bookings.map((session, index) => (
              <div className="session" key={index}>
                <div className="session-details">
                  <div>
                    <p>{session.time}</p>
                  </div>
                  <div>
                    <p>{session.patients}</p>
                    <p>Patients</p>
                  </div>
                  <div>
                    <p>{session.fee}</p>
                    <p>Channelling Fee</p>
                  </div>
                  <button className="button" onClick={handleSessionClick}>
                    {session.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <style jsx>{`
        .containers {
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .back-button {
          background-color: #0077b6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .profile-info {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-right: 16px;
        }

        .name {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }

        .hospital {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: #666;
        }

        .session {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .session-details {
          display: flex;
          justify-content: space-between;
        }

        .button {
          background-color: #0077b6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default DoctorProfile;
