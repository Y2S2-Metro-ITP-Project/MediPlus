import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, TextInput, Button } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { format } from "date-fns";
import { BiCapsule } from "react-icons/bi";
import { FaClipboardList } from "react-icons/fa";
import { set } from "mongoose";
export default function PatientDiagnosis() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const DiagnosisPerPage = 5;
  const { currentUser } = useSelector((state) => state.user);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diagnosis, setDiagnosis] = useState([]);
  const [severDiagnosticData, setSevereDiagnosticData] = useState("");
  const [mildDiagnosticData, setMildDiagnosticData] = useState("");
  const [moderateDiagnosticData, setModerateDiagnosticData] = useState("");
  const [lastMonthSevereDiagnosticData, setLastMonthSevereDiagnosticData] =
    useState("");
  const [lastMonthMildDiagnosticData, setLastMonthMildDiagnosticData] =
    useState("");
  const [lastMonthModerateDiagnosticData, setLastMonthModerateDiagnosticData] =
    useState("");
  const id = currentUser._id;
  const getColorClass2 = (level) => {
    switch (level) {
      case "Mild":
        return "text-green-500";
      case "Moderate":
        return "text-yellow-500";
      case "Severe":
        return "text-red-500";
      default:
        return "";
    }
  };
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch(
          `/api/diagnosis/getPatientDiagnosticData/${currentUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          const filteredDiagnosis = data.diagnosis.filter((diagnosis) =>
            diagnosis.doctorId.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
          const uniQueDoctors = [
            ...new Set(
              data.diagnosis.map((diagnosis) => diagnosis.doctorId.username)
            ),
          ];
          const uniqueDates = [
            ...new Set(
              data.diagnosis.map((diagnosis) =>
                format(new Date(diagnosis.date), "MMMM dd, yyyy")
              )
            ),
          ];
          setDates(uniqueDates);
          setDoctors(uniQueDoctors);
          setDiagnosis(filteredDiagnosis);
          setMildDiagnosticData(data.totalMildDiagnosisData);
          setModerateDiagnosticData(data.totalModerateDiagnosisData);
          setSevereDiagnosticData(data.totalSevereDiagnosisData);
          setLastMonthMildDiagnosticData(data.totalMildDiagnosisDataLastMonth);
          setLastMonthModerateDiagnosticData(
            data.totalModerateDiagnosisDataLastMonth
          );
          setLastMonthSevereDiagnosticData(
            data.totalSevereDiagnosisDataLastMonth
          );
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };

    fetchPrescriptions();
  }, [currentUser._id, searchTerm]);

  console.log(doctors);
  console.log(dates);
  const pageCount = Math.ceil(diagnosis.length / DiagnosisPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayDiagnosis = diagnosis
    .slice(pageNumber * DiagnosisPerPage, (pageNumber + 1) * DiagnosisPerPage)
    .map((diagnosis) => (
      <Table.Body className="divide-y" key={diagnosis._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>{diagnosis.type}</Table.Cell>
          <Table.Cell className={getColorClass2(diagnosis.level)}>
            {diagnosis.level}
          </Table.Cell>
          <Table.Cell>{diagnosis.diagnosis}</Table.Cell>
          <Table.Cell>{diagnosis.ICD10}</Table.Cell>
          <Table.Cell>{diagnosis.doctorId.username}</Table.Cell>
        </Table.Row>
      </Table.Body>
    ));
  const handleDoctorChange = (selectedOption) => {
    setSelectedDoctor(selectedOption);
  };

  const handleDateChange = (selectedOption) => {
    setSelectedDate(selectedOption);
  };

  const handleDownloadPDF = async () => {
    if (selectedDate !== null) {
      try {
        const res = await fetch(
          `/api/diagnosis/DownloadPDFPatientDiagnostic/${id}`,
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
        a.download = `Patient-${currentUser.username}-Prescriptions.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.log(error);
      }
    }
    if (selectedDoctor !== null) {
      try {
        const res = await fetch(
          `/api/diagnosis/DownloadPDFPatientDoctorDiagnostic/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patientId: id,
              selectedDoctor: selectedDoctor,
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
        a.download = `Patient-${currentUser.username}-Prescriptions.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Severe Diagnosis
                </h3>
                <p className="text-2xl">{severDiagnosticData}</p>
              </div>
              <FaClipboardList className="bg-red-500 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {lastMonthSevereDiagnosticData}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Moderate Diagnosis
                </h3>
                <p className="text-2xl">{moderateDiagnosticData}</p>
              </div>
              <FaClipboardList className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {lastMonthModerateDiagnosticData}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Mild Diagnosis
                </h3>
                <p className="text-2xl">{mildDiagnosticData}</p>
              </div>
              <FaClipboardList className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {lastMonthMildDiagnosticData}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className=" flex items-center mb-2">
          <TextInput
            type="text"
            placeholder="Search by Doctor's Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button className="w-12 h-10 lg:hidden ml-4" color="gray">
            <AiOutlineSearch />
          </Button>
          <Select
            className="ml-4"
            placeholder="Select Doctor"
            value={selectedDoctor}
            onChange={handleDoctorChange}
            options={doctors.map((doctor) => ({
              value: doctor,
              label: doctor,
            }))}
            isSearchable
            isClearable
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
          />
          <Select
            className="ml-4"
            placeholder="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            options={dates.map((date) => ({
              value: date,
              label: date,
            }))}
            isSearchable
            isClearable
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
          />
          <Button
            outline
            gradientDuoTone="greenToBlue"
            className=" ml-4"
            disabled={
              (selectedDate && selectedDoctor) ||
              (!selectedDate && !selectedDoctor)
            }
            onClick={handleDownloadPDF}
          >
            Download Prescription Report
          </Button>
        </div>
      </div>
      <div className="flex items-center mb-2">
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
      {diagnosis.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Category-Severity Level</Table.HeadCell>
              <Table.HeadCell>Diagnosis</Table.HeadCell>
              <Table.HeadCell>ICD 10 Code</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
            </Table.Head>
            {displayDiagnosis}
          </Table>
          <div className="mt-9 center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName={"pagination flex justify-center"}
              previousLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              nextLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              disabledClassName={"opacity-50 cursor-not-allowed"}
              activeClassName={"bg-indigo-500 text-white"}
            />
          </div>
        </>
      ) : (
        <p>No Diagnostic Data found</p>
      )}
    </div>
  );
}
