import {
  Button,
  ButtonGroup,
  FileInput,
  Label,
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
export default function DashOutPatients() {
  const { currentUser } = useSelector((state) => state.user);
  const [patients, setPatients] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState("");
  const [inquiryIdToReply, setInquiryIdToReply] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [addPatientModal, setAddPateintModal] = useState(false);
  const [filterOption, setFilterOption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientName, setPatient] = useState("");
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
    if (currentUser.isAdmin || currentUser.isReceptionist) {
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
        body: JSON.stringify({ filterOption: selectedOption }),
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
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    name:false,
    gender:false,
    contactEmail:false,
    contactPhone:false,
    createdAt:false,
    illness:false,
    dateOfBirth:false,
    address:false,
    identification:false,
    emergencyName:false,
    emergencyPhoneNumber:false,
    patientProfilePicture:false,
  });
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
      },
      (error) => {
        setImageFileUploadingError(
          "Could not upload image(File must be less than 2MB)"
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFileUploadSuccess("File Uploaded Successfully");
          setFormData({ ...formData, patientPicture: downloadURL });
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
        setImageFile(null);
        setImageFileUploadingError(null);
        setFileUploadSuccess(null);
        setImageFileUploadingProgress(null);
        setImageFileUploadingError(null);
        toast.success("Patient Added Successfully");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handlePatientDetailsView = (
    name,
    gender,
    contactEmail,
    contactPhone,
    createdAt,
    illness,
    dateOfBirth,
    address,
    identification,
    emergencyName,
    emergencyPhoneNumber,
    patientProfilePicture
  ) => {
    setPatientDetails({
      name,
      gender,
      contactEmail,
      contactPhone,
      createdAt,
      illness,
      dateOfBirth,
      address,
      identification,
      emergencyName,
      emergencyPhoneNumber,
      patientProfilePicture
    });
    setShowPatientDetails(true);
  };
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
          <option value="today">Today</option>
          <option value="lastmonth">Last Month</option>
          <option value="lastyear">Last Year</option>
          <option value="Bydate">By Date</option>
        </select>
      </div>
      {(currentUser.isAdmin || currentUser.isReceptionist) &&
      patients.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Patient Details</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {patients.map((patient) => (
              <Table.Body className="divide-y" key={patient._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{patient.name}</Table.Cell>
                  <Table.Cell>{patient.contactEmail}</Table.Cell>
                  <Table.Cell>{patient.contactPhone}</Table.Cell>
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
                          patient.emergencyName,
                          patient.emergencyPhoneNumber,
                          patient.patientProfilePicture
                        )
                      }
                    />
                  </Table.Cell>
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
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add New Patient
            </h3>
          </div>
          <form onSubmit={handlePatientSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Patient Name</Label>
                <TextInput
                  type="text"
                  placeholder="Patient Name"
                  id="name"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="illness">Illness</Label>
                <TextInput
                  type="text"
                  placeholder="Illness"
                  id="illness"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <TextInput
                  type="date"
                  id="dateOfBirth"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <TextInput
                  type="text"
                  placeholder="Address"
                  id="address"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <TextInput
                  type="tel"
                  placeholder="Contact Phone"
                  id="contactPhone"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <TextInput
                  type="email"
                  placeholder="Contact Email"
                  id="contactEmail"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="identification">Identification</Label>
                <TextInput
                  type="text"
                  placeholder="Identification"
                  id="identification"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <TextInput
                  type="text"
                  placeholder="Emergency Contact Name"
                  id="emergencyName"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhoneNumber">
                  Emergency Contact Phone Number
                </Label>
                <TextInput
                  type="tel"
                  placeholder="Emergency Contact Phone Number"
                  id="emergencyPhoneNumber"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label className="mg">Patient Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="input-field ml-5"
                />
                {imageFileUploadingProgress && (
                  <div className="mt-2">
                    <progress value={imageFileUploadingProgress} max="100" />
                  </div>
                )}
                {imageFileUploadingError && (
                  <div className="mt-2">
                    <p className="text-red-500">{imageFileUploadingError}</p>
                  </div>
                )}
                {fileUploadSuccess && (
                  <div className="mt-2">
                    <p className="text-green-500">{fileUploadSuccess}</p>
                  </div>
                )}
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
                  setAddPateintModal(false);
                  setFormData({});
                  setImageFile(null);
                  setImageFileUploadingError(null);
                  setFileUploadSuccess(null);
                  setImageFileUploadingProgress(null);
                  setImageFileUploadingError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <Modal
  show={showPatientDetails}
  onClose={() => setShowPatientDetails(false)}
  popup
  size="xlg"
>
  <Modal.Header />
  <Modal.Body>
    <div className="text-center">
      <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
      <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
        Patient Details
      </h3>
    </div>
    <div className="grid grid-cols-5 gap-4">
      <div>
        <p className="font-semibold">Name:</p>
        <p>{patientDetails.name}</p>
      </div>
      <div>
        <p className="font-semibold">Gender:</p>
        <p>{patientDetails.gender}</p>
      </div>
      <div>
        <p className="font-semibold">Contact Email:</p>
        <p>{patientDetails.contactEmail}</p>
      </div>
      <div>
        <p className="font-semibold">Contact Phone:</p>
        <p>{patientDetails.contactPhone}</p>
      </div>
      <div>
        <p className="font-semibold">Created At:</p>
        <p>{patientDetails.createdAt}</p>
      </div>
      <div>
        <p className="font-semibold">Illness:</p>
        <p>{patientDetails.illness}</p>
      </div>
      <div>
        <p className="font-semibold">Date of Birth:</p>
        <p>{patientDetails.dateOfBirth}</p>
      </div>
      <div>
        <p className="font-semibold">Address:</p>
        <p>{patientDetails.address}</p>
      </div>
      <div>
        <p className="font-semibold">Identification:</p>
        <p>{patientDetails.identification}</p>
      </div>
      <div>
        <p className="font-semibold">Emergency Contact Name:</p>
        <p>{patientDetails.emergencyName}</p>
      </div>
      <div>
        <p className="font-semibold">Emergency Contact Phone Number:</p>
        <p>{patientDetails.emergencyPhoneNumber}</p>
      </div>
      <div>
        <p className="font-semibold">Patient Picture:</p>
        <img
          src={patientDetails.patientProfilePicture}
          alt="Patient Picture"
          className="w-40 h-40"
        />
      </div>
    </div>
    <div className="flex justify-center mt-4">
      <Button color="gray" onClick={() => setShowPatientDetails(false)}>
        Close
      </Button>
    </div>
  </Modal.Body>
</Modal>

    </div>
  );
}
