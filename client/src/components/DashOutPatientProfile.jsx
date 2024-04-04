import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faThermometerHalf,
  faTint,
} from "@fortawesome/free-solid-svg-icons";
import { set } from "mongoose";
const THRESHOLDS = {
  temperature: { low: 36.1, high: 37.2 },
  bloodPressureSystolic: { low: 90, high: 120 },
  bloodPressureDiastolic: { low: 60, high: 80 },
  heartRate: { low: 60, high: 100 },
  bloodGlucose: { low: 70, high: 140 },
  oxygenSaturation: { low: 95, high: 100 },
};

const COLORS = {
  low: "bg-blue-700", // Low value color
  high: "bg-red-700", // High value color
  normal: "bg-green-600", // Normal value color
};

function getColorClass(value, thresholds) {
  if (value < thresholds.low) {
    return COLORS.low;
  } else if (value > thresholds.high) {
    return COLORS.high;
  } else {
    return COLORS.normal;
  }
}

const BMI_RANGES = {
  underweight: { low: 0, high: 18.5 },
  healthyWeight: { low: 18.5, high: 24.9 },
  overweight: { low: 25.0, high: 29.9 },
  obese: { low: 30.0, high: Infinity }, // Infinity represents any value above 30.0
};

const BMI_COLORS = {
  underweight: "bg-blue-700",
  healthyWeight: "bg-green-700",
  overweight: "bg-yellow-700",
  obese: "bg-red-700",
};

