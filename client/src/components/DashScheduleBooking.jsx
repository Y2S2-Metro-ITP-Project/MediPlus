import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaTimes, FaCheck } from "react-icons/fa";
import { BsBookmarkFill, BsBookmarkCheckFill, BsBookmarkDashFill, BsBookmarkXFill } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function ScheduleAppointment() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [formData, setFormData] = useState({ selectedDoctorId: "" });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const getSessionStatus = (bookedSlots, totalSlots) => {
    if (bookedSlots === 0) {
      return "Not Booked";
    } else if (bookedSlots === totalSlots) {
      return "Fully Booked";
    } else if (bookedSlots > 0 && bookedSlots < totalSlots) {
      return "Filling";
    } else {
      return "Session Cancelled";
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case "Not Booked":
        return <BsBookmarkDashFill className="text-gray-400" />;
      case "Fully Booked":
        return <BsBookmarkFill className="text-green-500" />;
      case "Filling":
        return <BsBookmarkCheckFill className="text-yellow-500" />;
      case "Session Cancelled":
        return <BsBookmarkXFill className="text-red-500" />;
      default:
        return null;
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };


  const formaTtime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":");
    const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes), 0);
    date.setMinutes(date.getMinutes() + 15);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/booking/getBookingsForScheduling");
      const data = await res.json();

      if (res.ok) {
        const filteredBookings = data.bookings.filter((booking) => {
          return currentUser.isDoctor
            ? booking.doctorId === currentUser._id
            : true;
        });

        const updatedBookings = await Promise.all(
          filteredBookings.map(async (booking) => {
            const doctorName = await fetchDoctorName(booking.doctorId);
            return { ...booking, doctorName };
          })
        );

        const groupedBookings = {};

        updatedBookings.forEach((booking) => {
          const { date, time, doctorId, type, roomNo, status } = booking;
          const startTime = time;
          const endTime = time;

          const key = `${date}-${doctorId}`;

          if (!groupedBookings[key]) {
            groupedBookings[key] = {
              date,
              doctorName: booking.doctorName,
              doctorId,
              type,
              roomNo,
              startTime,
              endTime,
              totalSlots: 1,
              bookedSlots: status === "Booked" ? 1 : 0,
            };
          } else {
            groupedBookings[key].totalSlots += 1;
            if (status === "Booked") {
              groupedBookings[key].bookedSlots += 1;
            }
          }
        });

        setBookings(Object.values(groupedBookings));
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
    }

    if (currentUser.isReceptionist || currentUser.isAdmin) {
      fetchDoctors()
        .then((doctors) => {
          const options = doctors.map((doctor) => ({
            value: doctor._id,
            label: doctor.username,
          }));
          setDoctorOptions(options);
          if (doctors.length > 0) {
            // Set the first doctor as default
            setFormData((prev) => ({
              ...prev,
              selectedDoctorId: doctors[0]._id,
            }));
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [currentUser._id, currentUser.isReceptionist]);

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
    } finally {
      // Close the delete confirmation modal
      setShowDeleteModal(false);
    }
  };

  const onChange = (e) => {
    if (e.target.id === "time") {
      setFormData({ ...formData, time: e.target.value });
    } else if (e.target.id === "startTime" || e.target.id === "endTime") {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    } else if (e.target.id === "selectedDoctorId") {
      setFormData({ ...formData, selectedDoctorId: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
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

  const handleUpdateBooking = (booking) => {
    setSelectedBooking(booking);
    console.log("Selected Booking:", booking); // Log selected booking
    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(booking.date).toISOString().split("T")[0];
    setFormData({
      type: booking.type,
      roomNo: booking.roomNo,
      date: formattedDate,
      time: booking.time,
    });
    setShowUpdateModal(true);
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const { type, date, roomNo, selectedDoctorId, startTime, endTime } =
        formData;
      // Validation for required fields
      if (!type) {
        toast.error("Type is required");
        return;
      }
      if (!date) {
        toast.error("Date is required");
        return;
      }
      if (!selectedDoctorId) {
        toast.error("Doctor is required");
        return;
      }
      // Validation to check if date is before today's date
      const today = new Date();
      const selectedDate = new Date(date);
      if (selectedDate < today) {
        toast.error("Date cannot be before today's date");
        return;
      }
      // Other validations can be added as needed
      const timeSlots = selectedTimeSlots;
      if (timeSlots.length === 0) {
        toast.error("Please select at least one time slot");
        return;
      }

      // Sort the timeSlots array in ascending order
      const sortedTimeSlots = timeSlots.sort();

      const formattedStartTime = formatTime(sortedTimeSlots[0]);
      const formattedEndTime = formatTime(
        sortedTimeSlots[sortedTimeSlots.length - 1]
      );

      // Validation to check if end time is after start time
      if (formattedEndTime <= formattedStartTime) {
        toast.error("End time must be after start time");
        return;
      }

      for (const time of timeSlots) {
        const newBooking = {
          type,
          doctorId: selectedDoctorId,
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
      setShowAddModal(false);
      setSelectedTimeSlots([]);
      toast.success("Bookings Added Successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.message || "Failed to add bookings");
      console.error(error);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedTimeSlots([]);
    } else {
      setSelectedTimeSlots(timeSlots);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { type, date, roomNo } = formData;

      console.log("Form Data:", formData); // Log form data

      if (!type || !date) {
        toast.error("Type and date are required");
        return;
      }

      const updatedBooking = {
        _id: selectedBooking._id,
        type,
        date,
        time: formData.time, // Use the selected time directly from formData
        roomNo,
      };

      console.log("Updated Booking:", updatedBooking); // Log updated booking object

      const res = await fetch(`/api/booking/update/${selectedBooking._id}`, {
        // Update the API endpoint to include the booking ID
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBooking),
      });

      const data = await res.json();

      console.log("Response Data:", data); // Log response data

      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking");
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

  const generateTimeSlots = (amPm) => {
    let startTime, endTime;
    if (amPm === "AM") {
      startTime = "08:00";
      endTime = "11:30";
    } else if (amPm === "PM") {
      startTime = "16:00";
      endTime = "24:00";
    }

    const timeSlots = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(`2000-01-01T${endTime}`);

    while (currentTime < endDateTime) {
      const timeSlot = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      timeSlots.push(timeSlot);
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }

    return timeSlots;
  };

  const handleTimeSlotSelection = (timeSlot, index) => {
    const isSelected = selectedTimeSlots.includes(timeSlot);
    if (isSelected) {
      setSelectedTimeSlots(
        selectedTimeSlots.filter((slot) => slot !== timeSlot)
      );
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  useEffect(() => {
    if (formData.amPm) {
      const timeSlots = generateTimeSlots(formData.amPm);
      setTimeSlots(timeSlots);
    }
  }, [formData.amPm]);

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

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/user/getdoctors"); // Update the endpoint
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      // Transform the data into options expected by react-select
      const options = data.map((doctor) => ({
        value: doctor._id, // Assuming doctor._id is the unique identifier
        label: doctor.username,
      }));
      setDoctorOptions(options);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
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
            Schedule Appointments
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
          className="w-200 h-10 ml-6 lg:ml-0 lg:w-32"
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
          <Table.HeadCell>Start Time</Table.HeadCell>
          <Table.HeadCell>Doctor</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Room</Table.HeadCell>
          <Table.HeadCell>Total Slots</Table.HeadCell>
          <Table.HeadCell>Booked Slots</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>View</Table.HeadCell>
          <Table.HeadCell>Update</Table.HeadCell>
          <Table.HeadCell>Delete</Table.HeadCell>
        </Table.Head>
            <Table.Body className="divide-y">
              {Object.entries(
                bookings.reduce((acc, booking) => {
                  const {
                    date,
                    doctorName,
                    startTime,
                    endTime,
                    roomNo,
                    totalSlots,
                    bookedSlots,
                    _id,
                  } = booking;
                  const amPm = startTime.includes("AM") ? "AM" : "PM";
                  const key = `${doctorName}-${amPm}`;

                  if (!acc[key]) {
                    acc[key] = {
                      doctorName,
                      amPm,
                      sessions: [],
                    };
                  }

                  acc[key].sessions.push({
                    date,
                    startTime,
                    roomNo,
                    endTime,
                    totalSlots,
                    bookedSlots,
                    _id,
                  });

                  return acc;
                }, {})
              ).map(([key, { doctorName, amPm, sessions }]) => (
                <React.Fragment key={key}>
                  {sessions.map(
                    (
                      {
                        date,
                    startTime,
                    endTime,
                    totalSlots,
                    bookedSlots,
                    _id,
                    roomNo,
                    type,
                      },
                      index
                    ) => (
                      <Table.Row
                        key={`${key}-${index}`}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell>
                          {new Date(date).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>{startTime}</Table.Cell>
                        <Table.Cell>{doctorName}</Table.Cell>
                        <Table.Cell>{type}</Table.Cell>
                        <Table.Cell>
                          {roomNo == "1"
                            ? "Consultation Room"
                            : roomNo == "2"
                            ? "OPD"
                            : roomNo == "3"
                            ? "Emergency Room"
                            : "Online Appointment"}
                        </Table.Cell>
                        <Table.Cell>{totalSlots}</Table.Cell>
                        <Table.Cell>{bookedSlots}</Table.Cell>
                        <Table.Cell>
                      {renderStatusIcon(getSessionStatus(bookedSlots, totalSlots))}
                    </Table.Cell>
                        <Table.Cell>
                          <Button
                            color="purple"
                            onClick={() =>
                              handleViewSession({
                                date,
                                startTime,
                                endTime: getEndTime(endTime),
                                totalSlots,
                                bookedSlots,
                                roomNo,
                                type: booking.type,
                              })
                            }
                          >
                            View
                          </Button>
                        </Table.Cell>
                        <Table.Cell>
                          <Link className="text-teal-500 hover:underline">
                            <span
                              onClick={() => {
                                handleUpdateBooking({
                                  _id,
                                  date,
                                  startTime,
                                  endTime,
                                  roomNo,
                                  totalSlots,
                                  bookedSlots,
                                });
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
                              setBookingIdToDelete(_id);
                            }}
                            className="font-medium text-red-500 hover:underline cursor-pointer"
                          >
                            Delete
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    )
                  )}
                </React.Fragment>
              ))}
            </Table.Body>
          </Table>
          <div className="flex justify-end">
            <Button color="red" onClick={handleDeleteSelected}>
              Delete Selected
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
        onClose={() => {
          setShowAddModal(false);
          setFormData({});
          setSelectedTimeSlots([]);
        }}
        popup
        size="xl"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Schedule Appointment
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
              <div className="mb-4">
                <Label>Doctor</Label>
                {currentUser.isDoctor ? (
                  <TextInput
                    type="text"
                    id="selectedDoctorId"
                    value={currentUser._id}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                ) : (
                  <Select
                    id="selectedDoctorId"
                    className="mt-1"
                    onChange={onChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.value} value={doctor.value}>
                        {doctor.label}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              {formData.type === "Hospital Booking" && (
                <div>
                  <Label htmlFor="roomNo">Room</Label>
                  <Select
                    id="roomNo"
                    onChange={onChange}
                    className="input-field"
                    value={formData.roomNo || ""}
                  >
                    <option value="">Select Room Type</option>
                    <option value="1">Consultation Room</option>
                    <option value="2">OPD</option>
                    <option value="3">Emergency Room</option>
                  </Select>
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
                <Label htmlFor="amPm">AM/PM</Label>
                <Select
                  id="amPm"
                  onChange={onChange}
                  className="input-field"
                  value={formData.amPm || ""}
                >
                  <option value="">Select AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </Select>
              </div>
            </div>
            {formData.amPm && (
              <div className="mt-4">
                <Label>Time Slots</Label>
                <div className="flex justify-between items-center mb-2">
                  <Button color="purple" onClick={toggleSelectAll}>
                    {selectAll ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {generateTimeSlots(formData.amPm).map((timeSlot, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`timeSlot-${index}`}
                        value={timeSlot}
                        checked={selectedTimeSlots.includes(timeSlot)}
                        onChange={() =>
                          handleTimeSlotSelection(timeSlot, index)
                        }
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <label
                        htmlFor={`timeSlot-${index}`}
                        className="ml-2 text-gray-700"
                      >
                        {timeSlot}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        size="xl"
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
                <Label htmlFor="time">Time</Label>
                <TextInput
                  type="time" // Change type to "time"
                  id="time"
                  onChange={onChange} // Make sure onChange is correctly defined
                  className="input-field"
                  value={formData.time || ""} // Update value to formData.time
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
      <Modal show={showSessionModal} onClose={closeSessionModal} popup size="xl">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
              Session Details
            </h3>
          </div>
          {selectedSession && (
            <div>
              <p>Date: {new Date(selectedSession.date).toLocaleDateString()}</p>
              <p>Start Time: {selectedSession.startTime}</p>
              <p>End Time: {selectedSession.endTime}</p>
              <p>Room: {selectedSession.roomNo}</p>
              <p>Type: {selectedSession.type}</p>
              <p>Total Slots: {selectedSession.totalSlots}</p>
              <p>Booked Slots: {selectedSession.bookedSlots}</p>
              {/* Add table for slots here */}
            </div>
          )}
          <div className="flex justify-center mt-3">
            <Button color="red" onClick={closeSessionModal}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
