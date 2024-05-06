import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiCalendar, HiClipboardList } from "react-icons/hi";
import { format } from "date-fns";
import { Button } from "flowbite-react";
import LoadingSpinner from "./LoadingSpinner"; // Import your LoadingSpinner component

export default function PatientDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Set loading state to true before fetching data
        const response = await fetch(`/api/patient/getPatientByUser/${currentUser._id}`);
        const patient = await response.json();

        if (patient) {
          const patientId = patient._id;
          const bookingsRes = await fetch(`/api/userBooking/upcomingBookings/${patientId}`);
          const bookingsData = await bookingsRes.json();
            console.log("Bookings Data:", bookingsData);
          if (bookingsRes.ok) {
            const updatedBookings = await Promise.all(
              bookingsData.upcomingBookings.map(async (booking) => {
                const doctorName = booking.doctorId.username;
                console.log("Doctor Name:", doctorName);
                return { ...booking, doctorName };
              })
            );
            setUpcomingAppointments(updatedBookings);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching data
      }
    };

    fetchData();
  }, [currentUser._id]);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner /> // Render the LoadingSpinner component while loading
      ) : (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Patient Dashboard</h1>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-2">{appointment.type}</h3>
                    <p className="text-gray-500 mb-2">
                      <HiCalendar className="inline-block mr-1" />
                      {format(new Date(appointment.date), "yyyy-MM-dd")}
                    </p>
                    <p className="text-gray-500 mb-2">
                      <HiClipboardList className="inline-block mr-1" />
                      {appointment.doctorName}
                    </p>
                    <Button>
                      <Link to="/dashboard?tab=bookings">View Details</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
