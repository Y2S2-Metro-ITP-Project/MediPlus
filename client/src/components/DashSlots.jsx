import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { HiCalendarDays } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  BsBookmarkFill,
  BsBookmarkCheckFill,
  BsBookmarkDashFill,
  BsBookmarkXFill,
} from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";

export default function DashSlot() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ selectedDoctorId: "" });
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchRooms();

    if (currentUser.isReceptionist || currentUser.isAdmin) {
      fetchDoctors()
        .then((doctors) => {
          const options = doctors.map((doctor) => ({
            value: doctor._id,
            label: doctor.username,
          }));
          setDoctorOptions(options);
          if (doctors.length > 0) {
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

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedBookings = sortColumn
    ? bookings.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : bookings;

  const handleAddBooking = async (e) => {
    e.preventDefault();
    await handleAddSlot(e);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();

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
            roomNo: formData.type === "Hospital Booking" ? formData.roomNo : null,
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

        toast.success("Appointments scheduled successfully");
        setShowAddModal(false);
        setFormData({});
        setSelectedTimeSlots([]);
        await fetchBookings();
      } else {
        console.log(dataSlot.message);
        toast.error(dataSlot.message || "Failed to schedule appointments");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to schedule appointments");
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

  const formatTime = (time) => {
    if (typeof time === "string") {
      const [hours, minutes] = time.split(":");
      return `${Number(hours).toString().padStart(2, "0")}:${Number(minutes)
        .toString()
        .padStart(2, "0")}`;
    } else {
      return "Invalid time";
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
          {(currentUser.isAdmin ||
            currentUser.isDoctor ||
            currentUser.isReceptionist) &&
          bookings.length > 0 ? (
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
                        sortColumn === "type" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("type")}
                    >
                      Type
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "roomNo" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("roomNo")}
                    >
                      Room
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "totalSlots" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("totalSlots")}
                    >
                      Total Slots
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "bookedSlots" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("bookedSlots")}
                    >
                      Booked Slots
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {sortedBookings.map(
                    (
                      {
                        date,
                        startTime,
                        doctorName,
                        type,
                        roomNo,
                        totalSlots,
                        bookedSlots,
                        _id,
                      },
                      index
                    ) => (
                      <Table.Row
                        key={_id}
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
                          {renderStatusIcon(
                            getSessionStatus(bookedSlots, totalSlots)
                          )}
                        </Table.Cell>
                      </Table.Row>
                    )
                  )}
                </Table.Body>
              </Table>
            ) : (
              <p className="px-4">You have no Bookings</p>
            )}
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
          </>
        )}
      </div>
    );
  }