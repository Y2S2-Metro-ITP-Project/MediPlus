import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Select,
  TextInput,
  Card,
  Badge,
  Modal,
} from "flowbite-react";
import {
  HiPrinter,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiCalendar,
  HiDocumentText,
  HiClipboardCheck,
  HiOutlineX,
  HiSearch,
  HiFilter,
  HiEye,
  HiDocumentReport,
} from "react-icons/hi";
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
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { ToastContainer, toast } from "react-toastify";

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
            // No need to create a new Date object
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
            isWithinInterval(new Date(booking.date), {
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
      const booking = bookings.find((b) => b._id === bookingId);
      console.log("Booking:", booking);

      const bookingDateStr = new Date(booking.date).toISOString();
      console.log("Booking date:", bookingDateStr);
      const bookingDate = new Date(bookingDateStr);
      console.log("Booking date object:", bookingDate);

      const now = new Date();
      console.log("Current date:", now);

      // Calculate the date 2 days before the booking date
      const twoDatesBefore = new Date(bookingDate);
      twoDatesBefore.setDate(bookingDate.getDate() - 2);

      if (now > twoDatesBefore) {
        toast.error(
          "Cannot cancel a booking within 2 days of the appointment.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.filter((b) => b.id !== bookingId)
        );
        toast.success("Booking cancelled successfully.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Failed to cancel booking. Please try again later.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
      filename: `appointment_card_${booking._id}.pdf`,
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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    const filtered = bookings.filter((booking) => {
      return (
        booking.doctorName.toLowerCase().includes(query) ||
        booking.patientName.toLowerCase().includes(query) ||
        booking.type.toLowerCase().includes(query) ||
        format(new Date(booking.date), "yyyy-MM-dd").includes(query) ||
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
          isWithinInterval(new Date(booking.date), {
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
            isWithinInterval(new Date(booking.date), {
              start: startOfDay(new Date()),
              end: endOfDay(new Date()),
            })
          );
          weekFiltered = filtered;
          break;
        case "tomorrow":
          const tomorrow = addDays(new Date(), 1);
          filtered = bookings.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfDay(tomorrow),
              end: endOfDay(tomorrow),
            })
          );
          weekFiltered = filtered;
          break;
        case "thisWeek":
          filtered = bookings.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
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
            isWithinInterval(new Date(booking.date), {
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
            isWithinInterval(new Date(booking.date), {
              start: nextMonthStart,
              end: nextMonthEnd,
            })
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfWeek(nextMonthStart),
              end: endOfWeek(nextMonthStart),
            })
          );
          break;
        case "afterThat":
          const afterNextMonthStart = addMonths(new Date(), 2);
          filtered = bookings.filter((booking) =>
            isAfter(new Date(booking.date), afterNextMonthStart)
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfWeek(afterNextMonthStart),
              end: endOfWeek(afterNextMonthStart),
            })
          );
          break;
        case "lastWeek":
          const lastWeekStart = subWeeks(startOfWeek(new Date()), 1);
          const lastWeekEnd = subWeeks(endOfWeek(new Date()), 1);
          filtered = bookings.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
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
            isWithinInterval(new Date(booking.date), {
              start: lastMonthStart,
              end: lastMonthEnd,
            })
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfWeek(lastMonthStart),
              end: endOfWeek(lastMonthStart),
            })
          );
          break;
        case "beforeThat":
          const beforeLastMonthEnd = subMonths(new Date(), 2);
          filtered = bookings.filter((booking) =>
            isAfter(beforeLastMonthEnd, new Date(booking.date))
          );
          weekFiltered = filtered.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfWeek(beforeLastMonthEnd),
              end: endOfWeek(beforeLastMonthEnd),
            })
          );
          break;
        default:
          filtered = bookings;
          weekFiltered = bookings.filter((booking) =>
            isWithinInterval(new Date(booking.date), {
              start: startOfWeek(new Date()),
              end: endOfWeek(new Date()),
            })
          );
      }

      setFilteredBookings(filtered);
      setWeekBookings(weekFiltered);
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

  const openLinkModal = (booking) => {
    setSelectedBooking(booking);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setSelectedBooking(null);
    setShowLinkModal(false);
  };

  const generateReport = () => {
    const content = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px;">Ismail Hospitals - Booking Report</h2>
        <p style="text-align: center; margin-bottom: 10px;">Generated on ${new Date().toLocaleDateString()}</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 20px;" />
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Date</th>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Time</th>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Doctor</th>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Type</th>
              <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings
              .map(
                (booking) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc;">${format(
                  new Date(booking.date),
                  "yyyy-MM-dd"
                )}</td>
                <td style="padding: 10px; border: 1px solid #ccc;">${
                  booking.time
                }</td>
                <td style="padding: 10px; border: 1px solid #ccc;">${
                  booking.doctorName
                }</td>
                <td style="padding: 10px; border: 1px solid #ccc;">${
                  booking.type
                }</td>
                <td style="padding: 10px; border: 1px solid #ccc;">${getStatusText(
                  booking.status
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

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
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 px-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-0 mr-4">
                <HiCalendarDays className="inline-block mr-1 align-middle" />
                My Appointments
              </h1>
            </div>
            <div className="flex items-center">
              <Button
                color="blue"
                className="mr-4"
              >
                <HiCalendarDays className="inline-block mr-1 align-middle" />{" "}
                Book Appointment
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Bookings
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {totalBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Completed Bookings
                </h5>
                <Badge color="success" className="text-2xl font-bold">
                  {completedBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Cancelled Bookings
                </h5>
                <Badge color="failure" className="text-2xl font-bold">
                  {cancelledBookings}
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search by doctor name, patient name, type, date, or time"
                value={searchTerm}
                onChange={handleSearch}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setSearchTerm("")}>
                <HiSearch className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={typeFilter}
                onChange={handleTypeFilter}
                className="mr-2"
              >
                <option value="">All Types</option>
                <option value="Hospital Booking">Hospital Booking</option>
                <option value="Online Appointment">Online Appointment</option>
                <option value="MACS">MACS</option>
              </Select>
              <Button color="gray" onClick={() => setTypeFilter("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Type
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={dateFilter}
                onChange={handleDateFilter}
                className="mr-2"
              >
                <option value="">All Dates</option>
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
              <Button color="gray" onClick={() => setDateFilter("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Date
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Time</Table.HeadCell>
                <Table.HeadCell>Doctor</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {currentBookings.map((booking) => (
                  <Table.Row
                    key={booking._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>
                      {format(new Date(booking.date), "yyyy-MM-dd")}
                    </Table.Cell>
                    <Table.Cell>{booking.time}</Table.Cell>
                    <Table.Cell>{booking.doctorName}</Table.Cell>
                    <Table.Cell>{booking.type}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={
                          booking.status === "Booked"
                            ? "success"
                            : booking.status === "Cancelled"
                            ? "failure"
                            : "gray"
                        }
                      >
                        {getStatusIcon(booking.status)}
                        {getStatusText(booking.status)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => viewBookingDetails(booking)}
                        >
                          <HiEye className="mr-2 h-5 w-5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => generateAppointmentCard(booking)}
                        >
                          <HiPrinter className="mr-2 h-5 w-5" />
                          Print
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => cancelBooking(booking._id)}
                        >
                          <HiOutlineX className="mr-2 h-5 w-5" />
                          Cancel
                        </Button>
                        {booking.type === "Online Appointment" && (
                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => openLinkModal(booking)}
                          >
                            Open Link
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <div className="mt-4 flex justify-between items-center">
              <Button color="blue" onClick={generateReport}>
                <HiDocumentReport className="mr-2 h-5 w-5" />
                Generate Report
              </Button>
              <div className="flex justify-center mt-4">
                <Button
                  color="gray"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  color="gray"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(bookings.length / bookingsPerPage)
                  }
                  className="ml-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          <Modal show={showModal} onClose={closeModal} size="xl">
            <Modal.Header>Booking Details</Modal.Header>
            <Modal.Body>
              {selectedBooking && (
                <div>
                  <p>
                    <strong>Patient Name:</strong> {selectedBooking.patientName}
                  </p>
                  <p>
                    <strong>Doctor Name:</strong> {selectedBooking.doctorName}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {format(new Date(selectedBooking.date), "yyyy-MM-dd")}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedBooking.time}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedBooking.type}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusText(selectedBooking.status)}
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={closeModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showLinkModal} onClose={closeLinkModal}>
            <Modal.Header>Online Appointment Link</Modal.Header>
            <Modal.Body>
              {selectedBooking && (
                <div>
                  <p>
                    Please open the following link at the time of your
                    appointment:
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
          <ToastContainer />
        </>
      )}
    </div>
  );
};

export default PatientBooking;