function getBMICategory(value) {
  if (value < BMI_RANGES.underweight.high) {
    return "underweight";
  } else if (
    value >= BMI_RANGES.healthyWeight.low &&
    value <= BMI_RANGES.healthyWeight.high
  ) {
    return "healthyWeight";
  } else if (
    value >= BMI_RANGES.overweight.low &&
    value <= BMI_RANGES.overweight.high
  ) {
    return "overweight";
  } else {
    return "obese";
  }
}
export default function DashOutPatientProfile() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const tab = queryParams.get("tab");
  const id = queryParams.get("id");
  const { currentUser } = useSelector((state) => state.user);
  const [patient, setPatient] = useState({});
  const [patientIdPDF, setPatientIdPDF] = useState("");
  const [vitalsModal, setVitalsModal] = useState(false);
  const [vitals, setVitals] = useState([]);
  const [formData, setFormData] = useState([]);
  const [vitalIdToDelete, setVitalIdToDelete] = useState("");
  const [latestVitals, setLatestVitals] = useState([]);
  const fetchPatientVital = async () => {
    const res = await fetch(`/api/vital/getVitals/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.log(data.message);
    } else {
      setVitals(data.vitals);
      setLatestVitals(data.latestVitals);
    }
  };
  const fetchPatient = async () => {
    const res = await fetch(`/api/patient/getPatient/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.log(data.message);
    } else {
      setPatient(data);
    }
  };
  useEffect(() => {
    const fetchPatientVital = async () => {
      const res = await fetch(`/api/vital/getVitals/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setVitals(data.vitals);
        setLatestVitals(data.latestVitals);
      }
    };
    const fetchPatient = async () => {
      const res = await fetch(`/api/patient/getPatient/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setPatient(data);
      }
    };
    if (currentUser.isReceptionist || currentUser.isAdmin) {
      fetchPatient();
      fetchPatientVital();
    }
  }, [currentUser._id]);
  const formatDateOfBirth = (dateOfBirth) => {
    const date = new Date(dateOfBirth);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  const handlePdfDownload = async () => {
    try {
      const res = await fetch(
        `/api/patient/DownloadPDFPatient/${patientIdPDF}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patientId: patientIdPDF }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Patient-${patient.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
    }
  };

  const onVitalChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/vital/addVitals/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      console.log("Failed to add vitals");
    }
    toast.success("Vitals added successfully");
    setFormData([]);
    setVitalsModal(false);
    fetchPatient();
    fetchPatientVital();
  };
  const handleVitalDelete = async (e) => {
    const res = await fetch(`/api/vital/deleteVitals/${vitalIdToDelete}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.log("Failed to delete vitals");
      toast.error("Failed to delete vitals");
    } else {
      toast.success("Vitals deleted successfully");
    }
    fetchPatient();
    fetchPatientVital();
  };
  const handlePdfDownloadVitals = async () => {
    try {
      const res = await fetch(`/api/vital/DownloadPDFVitals/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: id }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Patient-${patient.name}-Vitals.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <a href="dashboard?tab=patients">
        <Button outline gradientDuoTone="purpleToPink" className="mb-5">
          Go Back
        </Button>
      </a>
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">Heart Rate</h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.heartRate
                    ? `${latestVitals.heartRate} BPM`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faHeartbeat}
                className="text-indigo-600 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>

          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Body Temperature
                </h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.temperature
                    ? `${latestVitals.temperature} °C`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faThermometerHalf}
                className="text-green-700 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>

          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Blood Glucose Level
                </h3>
                <p className="text-2xl">
                  {latestVitals && latestVitals.bloodGlucose
                    ? `${latestVitals.bloodGlucose} mg/dL`
                    : "-"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faTint}
                className="text-red-700 text-5xl p-3 shadow-lg rounded-full bg-white"
              />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">{patient.name} Profile</h1>
        <Button
          color="gray"
          className="ml-8"
          onClick={() => {
            handlePdfDownload(patient.name);
            setPatientIdPDF(id);
          }}
        >
          Download Report
        </Button>
      </div>
      <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <div className="mb-4 flex items-center">
            <p className="text-gray-600 mr-4">Patient Profile</p>
            <img
              src={patient.patientProfilePicture}
              alt="Patient"
              className="h-20 w-20 rounded-full border-2 border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{patient.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-semibold">{patient.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-semibold">
                {formatDateOfBirth(patient.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Email</p>
              <p className="font-semibold">{patient.contactEmail}</p>
            </div>
            <div>
              <p className="text-gray-600">Identification</p>
              <p className="font-semibold">{patient.identification}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact Email</p>
              <p className="font-semibold">{patient.contactPhone}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">{patient.address}</p>
            </div>
          </div>
        </div>
        {/* Add more patient information here */}
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Vitals</h1>
          <Button
            color="gray"
            className="ml-8"
            onClick={() => {
              handlePdfDownloadVitals(patient.name);
            }}
          >
            Download Report
          </Button>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2"
                onClick={() => {
                  setVitalsModal(true);
                }}
              >
                Add New Vitals
              </Button>
              <div className="flex ml-4">
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-green-600 rounded-full mr-1.5"></span>
                  Normal
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-blue-700 rounded-full mr-1.5"></span>
                  Low
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-red-700 rounded-full mr-1.5"></span>
                  High
                </span>
              </div>
              <div className="flex ml-4">
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-green-700 rounded-full mr-1.5"></span>
                  BMI Normal
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-blue-700 rounded-full mr-1.5"></span>
                  BMI Under Weight
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-yellow-700 rounded-full mr-1.5"></span>
                  BMI Overweight
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-red-700 rounded-full mr-1.5"></span>
                  BMI Obese
                </span>
              </div>
            </div>
            {vitals.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>body Temperature-°C</Table.HeadCell>
                    <Table.HeadCell>blood Pressure-mmHg</Table.HeadCell>
                    <Table.HeadCell>Heart Rate-bpm</Table.HeadCell>
                    <Table.HeadCell>blood Sugar-mg/dL</Table.HeadCell>
                    <Table.HeadCell>Oxygen Saturation-SpO2</Table.HeadCell>
                    <Table.HeadCell>weight-Kg</Table.HeadCell>
                    <Table.HeadCell>height-CM</Table.HeadCell>
                    <Table.HeadCell>BMI</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  {vitals.map((vital) => (
                    <Table.Body className="divide-y" key={vital._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell
                          className={getColorClass(
                            vital.temperature,
                            THRESHOLDS.temperature
                          )}
                        >
                          {vital.temperature}
                        </Table.Cell>
                        <Table.Cell
                          className={`${getColorClass(
                            vital.bloodPressureSystolic,
                            THRESHOLDS.bloodPressureSystolic
                          )} ${getColorClass(
                            vital.bloodPressureDiastolic,
                            THRESHOLDS.bloodPressureDiastolic
                          )}`}
                        >
                          {vital.bloodPressureSystolic}/
                          {vital.bloodPressureDiastolic}
                        </Table.Cell>
                        <Table.Cell
                          className={getColorClass(
                            vital.heartRate,
                            THRESHOLDS.heartRate
                          )}
                        >
                          {vital.heartRate}
                        </Table.Cell>
                        <Table.Cell
                          className={getColorClass(
                            vital.bloodGlucose,
                            THRESHOLDS.bloodGlucose
                          )}
                        >
                          {vital.bloodGlucose}
                        </Table.Cell>
                        <Table.Cell
                          className={getColorClass(
                            vital.oxygenSaturation,
                            THRESHOLDS.oxygenSaturation
                          )}
                        >
                          {vital.oxygenSaturation}
                        </Table.Cell>
                        <Table.Cell>{vital.bodyweight}</Table.Cell>
                        <Table.Cell>{vital.height}</Table.Cell>
                        <Table.Cell
                          className={
                            BMI_COLORS[
                              getBMICategory(parseFloat(vital.BMI).toFixed(2))
                            ]
                          }
                        >
                          {parseFloat(vital.BMI).toFixed(2)}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            onClick={() => {
                              setVitalIdToDelete(vital._id);
                              handleVitalDelete();
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
              <p>Patient Has No recorded Vitals</p>
            )}
            <div className="mb-4 flex items-center"></div>
          </div>
        </div>
      </div>
      <Modal
        show={vitalsModal}
        onClose={() => setVitalsModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add Patient Vitals
            </h3>
          </div>
          <form onSubmit={handleVitalSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <TextInput
                  type="number"
                  id="temperature"
                  className="input-field"
                  placeholder="e.g., 36.5 - 37.5"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="bodyweight">Weight In KG</Label>
                <TextInput
                  type="number"
                  id="bodyweight"
                  className="input-field"
                  placeholder="e.g., 70"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="height">Height In CM</Label>
                <TextInput
                  type="number"
                  id="height"
                  className="input-field"
                  placeholder="e.g., 1.75"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="bloodGlucose">Blood Glucose</Label>
                <TextInput
                  type="number"
                  id="bloodGlucose"
                  className="input-field"
                  placeholder="e.g., 80 - 120"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureSystolic">
                  Systolic Blood Pressure
                </Label>
                <TextInput
                  type="number"
                  id="bloodPressureSystolic"
                  className="input-field"
                  placeholder="e.g., 90 - 120"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressureDiastolic">
                  Diastolic Blood Pressure
                </Label>
                <TextInput
                  type="number"
                  id="bloodPressureDiastolic"
                  className="input-field"
                  placeholder="e.g., 60 - 80"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate</Label>
                <TextInput
                  type="number"
                  id="heartRate"
                  className="input-field"
                  placeholder="e.g., 60 - 100"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                <TextInput
                  type="number"
                  id="respiratoryRate"
                  className="input-field"
                  placeholder="e.g., 12 - 20"
                  onChange={onVitalChange}
                />
              </div>
              <div>
                <Label htmlFor="oxygenSaturation">Oxygen Saturation</Label>
                <TextInput
                  type="number"
                  id="oxygenSaturation"
                  className="input-field"
                  placeholder="e.g., 95 - 100"
                  onChange={onVitalChange}
                />
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Button color="blue" type="submit" outline>
                Submit
              </Button>
              <Button
                className="ml-4"
                color="red"
                onClick={() => {
                  setVitalsModal(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
