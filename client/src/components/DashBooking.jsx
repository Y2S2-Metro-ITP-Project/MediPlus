import React, { useEffect, useState } from "react";
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
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Booking() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/booking/getBookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        if (data.bookings.length < 9) {
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
      fetchBookings();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = bookings.length;
    try {
      const res = await fetch(
        `/api/booking/getBookings?&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) => [...prev, ...data.bookings]);
        if (data.bookings.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBookingDelete = async (e) => {
    try {
      const res = await fetch(
        `/api/booking/delete/${bookingIdToDelete}`, // Use backticks for string interpolation
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.filter((booking) => booking._id !== bookingIdToDelete)
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
      const res = await fetch("/api/booking/filterBookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption: selectedOption }),
      });
      const data = await res.json();
      setBookings(data);
      setShowMore(data.bookings.length > 9);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/booking/searchBookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: formData.search }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.log(error);
      // Handle error
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/booking/getBookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        if (data.bookings.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const { type, date, time, roomNo } = formData;
      const doctorId = currentUser._id; // Get doctorId from currentUser
  
      // Check if type, date, time, roomNo are provided
      if (!type || !date || !time || !roomNo) {
        toast.error("All fields are required");
        return;
      }
  
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, doctorId, date, time, roomNo }), // Include doctorId in the request body
      });
      const data = await res.json();
      if (res.ok) {
        fetchBookings();
        setShowAddModal(false);
        setFormData({});
        toast.success("Booking Added Successfully");
      } else {
        toast.error(data.error || "Failed to add booking");
      }
    } catch (error) {
      toast.error("Failed to add booking");
      console.error(error);
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
            Add Booking
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
      bookings.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Time</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>Patient</Table.HeadCell>
              <Table.HeadCell>Reason</Table.HeadCell>
              <Table.HeadCell>RoomNo</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {bookings.map((booking) => (
              <Table.Body className="divide-y" key={booking._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(booking.date).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{booking.time}</Table.Cell>
                  <Table.Cell>{booking.type}</Table.Cell>
                  <Table.Cell>{booking.doctorId}</Table.Cell>
                  <Table.Cell>{booking.patientId}</Table.Cell>
                  <Table.Cell>{booking.reason}</Table.Cell>
                  <Table.Cell>{booking.roomNo}</Table.Cell>
                  <Table.Cell>
                    {booking.status === "PENDING" ? (
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
                          // set form data with booking details
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
                        setBookingIdToDelete(booking._id);
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
        <p>You have no Bookings</p>
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
              Are you sure you want to delete this booking?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleBookingDelete}>
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
              Add/Update Booking
            </h3>
          </div>
          <form onSubmit={handleAddBooking}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add form fields for booking details */}
              <div>
                <Label htmlFor="type">Type</Label>
                <Select id="type" onChange={onChange} className="input-field">
                  <option value="">Select Type</option>
                  <option value="MACS">MACS</option>
                  <option value="Online Appointment">Online Appointment</option>
                  <option value="Hospital Booking">Hospital Booking</option>
                </Select>
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
            </div>
            <div>
              <Label htmlFor="roomNo">Room No.</Label>
              <TextInput
                type="number"
                id="roomNo"
                onChange={onChange}
                className="input-field"
              />
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
