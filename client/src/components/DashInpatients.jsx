import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal, TextInput, Button, Table } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiEye } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashInpatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientIDPDF, setPatientIDPDF] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [selectedWard, setSelectedWard] = useState("all");
  const [currentBedNumber, setCurrentBedNumber] = useState("");
  const [newBedNumber, setNewBedNumber] = useState("");
  const [patientIdToTransfer, setPatientIdToTransfer] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  const handleTransferPatient = async () => {
    try {

      console.log("Patient ID to transfer:", patientIdToTransfer)

      const res = await fetch("/api/patient/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentBedNumber: currentBedNumber,
          newBedNumber: newBedNumber,
          patientId: patientIdToTransfer,
        }),
      });

      if (res.ok) {
        // Update the patient list after successful transfer
        const data = await fetch("/api/patient/get");
        const { patients } = await data.json();
        setPatients(patients);
        toast.success("Patient transferred successfully");
      } else {
        toast.error("Error transferring patient");
      }

      // Reset state variables
      setCurrentBedNumber("");
      setNewBedNumber("");
      setPatientIdToTransfer("");
      setIsTransferModalOpen(false);
    } catch (error) {
      console.error("Error transferring patient:", error);
      toast.error("Error transferring patient");
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
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
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

  const handleDownloadPDF = async (patientID) => {
    const res = await fetch(`/api/patient/downloadPDF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientIDPDF: patientID }),
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
    a.download = `Patient-${patientID}.pdf`; // Set download attribute
    document.body.appendChild(a);

    // Click link to initiate download
    a.click();

    // Remove link from DOM
    document.body.removeChild(a);
    setPatientIDPDF("");
    toast.success("PDF downloaded successfully");
  };

  // Filter patients based on search term
  const filteredPatients = (patients || [])
    .filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (patient) =>
        selectedWard === "all" ||
        (selectedWard === "general" && patient.bed?.ward === "General") ||
        (selectedWard === "emergency" && patient.bed?.ward === "Emergency") ||
        (!patient.bed)
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

        <div className="mb-4">
          <label
            htmlFor="ward-filter"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Filter by Ward
          </label>
          <select
            id="ward-filter"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="all">All</option>
            <option value="general">General Ward</option>
            <option value="emergency">Emergency Ward</option>
          </select>
        </div>
      </div>
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
              <Table.HeadCell>Bed</Table.HeadCell>
            </Table.Head>
            {filteredPatients.map((patient) => (
              <Table.Body className="divide-y" key={patient._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(patient.admissionDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{patient.name}</Table.Cell>
                  <Table.Cell>{patient.illness}</Table.Cell>
                  <Table.Cell>{patient.bed?.ward}</Table.Cell>

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
                        setCurrentBedNumber(patient.bed?.number);
                        setPatientIdToTransfer(patient._id);
                        setIsTransferModalOpen(true);
                      }}
                      className="font-medium text-blue-500 hover:underline cursor-pointer"
                    >
                      {patient.bed?.number}
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

      {isTransferModalOpen && (
        <Modal
          show={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setCurrentBedNumber("");
            setNewBedNumber("");
            setPatientIdToTransfer("");
          }}
          popup
          size="md"
        >
          <Modal.Header>Transfer Patient</Modal.Header>
          <Modal.Body>
            <div>
              <label
                htmlFor="patientIdToTransfer"
                className="mb-2 block"
              ></label>
              <TextInput
                id="patientIdToTransfer"
                type="text"
                value={patientIdToTransfer}
                disabled
              />
            </div>
            <div>
              <label htmlFor="currentBedNumber" className="mb-2 block">
                Current Bed Number
              </label>
              <TextInput
                id="currentBedNumber"
                type="text"
                value={currentBedNumber}
                disabled
              />
            </div>
            <div className="mt-4">
              <label htmlFor="newBedNumber" className="mb-2 block">
                New Bed Number
              </label>

              <TextInput
                id="newBedNumber"
                type="text"
                value={newBedNumber}
                onChange={(e) => setNewBedNumber(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="gray"
              onClick={() => {
                setIsTransferModalOpen(false);
                setCurrentBedNumber("");
                setNewBedNumber("");
                setPatientIdToTransfer("");
              }}
            >
              Cancel
            </Button>
            <Button color="blue" onClick={handleTransferPatient}>
              Transfer Patient
            </Button>
          </Modal.Footer>
        </Modal>
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
                <div>
                  <label>name</label>
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
                  <label>admissionDate</label>
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
                  <label>illness</label>
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
                  <label>roomPreferences</label>
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
                <div>
                  <label>Patient type</label>
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Generate Patient Report</h2>
        <div className="mb-4">
          <TextInput
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {searchTerm.trim() === "" ? (
          <div className="text-gray-500 text-center py-4">
            Start typing to search for a patient
          </div>
        ) : (
          <div className="mb-4">
            {filteredPatients.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No patients found for "{searchTerm}"
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className={`p-4 mb-2 rounded-md cursor-pointer ${
                    selectedPatient === patient ? "bg-blue-200" : "bg-gray-100"
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <p className="text-gray-800 font-medium">{patient.name}</p>
                </div>
              ))
            )}
          </div>
        )}
        <div>
          <Button
            color="blue"
            onClick={() => handleDownloadPDF(selectedPatient?._id)}
            disabled={!selectedPatient}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashInpatients;
