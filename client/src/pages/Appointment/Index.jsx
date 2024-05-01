// Index.js
import React, { useState, useEffect } from "react";
import { Button, TextInput } from "flowbite-react";
import Select from "react-select";
import DoctorsList from "../../components/DoctorList";
import DoctorProfile from "../../components/DoctorProfile";

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
      const options = [
        { value: "", label: "" },
        { value: "Cardiology", label: "Cardiology" },
        { value: "Dermatology", label: "Dermatology" },
        { value: "Neurology", label: "Neurology" },
      ];
      setSpecializationOptions(options);
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

  const handleViewProfile = (doctor) => {
    setSelectedDoctorProfile(doctor); // Set the selected doctor's details
    setShowDoctorList(false); // Hide the DoctorsList component
  };

  const handleBackToList = () => {
    setShowDoctorList(true); // Show the DoctorsList component
  };

  const handleSearch = async () => {
    try {
      // If no doctor is selected, fetch the list of doctors
      if (!selectedDoctor) {
        console.log("Fetching doctors...");
        fetchDoctorDetails();
        return;
      }
  
      // If doctor is selected, fetch doctor details
      console.log("Fetching doctor details...");
      
  
      // If specialization is selected and date is selected, fetch appointment details
      if (selectedSpecialization && date) {
        console.log("Fetching appointment details...");
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh" }}>
      {/* Form Container */}
      <div style={{ width: "850px", backgroundColor: "#0077b6", padding: "20px", borderRadius: "5px", marginBottom: "20px", marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                width: "300px", // Set fixed width
              }),
              input: (provided) => ({
                ...provided,
                boxShadow: "none",
                outline: "none",
                border: "none", // Removing border
              }),
            }}
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
                width: "200px", // Set fixed width
              }),
            }}
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
                width: "200px", // Set fixed width
              }),
            }}
          />
          <Button color="white" onClick={handleSearch}>
            Search
          </Button>
          <Button color="white" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
  
      {/* Doctor Profile Container */}
      <div style={{ width: "100%" }}>
        <div style={{ padding: "20px", borderRadius: "5px"}}>
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
