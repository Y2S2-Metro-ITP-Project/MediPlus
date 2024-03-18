import {
  Button,
  ButtonGroup,
  FileInput,
  Modal,
  Select,
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
import { get, set } from "mongoose";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
export default function DashPatients() {
  const { currentUser } = useSelector((state) => state.user);
  const [patients, setPatients] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState("");
  const [inquiryIdToReply, setInquiryIdToReply] = useState("");
  const [modalMessagePopUp, setModalMessagePopUp] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [addPatientModal, setAddPateintModal] = useState(false);
  const [filterOption, setFilterOption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const fetchPatients = async () => {
    try {
      const res = await fetch(`/api/patient/getPatients`);
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
        if (data.patients.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patient/getPatients`);
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setPatients(data.patients);
          if (data.patients.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin) {
      fetchPatients();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = patients.length;
    try {
      const res = await fetch(
        `/api/patient/getPatients?&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setPatients((prev) => [...prev, ...data.patients]);
        if (data.patients.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handlePatientDelete = async (e) => {
    try {
      const res = await fetch(`/api/patient/delete/${patientIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setPatients((prev) =>
          prev.filter((patient) => patient._id !== patientIdToDelete)
        );
        setShowModal(false);
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleFilterChange = async (e) => {
    e.preventDefault();
    const selectedOption = e.target.value;
    try {
      const res = await fetch(`/api/patient/filterPatient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption:selectedOption }),
      });
      const data = await res.json();
        setPatients(data);
        setShowMore(data.patients.length > 9);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patient/searchPatient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({});
        setPatients(data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/patient/getPatients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
        if (data.patients.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  useEffect(() => {
    if (imageFile) {
      uploadPatientImage();
    }
  }, [imageFile]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const uploadPatientImage = async () => {
    const storage = getStorage(app);
    const filename = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
        setFileUploadSuccess("File Uploaded Successfully");
      },
      (error) => {
        imageFileUploadingError(
          "Could not upload image(File must be less than 2MB)"
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
        });
      }
    );
  };
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/patient/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchPatients();
        setAddPateintModal(false);
        setFormData({});
        toast.success("Patient Added Successfully");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  console.log(formData);
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button
            className="mr-4"
            gradientDuoTone="purpleToPink"
            outline
            onClick={() => setAddPateintModal(true)}
          >
            Add Patient
          </Button>
          <form onSubmit={handleSearch}>
            <TextInput
              type="text"
              placeholder="Search...."
              rightIcon={AiOutlineSearch}
              className="hidden lg:inline"
              id="search"
              onChange={onChange}
              style={{ width: "300px" }}
            />
            <Button className="w-12 h-10 lg:hidden" color="gray">
              <AiOutlineSearch />
            </Button>
          </form>
        </div>
        <Button
          className="w-200 h-10 ml-6lg:ml-0 lg:w-32"
          color="gray"
          onClick={() => handleReset()}
        >
          Reset
        </Button>
        <select
          id="filter"
          onChange={handleFilterChange}
          className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="defaultvalue" disabled selected>
            Choose a filter option
          </option>
          <option value="inpatients">Inpatients</option>
          <option value="outpatients">Outpatients</option>
        </select>
      </div>
      {currentUser.isAdmin && patients.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Image</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Pateint Type</Table.HeadCell>
              <Table.HeadCell>Submit</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {patients.map((patient) => (
              <Table.Body className="divide-y" key={patient._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={patient.patientProfilePicture}
                      alt={patient.patientName}
                      className="w-10 h-10 object-cover b-gray-500 rounded-full"
                    />
                  </Table.Cell>
                  <Table.Cell>{patient.patientName}</Table.Cell>
                  <Table.Cell>{patient.patientPhone}</Table.Cell>
                  <Table.Cell>{patient.patientType}</Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span
                        onClick={() => {
                          setShowReplyModal(true);
                          setInquiryIdToReply(inquiry._id);
                        }}
                      >
                        Update
                      </span>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setPatientIdToDelete(patient._id);
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
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show More
            </button>
          )}
        </>
      ) : (
        <p>You have no Patients</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this patient?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handlePatientDelete}>
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={addPatientModal}
        onClose={() => setAddPateintModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Add New Patient
            </h3>
          </div>
          <form onSubmit={handlePatientSubmit}>
            <div className="mb-4">
              <TextInput
                type="text"
                id="patientName"
                placeholder="Patient Name"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="number"
                id="phone"
                onChange={handleChange}
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imageFileUploadingProgress && (
                <div className="mt-4">
                  <progress value={imageFileUploadingProgress} max="100" />
                </div>
              )}
              {}
              {imageFileUploadingError && (
                <div className="mt-4">
                  <p className="text-red-500">{imageFileUploadingError}</p>
                </div>
              )}

              {fileUploadSuccess && (
                <div className="mt-4">
                  <p className="text-green-500">{fileUploadSuccess}</p>
                </div>
              )}
            </div>
            <div className="mb-4">
              <Select
                id="patientType"
                label="Patient Type"
                required
                onChange={handleChange}
              >
                <option value="default" disabled selected>
                  Select Patient Type
                </option>
                <option value="Inpatient">Inpatient</option>
                <option value="Outpatient">Outpatient</option>
              </Select>
            </div>
            <div className="flex justify-center gap-4">
              <Button type="submit" color="primary">
                Add Patient
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setAddPateintModal(false),
                    setFormData({}),
                    setImageFile(null),
                    setImageFileUploadingError(false),
                    setFileUploadSuccess(false),
                    setImageFileUploadingError(false);
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
