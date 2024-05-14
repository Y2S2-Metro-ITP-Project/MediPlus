import React, { useEffect, useState } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Card,
  Badge,
  Spinner,
} from "flowbite-react";
import {
  HiSearch,
  HiFilter,
  HiTrash,
  HiEye,
  HiDocumentReport,
  HiClipboardList,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { HiCalendarDays } from "react-icons/hi2";
import { ToastContainer, toast } from "react-toastify";
import {
  BsBookmarkXFill,
  BsBookmarkDashFill,
  BsBookmarkCheckFill,
  BsBookmarkFill,
} from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";
import html2pdf from "html2pdf.js"; // Import html2pdf library
import { useNavigate } from "react-router-dom";

export default function DashSlot() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [slots, setSlots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotBookings, setSelectedSlotBookings] = useState([]);
  const [formData, setFormData] = useState({ selectedDoctorId: "" });
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    fetchSlots();
    fetchRooms();
    fetchDoctors();
  }, []);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/slot/");
      const data = await res.json();

      if (res.ok) {
        const updatedSlots = data.map((slot) => ({
          ...slot,
          doctorName: slot.doctorId ? slot.doctorId.username : "Unknown",
          room: slot.room ? slot.room.description : "Online Appointment",
          totalBookings: slot.totalBookings,
          notBookedCount: slot.notBookedCount,
          cancelledCount: slot.cancelledCount,
          bookedCount: slot.bookedCount,
          status: getSlotStatus(slot),
        }));

        setSlots(updatedSlots);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch slots. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotStatus = (slot) => {
    const {
      totalBookings,
      bookedCount,
      cancelledCount,
      rebookedCount,
      notBookedCount,
    } = slot;
    if (totalBookings === 0) return "Not Booked";
    if (notBookedCount === totalBookings) return "Not Booked";
    if (bookedCount === totalBookings) return "Fully Booked";
    if (cancelledCount === totalBookings) return "Cancelled";
    if (rebookedCount > 0) return "Filling";
    if (bookedCount > 0) return "Filling";
    return "Unknown";
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      if (Array.isArray(data)) {
        const options = data.map((room) => ({
          value: room._id,
          label: room.description,
        }));
        setRoomOptions(options);
      } else {
        setRoomOptions([]);
        console.error("Error: Response data is not an array");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms. Please try again later.");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/user/getdoctors");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const options = data.map((doctor) => ({
        value: doctor._id,
        label: doctor.username,
      }));
      setDoctorOptions(options);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      toast.error("Failed to fetch doctors. Please try again later.");
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      let session;
      const startTime = selectedTimeSlots[0];
      let endTime;

      if (selectedTimeSlots.length === 1) {
        const [startHours, startMinutes] = startTime.split(":").map(String);
        const [startMinutesNumm, startAmPm] = startMinutes.split(" ");
        const startHoursNum = parseInt(startHours, 10);
        const startMinutesNum = parseInt(startMinutesNumm, 10);
        const date = new Date(0, 0, 0, startHoursNum, startMinutesNum, 0);
        date.setMinutes(date.getMinutes() + 15);
        endTime = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        const previousSlot = selectedTimeSlots[selectedTimeSlots.length - 1];
        const [prevHours, prevMinutes] = previousSlot.split(":").map(String);
        const [minutes, amPm] = prevMinutes.split(" ");
        const prevHoursNum = parseInt(prevHours, 10);
        const prevMinutesNum = parseInt(minutes, 10);
        const date = new Date(0, 0, 0, prevHoursNum, prevMinutesNum, 0);
        date.setMinutes(date.getMinutes() + 15);
        endTime = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      if (formData.amPm === "AM") {
        session = "Morning";
      } else if (formData.amPm === "PM" && startTime < "18:00") {
        session = "Afternoon";
      } else {
        session = "Evening";
      }

      const slot = {
        date: new Date(formData.date),
        startTime,
        endTime,
        session,
        room: formData.type === "Hospital Booking" ? formData.roomNo : null,
        doctorId: formData.selectedDoctorId,
        type: formData.type,
      };

      const resSlot = await fetch("/api/slot/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slot),
      });

      const dataSlot = await resSlot.json();

      if (resSlot.ok) {
        const slotId = dataSlot.slot._id;

        for (const time of selectedTimeSlots) {
          const newBooking = {
            date: formData.date,
            time,
            doctorId: formData.selectedDoctorId,
            slotId,
            type: formData.type,
            roomNo:
              formData.type === "Hospital Booking" ? formData.roomNo : null,
          };

          const resBooking = await fetch("/api/booking/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBooking),
          });

          const dataBooking = await resBooking.json();

          if (!resBooking.ok) {
            throw new Error(dataBooking.error || "Failed to add booking");
          }
        }

        toast.success("Slot created and appointments scheduled successfully.");
        setShowAddModal(false);
        setFormData({});
        setSelectedTimeSlots([]);
        await fetchSlots();
      } else {
        console.log(dataSlot.message);
        toast.error(
          dataSlot.message || "Failed to create slot and schedule appointments."
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.message ||
          "An error occurred while creating slot and scheduling appointments."
      );
    } finally {
      setIsCreating(false);
    }
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

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (selectAll) {
      setSelectedTimeSlots([]);
    } else {
      setSelectedTimeSlots(timeSlots);
    }
  };

  const onChange = (e) => {
    if (e.target.id === "amPm") {
      setFormData({ ...formData, amPm: e.target.value });
    } else if (e.target.id === "selectedDoctorId") {
      setFormData({ ...formData, selectedDoctorId: e.target.value });
    } else if (e.target.id === "roomNo") {
      setFormData({ ...formData, roomNo: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };
  useEffect(() => {
    if (formData.amPm) {
      const timeSlots = generateTimeSlots(formData.amPm);
      setTimeSlots(timeSlots);
    }
  }, [formData.amPm]);
  const handleCancel = () => {
    setShowConfirmationModal(true);
  };
  const confirmCancelSlot = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/slot/cancel/${selectedSlot._id}`, {
        method: "PUT",
      });
      if (response.ok) {
        toast.success("Slot cancelled successfully.");
        setShowViewModal(false);
        setShowConfirmationModal(false);
        await fetchSlots();
      } else {
        toast.error("Failed to cancel the slot. Please try again later.");
      }
    } catch (error) {
      console.error("Error cancelling slot:", error);
      toast.error(
        "An error occurred while cancelling the slot. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/slot/delete/${selectedSlot._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Slot deleted successfully.");
        setShowDeleteModal(false);
        await fetchSlots();
      } else {
        toast.error("Failed to delete the slot. Please try again later.");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error(
        "An error occurred while deleting the slot. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchBookingsForSlot = async (slotId) => {
    console.log(slotId);
    try {
      const res = await fetch(`/api/booking/getBookingsForSlot/${slotId}`);
      const data = await res.json();
      console.log(res);
      if (res.ok) {
        setSelectedSlotBookings(data);
      } else {
        console.error("Failed to fetch bookings for slot");
        setSelectedSlotBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings for slot:", error);
      setSelectedSlotBookings([]);
    }
  };

  const handleViewSlot = (slot) => {
    setSelectedSlot(slot);
    setShowViewModal(true);
    fetchBookingsForSlot(slot._id);
    console.log(slot._id);
  };

  const generateTotalReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/slot/report");
      const html = await response.text();
      const element = document.createElement("div");
      element.innerHTML = html;

      const options = {
        margin: 0.5,
        filename: "total_slots_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().set(options).from(element).save();
      toast.success("Total slots report generated successfully.");
    } catch (error) {
      console.error("Error generating total slots report:", error);
      toast.error(
        "Failed to generate total slots report. Please try again later."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch = slot.doctorName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = filterDate
      ? new Date(slot.date).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
      : true;
    const matchesDoctor = filterDoctor ? slot.doctorId === filterDoctor : true;
    const matchesRoom = filterRoom ? slot.room === filterRoom : true;
    return matchesSearch && matchesDate && matchesDoctor && matchesRoom;
  });

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ToastContainer />
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 px-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-0 mr-4">
                <HiCalendarDays className="inline-block mr-1 align-middle" />
                Schedule Appointments
              </h1>
            </div>
            <div className="flex items-center">
              <Button
                className="mr-4"
                gradientDuoTone="purpleToPink"
                outline
                onClick={() => setShowAddModal(true)}
              >
                Schedule Appointments
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Slots
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {slots.length}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Booked Slots
                </h5>
                <Badge color="success" className="text-2xl font-bold">
                  {
                    slots.filter((slot) => slot.status === "Fully Booked")
                      .length
                  }
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Available Slots
                </h5>
                <Badge color="warning" className="text-2xl font-bold">
                  {
                    slots.filter((slot) => slot.status !== "Fully Booked")
                      .length
                  }
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search by doctor name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setSearchTerm("")}>
                <HiSearch className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
            <div className="flex items-center">
              <TextInput
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setFilterDate("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Date
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="mr-2"
              >
                <option value="">All Doctors</option>
                {doctorOptions.map((doctor) => (
                  <option key={doctor.value} value={doctor.value}>
                    {doctor.label}
                  </option>
                ))}
              </Select>
              <Button color="gray" onClick={() => setFilterDoctor("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Doctor
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="mr-2"
              >
                <option value="">All Rooms</option>
                {roomOptions.map((room) => (
                  <option key={room.value} value={room.label}>
                    {room.label}
                  </option>
                ))}
              </Select>
              <Button color="gray" onClick={() => setFilterRoom("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Room
              </Button>
            </div>
          </div>
          {filteredSlots.length > 0 ? (
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "date" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "startTime" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("startTime")}
                  >
                    Start Time
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "doctorName" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("doctorName")}
                  >
                    Doctor
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "room" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("room")}
                  >
                    Room
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "totalBookings" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("totalBookings")}
                  >
                    Total Bookings
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "bookedCount" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("bookedCount")}
                  >
                    Booked Count
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredSlots.map((slot) => (
                  <Table.Row
                    key={slot._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>
                      {new Date(slot.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{slot.startTime}</Table.Cell>
                    <Table.Cell>{slot.doctorName}</Table.Cell>
                    <Table.Cell>{slot.room}</Table.Cell>
                    <Table.Cell>{slot.totalBookings}</Table.Cell>
                    <Table.Cell>{slot.bookedCount}</Table.Cell>
                    <Table.Cell>
                      {slot.status === "Fully Booked" && (
                        <Badge color="success">
                          <BsBookmarkFill className="mr-1" />
                          Fully Booked
                        </Badge>
                      )}
                      {slot.status === "Filling" && (
                        <Badge color="warning">
                          <BsBookmarkCheckFill className="mr-1" />
                          Filling
                        </Badge>
                      )}
                      {slot.status === "Not Booked" && (
                        <Badge color="gray">
                          <BsBookmarkDashFill className="mr-1" />
                          Not Booked
                        </Badge>
                      )}
                      {slot.status === "Cancelled" && (
                        <Badge color="failure">
                          <BsBookmarkXFill className="mr-1" />
                          Cancelled
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => handleViewSlot(slot)}
                        >
                          <HiEye className="mr-2 h-5 w-5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          onClick={() =>
                            navigate(`/dashboard?tab=slotbooking/${slot._id}`)
                          }
                        >
                          <HiClipboardList className="mr-2 h-5 w-5" />
                          Bookings
                        </Button>
                        {currentUser.isAdmin && (
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setShowDeleteModal(true);
                            }}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Spinner size="sm" aria-label="Loading" />
                            ) : (
                              <>
                                <HiTrash className="mr-2 h-5 w-5" />
                                Delete
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="px-4">No slots found.</p>
          )}
          <div className="mt-4">
            <Button onClick={generateTotalReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? (
                <Spinner size="sm" aria-label="Loading" />
              ) : (
                <>
                  <HiDocumentReport className="mr-2 h-5 w-5" />
                  Generate Total Report
                </>
              )}
            </Button>
          </div>
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
              <form onSubmit={handleAddSlot}>
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
                      <option value="Online Appointment">
                        Online Appointment
                      </option>
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
                        <option value="">Select Room</option>
                        {roomOptions.map((room) => (
                          <option key={room.value} value={room.value}>
                            {room.label}
                          </option>
                        ))}
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
                      {generateTimeSlots(formData.amPm).map(
                        (timeSlot, index) => (
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
                        )
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-center mt-3">
                  <Button
                    color="blue"
                    type="submit"
                    outline
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Spinner size="sm" aria-label="Loading" />
                    ) : (
                      "Submit"
                    )}
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
            show={showViewModal}
            onClose={() => setShowViewModal(false)}
            size="xl"
          >
            <Modal.Header>Slot Details</Modal.Header>
            <Modal.Body>
              {selectedSlot && (
                <div>
                  <div className="mb-4">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedSlot.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Start Time:</strong> {selectedSlot.startTime}
                    </p>
                    <p>
                      <strong>End Time:</strong> {selectedSlot.endTime}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {selectedSlot.doctorName}
                    </p>
                    <p>
                      <strong>Room:</strong> {selectedSlot.room}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedSlot.status}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Slot Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>
                          <strong>Total Bookings:</strong>{" "}
                          {selectedSlot.totalBookings}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Booked Count:</strong>{" "}
                          {selectedSlot.bookedCount}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Cancelled Count:</strong>{" "}
                          {selectedSlot.cancelledCount || 0}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Not Booked Count:</strong>{" "}
                          {selectedSlot.notBookedCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button
                color="failure"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading" />
                ) : (
                  "Cancel Slot"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          >
            <Modal.Header>Confirm Delete</Modal.Header>
            <Modal.Body>Are you sure you want to delete this slot?</Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                color="failure"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading" />
                ) : (
                  "Delete"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            size="md"
          >
            <Modal.Header>Confirm Cancellation</Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to cancel this slot? This will cancel all
                associated bookings, and emails will be sent to the doctor and
                patients.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </Button>
              <Button
                color="failure"
                onClick={confirmCancelSlot}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading" />
                ) : (
                  "Confirm Cancellation"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
