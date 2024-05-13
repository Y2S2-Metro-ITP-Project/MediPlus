import {
  Button,
  ButtonGroup,
  FileInput,
  Label,
  Modal,
  Table,
  TextInput,
  Textarea,
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
export default function DashDiseases() {
  const { currentUser } = useSelector((state) => state.user);
  const [addwardModal, setAddWardModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [diseaseData, setDiseaseData] = useState([]);
  const [diseaseView, setDiseaseView] = useState({});
  const [viewDiseaseModal, setViewDiseaseModal] = useState(false);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [addDiseaseModal, setAddDieseaseModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dieseaseIdToDelete, setDieseaseIdToDelete] = useState("");
  const [updateModal, setUpdateModal] = useState(false);
  const [diseaseDataUpdate, setDiseaseDataUpdate] = useState({});
  const fetchDiseases = async () => {
    const response = await fetch(`/api/disease/getDisease`);
    const data = await response.json();
    const filteredData = data.diseases.filter((disease) =>
      disease.name.toLowerCase().includes(searchTerm1.toLowerCase())
    );
    setDiseaseData(filteredData);
  };
  useEffect(() => {
    const fetchDiseases = async () => {
      const response = await fetch(`/api/disease/getDisease`);
      const data = await response.json();
      const filteredData = data.diseases.filter((disease) =>
        disease.name.toLowerCase().includes(searchTerm1.toLowerCase())
      );
      setDiseaseData(filteredData);
    };
    fetchDiseases();
  }, [currentUser._id, searchTerm1]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleDiseaseDataUpdate = (disease) => {
    setDiseaseDataUpdate(disease);
  };
  {
    /** Pagination */
  }
  const [pageNumber, setPageNumber] = useState(0);
  const diseasesPerPage = 5;

  const pageCount = Math.ceil(diseaseData.length / diseasesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };
  const displayDiseases = diseaseData
    .slice(pageNumber * diseasesPerPage, (pageNumber + 1) * diseasesPerPage)
    .map((disease) => (
      <Table.Body className="divide-y" key={disease._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>{disease.name}</Table.Cell>
          <Table.Cell>{disease.ICD10}</Table.Cell>
          <Table.Cell>
            <HiEye
              className="text-blue-500 cursor-pointer"
              onClick={() => handleViewDisease(disease)}
            />
          </Table.Cell>
          <Table.Cell>
            <span
              onClick={() => {
                setUpdateModal(true);
                handleDiseaseDataUpdate(disease);
              }}
              className="font-medium text-green-500 hover:underline cursor-pointer"
            >
              Update
            </span>
          </Table.Cell>
          <Table.Cell>
            <span
              onClick={() => {
                setShowModal(true);
                setDieseaseIdToDelete(disease._id);
              }}
              className="font-medium text-red-500 hover:underline cursor-pointer"
            >
              Delete
            </span>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const handleViewDisease = (disease) => {
    setDiseaseView(disease);
    setViewDiseaseModal(true);
  };
  const handleDieseaseAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/disease/addDisease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.message) {
        toast.success(data.message);
        setAddDieseaseModal(false);
        fetchDiseases();
        setFormData({});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  console.log(formData);
  const handleDeleteDiesease = async () => {
    try {
      const response = await fetch(
        `/api/disease/deleteDisease/${dieseaseIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.message) {
        toast.success(data.message);
        setShowModal(false);
        fetchDiseases();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDieseaseUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/disease/updateDisease/${diseaseDataUpdate._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Disease updated successfully");
        setUpdateModal(false);
        fetchDiseases();
        setFormData({});
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button
            className="mr-4"
            gradientDuoTone="purpleToPink"
            outline
            onClick={() => setAddDieseaseModal(true)}
          >
            Add Diesease
          </Button>
          <TextInput
            type="text"
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            placeholder="Search by diesease name"
            rightIcon={AiOutlineSearch}
            className="ml-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
          />
        </div>
      </div>
      {(currentUser.isHeadNurse || currentUser.isDoctor) &&
      diseaseData.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>ICD10</Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {displayDiseases}
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
        <p>You have no Dieseases</p>
      )}
      {/** Diesease View Modal */}
      <Modal
        show={viewDiseaseModal}
        onClose={() => setViewDiseaseModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center mb-4">
            <h3 className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
              Disease Details
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Disease Name:
              </label>
              <p>{diseaseView.name}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Disease ICD10:
              </label>
              <p>{diseaseView.ICD10}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Disease Description:
              </label>
              <p>{diseaseView.description}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Disease Symptoms:
              </label>
              <p>{diseaseView.symptoms}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Disease Treatment:
              </label>
              <p>{diseaseView.treatment}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/** Diesease Add Modal */}
      <Modal
        show={addDiseaseModal}
        onClose={() => setAddDieseaseModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add New Diesease
            </h3>
          </div>
          <form onSubmit={handleDieseaseAdd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Diesease Name:</Label>
                <TextInput
                  type="text"
                  placeholder="Diesease Name"
                  id="name"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">ICD10 Code:</Label>
                <TextInput
                  type="text"
                  id="ICD10"
                  placeholder="ICD10 Code"
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="gender">Description:</Label>
                <Textarea
                  typeof="text"
                  id="description"
                  placeholder="Description"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Symptoms:</Label>
                <Textarea
                  typeof="text"
                  id="symptoms"
                  onChange={handleChange}
                  placeholder="Symptoms"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Treatment:</Label>
                <Textarea
                  typeof="text"
                  id="treatment"
                  placeholder="Treatment"
                  onChange={handleChange}
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
                  setFormData({});
                  setAddDieseaseModal(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/** Delete Modal */}
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
              Are you sure you want to delete this diesease?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteDiesease}>
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {/** Update Modal */}
      <Modal
        show={updateModal}
        onClose={() => updateModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Update Diesease
            </h3>
          </div>
          <form onSubmit={handleDieseaseUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Diesease Name:</Label>
                <TextInput
                  type="text"
                  id="name"
                  placeholder={diseaseDataUpdate.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">ICD10 Code:</Label>
                <TextInput
                  type="text"
                  id="ICD10"
                  onChange={handleChange}
                    placeholder={diseaseDataUpdate.ICD10}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="gender">Description:</Label>
                <Textarea
                  typeof="text"
                  id="description"
                    placeholder={diseaseDataUpdate.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Symptoms:</Label>
                <Textarea
                  typeof="text"
                  id="symptoms"
                  onChange={handleChange}
                    placeholder={diseaseDataUpdate.symptoms}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Treatment:</Label>
                <Textarea
                  typeof="text"
                  id="treatment"
                  placeholder={diseaseDataUpdate.treatment}
                  onChange={handleChange}
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
                  setFormData({});
                  setUpdateModal(false);
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
