// Index.js
import React, { useState, useEffect } from "react";
import { Button, TextInput } from "flowbite-react";
import Select from "react-select";
import DoctorsList from "../../components/DoctorList";
import DoctorProfile from "../../components/DoctorProfile";
import { ToastContainer, toast } from "react-toastify";
import specializations from './specializations';

const Index = () => {
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [date, setDate] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showDoctorList, setShowDoctorList] = useState(true);
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null); // State to store the selected doctor's details

  // Load doctors and specializations when the component mounts
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
    }
  };

  const fetchSpecializations = async () => {
    try {
      setSpecializationOptions(specializations);
    } catch (error) {
      console.error("Error fetching Specializations:", error);
    }
  };

  const fetchDoctorDetails = async () => {
    try {
      if (!selectedDoctor && !selectedSpecialization && !date) {
        const response = await fetch("/api/user/getAllDoctors");
        const data = await response.json();
        
        console.log("Fetched all doctors:", data);
        
        const detailsPromises = data.map(async (doctor) => {
          const employeeDetailsResponse = await fetch(`/api/employee/getDoctorDetails/${doctor._id}`);
          const employeeDetails = await employeeDetailsResponse.json();
          
          console.log("Fetched details for doctor", doctor._id, ":", employeeDetails);
          
          // Log the entire employeeDetails object
          console.log("Full employee details:", employeeDetails);
          
          // Assuming employeeDetails is an object with doctor details
          return employeeDetails; // Return employeeDetails directly
        });
        
        const doctorsDetails = await Promise.all(detailsPromises);
        console.log("All doctor details:", doctorsDetails);
        
        setDoctorDetails(doctorsDetails); // Update the state with fetched doctor details
      } else {
        console.log("At least one selection is made, not fetching all doctors.");
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  const fetchDoctorDetailsById = async (doctorId) => {
    try {
      console.log(`Fetching doctor details for doctorId: ${doctorId}`);
      const response = await fetch(`/api/employee/getDoctorDetails/${doctorId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched doctor details:", data);
      // Update the state with the fetched doctor details
      setDoctorDetails([data]);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };
  
  const fetchDoctorsBySpecialization = async (specialization) => {
    try {
      console.log(`Fetching doctors by specialization: ${specialization}`);
      const response = await fetch(`/api/user/getDoctorsBySpecialization/${specialization}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched doctors by specialization:", data);
      // Update the state with the fetched doctors
      setDoctorDetails(data);
    } catch (error) {
      console.error("Error fetching doctors by specialization:", error);
    }
  };
  
  const fetchAppointmentsByDate = async (date) => {
    try {
      console.log(`Fetching appointments by date: ${date}`);
      const response = await fetch(`/api/appointment/getAppointmentsByDate/${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched appointments by date:", data);
      // Update the state with the fetched appointments
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
    }
  };
  
  const fetchDoctorsBySpecializationAndDoctor = async (doctorId, specialization) => {
    try {
      console.log(`Fetching doctor by specialization: ${specialization} and doctorId: ${doctorId}`);
      const response = await fetch(`/api/employee/getDoctorBySpecializationAndId/${specialization}/${doctorId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched doctor by specialization and ID:", data);
      // Update the state with the fetched doctor details
      setDoctorDetails([data]);
    } catch (error) {
      console.error("Error fetching doctor by specialization and ID:", error);
    }
  };
  
  const fetchAppointmentsByDoctorAndDate = async (doctorId, date) => {
    try {
      console.log(`Fetching appointments by doctorId: ${doctorId} and date: ${date}`);
      const response = await fetch(`/api/appointment/getAppointmentsByDoctorAndDate/${doctorId}/${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched appointments by doctor and date:", data);
      // Update the state with the fetched appointments
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by doctor and date:", error);
    }
  };
  
  const fetchAppointmentsBySpecializationAndDate = async (specialization, date) => {
    try {
      console.log(`Fetching appointments by specialization: ${specialization} and date: ${date}`);
      const response = await fetch(`/api/appointment/getAppointmentsBySpecializationAndDate/${specialization}/${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched appointments by specialization and date:", data);
      // Update the state with the fetched appointments
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by specialization and date:", error);
    }
  };
  
  const fetchAppointmentsByDoctorAndSpecializationAndDate = async (doctorId, specialization, date) => {
    try {
      console.log(`Fetching appointments by doctorId: ${doctorId}, specialization: ${specialization}, and date: ${date}`);
      const response = await fetch(`/api/appointment/getAppointmentsByDoctorAndSpecializationAndDate/${doctorId}/${specialization}/${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log("Fetched appointments by doctor, specialization, and date:", data);
      // Update the state with the fetched appointments
      setAppointmentDetails(data);
    } catch (error) {
      console.error("Error fetching appointments by doctor, specialization, and date:", error);
    }
  };

  const handleViewProfile = (doctor) => {
    console.log("Selected doctor:", doctor); // Add this line
    setSelectedDoctorProfile(doctor);
    setShowDoctorList(false);
  };

  const handleBackToList = () => {
    console.log("Going back to doctor list"); // Add this line if needed
    setShowDoctorList(true);
  };

  const handleSearch = async () => {
    try {
      console.log("Selected doctor:", selectedDoctor);
      console.log("Selected specialization:", selectedSpecialization);
      console.log("Selected date:", date);
  
      // If no input is provided
      if (!selectedDoctor && !selectedSpecialization && !date) {
        console.log("No input provided, fetching all doctors...");
        fetchDoctorDetails();
      }
      // If only doctor is selected
      else if (selectedDoctor && !selectedSpecialization && !date) {
        console.log("Fetching details for the selected doctor...");
        fetchDoctorDetailsById(selectedDoctor.value); // Pass the selected doctor ID
      }
      // If only specialization is selected
      else if (!selectedDoctor && selectedSpecialization && !date) {
        console.log("Fetching doctors with the selected specialization...");
        fetchDoctorsBySpecialization(selectedSpecialization.value); // Pass the selected specialization value
      }
      // If only date is selected
      else if (!selectedDoctor && !selectedSpecialization && date) {
        console.log("Fetching appointments for the selected date...");
        fetchAppointmentsByDate(date); // Pass the selected date
      }
      // If doctor and specialization are selected
      else if (selectedDoctor && selectedSpecialization && !date) {
        console.log("Fetching doctor details with the selected specialization...");
        fetchDoctorsBySpecializationAndDoctor(selectedDoctor.value, selectedSpecialization.value);
      }
      // If doctor and date are selected
      else if (selectedDoctor && !selectedSpecialization && date) {
        console.log("Fetching appointments for the selected doctor and date...");
        fetchAppointmentsByDoctorAndDate(selectedDoctor.value, date);
      }
      // If specialization and date are selected
      else if (!selectedDoctor && selectedSpecialization && date) {
        console.log("Fetching appointments with the selected specialization and date...");
        fetchAppointmentsBySpecializationAndDate(selectedSpecialization.value, date);
      }
      // If all inputs are selected
      else if (selectedDoctor && selectedSpecialization && date) {
        console.log("Fetching appointments with all selected inputs...");
        fetchAppointmentsByDoctorAndSpecializationAndDate(selectedDoctor.value, selectedSpecialization.value, date);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  const handleClear = () => {
    console.log("Clearing form values"); // Add this line if needed
    setSelectedDoctor(null);
    setSelectedSpecialization(null);
    setDate("");
    setDoctorDetails(null);
    setAppointmentDetails(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {/* Form Container */}
      <div className="w-full max-w-3xl bg-blue-600 p-4 rounded mb-4 sm:p-6">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Select
            id="doctor"
            value={selectedDoctor}
            onChange={setSelectedDoctor}
            options={doctorOptions}
            placeholder="Select a doctor"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "white",
                marginRight: "10px",
                minWidth: "200px", // Set minimum width
              }),
              input: (provided) => ({
                ...provided,
                boxShadow: "none",
                outline: "none",
                border: "none",
              }),
            }}
            className="w-full sm:w-auto" // Apply full width on small screens
          />
          <Select
            placeholder="Select specialization"
            value={selectedSpecialization}
            onChange={setSelectedSpecialization}
            options={specializationOptions}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "white",
                marginRight: "10px",
                minWidth: "200px", // Set minimum width
              }),
            }}
            className="w-full sm:w-auto" // Apply full width on small screens
          />
          <TextInput
            type="date"
            placeholder="dd/mm/yyyy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "white",
                marginRight: "10px",
                minWidth: "200px", // Set minimum width
              }),
            }}
            className="w-full sm:w-auto" // Apply full width on small screens
          />
          <Button color="white" onClick={handleSearch} className="w-full sm:w-auto">
            Search
          </Button>
          <Button color="white" onClick={handleClear} className="w-full sm:w-auto">
            Clear
          </Button>
        </div>
      </div>

      {/* Doctor Profile Container */}
      <div className="w-full max-w-4xl">
        <div className="p-4 rounded">
          {showDoctorList ? (
            <DoctorsList doctorDetails={doctorDetails} onViewProfile={handleViewProfile} />
          ) : (
            <DoctorProfile doctor={selectedDoctorProfile} onBack={handleBackToList} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
