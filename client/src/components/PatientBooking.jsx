import React, { useState, useEffect } from "react";
import {
  HiPrinter,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiCalendar,
  HiDocumentText,
  HiClipboardCheck,
  HiOutlineX,
} from "react-icons/hi";
import { AiOutlineSearch } from "react-icons/ai";
import { HiCalendarDays } from "react-icons/hi2";
import {
  format,
  isAfter,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  addDays,
} from "date-fns";
import html2pdf from "html2pdf.js";
import { useSelector } from "react-redux";
import {
  Modal,
  Button,
  Table,
  Select,
  TextInput,
  Pagination,
} from "flowbite-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const PatientBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [weekBookings, setWeekBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleNewAppointment = () => {
    navigate("/appointment");
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const userId = currentUser._id;
      const response = await fetch(`/api/patient/getPatientByUser/${userId}`);
      const patient = await response.json();

      if (patient) {
        const patientId = patient._id;
        const bookingsResponse = await fetch(
          `/api/userBooking/bookings/${patientId}`
        );
        const bookingsData = await bookingsResponse.json();

        if (bookingsData && Array.isArray(bookingsData.bookings)) {
          const filteredBookings = bookingsData.bookings.map((booking) => ({
            ...booking,
            date: new Date(booking.date),
          }));

          const updatedBookings = await Promise.all(
            filteredBookings.map(async (booking) => {
              const drName = await fetchDoctorName(booking.doctorId);
              const doctorName = "Dr. " + drName;
              const patientName = await fetchPatientName(userId);
              return { ...booking, doctorName, patientName };
            })
          );

          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);

          const today = new Date();
          const thisWeekBookings = updatedBookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(today),
              end: endOfWeek(today),
            })
          );
          setWeekBookings(thisWeekBookings);

          const totalBookingsCount = updatedBookings.length;
          const completedBookingsCount = updatedBookings.filter(
            (booking) => booking.status === "Booked"
          ).length;
          const cancelledBookingsCount = updatedBookings.filter(
            (booking) => booking.status === "Cancelled"
          ).length;

          setTotalBookings(totalBookingsCount);
          setCompletedBookings(completedBookingsCount);
          setCancelledBookings(cancelledBookingsCount);
        } else {
          console.error(
            "Bookings data is not in the expected format:",
            bookingsData
          );
        }
      } else {
        console.error("Patient data not found");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorName = async (doctorId) => {
    try {
      const res = await fetch(`/api/employee/getDoctorDetails/${doctorId}`);
      const data = await res.json();
      if (res.ok) {
        return data.doctorDetails.Name;
      }
      return "Unknown";
    } catch (error) {
      console.error(error);
      return "Unknown";
    }
  };

  const fetchPatientName = async (userId) => {
    try {
      const res = await fetch(`/api/patient/getPatientByUser/${userId}`);
      const data = await res.json();
      if (res.ok) {
        return data.name;
      }
      return "Not Assigned";
    } catch (error) {
      console.error(error);
      return "Not Assigned";
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      const bookingDate = new Date(booking.date);
      const now = new Date();

      if (isAfter(now, bookingDate)) {
        alert("Cannot cancel a booking that has already passed.");
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.filter((b) => b.id !== bookingId)
        );
        alert("Booking cancelled successfully.");
      } else {
        alert("Failed to cancel booking. Please try again later.");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again later.");
    }
  };

  const generateAppointmentCard = (booking) => {
    const content = `
      <div style="width: 400px; padding: 20px; background-color: #f5f5f5; border-radius: 5px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px;">Ismail Hospitals</h2>
        <p style="text-align: center; margin-bottom: 10px;">123 Main Street, City, Country</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 20px;" />
        <h3 style="margin-bottom: 10px;">Appointment Details</h3>
        <p><strong>Patient Name:</strong> ${booking.patientName}</p>
        <p><strong>Doctor Name:</strong> ${booking.doctorName}</p>
        <p><strong>Date:</strong> ${format(
          new Date(booking.date),
          "yyyy-MM-dd"
        )}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Type:</strong> ${booking.type}</p>
        <p><strong>Status:</strong> ${getStatusText(booking.status)}</p>
      </div>
    `;

    const options = {
      filename: `appointment_card_${booking.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };

    html2pdf().set(options).from(content).save();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Booked":
        return <HiCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <HiXCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Booked":
        return "Booked";
      case "Cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    const filtered = bookings.filter((booking) => {
      return (
        booking.doctorName.toLowerCase().includes(query) ||
        booking.patientName.toLowerCase().includes(query) ||
        booking.type.toLowerCase().includes(query) ||
        new Date(booking.date).toLocaleDateString().includes(query) ||
        booking.time.includes(query) ||
        getStatusText(booking.status).toLowerCase().includes(query)
      );
    });

    setFilteredBookings(filtered);
  };

  const handleTypeFilter = (e) => {
    const selectedType = e.target.value;
    setTypeFilter(selectedType);

    if (selectedType === "") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) => booking.type === selectedType
      );
      setFilteredBookings(filtered);
    }
  };

  const handleDateFilter = (e) => {
    const selectedDate = e.target.value;
    setDateFilter(selectedDate);

    if (selectedDate === "") {
      setFilteredBookings(bookings);
      setWeekBookings(
        bookings.filter((booking) =>
          isWithinInterval(booking.date, {
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
          })
        )
      );
    } else {
      let filtered = [];
      let weekFiltered = [];

      switch (selectedDate) {
        case "today":
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfDay(new Date()),
              end: endOfDay(new Date()),
            })
          );
          weekFiltered = filtered;
          break;
        case "tomorrow":
          const tomorrow = addDays(new Date(), 1);
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfDay(tomorrow),
              end: endOfDay(tomorrow),
            })
          );
          weekFiltered = filtered;
          break;
        case "thisWeek":
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(new Date()),
              end: endOfWeek(new Date()),
            })
          );
          weekFiltered = filtered;
          break;
        case "nextWeek":
          const nextWeekStart = addWeeks(startOfWeek(new Date()), 1);
          const nextWeekEnd = addWeeks(endOfWeek(new Date()), 1);
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: nextWeekStart,
              end: nextWeekEnd,
            })
          );
          weekFiltered = filtered;
          break;
        case "nextMonth":
          const nextMonthStart = startOfMonth(addMonths(new Date(), 1));
          const nextMonthEnd = endOfMonth(addMonths(new Date(), 1));
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: nextMonthStart,
              end: nextMonthEnd,
            })
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(nextMonthStart),
              end: endOfWeek(nextMonthStart),
            })
          );
          break;
        case "afterThat":
          const afterNextMonthStart = addMonths(new Date(), 2);
          filtered = bookings.filter((booking) =>
            isAfter(booking.date, afterNextMonthStart)
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(afterNextMonthStart),
              end: endOfWeek(afterNextMonthStart),
            })
          );
          break;
        case "lastWeek":
          const lastWeekStart = subWeeks(startOfWeek(new Date()), 1);
          const lastWeekEnd = subWeeks(endOfWeek(new Date()), 1);
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: lastWeekStart,
              end: lastWeekEnd,
            })
          );
          weekFiltered = filtered;
          break;
        case "lastMonth":
          const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
          const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
          filtered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: lastMonthStart,
              end: lastMonthEnd,
            })
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(lastMonthStart),
              end: endOfWeek(lastMonthStart),
            })
          );
          break;
        case "beforeThat":
          const beforeLastMonthEnd = subMonths(new Date(), 2);
          filtered = bookings.filter((booking) =>
            isAfter(beforeLastMonthEnd, booking.date)
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(beforeLastMonthEnd),
              end: endOfWeek(beforeLastMonthEnd),
            })
          );
          break;
        default:
          filtered = bookings;
          weekFiltered = bookings.filter((booking) =>
            isWithinInterval(booking.date, {
              start: startOfWeek(new Date()),
              end: endOfWeek(new Date()),
            })
          );
      }

      setFilteredBookings(filtered);
      setWeekBookings(weekFiltered);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openLinkModal = (booking) => {
    setSelectedBooking(booking);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setSelectedBooking(null);
    setShowLinkModal(false);
  };

  const generateReport = () => {
    const content = (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Ismail Hospitals - Booking Report
        </h2>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>
          Generated on {new Date().toLocaleDateString()}
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                Time
              </th>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                Doctor
              </th>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  textAlign: "left",
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {format(new Date(booking.date), "yyyy-MM-dd")}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {booking.time}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {booking.doctorName}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {booking.type}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {getStatusText(booking.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  
    const options = {
      filename: `booking_report_${new Date().toISOString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
  
    html2pdf().set(options).from(content).save();
  };
const indexOfLastBooking = currentPage * bookingsPerPage;
const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
const currentBookings = filteredBookings.slice(
indexOfFirstBooking,
indexOfLastBooking
);
return (
<div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
  {isLoading ? (
    <LoadingSpinner />
  ) : (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-4">
          <HiCalendarDays className="inline-block mr-1 align-middle" />
          This Week's Appointments
        </h1>
        <Button color="blue" onClick={handleNewAppointment}>
          <HiCalendarDays className="inline-block mr-1 align-middle" /> Book
          Appointment
        </Button>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-slate-300 scrollbar-track-slate-100 dark:scrollbar-thumb-slate-500 dark:scrollbar-track-slate-700">
        <div className="flex gap-4 min-w-max">
          {weekBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col p-3 bg-gray-100 dark:bg-slate-800 gap-2 md:w-96 w-full rounded-md shadow-md mr-4"
              style={{ minWidth: "350px", minHeight: "200px" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm uppercase">
                    {booking.type}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-gray-500 cursor-pointer ${
                    booking.status === "Booked"
                      ? "bg-green-200 text-green-500"
                      : booking.status === "Cancelled"
                      ? "bg-red-200 text-red-500"
                      : "bg-gray-200"
                  }`}
                  title={getStatusText(booking.status)}
                >
                  {getStatusIcon(booking.status)}
                  <span className="ml-2 text-sm font-semibold">
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-semibold">
                    {format(booking.date, "MMM d, yyyy")}
                  </p>
                  <p className="text-gray-500 text-sm">{booking.time}</p>
                  <p className="text-gray-500 text-sm">{booking.doctorName}</p>
                </div>
              </div>
              <div className="flex justify-end mt-auto">
                <Button
                  color="red"
                  size="xs"
                  onClick={() => cancelBooking(booking.id)}
                  disabled={isAfter(new Date(), new Date(booking.date))}
                  className="w-20 h-8 text-sm"
                >
                  <HiOutlineX className="inline-block mr-1 align-middle" />{" "}
                  Cancel
                </Button>
                <Button
                  color="blue"
                  size="xs"
                  onClick={() => viewBookingDetails(booking)}
                  className="w-20 h-8 text-sm mx-2"
                >
                  View
                </Button>
                <Button
                  color="gray"
                  size="xs"
                  onClick={() => generateAppointmentCard(booking)}
                  className="w-20 h-8 text-sm"
                >
                  <HiPrinter className="inline-block mr-1 align-middle" />{" "}
                  Print
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-bold my-6">
        <HiCalendar className="inline-block mr-1 align-middle" /> All
        Appointments
      </h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <TextInput
            type="text"
            placeholder="Search..."
            rightIcon={AiOutlineSearch}
            className="hidden lg:inline"
            id="search"
            onChange={handleSearch}
            style={{ width: "300px" }}
          />
        </div>
        <div className="flex items-center">
          <Select
            id="typeFilter"
            onChange={handleTypeFilter}
            className="ml-4 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Filter by Type</option>
            <option value="Hospital Booking">Hospital Booking</option>
            <option value="Online Appointment">Online Appointment</option>
            <option value="MACS">MACS</option>
          </Select>
          <Select
            id="dateFilter"
            onChange={handleDateFilter}
            className="ml-4 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Filter by Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="thisWeek">This Week</option>
            <option value="nextWeek">Next Week</option>
            <option value="nextMonth">Next Month</option>
            <option value="afterThat">After That</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="beforeThat">Before That</option>
          </Select>
        </div>
      </div>
      <Table className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
        <Table.Head>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time</Table.HeadCell>
          <Table.HeadCell>Doctor</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="bg-white dark:border-gray-700 dark:bg-gray-800">
          {currentBookings.map((booking) => {
            const bookingDate = new Date(booking.date);
            const formattedDate = bookingDate.toLocaleDateString();

            return (
              <Table.Row
                key={booking.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Table.Cell>{formattedDate}</Table.Cell>
                <Table.Cell>{booking.time}</Table.Cell>
                <Table.Cell>{booking.doctorName}</Table.Cell>
                <Table.Cell>{booking.type}</Table.Cell>
                <Table.Cell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-gray-500 cursor-pointer ${
                      booking.status === "Booked"
                        ? "bg-green-200 text-green-500"
                        : booking.status === "Cancelled"
                        ? "bg-red-200 text-red-500"
                        : "bg-gray-200"
                    }`}
                    title={getStatusText(booking.status)}
                  >
                    {getStatusIcon(booking.status)}
                    <span className="ml-2">{booking.status}</span>
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-2">
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => cancelBooking(booking.id)}
                      disabled={isAfter(new Date(), new Date(booking.date))}
                    >
                      <HiOutlineX className="inline-block mr-1 align-middle" />{" "}
                      Cancel
                    </Button>
                    <Button
                      color="blue"
                      size="xs"
                      onClick={() => viewBookingDetails(booking)}
                    >
                      View
                    </Button>
                    <Button
                      color="gray"
                      size="xs"
                      onClick={() => generateAppointmentCard(booking)}
                    >
                      <HiPrinter className="inline-block mr-1 align-middle" />{" "}
                      Print
                    </Button>
                    {booking.type === "Online Appointment" && (
                      <Button
                        color="green"
                        size="xs"
                        onClick={() => openLinkModal(booking)}
                        disabled={isAfter(new Date(), new Date(booking.date))}
                      >
                        Open Link
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Button color="blue" onClick={generateReport}>
          Generate Report
        </Button>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredBookings.length / bookingsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
      <Modal show={showModal} onClose={closeModal}>
        <Modal.Header>Booking Details</Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p className="text-gray-500">
                <HiDocumentText className="inline-block mr-2" />
                Patient Name: {selectedBooking.patientName}
              </p>
              <p className="text-gray-500">
                <HiDocumentText className="inline-block mr-2" />
                Doctor Name: {selectedBooking.doctorName}
              </p>
              <p className="text-gray-500">
                <HiCalendar className="inline-block mr-2" />
                Date: {format(new Date(selectedBooking.date), "yyyy-MM-dd")}
              </p>
              <p className="text-gray-500">
                <HiClock className="inline-block mr-2" />
                Time: {selectedBooking.time}
              </p>
              <p className="text-gray-500">
                <span className="font-bold">Type:</span> {selectedBooking.type}
              </p>
              <p className="text-gray-500">
                <span className="font-bold">Status:</span>{" "}
                {getStatusText(selectedBooking.status)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end">
            <Button
              color="red"
              onClick={() => cancelBooking(selectedBooking.id)}
              disabled={
                selectedBooking
                  ? isAfter(new Date(), new Date(selectedBooking.date))
                  : false
              }
            >
              <HiOutlineX className="inline-block mr-1 align-middle" /> Cancel
            </Button>
            <Button color="blue" onClick={closeModal}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={showLinkModal} onClose={closeLinkModal}>
        <Modal.Header>Online Appointment Link</Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p>
                Please open the following link at the time of your appointment:
              </p>
              <a
                href={selectedBooking.meetLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedBooking.meetLink}
              </a>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={closeLinkModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )}
</div>
);
};
export default PatientBooking;