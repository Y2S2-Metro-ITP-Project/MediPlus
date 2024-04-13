import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, TextInput, Button } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { format } from "date-fns";
import { BiCapsule } from "react-icons/bi";
export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const prescriptionsPerPage = 5;
  const { currentUser } = useSelector((state) => state.user);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [totalPrescriptions, setTotalPrescriptions] = useState([]);
  const [totalPrescriptionsLastMonth, setTotalPrescriptionsLastMonth] =
    useState([]);
  const id = currentUser._id;
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch(
          `/api/prescription/getPatientPrescription/${currentUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          const filteredPrescriptions = data.prescriptions.filter(
            (prescription) =>
              prescription.doctorId.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
          const uniqueDates = [
            ...new Set(
              data.prescriptions.map((prescription) =>
                format(new Date(prescription.date), "MMMM dd, yyyy")
              )
            ),
          ];
          const uniQueDoctors = [
            ...new Set(
              data.prescriptions.map(
                (prescription) => prescription.doctorId.username
              )
            ),
          ];
          setDoctors(uniQueDoctors);
          setDates(uniqueDates);
          setTotalPrescriptions(data.totalPrescriptions);
          setTotalPrescriptionsLastMonth(data.totalPrescriptionsLastMonth);
          setPrescriptions(filteredPrescriptions);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };

    fetchPrescriptions();
  }, [currentUser._id, searchTerm]);

  console.log(doctors);
  console.log(dates);
  const pageCount = Math.ceil(prescriptions.length / prescriptionsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayPrescriptions = prescriptions
    .slice(
      pageNumber * prescriptionsPerPage,
      (pageNumber + 1) * prescriptionsPerPage
    )
    .map((prescription) => (
      <Table.Body className="divide-y" key={prescription._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>{prescription.medicine}</Table.Cell>
          <Table.Cell>
            {prescription.dosage} {prescription.dosageType}
          </Table.Cell>
          <Table.Cell>{prescription.frequency} Times/Day</Table.Cell>
          <Table.Cell>{prescription.duration} Days</Table.Cell>
          <Table.Cell>{prescription.route}</Table.Cell>
          <Table.Cell>{prescription.foodRelation}</Table.Cell>
          <Table.Cell>{prescription.doctorId.username}</Table.Cell>
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
          `/api/prescription/DownloadPDFPatientPrescription/${id}`,
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
          `/api/prescription/DownloadPDFPatientDoctorPrescription/${id}`,
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
                  Total Prescriptions
                </h3>
                <p className="text-2xl">{totalPrescriptions}</p>
              </div>
              <BiCapsule className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {totalPrescriptionsLastMonth}
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
            </Table.Head>
            {displayPrescriptions}
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
        <p>No prescriptions found</p>
      )}
    </div>
  );
}
