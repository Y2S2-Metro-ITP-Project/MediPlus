import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiCalendar, HiClipboardList } from "react-icons/hi";
import { format } from "date-fns";
import { Button, Card, Badge } from "flowbite-react";
import LoadingSpinner from "./LoadingSpinner";

export default function PatientDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser._id]);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Upcoming Appointments
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                You have {upcomingAppointments.length} upcoming appointments.
              </p>
            </Card>
            <Card>
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Medical Records
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                Access and manage your medical records.
              </p>
              <Button color="blue">
                <Link to="/medical-records">View Records</Link>
              </Button>
            </Card>
            <Card>
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Prescriptions
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                View and request prescriptions.
              </p>
              <Button color="blue">
                <Link to="/prescriptions">Manage Prescriptions</Link>
              </Button>
            </Card>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment._id}>
                    <h3 className="text-xl font-bold mb-2">{appointment.type}</h3>
                    <div className="flex items-center mb-2">
                      <HiCalendar className="inline-block mr-2" />
                      <p className="text-gray-500">
                        {format(new Date(appointment.date), "yyyy-MM-dd")}
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <HiClipboardList className="inline-block mr-2" />
                      <p className="text-gray-500">{appointment.doctorName}</p>
                    </div>
                    <Badge color="blue" className="mb-4">
                      {appointment.status}
                    </Badge>
                    <Button color="blue">
                      <Link to="/dashboard?tab=bookings">View Details</Link>
                    </Button>
                  </Card>
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