import React, { useState, useEffect } from "react";
import { Button, TextInput } from "flowbite-react";
import Select from "react-select";
import DoctorsList from "../../components/DoctorList";

const Index = () => {
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [date, setDate] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

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
  
  
  
  
  
  

  const fetchAppointmentDetails = async () => {
    // Fetch appointment details based on selectedDoctor, selectedSpecialization, and date
    // You need to implement this function to fetch details from your API
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "5px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Channel Your Doctor
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="doctor">Doctor</label>
            <Select
              id="doctor"
              value={selectedDoctor}
              onChange={setSelectedDoctor}
              options={doctorOptions}
              placeholder="Select a doctor"
              styles={{ option: (provided) => ({ ...provided, color: "black" }) }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="specialization">Specialization</label>
            <Select
              id="specialization"
              value={selectedSpecialization}
              onChange={setSelectedSpecialization}
              options={specializationOptions}
              placeholder="Select a specialization"
              styles={{ option: (provided) => ({ ...provided, color: "black" }) }}
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <TextInput
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "20px" }}>
          <Button className="btn-lg" onClick={handleSearch}>Search</Button>
          <Button className="btn-lg btn-outline-danger" onClick={handleClear}>Clear</Button>
        </div>
        {/* Render doctor details and appointment details here */}
        <DoctorsList doctorDetails={doctorDetails} />
      </div>
    </div>
  );
};

export default Index;
