import {
    Button,
    Modal,
    Table,
    TextInput,
  } from "flowbite-react";
  import React, { useEffect, useState } from "react";
  import { useSelector } from "react-redux";
  import { ToastContainer, toast } from "react-toastify";
  import { AiOutlineSearch } from "react-icons/ai";
  
  export default function DashDoctor() {
    const { currentUser } = useSelector((state) => state.user);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [doctorIdToDelete, setDoctorIdToDelete] = useState("");
    const [formData, setFormData] = useState({});
    const [filterOption, setFilterOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
  
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`/api/doctor/getDoctors`);
        const data = await res.json();
        if (res.ok) {
          setDoctors(data.doctors);
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    useEffect(() => {
      if (currentUser.isAdmin || currentUser.isReceptionist) {
        fetchDoctors();
      }
    }, [currentUser._id]);
  
    const handleDoctorDelete = async () => {
      try {
        const res = await fetch(`/api/doctor/delete/${doctorIdToDelete}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          setDoctors((prev) =>
            prev.filter((doctor) => doctor._id !== doctorIdToDelete)
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
  
    const handleFilterChange = async (e) => {
      e.preventDefault();
      const selectedOption = e.target.value;
      // Implement filtering logic
    };
  
    const handleSearch = async (e) => {
      e.preventDefault();
      // Implement search logic
    };
  
    return (
      <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
        <ToastContainer />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <form onSubmit={handleSearch}>
              <TextInput
                type="text"
                placeholder="Search...."
                rightIcon={AiOutlineSearch}
                className="hidden lg:inline"
                id="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "300px" }}
              />
              <Button className="w-12 h-10 lg:hidden" color="gray">
                <AiOutlineSearch />
              </Button>
            </form>
          </div>
          <select
            id="filter"
            onChange={handleFilterChange}
            className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="defaultvalue" disabled selected>
              Choose a filter option
            </option>
            {/* Add filter options here */}
          </select>
        </div>
        {(currentUser.isAdmin || currentUser.isReceptionist) &&
        doctors.length > 0 ? (
          <>
            <Table hoverable className="shadow-md">
              <Table.Head>
                {/* Add table headers */}
              </Table.Head>
              {doctors.map((doctor) => (
                <Table.Body className="divide-y" key={doctor._id}>
                  <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                    {/* Render doctor information in table rows */}
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </>
        ) : (
          <p>You have no Doctors</p>
        )}
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            {/* Modal content for doctor deletion confirmation */}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
  