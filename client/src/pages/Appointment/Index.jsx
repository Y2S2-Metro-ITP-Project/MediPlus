import React, { useState, useEffect } from "react";
import { Button, TextInput } from "flowbite-react";
import Select from "react-select";

const Index = () => {
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");

  // Load doctors when the component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/user/getdoctors"); // Update the endpoint
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      // Transform the data into options expected by react-select
      const options = data.map((doctor) => ({
        value: doctor._id, // Assuming doctor._id is the unique identifier
        label: doctor.username,
      }));
      setDoctorOptions(options);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
    }
  };

  const handleSearch = async () => {
    try {
      // Construct the API endpoint URL
      const apiUrl = `/api/booking/appointments?doctorId=${selectedDoctor.value}&date=${date}`;
  
      // Make a GET request to fetch appointments
      const response = await fetch(apiUrl);
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
  
      // Parse the JSON data
      const appointmentData = await response.json();
  
      // Log or handle the fetched appointment data
      console.log('Fetched Appointments:', appointmentData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
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
        <h2>Channel Your Doctor</h2>
        <div>
          <label htmlFor="doctor">Doctor</label>
          <Select
            id="doctor"
            value={selectedDoctor}
            onChange={setSelectedDoctor}
            options={doctorOptions}
            placeholder="Select a doctor"
            styles={{
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
            }}
          />
        </div>
        <div>
          <label htmlFor="date">Any Date</label>
          <TextInput
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
};

export default Index;
