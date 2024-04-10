import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, TextInput, Button } from "flowbite-react";

const DashInpatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientIDPDF, setPatientIDPDF] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    // Fetch the list of patients from the API
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patient/get");
        const data = await res.json();
        setPatients(data.patients);
      } catch (error) {
        console.error("Error fetching patients:", error);
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
    } catch (error) {
      console.error("Error deleting patient:", error);
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
    } catch (error) {
      console.error("Error updating patient:", error);
    }
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
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Inpatient List</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          className="border px-4 py-2 rounded-md w-full md:w-1/2 lg:w-1/3"
        />
      </div>
      {isModalOpen && (
        <Modal
          show={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPatient(null);
          }}
          size="xlg"
        >
          <Modal.Header>Edit Patient</Modal.Header>
          <Modal.Body>
            {editingPatient && (
              <form className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name">Patient Name</label>
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
                <div>
                  <label htmlFor="admissionDate">Admission Date</label>
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
                <div>
                  <label htmlFor="illness">Illness</label>
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
                <div>
                  <label htmlFor="contactPhone">Contact Phone</label>
                  <TextInput
                    type="text"
                    id="contactPhone"
                    value={editingPatient.contactPhone}
                    onChange={(e) =>
                      setEditingPatient({
                        ...editingPatient,
                        contactPhone: e.target.value,
                      })
                    }
                  />
                </div>
                {/* Add more input fields for other patient details */}
              </form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
            >
              Save Changes
            </button>
          </Modal.Footer>
        </Modal>
      )}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <li
            key={patient._id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">Patient Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">Name:</p>
                  <p className="text-black font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-gray-700">Admission Date:</p>
                  <p className="text-black font-medium">
                    {patient.admissionDate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">Illness:</p>
                  <p className="text-black font-medium">{patient.illness}</p>
                </div>
                <div>
                  <p className="text-gray-700">Ward:</p>
                  <p className="text-black font-medium">
                    {patient.roomPreferences}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-x-4">
                <Link
                  to="#"
                  onClick={() => handleEdit(patient)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteConfirm(patient)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-300"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => {
                  handleDownloadPDF(patient.name);
                  setPatientIDPDF(patient._id);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                Download PDF
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isDeleteModalOpen && (
        <Modal
          show={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
          }}
          size="md"
        >
          <Modal.Header>Confirm Deletion</Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete the patient{" "}
              {patientToDelete?.name}?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="gray"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPatientToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeletePatient}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DashInpatients;