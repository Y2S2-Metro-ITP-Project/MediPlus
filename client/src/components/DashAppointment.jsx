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
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function DashAppointment() {
  const { currentUser } = useSelector((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointment/getAppointments");
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments);
        if (data.appointments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      currentUser.isAdmin ||
      currentUser.isDoctor ||
      currentUser.isReceptionist
    ) {
      fetchAppointments();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = appointments.length;
    try {
      const res = await fetch(
        "/api/appointment/getAppointments?&startIndex=${startIndex}"
      );
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) => [...prev, ...data.appointments]);
        if (data.appointments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAppointmentDelete = async (e) => {
    try {
      const res = await fetch(
        "/api/appointment/delete/${appointmentIdToDelete}",
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.filter(
            (appointment) => appointment._id !== appointmentIdToDelete
          )
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
      const res = await fetch("/api/appointment/filterAppointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption: selectedOption }),
      });
      const data = await res.json();
      setAppointments(data);
      setShowMore(data.appointments.length > 9);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/appointment/searchAppointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({});
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/appointment/getAppointments");
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments);
        if (data.appointments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/appointment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchAppointments();
        setShowAddModal(false);
        setFormData({});
        toast.success("Appointment Added Successfully");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
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
            onClick={() => setShowAddModal(true)}
          >
            Add Appointment
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
          <option value="defaultvalue">Choose a filter option</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="comingweek">Coming Week</option>
          <option value="comingmonth">Coming Month</option>
          <option value="lastmonth">Last Month</option>
          <option value="lastyear">Last Year</option>
          <option value="Bydate">By Date</option>
        </select>
      </div>
      {(currentUser.isAdmin ||
        currentUser.isDoctor ||
        currentUser.isReceptionist) &&
      appointments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Time</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>Patient</Table.HeadCell>
              <Table.HeadCell>Reason</Table.HeadCell>
              <Table.HeadCell>Ward</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {appointments.map((appointment) => (
              <Table.Body className="divide-y" key={appointment._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(appointment.date).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{appointment.time}</Table.Cell>
                  <Table.Cell>{appointment.type}</Table.Cell>
                  <Table.Cell>{appointment.doctorId}</Table.Cell>
                  <Table.Cell>{appointment.patientId}</Table.Cell>
                  <Table.Cell>{appointment.reason}</Table.Cell>
                  <Table.Cell>{appointment.wardno}</Table.Cell>
                  <Table.Cell>
                    {appointment.status === "PENDING" ? (
                      <FaTimes className="text-yellow-500" />
                    ) : (
                      <FaCheck className="text-green-500" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span
                        onClick={() => {
                          setShowAddModal(true);
                          // set form data with appointment details
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
                        setAppointmentIdToDelete(appointment._id);
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
        <p>You have no Appointments</p>
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
              Are you sure you want to delete this appointment?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleAppointmentDelete}>
              Yes, I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Add/Update Appointment
            </h3>
          </div>
          <form onSubmit={handleAddAppointment}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add form fields for appointment details */}
              <div>
                <Label htmlFor="type">Type</Label>
                <TextInput
                  type="text"
                  placeholder="Type of Appointment"
                  id="type"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="doctorId">Doctor</Label>
                <TextInput
                  type="number"
                  id="doctorId"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="patientId">Patient</Label>
                <TextInput
                  type="number"
                  id="patientId"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <TextInput
                  type="date"
                  id="date"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <TextInput
                  type="time"
                  id="time"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <TextInput
                  type="text"
                  placeholder="Reason for Appointment"
                  id="reason"
                  onChange={onChange}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="wardno">Ward No.</Label>
                <TextInput
                  type="number"
                  id="wardno"
                  onChange={onChange}
                  className="input-field"
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
                  setShowAddModal(false);
                  setFormData({});
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
