import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, TextInput, Button, Table } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiEye } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  Select, Spinner } from "flowbite-react";

const DashInpatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientIDPDF, setPatientIDPDF] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(null);
  useEffect(() => {
    // Fetch the list of patients from the API
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patient/get");
        const data = await res.json();
        setPatients(data.patients);
        console.log(data.patients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Error fetching patients");
      }
    };

    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    try {
      // Delete the patient with the specified id
      await fetch(`/api/patient/${id}`, {
        method: "DELETE",
      });
      // Remove the deleted patient from the state
      setPatients(patients.filter((patient) => patient._id !== id));
      toast.success("Patient deleted successfully");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Error deleting patient");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const admissionData = { ...formData};

    console.log('admissionData:', admissionData);

    if (
      !formData.name ||
      !formData.admissionDate ||
      !formData.illness ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.address ||
      !formData.contactPhone ||
      !formData.contactEmail ||
      !formData.reasonForAdmission||
      !formData.patientType
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/patient/admit", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admissionData),
      });

      const data = await res.json();

      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      if (res.ok) {
        setLoading(false);
        const patientId = data.patient._id;
        setPatientId(patientId);
        setShowPatientModal(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update the patient with the new data
      await fetch(`/api/patient/${editingPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingPatient),
      });
      // Reset the editingPatient state
      setEditingPatient(null);
      setIsModalOpen(false);
      // Fetch the updated patient list
      const res = await fetch("/api/patient/get");
      const data = await res.json();
      setPatients(data.patients);
      toast.success("Patient updated successfully");
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Error updating patient");
    }
  };

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);



const handleOpenRegistrationModal = () => {
  setShowPatientModal(true);
};

const handleCloseRegistrationModal = () => {
  setShowPatientModal(false);
};

  const handleDeleteConfirm = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePatient = () => {
    if (patientToDelete) {
      handleDelete(patientToDelete._id);
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleDownloadPDF = async (name) => {
    const res = await fetch(`/api/patient/downloadPDF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientIDPDF }),
    });
    if (!res.ok) {
      console.error("Error downloading PDF:", res.statusText);
      toast.error("Error downloading PDF");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temporary link element
    const a = document.createElement("a");
    a.href = url;
    a.download = `Patient-${name}.pdf`; // Set download attribute
    document.body.appendChild(a);

    // Click link to initiate download
    a.click();

    // Remove link from DOM
    document.body.removeChild(a);
    setPatientIDPDF("");
    toast.success("PDF downloaded successfully");
  };

  // Filter patients based on search term
  const filteredPatients = (patients || []).filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <form onSubmit={(e) => e.preventDefault()}>
            <TextInput
              type="text"
              placeholder="Search...."
              rightIcon={AiOutlineSearch}
              className="hidden lg:inline"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: "300px" }}
            />
            <Button className="w-12 h-10 lg:hidden" color="gray">
              <AiOutlineSearch />
            </Button>
          </form>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
  {/* Existing code */}
  <Button onClick={handleOpenRegistrationModal}>Add Patient</Button>
</div>

{showRegistrationModal && (
  <Modal
    show={showRegistrationModal}
    onClose={handleCloseRegistrationModal}
    popup
    size="xlg"
  >
    <Modal.Header>Patient Registration</Modal.Header>
    <Modal.Body>
      <PatientRegistrationForm onClose={handleCloseRegistrationModal} />
    </Modal.Body>
  </Modal>
)}

      {(patients || []).length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Admitted</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Illness</Table.HeadCell>
              <Table.HeadCell>Ward</Table.HeadCell>
              <Table.HeadCell>Patient Details</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Download PDF</Table.HeadCell>
            </Table.Head>
            {filteredPatients.map((patient) => (
              <Table.Body className="divide-y" key={patient._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(patient.admissionDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{patient.name}</Table.Cell>
                  <Table.Cell>{patient.illness}</Table.Cell>
                  <Table.Cell>{patient.roomPreferences}</Table.Cell>
                  <Table.Cell>
                    <HiEye
                      className="text-blue-500 cursor-pointer"
                      onClick={() =>
                        handlePatientDetailsView(
                          patient.name,
                          patient.gender,
                          patient.contactEmail,
                          patient.contactPhone,
                          patient.createdAt,
                          patient.illness,
                          patient.dateOfBirth,
                          patient.address,
                          patient.identification,
                          patient.emergencyContact.name,
                          patient.emergencyContact.phoneNumber,
                          patient.patientProfilePicture
                        )
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => handleEdit(patient)}
                      className="font-medium text-teal-500 hover:underline cursor-pointer"
                    >
                      Update
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => handleDeleteConfirm(patient)}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        handleDownloadPDF(patient.name);
                        setPatientIDPDF(patient._id);
                      }}
                      className="font-medium text-green-700 hover:underline cursor-pointer"
                    >
                      Download PDF
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>You have no Inpatients</p>
      )}
      {isModalOpen && (
        <Modal
          show={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPatient(null);
          }}
          popup
          size="xlg"
        >
          <Modal.Header>Edit Patient</Modal.Header>
          <Modal.Body>
            {editingPatient && (
              <form
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                onSubmit={handleEditSubmit}
              >
                <div><label>name</label>
                  <TextInput
                    type="text"
                    placeholder="Patient Name"
                    id="name"
                    value={editingPatient.name}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div><label>admissionDate</label>
                  <TextInput
                    type="date"
                    id="admissionDate"
                    value={editingPatient.admissionDate}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        admissionDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div><label>illness</label>
                  <TextInput
                    type="text"
                    placeholder="Illness"
                    id="illness"
                    value={editingPatient.illness}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        illness: e.target.value,
                      })
                    }
                  />
                </div>
                <div><label>roomPreferences</label>
                  <TextInput
                    type="text"
                    placeholder="Ward"
                    id="roomPreferences"
                    value={editingPatient.roomPreferences}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        roomPreferences: e.target.value,
                      })
                    }
                  />
                </div>
                <div><label>Patient type</label>
                  <TextInput
                    type="text"
                    placeholder="patienttype"
                    id="patientType"
                    value={editingPatient.patientType}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        patientType: e.target.value,
                      })
                    }
                  />
                </div>
              </form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="gray"
              onClick={() => {
                setIsModalOpen(false);
                setEditingPatient(null);
              }}
            >
              Cancel
            </Button>
            <Button color="blue" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}


      
      {isDeleteModalOpen && (
        <Modal
          show={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
          }}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this patient?
              </h3>
            </div>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePatient}>
                Yes, I am sure
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPatientToDelete(null);
                }}
              >
                No, cancel
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}



<Modal
        show={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header>Patient Registration</Modal.Header>
        <Modal.Body>
          { (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            
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
                  <option value="Emergency Ward">Emergency Ward</option>
                </Select>
              </div>
              <div>
                <label htmlFor="patientType">patientType</label>
                <Select id="patientType" onChange={handleChange}>
                  <option value="">Select Room Preferences</option>
                  <option value="inpatient">inpatient</option>
                  <option value="outpatient">outpatient</option>
                </Select>
              </div>
            </div>
            
          </form>
          )}

          
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={handleCloseRegistrationModal}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSubmit}>
            Submit
          </Button>
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

export default DashInpatients;