import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaTimes, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import TextArea from "./TextArea";

export default function Booking() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const handleReasonChange = (newValue) => {
    setReason(newValue);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/booking/getBookings");
      const data = await res.json();

      if (res.ok) {
        // Filter bookings based on user role (doctor or patient)
        const filteredBookings = data.bookings.filter((booking) => {
          if (currentUser.isDoctor) {
            return booking.doctorId === currentUser._id;
          } else if (currentUser.isOutPatient) {
            return booking.patientId === currentUser._id;
          } else {
            return true; // Allow all bookings for non-doctor and non-patient users
          }
        });

        // Update filtered bookings with doctor and patient names
        const updatedBookings = await Promise.all(
          filteredBookings.map(async (booking) => {
            const doctorName = await fetchDoctorName(booking.doctorId);
            const patientName = await fetchPatientName(booking.patientId);
            return { ...booking, doctorName, patientName };
          })
        );

        // Sort the bookings in ascending order based on date and time
        // Sort the bookings in ascending order based on date and time
        // Sort the bookings in ascending order based on date and time
        updatedBookings.sort((a, b) => {
          // Parse the date strings into Date objects
          const datePartsA = a.date.split("/");
          const dateA = new Date(
            datePartsA[2],
            datePartsA[1] - 1,
            datePartsA[0]
          );

          const datePartsB = b.date.split("/");
          const dateB = new Date(
            datePartsB[2],
            datePartsB[1] - 1,
            datePartsB[0]
          );

          // Compare the dates
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;

          // If the dates are equal, compare the times
          const timePartsA = a.time.split(":");
          const timeA = parseInt(timePartsA[0]) * 60 + parseInt(timePartsA[1]);

          const timePartsB = b.time.split(":");
          const timeB = parseInt(timePartsB[0]) * 60 + parseInt(timePartsB[1]);

          return timeA - timeB;
        });

        setBookings(updatedBookings);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (
      currentUser.isAdmin ||
      currentUser.isDoctor ||
      currentUser.isReceptionist
    ) {
      fetchBookings();
      fetchPatient();
    }
  }, [currentUser._id]);

  const handleBookModal = (booking) => {
    setBookingData(booking);
    setSelectedBooking(booking);
    console.log("Selected Booking:", booking);
    const formattedDate = new Date(booking.date).toISOString().split("T")[0];
    setFormData({
      type: booking.type,
      roomNo: booking.roomNo,
      date: formattedDate,
      time: booking.time, // Assuming booking object has a 'time' property
    });
    setShowBookModal(true); // Show the book modal
  };

  const fetchPatient = async () => {
    try {
      const response = await fetch("/api/user/getPatients");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const options = data.map((patient) => ({
        value: patient._id,
        label: patient.username,
      }));
      console.log("Patient Options:", options); // Log patient options
      setPatientOptions(options);
    } catch (error) {
      console.error("Error fetching Patients:", error);
    }
  };

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

  const handleBookingDelete = async (bookingId) => {
    try {
      const res = await fetch(`/api/booking/delete/${bookingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.filter((booking) => booking._id !== bookingId)
        );
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (id === "selectedPatientId") {
      console.log("Selected Patient ID:", value);
    }
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

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.value.toLowerCase(); // Convert search term to lowercase for case-insensitive search
    const filteredBookings = bookings.filter((booking) => {
      // Check if the doctor or patient name contains the search term
      const doctorName = booking.doctorName.toLowerCase();
      const patientName = booking.patientName.toLowerCase();
      return (
        doctorName.includes(searchTerm) || patientName.includes(searchTerm)
      );
    });
    setBookings(filteredBookings);
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

  const handleUpdateBooking = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      type: booking.type,
      roomNo: booking.roomNo,
      date: booking.date,
    });
    setShowUpdateModal(true);
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const { type, date, roomNo } = formData;
      const doctorId = currentUser._id;

      if (!type || !date || selectedTimeSlots.length === 0) {
        toast.error("Type, date, and at least one time slot are required");
        return;
      }

      for (const time of selectedTimeSlots) {
        const newBooking = {
          type,
          doctorId,
          date,
          time,
          roomNo,
        };

        const res = await fetch("/api/booking/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBooking),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to add booking");
        }
      }

      setFormData({});
      setSelectedTimeSlots([]);
      setShowAddModal(false);
      toast.success("Bookings Added Successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "Failed to add bookings");
      console.error(error);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { type, date, roomNo } = formData;
      const doctorId = currentUser._id;

      if (!type || !date || selectedTimeSlots.length === 0) {
        toast.error("Type, date, and at least one time slot are required");
        return;
      }

      for (const time of selectedTimeSlots) {
        const updatedBooking = {
          _id: selectedBooking._id,
          type,
          doctorId,
          date,
          time,
          roomNo,
        };

        const res = await fetch("/api/booking/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBooking),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update booking");
        }
      }

      setFormData({});
      setSelectedTimeSlots([]);
      setShowUpdateModal(false);
      setSelectedBooking(null);
      toast.success("Booking Updated Successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "Failed to update booking");
      console.error(error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPatientId || !bookingData._id) {
        toast.error("Patient ID and Booking ID are required");
        return;
      }
  
      const booking = {
        _id: bookingData._id,
        patientId: selectedPatientId,
      };
  
      console.log("Booking data:", booking);
  
      const res = await fetch(`/api/booking/bookAppointment/${booking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }
  
      setFormData({});
      setSelectedTimeSlots([]);
      setShowBookModal(false);
      toast.success("Appointment Booked Successfully");
      fetchBookings(); // Assuming fetchBookings fetches the updated list of bookings
    } catch (error) {
      toast.error(error.message || "Failed to book appointment");
      console.error(error);
    }
  };

  const generateTimeSlots = () => {
    const timeSlots = [];
    const startTime = 9; // Start time in 24-hour format (9 AM)
    const endTime = 24; // End time in 24-hour format (12 AM)

    for (let hour = startTime; hour <= endTime; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const formattedMinute = minute === 0 ? "00" : minute;
        const timeSlot = `${formattedHour}:${formattedMinute}`;
        timeSlots.push(timeSlot);
      }
    }

    return timeSlots;
  };

  useEffect(() => {
    const timeSlots = generateTimeSlots();
    setTimeSlots(timeSlots);
  }, []);

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    const updatedBookings = bookings.map((booking) => {
      return { ...booking, isSelected: !selectAll };
    });
    setBookings(updatedBookings);
  };

  const handleSelectBooking = (index) => {
    const updatedBookings = [...bookings];
    updatedBookings[index].isSelected = !updatedBookings[index].isSelected;
    setBookings(updatedBookings);
  };

  const handleDeleteSelected = async () => {
    try {
      const selectedIds = bookings
        .filter((booking) => booking.isSelected)
        .map((booking) => booking._id);
      const promises = selectedIds.map((id) => handleBookingDelete(id));
      await Promise.all(promises);
      toast.success("Selected bookings deleted successfully");
    } catch (error) {
      toast.error("Failed to delete selected bookings");
      console.error(error);
    }
  };

  const fetchDoctorName = async (doctorId) => {
    try {
      const res = await fetch(`/api/user/${doctorId}`);
      const data = await res.json();
      if (res.ok) {
        return data.username;
      }
      return "Unknown";
    } catch (error) {
      console.error(error);
      return "Unknown";
    }
  };

  //function to fetch patient name
  const fetchPatientName = async (patientId) => {
    try {
      const res = await fetch(`/api/user/${patientId}`);
      const data = await res.json();
      if (res.ok) {
        return data.username;
      }
      return "Not Assigned";
    } catch (error) {
      console.error(error);
      return "Not Assgined";
    }
  };

  const handleCancelSelected = async () => {
    try {
      const selectedIds = bookings
        .filter((booking) => booking.isSelected)
        .map((booking) => booking._id);

      // Make an API call to cancel the selected bookings
      const res = await fetch("/api/booking/cancelSelected", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingIds: selectedIds }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);

        // Clear the isSelected property of each booking
        const updatedBookings = bookings.map((booking) => ({
          ...booking,
          isSelected: false,
        }));
        setBookings(updatedBookings);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to cancel selected bookings");
      }
    } catch (error) {
      toast.error("Failed to cancel selected bookings");
      console.error(error);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">
          {" "}
          {currentUser.isDoctor
            ? "Doctors Appointments"
            : "Patient Appointments"}
        </h1>
      </div>
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
          onClick={() => fetchBookings()}
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
              <Table.HeadCell>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Time</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>Patient</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Book</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {bookings.map((booking, index) => (
              <Table.Body className="divide-y" key={booking._id}>
                <Table.Row
                  className={`bg-white dar:border-gray-700 dark:bg-gray-800 ${
                    booking.isSelected ? "bg-gray-200" : ""
                  }`}
                >
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={booking.isSelected}
                      onChange={() => handleSelectBooking(index)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(booking.date).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{booking.time}</Table.Cell>
                  <Table.Cell>{booking.type}</Table.Cell>
                  <Table.Cell>{booking.doctorName}</Table.Cell>
                  <Table.Cell>{booking.patientName}</Table.Cell>
                  <Table.Cell>
                    <Table.Cell>
                      {booking.status === "Not Booked" ? (
                        <span className="text-yellow-500">Not Booked</span>
                      ) : booking.status === "Pending Payment" ? (
                        <span className="text-orange-500">Pending Payment</span>
                      ) : booking.status === "Cancelled" ? (
                        <span className="text-red-500">Cancelled</span>
                      ) : (
                        <span className="text-green-500">Booked</span>
                      )}
                    </Table.Cell>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      {booking.status !== "Not Booked" ? (
                        <span>
                          <HiOutlineExclamationCircle className="inline-block w-5 h-5 mr-1 text-red-500" />
                        </span>
                      ) : (
                        <span onClick={() => handleBookModal(booking)}>
                          Book
                        </span>
                      )}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span
                        onClick={() => {
                          handleUpdateBooking(booking);
                        }}
                      >
                        Update
                      </span>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowDeleteModal(true);
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
          <div className="flex justify-end">
            <Button color="red" onClick={handleCancelSelected}>
              Cancel Selected
            </Button>
          </div>
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
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
            <Button
              color="failure"
              onClick={() => handleBookingDelete(bookingIdToDelete)}
            >
              Yes, I am sure
            </Button>
            <Button color="gray" onClick={() => setShowDeleteModal(false)}>
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
              Add Booking
            </h3>
          </div>
          <form onSubmit={handleAddBooking}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  onChange={onChange}
                  className="input-field"
                  value={formData.type || ""}
                >
                  <option value="">Select Type</option>
                  <option value="MACS">MACS</option>
                  <option value="Online Appointment">Online Appointment</option>
                  <option value="Hospital Booking">Hospital Booking</option>
                </Select>
              </div>
              {formData.type === "Hospital Booking" && (
                <div>
                  <Label htmlFor="roomNo">Room No.</Label>
                  <TextInput
                    type="number"
                    id="roomNo"
                    onChange={onChange}
                    className="input-field"
                    value={formData.roomNo || ""}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="date">Date</Label>
                <TextInput
                  type="date"
                  id="date"
                  onChange={onChange}
                  className="input-field"
                  value={formData.date || ""}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select
                  id="time"
                  onChange={(e) =>
                    setSelectedTimeSlots([...selectedTimeSlots, e.target.value])
                  }
                  className="input-field"
                  value=""
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Select>
                <div>
                  {selectedTimeSlots.map((time) => (
                    <span key={time}>{time}</span>
                  ))}
                </div>
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
                  setSelectedTimeSlots([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Update Booking
            </h3>
          </div>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  onChange={onChange}
                  className="input-field"
                  value={formData.type || ""}
                >
                  <option value="">Select Type</option>
                  <option value="MACS">MACS</option>
                  <option value="Online Appointment">Online Appointment</option>
                  <option value="Hospital Booking">Hospital Booking</option>
                </Select>
              </div>
              {formData.type === "Hospital Booking" && (
                <div>
                  <Label htmlFor="roomNo">Room No.</Label>
                  <TextInput
                    type="number"
                    id="roomNo"
                    onChange={onChange}
                    className="input-field"
                    value={formData.roomNo || ""}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="date">Date</Label>
                <TextInput
                  type="date"
                  id="date"
                  onChange={onChange}
                  className="input-field"
                  value={formData.date || ""}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select
                  id="time"
                  onChange={(e) =>
                    setSelectedTimeSlots([...selectedTimeSlots, e.target.value])
                  }
                  className="input-field"
                  value=""
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Select>
                <div>
                  {selectedTimeSlots.map((time) => (
                    <span key={time}>{time}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Button color="blue" type="submit" outline>
                Update
              </Button>
              <Button
                className="ml-4"
                color="red"
                onClick={() => {
                  setShowUpdateModal(false);
                  setFormData({});
                  setSelectedTimeSlots([]);
                  setSelectedBooking(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showBookModal}
        onClose={() => setShowBookModal(false)}
        popup
        size="xl"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Book Appointment
            </h3>
          </div>
          <form onSubmit={handleBookAppointment}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="type">Type</Label>
                <TextInput
                  type="text"
                  id="type"
                  onChange={onChange}
                  className="input-field"
                  value={formData.type || ""}
                  readOnly
                />
              </div>
              {formData.type === "Hospital Booking" && (
                <div>
                  <Label htmlFor="roomNo">Room No.</Label>
                  <TextInput
                    type="number"
                    id="roomNo"
                    onChange={onChange}
                    className="input-field"
                    value={formData.roomNo || ""}
                    readOnly
                  />
                </div>
              )}
              <div>
                <Label htmlFor="date">Date</Label>
                <TextInput
                  type="date"
                  id="date"
                  onChange={onChange}
                  className="input-field"
                  value={formData.date || ""}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <TextInput
                  type="text"
                  id="time"
                  onChange={onChange}
                  className="input-field"
                  value={formData.time || ""}
                  readOnly
                />
              </div>
              <div>
                <Label>Select Patient</Label>
                <Select
                  id="selectedPatientId"
                  className="mt-1"
                  onChange={(e) => setSelectedPatientId(e.target.value)} // Update the selectedPatientId state here
                  required
                >
                  <option value="">Select Patient</option>
                  {patientOptions.map((patient) => (
                    <option key={patient.value} value={patient.value}>
                      {patient.label}
                    </option>
                  ))}
                </Select>
              </div>
              <TextInput
                type="id"
                id="id"
                onChange={onChange}
                className="input-field"
                value={bookingData._id}
                isDisabled
                style={{ display: "none" }} // Inline style to hide the input
              />
            </div>
            <div className="flex justify-center mt-3">
              <Button color="blue" type="submit" outline>
                Book
              </Button>
              <Button
                className="ml-4"
                color="red"
                onClick={() => {
                  setShowBookModal(false);
                  setFormData({});
                  setSelectedTimeSlots([]);
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
