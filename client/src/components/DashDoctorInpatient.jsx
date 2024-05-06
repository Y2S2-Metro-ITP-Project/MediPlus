import {
  Button,
  ButtonGroup,
  FileInput,
  Label,
  Modal,
  Table,
  TextInput,
} from "flowbite-react";
import { app } from "../firebase";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Link, json } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { set } from "mongoose";
import { formatDate } from "date-fns";
import { updateWard } from "../../../api/controller/ward.controller";
export default function DashDoctorInpatient() {
  const { currentUser } = useSelector((state) => state.user);
  const [addwardModal, setAddWardModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [doctor, setDoctor] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardIdToUpdate, setWardIdToUpdate] = useState("");
  const [wardIdToDelete, setWardIdToDelete] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [updateWardModal, setUpdateWardModal] = useState(false);
  const [wardDetailsModal, setWardDetailsModal] = useState(false);
  const [bedsData, setBedsData] = useState([]);
  const [wardData, setWardData] = useState({
    doctorId: "",
    doctorName: "",
    nurseId: "",
    nurseName: "",
    WardName: "",
    WardType: "",
    WardCapacity: "",
  });
  const handleWardDetails = (ward) => {
    setWardData(ward);
  };
  const fetchDoctors = async () => {
    const response = await fetch(`/api/user/get/getDoctors`);
    const data = await response.json();
    setDoctor(data);
  };
  const fetchNurses = async () => {
    const response = await fetch(`/api/user/get/getNurses`);
    const data = await response.json();
    setNurses(data);
  };
  const fetchWards = async () => {
    const response = await fetch(`/api/ward/getWard`);
    const data = await response.json();
    setWards(data);
  };
  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await fetch(`/api/user/get/getDoctors`);
      const data = await response.json();
      setDoctor(data);
    };
    const fetchNurses = async () => {
      const response = await fetch(`/api/user/get/getNurses`);
      const data = await response.json();
      setNurses(data);
    };
    const fetchWards = async () => {
      const response = await fetch(`/api/ward/getDoctorWard/${currentUser._id}`);
      const data = await response.json();
      const filteredData = data.filter((ward) => {
        // Check if the ward's doctor name or nurse name contains the search term
        const doctorNameMatch = ward.doctorName
          .toLowerCase()
          .includes(searchTerm1.toLowerCase());
        const nurseNameMatch = ward.nurseName
          .toLowerCase()
          .includes(searchTerm1.toLowerCase());

        // Return true if either doctor name or nurse name matches the search term
        return doctorNameMatch || nurseNameMatch;
      });
      setWards(filteredData);
    };
    fetchDoctors();
    fetchNurses();
    fetchWards();
  }, [currentUser._id, searchTerm1]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  {
    /** Pagination */
  }
  const [pageNumber, setPageNumber] = useState(0);
  const wardsPerPage = 5;

  const pageCount = Math.ceil(wards.length / wardsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };
  const calculateAvailableBeds = (ward) => {
    return ward.beds.reduce((count, bed) => {
      return bed.isAvailable ? count + 1 : count;
    }, 0);
  };

  const calculateOccupiedBeds = (ward) => {
    return ward.beds.reduce((count, bed) => {
      return !bed.isAvailable ? count + 1 : count;
    }, 0);
  };
  const handleViewBeds = async (beds) => {
    setBedsData(beds);
    setWardDetailsModal(true);
  };
  const displayWards = wards
    .slice(pageNumber * wardsPerPage, (pageNumber + 1) * wardsPerPage)
    .map((wards) => (
      <Table.Body className="divide-y" key={wards._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            {new Date(wards.createdAt).toLocaleDateString()}
          </Table.Cell>
          <Table.Cell>{wards.WardName}</Table.Cell>
          <Table.Cell>{wards.doctorName}</Table.Cell>
          <Table.Cell>{wards.nurseName}</Table.Cell>
          <Table.Cell>
            <span className="text-green-500">{wards.beds.length}</span>
          </Table.Cell>
          <Table.Cell>
            <span className="text-red-500">{calculateOccupiedBeds(wards)}</span>
          </Table.Cell>
          <Table.Cell>
            <HiEye
              className="text-blue-500 cursor-pointer"
              onClick={() => handleViewBeds(wards.beds)}
            />
          </Table.Cell>
          <Table.Cell>
            <Link
              to={`/dashboard?tab=WardProfile&wardId=${wards._id}`}
              className="text-blue-500 hover:underline"
            >
              View Patients
            </Link>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <TextInput
            type="text"
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            placeholder="Search by doctor name"
            rightIcon={AiOutlineSearch}
            className="ml-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
          />
        </div>
      </div>
      {(currentUser.isHeadNurse || currentUser.isDoctor)&& wards.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>Nurse</Table.HeadCell>
              <Table.HeadCell>No of Beds</Table.HeadCell>
              <Table.HeadCell>Beds Occupied</Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
              <Table.HeadCell>Patients</Table.HeadCell>
            </Table.Head>
            {displayWards}
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
        <p>You have no Wards</p>
      )}

      {/** Ward Details Modal */}
      {/* Modal to display bed status */}
      <Modal
        show={wardDetailsModal}
        onClose={() => setWardDetailsModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <h2>Beds Status</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {bedsData.map((bed) => (
              <li
                key={bed._id}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: bed.isAvailable ? "#e6ffe6" : "#ffe6e6",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Bed {bed.number}:</span>
                <span style={{ marginLeft: "10px" }}>
                  {bed.isAvailable ? "Available" : "Occupied"}
                </span>
                {bed.patient && (
                  <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
                    - Occupied by {bed.patient.name}, Phone:{" "}
                    {bed.patient.contactPhone}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </div>
  );
}
