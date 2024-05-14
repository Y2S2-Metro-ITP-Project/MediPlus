// Index.js
import React, { useState, useEffect } from "react";
import { Button, TextInput, Card, Badge } from "flowbite-react";
import Select from "react-select";
import DoctorsList from "../../components/DoctorList";
import DoctorProfile from "../../components/DoctorProfile";
import { ToastContainer, toast } from "react-toastify";
import specializations from "./specializations";

const Index = () => {
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [date, setDate] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showDoctorList, setShowDoctorList] = useState(true);
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/user/getdoctors");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const options = data.map((doctor) => ({
        value: doctor._id,
        label: doctor.username,
      }));
      setDoctorOptions(options);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      toast.error("Failed to fetch doctors. Please try again later.");
    }
  };

  const fetchSpecializations = async () => {
    try {
      setSpecializationOptions(specializations);
    } catch (error) {
      console.error("Error fetching Specializations:", error);
      toast.error("Failed to fetch specializations. Please try again later.");
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      if (!selectedDoctor && !selectedSpecialization && !date) {
        const response = await fetch("/api/user/getAllDoctors");
        const data = await response.json();
        const detailsPromises = data.map(async (doctor) => {
          const employeeDetailsResponse = await fetch(
            `/api/employee/getDoctorDetails/${doctor._id}`
          );
          const employeeDetails = await employeeDetailsResponse.json();
          return employeeDetails;
        });
        const doctorsDetails = await Promise.all(detailsPromises);
        setDoctorDetails(doctorsDetails);
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast.error("Failed to fetch doctor details. Please try again later.");
    }
  };

  const fetchDoctorDetailsById = async (doctorId) => {
    try {
      const response = await fetch(`/api/employee/getDoctorDetails/${doctorId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setDoctorDetails([data]);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast.error("Failed to fetch doctor details. Please try again later.");
    }
  };

  const fetchDoctorsBySpecialization = async (specialization) => {
    try {
      const response = await fetch(`/api/employee/getDoctorsBySpecialization/${specialization}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setDoctorDetails(data);
    } catch (error) {
      console.error("Error fetching doctors by specialization:", error);
      toast.error("Failed to fetch doctors by specialization. Please try again later.");
    }
  };

  const fetchAppointmentsByDate = async (date) => {
    try {
      const response = await fetch(`/api/appointment/getAppointmentsByDate/${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      toast.error("Failed to fetch appointments by date. Please try again later.");
    }
  };

  const fetchDoctorsBySpecializationAndDoctor = async (doctorId, specialization) => {
    try {
      const response = await fetch(
        `/api/employee/getDoctorBySpecializationAndId/${specialization}/${doctorId}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setDoctorDetails([data]);
    } catch (error) {
      console.error("Error fetching doctor by specialization and ID:", error);
      toast.error("Failed to fetch doctor by specialization and ID. Please try again later.");
    }
  };

  const fetchAppointmentsByDoctorAndDate = async (doctorId, date) => {
    try {
      const response = await fetch(
        `/api/appointment/getAppointmentsByDoctorAndDate/${doctorId}/${date}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by doctor and date:", error);
      toast.error("Failed to fetch appointments by doctor and date. Please try again later.");
    }
  };

  const fetchAppointmentsBySpecializationAndDate = async (specialization, date) => {
    try {
      const response = await fetch(
        `/api/appointment/getAppointmentsBySpecializationAndDate/${specialization}/${date}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by specialization and date:", error);
      toast.error("Failed to fetch appointments by specialization and date. Please try again later.");
    }
  };

  const fetchAppointmentsByDoctorAndSpecializationAndDate = async (doctorId, specialization, date) => {
    try {
      const response = await fetch(
        `/api/appointment/getAppointmentsByDoctorAndSpecializationAndDate/${doctorId}/${specialization}/${date}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by doctor, specialization, and date:", error);
      toast.error("Failed to fetch appointments by doctor, specialization, and date. Please try again later.");
    }
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctorProfile(doctor);
    setShowDoctorList(false);
  };

  const handleBackToList = () => {
    setShowDoctorList(true);
  };

  const handleSearch = async () => {
    try {
      if (!selectedDoctor && !selectedSpecialization && !date) {
        fetchDoctorDetails();
      } else if (selectedDoctor && !selectedSpecialization && !date) {
        fetchDoctorDetailsById(selectedDoctor.value);
      } else if (!selectedDoctor && selectedSpecialization && !date) {
        fetchDoctorsBySpecialization(selectedSpecialization.value);
      } else if (!selectedDoctor && !selectedSpecialization && date) {
        fetchAppointmentsByDate(date);
      } else if (selectedDoctor && selectedSpecialization && !date) {
        fetchDoctorsBySpecializationAndDoctor(selectedDoctor.value, selectedSpecialization.value);
      } else if (selectedDoctor && !selectedSpecialization && date) {
        fetchAppointmentsByDoctorAndDate(selectedDoctor.value, date);
      } else if (!selectedDoctor && selectedSpecialization && date) {
        fetchAppointmentsBySpecializationAndDate(selectedSpecialization.value, date);
      } else if (selectedDoctor && selectedSpecialization && date) {
        fetchAppointmentsByDoctorAndSpecializationAndDate(
          selectedDoctor.value,
          selectedSpecialization.value,
          date
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
    }
  };

  const handleClear = () => {
    setSelectedDoctor(null);
    setSelectedSpecialization(null);
    setDate("");
    setDoctorDetails(null);
    setAppointmentDetails(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-3xl bg-blue-600 p-4 rounded mb-4 sm:p-6">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Select
            id="doctor"
            value={selectedDoctor}
            onChange={setSelectedDoctor}
            options={doctorOptions}
            placeholder="Select a doctor"
            className="w-full sm:w-auto"
          />
          <Select
            placeholder="Select specialization"
            value={selectedSpecialization}
            onChange={setSelectedSpecialization}
            options={specializationOptions}
            className="w-full sm:w-auto"
          />
          <TextInput
            type="date"
            placeholder="dd/mm/yyyy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full sm:w-auto"
          />
          <Button color="white" onClick={handleSearch} className="w-full sm:w-auto">
            Search
          </Button>
          <Button color="white" onClick={handleClear} className="w-full sm:w-auto">
            Clear
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <div className="p-4 rounded">
          {showDoctorList ? (
            <DoctorsList doctorDetails={doctorDetails} onViewProfile={handleViewProfile} />
          ) : (
            <DoctorProfile doctor={selectedDoctorProfile} onBack={handleBackToList} />
          )}
        </div>
      </div>

      {appointmentDetails && appointmentDetails.length > 0 && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {appointmentDetails.map((appointment) => (
              <Card key={appointment._id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{appointment.doctorName}</h3>
                  <Badge color={appointment.status === "Booked" ? "success" : "warning"}>
                    {appointment.status}
                  </Badge>
                </div>
                <p>
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.time}
                </p>
                <p>
                  <strong>Type:</strong> {appointment.type}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Index;