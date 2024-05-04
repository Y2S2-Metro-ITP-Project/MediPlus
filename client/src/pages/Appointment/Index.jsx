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
          const employeeDetailsResponse = await fetch(
            `/api/employee/getDoctorDetails/${doctor._id}`
          );
          const employeeDetails = await employeeDetailsResponse.json();

          console.log(
            "Fetched details for doctor",
            doctor._id,
            ":",
            employeeDetails
          );

          // Log the entire employeeDetails object
          console.log("Full employee details:", employeeDetails);

          // Assuming employeeDetails is an object with doctor details
          return employeeDetails; // Return employeeDetails directly
        });

        const doctorsDetails = await Promise.all(detailsPromises);
        console.log("All doctor details:", doctorsDetails);

        setDoctorDetails(doctorsDetails); // Update the state with fetched doctor details
      } else {
        console.log(
          "At least one selection is made, not fetching all doctors."
        );
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      // Make an API call to fetch appointment details based on selectedDoctor, selectedSpecialization, and date
      // Replace this with your actual API call
      const response = await fetch(`/api/appointments?doctor=${selectedDoctor}&specialization=${selectedSpecialization}&date=${date}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching appointment details:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      return null;
    }
  };
  
  const fetchDoctorDetailsByDoctorAndDate = async (doctorId, date) => {
    try {
      // Make an API call to fetch doctor details based on doctorId and date
      // Replace this with your actual API call
      const response = await fetch(`/api/doctors/${doctorId}?date=${date}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching doctor details by doctor and date:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching doctor details by doctor and date:', error);
      return null;
    }
  };
  
  const fetchDoctorDetailsBySpecializationAndDate = async (specialization, date) => {
    try {
      // Make an API call to fetch doctor details based on specialization and date
      // Replace this with your actual API call
      const response = await fetch(`/api/doctors?specialization=${specialization}&date=${date}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching doctor details by specialization and date:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching doctor details by specialization and date:', error);
      return null;
    }
  };
  
  const fetchDoctorDetailsByDoctorAndSpecialization = async (doctorId, specialization) => {
    try {
      // Make an API call to fetch doctor details based on doctorId and specialization
      // Replace this with your actual API call
      const response = await fetch(`/api/doctors/${doctorId}?specialization=${specialization}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching doctor details by doctor and specialization:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching doctor details by doctor and specialization:', error);
      return null;
    }
  };
  
  const fetchDoctorDetailsByDoctor = async (doctorId) => {
    try {
      // Make an API call to fetch doctor details based on doctorId
      // Replace this with your actual API call
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching doctor details by doctor:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching doctor details by doctor:', error);
      return null;
    }
  };
  
  const fetchDoctorDetailsBySpecialization = async (specialization) => {
    try {
      // Make an API call to fetch doctor details based on specialization
      // Replace this with your actual API call
      const response = await fetch(`/api/doctors?specialization=${specialization}`);
      const data = await response.json();
  
      if (response.ok) {
        return data;
      } else {
        console.error('Error fetching doctor details by specialization:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching doctor details by specialization:', error);
      return null;
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
  
      // Check if the selected date is in the past
      const selectedDate = new Date(date);
      const today = new Date();
      if (selectedDate < today) {
        console.error("Cannot search for past dates");
        toast.error("Cannot search for past dates"); // Show a toast error
        return;
      }
  
      // If all values are selected, fetch appointment details
      if (selectedDoctor && selectedSpecialization && date) {
        console.log("Fetching appointment details...");
        const appointmentDetails = await fetchAppointmentDetails();
        if (!appointmentDetails) {
          toast.error("No appointment details found"); // Show a toast error
        }
      }
      // If doctor and date are selected (but not specialization), fetch doctor details
      else if (selectedDoctor && date) {
        console.log("Fetching doctor details based on doctor and date...");
        const doctorDetails = await fetchDoctorDetailsByDoctorAndDate(selectedDoctor, date);
        if (!doctorDetails) {
          toast.error("No doctor details found for the selected doctor and date"); // Show a toast error
        }
      }
      // If only specialization and date are selected (but not doctor), fetch doctor details
      else if (selectedSpecialization && date) {
        console.log("Fetching doctor details based on specialization and date...");
        const doctorDetails = await fetchDoctorDetailsBySpecializationAndDate(selectedSpecialization, date);
        if (!doctorDetails) {
          toast.error("No doctor details found for the selected specialization and date"); // Show a toast error
        }
      }
      // If only doctor and specialization are selected, fetch doctor details
      else if (selectedDoctor && selectedSpecialization) {
        console.log("Fetching doctor details based on doctor and specialization...");
        const doctorDetails = await fetchDoctorDetailsByDoctorAndSpecialization(selectedDoctor, selectedSpecialization);
        if (!doctorDetails) {
          toast.error("No doctor details found for the selected doctor and specialization"); // Show a toast error
        }
      }
      // If only doctor is selected, fetch doctor details
      else if (selectedDoctor) {
        console.log("Fetching doctor details based on doctor...");
        const doctorDetails = await fetchDoctorDetailsByDoctor(selectedDoctor);
        if (!doctorDetails) {
          toast.error("No doctor details found for the selected doctor"); // Show a toast error
        }
      }
      // If only specialization is selected, fetch doctor details
      else if (selectedSpecialization) {
        console.log("Fetching doctor details based on specialization...");
        const doctorDetails = await fetchDoctorDetailsBySpecialization(selectedSpecialization);
        if (!doctorDetails) {
          toast.error("No doctor details found for the selected specialization"); // Show a toast error
        }
      }
      // If no doctor is selected, fetch the list of doctors
      else {
        console.log("Fetching doctors...");
        const doctorDetails = await fetchDoctorDetails();
        if (!doctorDetails) {
          toast.error("No doctor details found"); // Show a toast error
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data"); // Show a toast error
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
            min={new Date().toISOString().split("T")[0]} // Prevent selection of past dates
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "white",
                marginRight: "10px",
                minWidth: "200px",
              }),
            }}
            className="w-full sm:w-auto"
          />
          <Button
            color="white"
            onClick={handleSearch}
            className="w-full sm:w-auto"
          >
            Search
          </Button>
          <Button
            color="white"
            onClick={handleClear}
            className="w-full sm:w-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Doctor Profile Container */}
      <div className="w-full max-w-4xl">
        <div className="p-4 rounded">
          {showDoctorList ? (
            <DoctorsList
              doctorDetails={doctorDetails}
              onViewProfile={handleViewProfile}
            />
          ) : (
            <DoctorProfile
              doctor={selectedDoctorProfile}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
