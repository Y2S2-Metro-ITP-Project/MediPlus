import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableCell,
  TextInput,
  Textarea,
  Checkbox,
} from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import {
  faHeartbeat,
  faThermometerHalf,
  faTint,
} from "@fortawesome/free-solid-svg-icons";
import { FaFilePdf } from "react-icons/fa6";
import { set } from "mongoose";
import TestOrder from "../../../api/models/orderedTest.model";
const THRESHOLDS = {
  temperature: { low: 36.1, high: 37.2 },
  bloodPressureSystolic: { low: 90, high: 120 },
  bloodPressureDiastolic: { low: 60, high: 80 },
  heartRate: { low: 60, high: 100 },
  bloodGlucose: { low: 70, high: 140 },
  oxygenSaturation: { low: 95, high: 100 },
};

const COLORS = {
  low: "font-bold text-blue-700", // Low value color
  high: "font-bold text-red-700", // High value color
  normal: "font-bold text-green-700", // Normal value color
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
  underweight: "font-bold text-blue-700",
  healthyWeight: "font-bold text-green-700",
  overweight: "font-bold text-yellow-700",
  obese: "font-bold text-red-700",
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
  const [PrecriptionsModal, setPrescriptionModal] = useState(false);
  const [medicine, setMedicine] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionIdToDelete, setPrescriptionIdToDelete] = useState("");
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [diagnosisModal, setDiagnosisModal] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [diagnosticData, setDiagnosticData] = useState([]);
  const [diagnosisIDDelete, setDiagnosisIDDelete] = useState("");
  const [searchTerm1, setSearchTerm1] = useState("");
  const [labOrders, setLabOrders] = useState([]);
  const [addTestModal, setAddTestModal] = useState(false);

  const itemsPerPage = 2; // Adjust as needed

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
  const offset = currentPage * itemsPerPage;
  const pageCount = Math.ceil(prescriptions.length / itemsPerPage);
  const currentPageData = prescriptions.slice(offset, offset + itemsPerPage);
  const fetchDieseases = async () => {
    try {
      const res = await fetch(`/api/disease/getDisease`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      setDiseases(
        data.diseases.map((disease) => ({
          value: disease.name,
          label: disease.name,
          icdCode: disease.ICD10,
        }))
      );
    } catch (error) {
      console.error("Error fetching diseases:", error);
    }
  };
  const fetchDiagnosticData = async () => {
    try {
      const res = await fetch(`/api/diagnosis/getDiagnosticData/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }

      const uniqueDates = [
        ...new Set(
          data.diagnosis.map((diagnosis) =>
            format(new Date(diagnosis.date), "MMMM dd, yyyy")
          )
        ),
      ];

      const uniqueDoctors = [
        ...new Set(
          data.diagnosis.map((diagnosis) => ({
            doctorId: diagnosis.doctorId._id,
            username: diagnosis.doctorId.username,
          }))
        ),
      ];
      setDiagnosisDate(uniqueDates);
      setDiagnosisDoctor(uniqueDoctors);
      setDiagnosticData(data.diagnosis);
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
    }
  };
 
  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`/api/prescription/getPrescriptions/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const filteredPrescriptions = data.prescriptions.filter((prescription) =>
        prescription.doctorId.username
          .toLowerCase()
          .includes(searchTerm1.toLowerCase())
      );
      const uniqueDates = [
        ...new Set(
          data.prescriptions.map((prescription) =>
            format(new Date(prescription.date), "MMMM dd, yyyy")
          )
        ),
      ];
      setDates(uniqueDates);
      setPrescriptions(filteredPrescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };


    // ====================================================
    //FETCHING TEST ORDERS FOR RELEVANT PATIENT

    const fetchTestOrders = async() => {
      try {
        const res = await fetch(`/api/labOrder/getPatientTests/${id}`);
        const data = await res.json();

        if (res.ok){
          setLabOrders(data);
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    if(currentUser.isAdmin || currentUser.isDoctor || currentUser.isLabTech){
        fetchTestOrders();
    }
    
   useEffect ( ()=> {
    const fetchTestOrders = async() => {
      try {
        const res = await fetch(`/api/labOrder/getPatientTests/${id}`);
        const data = await res.json();

        if (res.ok){
          setLabOrders(data);
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    if(currentUser.isAdmin || currentUser.isDoctor || currentUser.isLabTech){
        fetchTestOrders();
    }
   },[currentUser._id]);
      
  
   


    //=================================================

  const fetchMedicine = async () => {
    try {
      const response = await fetch("/api/inventory/getInventoryInstock");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setMedicine(data.items);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };
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
    if (
      currentUser.isReceptionist ||
      currentUser.isAdmin ||
      currentUser.isDoctor
    ) {
      fetchPatient();
      fetchPatientVital();
      fetchMedicine();
      fetchPrescriptions();
      fetchDieseases();
      fetchDiagnosticData();
      fetchTestOrders();
    }
  }, [currentUser._id, searchTerm1]);
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

  const onPrescriptionChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  console.log(formData);
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
      toast.error("Failed to add vitals");
    }
    toast.success("Vitals added successfully");
    setFormData([]);
    setVitalsModal(false);
    fetchPatient();
    fetchPatientVital();
    fetchPrescriptions();
    fetchTestOrders();
    fetchDieseases();
    fetchDiagnosticData();
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
    fetchPrescriptions();
    fetchDieseases();
    fetchDiagnosticData();
    fetchTestOrders();
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
  const deliveryOptions = [
    { value: "Oral", label: "Oral" },
    { value: "Intravenous", label: "Intravenous" },
    { value: "Intramuscular", label: "Intramuscular" },
    { value: "Subcutaneous", label: "Subcutaneous" },
    { value: "Rectal", label: "Rectal" },
    { value: "Vaginal", label: "Vaginal" },
    { value: "Otic", label: "Otic" },
    { value: "Ophthalmic", label: "Ophthalmic" },
    { value: "Nasal", label: "Nasal" },
    { value: "Topical", label: "Topical" },
    { value: "Transdermal", label: "Transdermal" },
    { value: "Inhalation", label: "Inhalation" },
    { value: "Buccal", label: "Buccal" },
    { value: "Sublingual", label: "Sublingual" },
    { value: "Epidural", label: "Epidural" },
    { value: "Intrathecal", label: "Intrathecal" },
    { value: "Intraosseous", label: "Intraosseous" },
    { value: "Intraperitoneal", label: "Intraperitoneal" },
    { value: "Intrapleural", label: "Intrapleural" },
    { value: "Intravesical", label: "Intravesical" },
    { value: "Intravitreal", label: "Intravitreal" },
    { value: "Intracardiac", label: "Intracardiac" },
  ];
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/prescription/addPrescription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          DoctorId: currentUser._id,
          patientId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Failed to add prescription");
        toast.error(data.message);
        console.log(data);
      } else {
        toast.success("Prescription added successfully");
      }
      setFormData([]);
      setPrescriptionModal(false);
      fetchPatient();
      fetchPatientVital();
      fetchPrescriptions();
      fetchDieseases();
      fetchDiagnosticData();
      fetchTestOrders();
    } catch (error) {
      console.log(error);
    }
  };
  const onChangeFoodRelation = (selectedOption) => {
    console.log("Selected Option:", selectedOption);
    setFormData({
      ...formData,
      foodRelation: selectedOption.value,
    });
  };
  const onMedicineChange = (selectedOption) => {
    console.log("Selected Option:", selectedOption);
    setFormData({
      ...formData,
      medicine: selectedOption.label,
      itemId: selectedOption.value,
    });
  };
  const onRouteChange = (selectedOption) => {
    console.log("Selected Option:", selectedOption);
    setFormData({
      ...formData,
      route: selectedOption.value,
    });
  };
  const onDosageTypeChange = (selectedOption) => {
    console.log("Selected Option:", selectedOption);
    setFormData({
      ...formData,
      dosageType: selectedOption.value,
    });
  };
  const handlePrescriptionDelete = async (e) => {
    const res = await fetch(
      `/api/prescription/deletePrescription/${prescriptionIdToDelete}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      console.log("Failed to delete prescription");
      toast.error("Failed to delete prescription");
    } else {
      toast.success("Prescription deleted successfully");
    }
    fetchPatient();
    fetchPrescriptions();
    fetchPatientVital();
    fetchDieseases();
    fetchDiagnosticData();
    fetchTestOrders();
  };
 
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const handleDownloadPrescriptionReport = async () => {
    try {
      const res = await fetch(
        `/api/prescription/DownloadPDFPrescription/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patientId: id, selectedDate: selectedDate }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Patient-${patient.name}-Prescriptions.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDiseaseSelect = (selectedOption) => {
    setSelectedDisease(selectedOption);
    if (selectedOption) {
      setIcdCode(selectedOption.icdCode);
      setFormData({
        ...formData,
        disease: selectedOption.value,
        ICD10: selectedOption.icdCode,
      });
    } else {
      setIcdCode("");
    }
  };
  const onDiagnosisChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const onSelectedTypeChange = (selectedOption) => {
    setFormData({
      ...formData,
      type: selectedOption.value,
    });
  };
  const onSelectedCategoryChange = (selectedOption) => {
    setFormData({
      ...formData,
      category: selectedOption.value,
    });
  };
  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/diagnosis/addDiagnosticData/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          doctorId: currentUser._id,
          patientId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      }
      toast.success("Diagnosis added successfully");
      setFormData([]);
      setDiagnosisModal(false);
      fetchPatient();
      fetchPatientVital();
      fetchPrescriptions();
      fetchDieseases();
      fetchDiagnosticData();
      fetchTestOrders();
    } catch (error) {
      console.log(error);
    }
  };
  const getColorClass2 = (level) => {
    switch (level) {
      case "Mild":
        return "font-bold text-green-500";
      case "Moderate":
        return "font-bold text-yellow-500";
      case "Severe":
        return "font-bold text-red-500";
      default:
        return "";
    }
  };
  const handleDiagnosisDelete = async (e) => {
    try {
      const res = await fetch(
        `/api/diagnosis/deleteDiagnosticData/${diagnosisIDDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        console.log("Failed to delete diagnosis");
        toast.error("Failed to delete diagnosis");
      } else {
        toast.success("Diagnosis deleted successfully");
      }
      fetchPatient();
      fetchPrescriptions();
      fetchPatientVital();
      fetchDieseases();
      fetchDiagnosticData();
      fetchTestOrders();
    } catch (error) {
      console.log(error);
    }
  };

  {
    /** Handle Diagnosis Report Download */
  }
  const [selectedDiagnosisDate, setSelectedDiagnosisDate] = useState("");
  const [selectedDiagnosisDoctor, setSelectedDiagnosisDoctor] = useState("");

  const handleDiagnosisDateChange = (selectedOption) => {
    setSelectedDiagnosisDate(selectedOption);
  };

  const handleDiagnosisDoctorChange = (selectedOption) => {
    setSelectedDiagnosisDoctor(selectedOption);
  };

  console.log(selectedDiagnosisDate);
  console.log(selectedDiagnosisDoctor);
  const handleDownloadDiagnosisReport = async () => {
    if (selectedDiagnosisDate !== null) {
      try {
        const res = await fetch(
          `/api/diagnosis/DownloadPDFDateDiagnosisDate/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ patientId: id, selectedDiagnosisDate }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Patient-${patient.name}-Diagnosis.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.log(error);
      }
    }
    if (selectedDiagnosisDoctor !== null) {
      try {
        const res = await fetch(
          `/api/diagnosis/DownloadPDFDiagnosisDoctor/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patientId: id,
              selectedDoctor: selectedDiagnosisDoctor,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Patient-${patient.name}-Diagnosis.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.log(error);
      }
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
      {/* Patient Diagnosis*/}
      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Diagnosis</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2"
                onClick={() => {
                  setDiagnosisModal(true);
                }}
              >
                Add New Diagnosis
              </Button>
              <div className="flex ml-4">
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5"></span>
                  Mild
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-1.5"></span>
                  Moderate
                </span>
                <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5"></span>
                  Severe
                </span>
              </div>
            </div>
            {diagnosticData.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Type</Table.HeadCell>
                    <Table.HeadCell>Category-Severity Level</Table.HeadCell>
                    <Table.HeadCell>Diagnosis</Table.HeadCell>
                    <Table.HeadCell>ICD 10 Code</Table.HeadCell>
                    <Table.HeadCell>Doctor</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  {diagnosticData.map((diagnosis) => (
                    <Table.Body className="divide-y" key={diagnosis._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>{diagnosis.type}</Table.Cell>
                        <Table.Cell className={getColorClass2(diagnosis.level)}>
                          {diagnosis.level}
                        </Table.Cell>
                        <Table.Cell>{diagnosis.diagnosis}</Table.Cell>
                        <Table.Cell>{diagnosis.ICD10}</Table.Cell>
                        <Table.Cell>{diagnosis.doctorId.username}</Table.Cell>
                        <Table.Cell>
                          <span
                            onClick={() => {
                              setDiagnosisIDDelete(diagnosis._id);
                              handleDiagnosisDelete();
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
              <p>Patient Has No recorded Diagnosis</p>
            )}
            <div className="mb-4 flex items-center"></div>
          </div>
        </div>
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
      {/** Patient Precriptions */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Prescriptions</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2"
                onClick={() => {
                  setPrescriptionModal(true);
                }}
              >
                Add New Prescription
              </Button>
              <TextInput
                type="text"
                value={searchTerm1}
                onChange={(e) => setSearchTerm1(e.target.value)}
                placeholder="Search by doctor name"
                rightIcon={AiOutlineSearch}
                className="ml-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
              />
              <Select
                id="filter"
                className="ml-4 mb-2"
                onChange={handleDateChange}
                placeholder="Select a date"
                value={selectedDate}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
                options={dates.map((date) => ({
                  value: date,
                  label: date,
                }))}
              />

              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2 ml-4"
                onClick={handleDownloadPrescriptionReport}
                disabled={!selectedDate}
              >
                Download Prescription Report
              </Button>
              <div className="flex ml-4"></div>
            </div>
            {prescriptions.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Medicine</Table.HeadCell>
                    <Table.HeadCell>Dosage</Table.HeadCell>
                    <Table.HeadCell>Frequency</Table.HeadCell>
                    <Table.HeadCell>Duration</Table.HeadCell>
                    <Table.HeadCell>Route</Table.HeadCell>
                    <Table.HeadCell>Food Relation</Table.HeadCell>
                    <Table.HeadCell>Doctor</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  {prescriptions.map((prescription) => (
                    <Table.Body className="divide-y" key={prescription._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>{prescription.medicine}</Table.Cell>
                        <Table.Cell>
                          {prescription.dosage} {prescription.dosageType}
                        </Table.Cell>
                        <Table.Cell>
                          {prescription.frequency} Times/Day
                        </Table.Cell>
                        <Table.Cell>{prescription.duration} Days</Table.Cell>
                        <Table.Cell>{prescription.route}</Table.Cell>
                        <Table.Cell>{prescription.foodRelation}</Table.Cell>
                        <Table.Cell>
                          {prescription.doctorId.username}
                        </Table.Cell>
                        <Table.Cell
                          style={{
                            color:
                              prescription.status === "Pending"
                                ? "orange"
                                : prescription.status === "Rejected"
                                ? "red"
                                : "green",
                            fontWeight: "bold",
                          }}
                        >
                          {prescription.status}
                        </Table.Cell>

                        <Table.Cell>
                          <span
                            onClick={() => {
                              setPrescriptionIdToDelete(prescription._id);
                              handlePrescriptionDelete();
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
                {/* Pagination */}
              </>
            ) : (
              <p>Patient Has No recorded Precriptions</p>
            )}
            <div className="mb-4 flex items-center"></div>
          </div>
        </div>
      </div>

      {/* ======================================================================================================= */}
      {/* LAB PRESCRIPTIONS */}
            {/** Patient Precriptions */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Lab Prescriptions</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2"
                onClick={() => {setAddTestModal(true)}}
              >
                Add New Test Order
              </Button>
              <TextInput
                type="text"
                placeholder="Search by doctor name"
                rightIcon={AiOutlineSearch}
                className="ml-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
              />

<Select
                id="filter"
                className="ml-4 mb-2"
                onChange={handleDateChange}
                placeholder="Select a date"
                value={selectedDate}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
                options={dates.map((date) => ({
                  value: date,
                  label: date,
                }))}
              />
              

              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="mb-2 ml-4"
                onClick={""}
              >
                Download Test Result
              </Button>
              <div className="flex ml-4"></div>
            </div>
            {
      ( labOrders.length > 0) ? (
              <>
              <Table hoverable className="shadow-md">
                <Table.Head>
                  <Table.HeadCell>Test/s Ordered</Table.HeadCell>
                  <Table.HeadCell>Prescribed by</Table.HeadCell>
                  <Table.HeadCell>Priority</Table.HeadCell>
                  <Table.HeadCell>Stage</Table.HeadCell>
                  <Table.HeadCell>Edit</Table.HeadCell>
                  <Table.HeadCell>Delete</Table.HeadCell>
                  <Table.HeadCell>Results</Table.HeadCell>
                </Table.Head>

                {labOrders.map((orders) => (
              <Table.Body className=" divide-y text-center ">
                <Table.Row>
                  
                  <TableCell>
                    {orders.testId.map((test) => test.name).join("/")}
                  </TableCell>
                  <TableCell>{orders.DoctorId.username} </TableCell>
                 
                  <TableCell>
                    {orders.highPriority ? "high priority" : "low priority"}
                  </TableCell>

                  <TableCell>
                    {orders.orderStages}
                  </TableCell>
                  <TableCell>
                    Edit
                  </TableCell>
                  <TableCell>
                   Delete
                  </TableCell>
                  <TableCell>
                    Result
                  </TableCell>
                </Table.Row>
              </Table.Body>
            ))}
    
                
              </Table>
            </>
            ) : (
              <p>Patient Has No recorded lab orders</p>
            )}
            <div className="mb-4 flex items-center"></div>
          </div>
        </div>
      </div>



      {/* ======================================================================================================= */}
      {/** Vitals Modal */}
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
      {/** Precription Modal */}
      <Modal
        show={PrecriptionsModal}
        onClose={() => {
          setPrescriptionModal(false), setFormData([]);
        }}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add Precription
            </h3>
          </div>
          <form onSubmit={handlePrescriptionSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Label htmlFor="Medicine">Medicine</Label>
                <Select
                  options={medicine.map((item) => ({
                    value: item._id,
                    label: item.itemName,
                  }))}
                  placeholder="Select a Medicine"
                  id="medicine"
                  onChange={onMedicineChange}
                  isSearchable
                  required
                />
              </div>
              <div className="">
                <Label htmlFor="dosageType">Dosage Type</Label>
                <div className="flex">
                  <Select
                    id="dosageType"
                    className="max-w-xs"
                    options={["Tablet", "Capsule", "Syrup", "Injection"].map(
                      (option) => ({
                        value: option,
                        label: option,
                      })
                    )}
                    onChange={onDosageTypeChange}
                    required
                  />
                  <TextInput
                    type="number"
                    id="dosageAmount"
                    className="input-field ml-5"
                    placeholder="Dosage Amount"
                    onChange={onPrescriptionChange}
                    required
                    style={{ maxWidth: "200px" }} // Add left margin to separate it from the select
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="noofdays">No Of Days</Label>
                <TextInput
                  type="number"
                  id="noOfDays"
                  className="input-field"
                  placeholder="1,2,3..."
                  onChange={onPrescriptionChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="route">Route</Label>
                <Select
                  options={deliveryOptions}
                  placeholder="Select a Route"
                  id="route"
                  onChange={onRouteChange}
                  isSearchable
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <TextInput
                  type="number"
                  id="frequency"
                  className="input-field"
                  placeholder="No Of Times Per Day"
                  onChange={onPrescriptionChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="foodRealtion">Food Relations</Label>
                <Select
                  options={["Before Food", "After Food"].map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  placeholder="Select"
                  id="foodRelations"
                  onChange={onChangeFoodRelation}
                  isSearchable
                  required
                />
              </div>
              <div>
                <Label htmlFor="Instructions">Instructions</Label>
                <Textarea
                  type="text"
                  id="instructions"
                  placeholder="e.g., Take 1 tablet twice a day for 3 days"
                  onChange={onPrescriptionChange}
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
                  setPrescriptionModal(false);
                  setFormData([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/** Diagnosis Modal */}
      <Modal
        show={diagnosisModal}
        onClose={() => {
          setDiagnosisModal(false), setFormData([]);
        }}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add Patient Diagnosis
            </h3>
          </div>
          <form onSubmit={handleDiagnosisSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Label htmlFor="diesease">Diesease</Label>
                <Select
                  options={diseases}
                  placeholder="Select a Disease"
                  id="disease"
                  required
                  isSearchable
                  value={selectedDisease}
                  onChange={handleDiseaseSelect}
                />
              </div>
              <div>
                <Label htmlFor="ICD Code">ICD Code</Label>
                <TextInput
                  id="icdCode"
                  type="text"
                  value={icdCode}
                  placeholder="ICD Code"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="Type">Type</Label>
                <Select
                  options={["Provincial", "Principal"].map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  placeholder="Select a Type"
                  isSearchable
                  onChange={onSelectedTypeChange}
                  id="type"
                />
              </div>
              <div>
                <Label htmlFor="Category">Category</Label>
                <Select
                  options={["Mild", "Moderate", "Severe"].map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  isSearchable
                  required
                  id="category"
                  onChange={onSelectedCategoryChange}
                  placeholder="Select a Category"
                />
              </div>
              <div>
                <Label htmlFor="Remarks">Remarks</Label>
                <Textarea
                  type="text"
                  id="instructions"
                  placeholder="Sympthoms, Treatment, etc"
                  onChange={onDiagnosisChange}
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
                  setDiagnosisModal(false);
                  setFormData([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* PRESCIRBE TESTS MODAL */}

      <Modal show={addTestModal} onClose={() => setAddTestModal(false)} popup size="lg">
        <ModalHeader />
        <ModalBody>
          <form className="flex flex-col gap-5" onSubmit={""}>
            <div>
              <Label>Select Lab Tests:</Label>
              <Select
                isMulti
                id="labTests"
               // value={selectedTests}
               // options={options}
               // onChange={handleTestSelectChange}
              />
            </div>

  

            <div>
              <Label> Test presrcibed by: </Label>
              <TextInput
                id="testEmpName"
                value={currentUser.username}
                readOnly={true}
              />
            </div>

            <div>
              <Label value="High priority?  " />
              <Checkbox id="priority"
              // onChange={handlePriorityChange}
                />
            </div>

            <div>
              <Label value="Patient Advice:"/>
              <Textarea/>

            </div>

            <Button gradientDuoTone="purpleToPink" outline type="submit">
              {/* {if(selectedTests.length>1{

              })} */}
              Order Test
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
}
