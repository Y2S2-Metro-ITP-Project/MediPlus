import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Alert,
  TextInput,
  Modal,
  Select,
  Spinner,
  Table,
  Label,
} from "flowbite-react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import ReactSelect from "react-select";
import { set } from "mongoose";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [totalbeds, setTotalbeds] = useState(0);
  const [wards, setWards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  useEffect(() => {
    fetchBeds();
    fetchWards();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const response = await fetch(`/api/patient/getInpatients`);
    const data = await response.json();
    setPatients(data.patients);
  };

  const fetchWards = async () => {
    try {
      const response = await fetch("/api/ward/getward");
      const data = await response.json();
      setWards(data);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };
  const fetchBeds = async () => {
    try {
      const response = await fetch("/api/bed/getbed");
      const data = await response.json();
      setBeds(data.beds);
      setTotalbeds(data.totalbeds);
    } catch (error) {
      console.error("Error fetching beds:", error);
    }
  };
  console.log(beds);

  const handleBedClick = async (bed) => {
    try {
      console.log("Clicked bed:", bed);

      const response = await axios.get(`/api/bed/${bed.number}`);
      setSelectedBed(response.data.bed);

      if (bed.isAvailable) {
        console.log("Bed is available, showing patient modal");
        setShowPatientModal(true);
        setShowModal(false);
        fetchPatients();
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

  const OnPatientChange = (selectedOption) => {
    setFormData({
      ...formData,
      patientId: selectedOption.value,
      patientName: selectedOption.label,
    });
  };

  console.log(formData);

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
        ward: selectedWard,
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

    const a = document.createElement("a");
    a.href = url;
    a.download = "Bed.pdf";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };


  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/bed/admitbed", {
        bedNumber: selectedBed.number,
        patientId: formData.patientId,
      });

      if (response.data.success) {
        console.log(response.data.message);
        setShowPatientModal(false);
        fetchPatients();
        fetchBeds();
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBeds = beds.filter((bed) =>
    bed.number.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Bed Management</h1>

      <div className="flex justify-between">
        <div className="">
          <h3 className="text-gray-500 text-md uppercase">Total bed</h3>
          <p className="text-2xl">{totalbeds}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <form onSubmit={(e) => e.preventDefault()}>
            <TextInput
              type="text"
              placeholder="Search..."
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
          <div className="flex items-center ml-4">
            <TextInput
              type="text"
              placeholder="Enter bed number"
              value={newBedNumber}
              onChange={(e) => setNewBedNumber(e.target.value)}
              className="mr-2"
            />
            <ReactSelect
              options={wards.map((ward) => ({
                value: ward._id,
                label: ward.WardName,
              }))}
              isSearchable
              placeholder="Select Ward"
              onChange={(selectedOption) => {
                setSelectedWard(selectedOption.value);
              }}
            />
          </div>
          <Button
            gradientDuoTone="purpleToPink"
            className="ml-5"
            onClick={handleCreateBed}
          >
            Create Bed
          </Button>
        </div>
        <Button
          gradientDuoTone="purpleToPink"
          outline
          className="ml-5"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </Button>
      </div>

      {beds.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Bed Number</Table.HeadCell>
              <Table.HeadCell>Availability</Table.HeadCell>
              <Table.HeadCell>Ward</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {filteredBeds.map((bed) => (
              <Table.Body className="divide-y" key={bed.number}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{bed.number}</Table.Cell>
                  <Table.Cell
                    key={bed.number}
                    className={`cursor-pointer ${
                      bed.isAvailable
                        ? " hover:bg-green-200"
                        : " hover:bg-red-200"
                    }`}
                    onClick={() => handleBedClick(bed)}
                  >
                    {bed.isAvailable
                      ? "Bed is not occupied"
                      : "Bed occupied with the patient"}
                  </Table.Cell>
                  <Table.Cell>{bed.ward.WardName}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="xs"
                      onClick={() =>
                        handleUpdateBedAvailability(
                          bed.number,
                          !bed.isAvailable
                        )
                      }
                    >
                      {bed.isAvailable ? "not Occupied" : " Discharge patient"}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setSelectedBedNumber(bed.number);
                        setShowDeleteModal(true);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </>
      ) : (
        <p>No beds available</p>
      )}

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
              Yes, I am sure
            </Button>
            <Button color="gray" onClick={() => setShowDeleteModal(false)}>
              No, cancel
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
        <Modal.Header>Select Patient</Modal.Header>
        <Modal.Body>
          {selectedBed && selectedBed.isAvailable ? (
            <form className="flex flex-col gap-4" onSubmit={handleAdmitPatient}>
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
                <Label htmlFor="patients">Select Patient</Label>
                <ReactSelect
                  options={patients.map((patient) => ({
                    value: patient._id,
                    label: patient.name,
                  }))}
                  onChange={OnPatientChange}
                  required
                  id="patients"
                />
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
                  "Admit Patient"
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
