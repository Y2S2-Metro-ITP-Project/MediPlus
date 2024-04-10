import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Alert, TextInput, Modal, Select, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";

const DashBedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBedNumber, setSelectedBedNumber] = useState("");
  const [newBedNumber, setNewBedNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const navigate = useNavigate();
  const [bedNumberPDF, setBedNumberPDF] = useState("");
  const [bedPDFID, setBedPDFID] = useState("");

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await axios.get("/api/bed/getbed");
      console.log("Fetched beds :", response.data.beds);
      setBeds(response.data.beds);
    } catch (error) {
      console.error("Error fetching beds:", error);
    }
  };

  const handleBedClick = async (bed) => {
    try {

      console.log('Clicked bed:', bed); // Add this line

      const response = await axios.get(`/api/bed/${bed.number}`);
      setSelectedBed(response.data.bed);
      

      if (bed.isAvailable) {
        console.log('Bed is available, showing patient modal');

        setShowPatientModal(true);
        setShowModal(false);

      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching bed details:", error);
    }
  };

  const handleUpdateBedAvailability = async (bedNumber, isAvailable) => {
    try {
      const response = await axios.put(`/api/bed/${bedNumber}`, {
        isAvailable,
      });
      setSuccessMessage(response.data.message);
      fetchBeds();
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleCloseModal = () => {
    setSelectedBed(null);
    setShowModal(false);
  };

  const handleCreateBed = async () => {
    if (!newBedNumber) {
      setErrorMessage("Please enter a bed number");
      return;
    }

    try {
      const response = await axios.post("/api/bed/create", {
        number: newBedNumber,
      });
      setSuccessMessage(response.data.message);
      setNewBedNumber("");
      fetchBeds();
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleDeleteBed = async (bedNumber) => {
    console.log(bedNumber);
    try {
      const response = await axios.delete(`/api/bed/${bedNumber}`);
      setSuccessMessage(response.data.message);
      setShowDeleteModal(false);
      fetchBeds();
      // Remove the deleted bed from the beds state
      setBeds(beds.filter((bed) => bed.number !== bedNumber));
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleDownloadPDF = async () => {
    const res = await fetch("/api/bed/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
      },
    });
    if (!res.ok) {
      console.error("Error generating report");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temporary link element
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bed.pdf"; // Set download attribute
    document.body.appendChild(a);

    // Click link to initiate download
    a.click();

    // Remove link from DOM
    document.body.removeChild(a);
  };

  

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const admissionData = { ...formData, bedNumber: selectedBed.number };
     
    console.log('admissionData:', admissionData); // Log the admissionData object

    // Validate form data
    if (
      !formData.name ||
      !formData.admissionDate ||
      !formData.illness ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.address ||
      !formData.contactPhone ||
      !formData.contactEmail ||
      !formData.reasonForAdmission
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Submit patient admission data
      const res = await fetch("/api/patient/admit", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admissionData),
      });

      const data = await res.json();

      if (data.success === false) {
        setErrorMessage(data.message);
        return;
      }

      setLoading(false);
      if (res.ok) {
        setLoading(false);
        const patientId = data.patient._id;
        setPatientId(patientId);
        setShowPatientModal(true); // Show the modal after successful registration
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  // Handle admitting patient to bed
  const handleAdmitPatient = async () => {
    try {
      const response = await axios.post('/api/bed/admitbed', {
        bedNumber: selectedBed.number,
        patientId,
      });

      if (response.data.success) {
        // Handle successful admission
        console.log(response.data.message);
        setShowPatientModal(false); // Close the modal after successful admission
        fetchBeds(); // Refresh the bed list
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Bed Management</h1>

      {/* Create Bed */}
      <div className="flex items-center mb-4">
        <TextInput
          type="text"
          placeholder="Enter bed number"
          value={newBedNumber}
          onChange={(e) => setNewBedNumber(e.target.value)}
          className="mr-2"
        />
        <Button
          gradientDuoTone="purpleToPink"
          className="ml-5"
          onClick={handleCreateBed}
        >
          Create Bed
        </Button>
        <Button
          gradientDuoTone="purpleToPink"
          outline
          className="ml-5"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <table
          className="w-full text-left rounded w-overflow-x-auto "
          cellSpacing="0"
        >
          <thead>
            <tr className="bg-gray-100">
              <th
                scope="col"
                className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
              >
                Bed Number
              </th>
              <th
                scope="col"
                className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
              >
                Availability
              </th>
              <th
                scope="col"
                className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
              >
                Update
              </th>
              <th
                scope="col"
                className="h-12 px-6 text-sm font-medium stroke-slate-700 text-slate-700 bg-slate-100"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {beds.map((bed) => (
              <tr key={bed.number}>
                <td className="h-12 px-6 text-sm transition duration-300 border-slate-200 stroke-slate-500 text-slate-500">
                  {bed.number}
                </td>
                <td
                  key={bed.number}
                  className={`cursor-pointer ${
                    bed.isAvailable
                      ? "bg-green-100 hover:bg-green-200"
                      : "bg-red-100 hover:bg-red-200"
                  }`}
                  onClick={() => handleBedClick(bed)}
                >
                  {bed.isAvailable ? "Available" : "Unavailable"}
                </td>
                <td className="h-12 px-6 text-sm transition duration-300 border-slate-200 stroke-slate-500 text-slate-500">
                  <Button
                    color={bed.isAvailable ? "success" : "failure"}
                    size="xs"
                    onClick={() =>
                      handleUpdateBedAvailability(bed.number, !bed.isAvailable)
                    }
                  >
                    {bed.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                </td>
                <td className="h-12 px-6 text-sm transition duration-300 border-slate-200 stroke-slate-500 text-slate-500">
                  <Button
                    color="failure"
                    size="xs"
                    onClick={() => {
                      setSelectedBedNumber(bed.number);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
                <td>
                  {!bed.isAvailable ? (
                    <Button
                      color="failure"
                      outline
                      className="ml-5"
                      onClick={() => {
                        setBedNumberPDF(bed.number);
                        setBedPDFID(bed._id);
                        handleDownloadPdf(bed.number);
                      }}
                    >
                      DownloadPdf
                    </Button>
                  ) : (
                    <p>This bed is not occupied</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        show={showModal && selectedBed}
        onClose={() => {
          setShowModal(false);
          setSelectedBed(null);
          
        }}
        size="md"
      >
        <Modal.Header />
        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
        <Modal.Body>
          {selectedBed && selectedBed.patient ? (
            <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-5">
              <h2 className="text-xl font-semibold mb-5">Patient Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-bold">Name:</p>
                  <p>{selectedBed.patient.name}</p>
                </div>
                <div>
                  <p className="font-bold">Admission Date:</p>
                  <p>{selectedBed.patient.admissionDate}</p>
                </div>
                <div>
                  <p className="font-bold">Illness:</p>
                  <p>{selectedBed.patient.illness}</p>
                </div>
                <div>
                  <p className="font-bold">Gender:</p>
                  <p>{selectedBed.patient.gender}</p>
                </div>
                <div>
                  <p className="font-bold">Contact Phone:</p>
                  <p>{selectedBed.patient.contactPhone}</p>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  color="gray"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBed(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div>No patient selected</div>
          )}
        </Modal.Body>
      </Modal>
      {/* Delete Bed Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this Bed?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              onClick={() => handleDeleteBed(selectedBedNumber)}
            >
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowDeleteModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header>Patient Registration</Modal.Header>
        <Modal.Body>
          {selectedBed && selectedBed.isAvailable ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="bedNumber">Bed Number</label>
              <TextInput
                type="text"
                placeholder="Bed Number"
                id="bedNumber"
                value={selectedBed.number} // Set default value as the selected bed number
                onChange={handleChange}
                readOnly // Make the input read-only
              />
            </div>
            <div>
              <label htmlFor="name">Patient Name</label>
              <TextInput
                type="text"
                placeholder="Patient Name"
                id="name"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="admissionDate">Admission Date</label>
              <TextInput
                type="date"
                id="admissionDate"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="illness">Illness</label>
              <TextInput
                type="text"
                placeholder="Illness"
                id="illness"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <TextInput
                type="date"
                id="dateOfBirth"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="gender">Gender</label>
              <Select id="gender" onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <TextInput
                type="text"
                placeholder="Address"
                id="address"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contactPhone">Contact Phone</label>
              <TextInput
                type="tel"
                placeholder="Contact Phone"
                id="contactPhone"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contactEmail">Contact Email</label>
              <TextInput
                type="email"
                placeholder="Contact Email"
                id="contactEmail"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="identification">Identification</label>
              <TextInput
                type="text"
                placeholder="Identification"
                id="identification"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="reasonForAdmission">Reason for Admission</label>
              <TextInput
                type="text"
                placeholder="Reason for Admission"
                id="reasonForAdmission"
                onChange={handleChange}
              />
            </div>
            <div className="w-full md:w-1/2">
              <div>
                <label htmlFor="insuranceProvider">Insurance Provider</label>
                <TextInput
                  type="text"
                  placeholder="Insurance Provider"
                  id="insuranceProvider"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="policyNumber">Policy Number</label>
                <TextInput
                  type="text"
                  placeholder="Policy Number"
                  id="policyNumber"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="contactInfo">Insurance Contact Info</label>
                <TextInput
                  type="text"
                  placeholder="Insurance Contact Info"
                  id="contactInfo"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="emergencyName">Emergency Contact Name</label>
                <TextInput
                  type="text"
                  placeholder="Emergency Contact Name"
                  id="emergencyName"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="emergencyRelationship">Emergency Contact Relationship</label>
                <TextInput
                  type="text"
                  placeholder="Emergency Contact Relationship"
                  id="emergencyRelationship"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="emergencyPhoneNumber">Emergency Contact Phone Number</label>
                <TextInput
                  type="tel"
                  placeholder="Emergency Contact Phone Number"
                  id="emergencyPhoneNumber"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="roomPreferences">Room Preferences</label>
                <Select id="roomPreferences" onChange={handleChange}>
                  <option value="">Select Room Preferences</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Private Room">Private Room</option>
                  <option value="Semi-Private Room">Semi-Private Room</option>
                </Select>
              </div>
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Admitting Patient...</span>
                </>
              ) : (
                'Admit Patient'
              )}
            </Button>
          </form>
          ) : (
            <div>No bed selected</div>
          )}
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedBed && selectedBed.isAvailable && (
          <Button onClick={handleAdmitPatient}>Confirm Admission</Button>
          )}
          </Modal.Footer>
         
      </Modal>

      {errorMessage && <Alert color="failure">{errorMessage}</Alert>}
      {successMessage && (
        <Alert color="success" onDismiss={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
    </div>
  );
};

export default DashBedManagement;