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
  HiOutlineExclamationCircle,
  HiMail,
  HiIdentification,
  HiPencil,
} from "react-icons/hi";
import { HiCalendarDays } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  BsBookmarkXFill,
  BsBookmarkDashFill,
  BsBookmarkCheckFill,
  BsBookmarkFill,
  BsBookmarkPlus,
  BsBookmarkStar,
} from "react-icons/bs";
import html2pdf from "html2pdf.js";

export default function DashBooking() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateFormData, setUpdateFormData] = useState({});
  const [cancellationReason, setCancellationReason] = useState("");
  const [isRebooking, setIsRebooking] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchPatients();
    fetchStatusOptions();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/booking/getBookings");
      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patient/getPatientsforBooking");
      const data = await res.json();

      if (res.ok) {
        const options = data.map((patient) => ({
          value: patient._id,
          label: patient.name,
        }));
        setPatientOptions(options);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch patients. Please try again later.");
    }
  };

  const fetchStatusOptions = () => {
    const statusOptions = [
      { value: "Completed", label: "Completed" },
      { value: "Pending", label: "Pending" },
      { value: "Cancelled", label: "Cancelled" },
      { value: "Not Booked", label: "Not Booked" },
      { value: "Booked", label: "Booked" },
      { value: "ReBooked", label: "Rebooked" },
      { value: "In Consultation", label: "In Consultation" },
    ];
    setStatusOptions(statusOptions);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleDeleteBooking = async () => {
    try {
      const res = await fetch(`/api/booking/delete/${selectedBooking._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Booking deleted successfully.");
        setShowDeleteModal(false);
        setSelectedBooking(null);
        await fetchBookings();
      } else {
        toast.error("Failed to delete the booking. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while deleting the booking. Please try again later."
      );
    }
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Please select a patient.");
      return;
    }

    try {
      const url = isRebooking
        ? `/api/booking/rebookAppointment/${selectedBooking._id}`
        : `/api/booking/bookAppointment/${selectedBooking._id}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: selectedPatientId }),
      });

      if (res.ok) {
        toast.success(
          isRebooking
            ? "Appointment rebooked successfully."
            : "Appointment booked successfully."
        );
        setShowBookModal(false);
        setSelectedPatientId("");
        setIsRebooking(false);
        await fetchBookings();
      } else {
        toast.error(
          isRebooking
            ? "Failed to rebook the appointment. Please try again later."
            : "Failed to book the appointment. Please try again later."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        isRebooking
          ? "An error occurred while rebooking the appointment. Please try again later."
          : "An error occurred while booking the appointment. Please try again later."
      );
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationReason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    try {
      const res = await fetch(`/api/booking/cancel/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancellationReason }),
      });

      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        setShowCancelModal(false);
        setShowViewModal(false)
        setSelectedBooking(null);
        setCancellationReason("");
        await fetchBookings();
      } else {
        toast.error("Failed to cancel the booking. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while cancelling the booking. Please try again later."
      );
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      toast.error("Please select  a status.");
      return;
    }

    try {
      const res = await fetch(`/api/booking/update/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatientId || updateFormData.patientId,
          status: selectedStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowUpdateModal(false);
        setSelectedPatientId("");
        setSelectedStatus("");
        await fetchBookings();
      } else {
        toast.error(data.message || "Failed to update the booking. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while updating the booking. Please try again later."
      );
    }
  };

  const generateReport = () => {
    const reportContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  
            body {
              font-family: 'Roboto', sans-serif;
              background-color: #f5f5f5;
              color: #333;
            }
  
            table {
              width: 100%;
              border-collapse: collapse;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
  
            th, td {
              padding: 12px 15px;
              text-align: left;
              border: 1px solid #ddd;
            }
  
            th {
              background-color: #4CAF50;
              color: white;
            }
  
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
  
            tr:hover {
              background-color: #e6e6e6;
            }
  
            h2 {
              text-align: center;
              color: #4CAF50;
              margin-top: 30px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h2>Bookings Report</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings
                .map(
                  (booking) => `
                    <tr>
                      <td>${new Date(booking.date).toLocaleDateString()}</td>
                      <td>${booking.time}</td>
                      <td>${booking.doctorName}</td>
                      <td>${booking.patientName ? booking.patientName : "-"}</td>
                      <td>${booking.roomName}</td>
                      <td>${booking.status}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
  
    const opt = {
      margin: 1,
      filename: "bookings_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
  
    html2pdf().set(opt).from(reportContent).save();
  };

  const generateAppointmentCard = (booking) => {
    const appointmentCard = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  
            .card {
              width: 400px;
              border: 1px solid #ddd;
              padding: 20px;
              font-family: 'Roboto', sans-serif;
              background-color: #fff;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
            }
  
            .card h2 {
              margin-top: 0;
              color: #4CAF50;
              text-align: center;
            }
  
            .card p {
              margin-bottom: 10px;
              font-size: 16px;
              line-height: 1.5;
            }
  
            .card p strong {
              color: #333;
              font-weight: 700;
            }
  
            .card p:last-child {
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Appointment Card</h2>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Doctor:</strong> ${booking.doctorName}</p>
            <p><strong>Patient:</strong> ${booking.patientName ? booking.patientName : "-"}</p>
            <p><strong>Room:</strong> ${booking.roomName}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
          </div>
        </body>
      </html>
    `;
  
    const opt = {
      margin: 1,
      filename: "appointment_card.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: [4, 2], orientation: "portrait" },
    };
  
    html2pdf().set(opt).from(appointmentCard).save();
  };

  const sendEmail = () => {
    const emailContent = `
      Subject: Appointment Details
  
      Dear ${selectedBooking.patientName},
  
      Here are the details of your upcoming appointment:
  
      <h3 style="color: #4CAF50; font-family: 'Roboto', sans-serif;">Appointment Details</h3>
  
      <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        <strong>Date:</strong> ${new Date(selectedBooking.date).toLocaleDateString()}<br>
        <strong>Time:</strong> ${selectedBooking.time}<br>
        <strong>Doctor:</strong> ${selectedBooking.doctorName}<br>
        <strong>Room:</strong> ${selectedBooking.roomName}<br>
        <strong>Status:</strong> ${selectedBooking.status}
      </p>
  
      <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        Please arrive 30 minutes before your appointment for check-in and registration.
      </p>
  
      <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        Thank you for choosing our healthcare services. If you have any questions or need to reschedule, please don't hesitate to contact us.
      </p>
  
      <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        Best regards,<br>
        Your Healthcare Provider
      </p>
    `;
  
    const mailtoLink = `mailto:${selectedBooking.patientEmail}?subject=Appointment%20Details&body=${encodeURIComponent(emailContent)}`;
    window.location.href = mailtoLink;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.patientName &&
        booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = filterDate
      ? new Date(booking.date).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
      : true;
    const matchesDoctor = filterDoctor
      ? booking.doctorId === filterDoctor
      : true;
    const matchesPatient = filterPatient
      ? booking.patientId === filterPatient
      : true;
    const matchesRoom = filterRoom ? booking.roomId === filterRoom : true;
    return (
      matchesSearch &&
      matchesDate &&
      matchesDoctor &&
      matchesPatient &&
      matchesRoom
    );
  });

  const totalCompletedBookings = bookings.filter(
    (booking) => booking.status === "Completed"
  ).length;
  const totalPendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;
  const totalCancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  ).length;
  const totalNotBookedBookings = bookings.filter(
    (booking) => booking.status === "Not Booked"
  ).length;

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
        <Spinner color="info" aria-label="Loading spinner" />
      </div>
      ) : (
        <>
          <ToastContainer />
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 px-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-0 mr-4">
                <HiCalendarDays className="inline-block mr-1 align-middle" />
                Bookings
              </h1>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Bookings
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {bookings.length}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Completed Bookings
                </h5>
                <Badge color="success" className="text-2xl font-bold">
                  {totalCompletedBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Pending Bookings
                </h5>
                <Badge color="warning" className="text-2xl font-bold">
                  {totalPendingBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Cancelled Bookings
                </h5>
                <Badge color="failure" className="text-2xl font-bold">
                  {totalCancelledBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Not Booked
                </h5>
                <Badge color="gray" className="text-2xl font-bold">
                  {totalNotBookedBookings}
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search..."
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
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className="mr-2"
              >
                <option value="">All Patients</option>
                {patientOptions.map((patient) => (
                  <option key={patient.value} value={patient.value}>
                    {patient.label}
                  </option>
                ))}
              </Select>
              <Button color="gray" onClick={() => setFilterPatient("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Patient
              </Button>
            </div>
          </div>
          {filteredBookings.length > 0 ? (
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
                      sortColumn === "time" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("time")}
                  >
                    Time
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
                      sortColumn === "patientName" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("patientName")}
                  >
                    Patient
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "roomName" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("roomName")}
                  >
                    Room
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>
                  <span
                    className={`cursor-pointer ${
                      sortColumn === "status" ? "text-blue-500" : ""
                    }`}
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </span>
                </Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredBookings.map((booking) => (
                  <Table.Row
                    key={booking._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>
                      {new Date(booking.date).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>{booking.time}</Table.Cell>
                    <Table.Cell>{booking.doctorName}</Table.Cell>
                    <Table.Cell>
                      {booking.patientName ? booking.patientName : "-"}
                    </Table.Cell>
                    <Table.Cell>{booking.roomName}</Table.Cell>
                    <Table.Cell>
                      {booking.status === "Completed" && (
                        <Badge color="success">
                          <BsBookmarkFill className="mr-1" />
                          Completed
                        </Badge>
                      )}
                      {booking.status === "Pending" && (
                        <Badge color="warning">
                          <BsBookmarkCheckFill className="mr-1" />
                          Pending
                        </Badge>
                      )}
                      {booking.status === "Cancelled" && (
                        <Badge color="failure">
                          <BsBookmarkXFill className="mr-1" />
                          Cancelled
                        </Badge>
                      )}
                      {booking.status === "Not Booked" && (
                        <Badge color="gray">
                          <BsBookmarkDashFill className="mr-1" />
                          Not Booked
                        </Badge>
                      )}
                      {booking.status === "Booked" && (
                        <Badge color="info">
                          <BsBookmarkPlus className="mr-1" />
                          Booked
                        </Badge>
                      )}
                      {booking.status === "ReBooked" && (
                        <Badge color="purple">
                          <BsBookmarkStar className="mr-1" />
                          Rebooked
                        </Badge>
                      )}
                      {booking.status === "In Consultation" && (
                        <Badge color="indigo">
                          <HiIdentification className="mr-1" />
                          In Consultation
                        </Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <HiEye className="mr-2 h-5 w-5" />
                          View
                        </Button>
                        {booking.status === "Not Booked" && (
                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setFormData({
                                type: booking.type,
                                date: booking.date,
                                time: booking.time,
                                doctorName: booking.doctorName,
                                roomNo: booking.roomName,
                              });
                              setIsRebooking(false);
                              setShowBookModal(true);
                            }}
                          >
                            <HiIdentification className="mr-2 h-5 w-5" />
                            Book
                          </Button>
                        )}
                        {booking.status === "Cancelled" && (
                          <Button
                            size="sm"
                            color="purple"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setFormData({
                                type: booking.type,
                                date: booking.date,
                                time: booking.time,
                                doctorName: booking.doctorName,
                                roomNo: booking.roomName,
                              });
                              setIsRebooking(true);
                              setShowBookModal(true);
                            }}
                          >
                            <BsBookmarkStar className="mr-2 h-5 w-5" />
                            Rebook
                          </Button>
                        )}
                        <Button
                          size="sm"
                          color="yellow"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setUpdateFormData({
                              type: booking.type,
                              date: booking.date,
                              time: booking.time,
                              doctorName: booking.doctorName,
                              roomNo: booking.roomName,
                              patientName: booking.patientName,
                              status: booking.status,
                            });
                            setShowUpdateModal(true);
                          }}
                        >
                          <HiPencil className="mr-2 h-5 w-5" />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDeleteModal(true);
                          }}
                        >
                          <HiTrash className="mr-2 h-5 w-5" />
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="px-4">No bookings found.</p>
          )}
          <div className="mt-4">
            <Button onClick={generateReport}>
              <HiDocumentReport className="mr-2 h-5 w-5" />
              Generate Report
            </Button>
          </div>

          <Modal show={showViewModal} onClose={() => setShowViewModal(false)}>
            <Modal.Header>
              <h3 className="text-xl font-semibold">Booking Details</h3>
            </Modal.Header>
            <Modal.Body>
              {selectedBooking && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Date:</p>
                    <p>{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Time:</p>
                    <p>{selectedBooking.time}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Doctor:</p>
                    <p>{selectedBooking.doctorName}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Patient:</p>
                    <p>{selectedBooking.patientName || "-"}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Room:</p>
                    <p>{selectedBooking.roomName}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Status:</p>
                    <Badge
                      color={
                        selectedBooking.status === "Completed"
                          ? "success"
                          : selectedBooking.status === "Pending"
                          ? "warning"
                          : selectedBooking.status === "Cancelled"
                          ? "failure"
                          : selectedBooking.status === "Not Booked"
                          ? "gray"
                          : selectedBooking.status === "Booked"
                          ? "info"
                          : selectedBooking.status === "ReBooked"
                          ? "purple"
                          : "indigo"
                      }
                    >
                      {selectedBooking.status}
                    </Badge>
                  </div>
                  <div className="flex justify-end">
                    {selectedBooking.status !== "Cancelled" &&
                      selectedBooking.status !== "Completed" &&
                      selectedBooking.status !== "In Consultation" && (
                        <Button
                          color="failure"
                          onClick={handleCancelBooking}
                          className="mr-2"
                          disabled={selectedBooking.status === "Not Booked"}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    {selectedBooking.status !== "Not Booked" &&
                      selectedBooking.status !== "Cancelled" && (
                        <Button
                          color="purple"
                          onClick={() =>
                            generateAppointmentCard(selectedBooking)
                          }
                          className="mr-2"
                        >
                          <HiIdentification className="mr-2 h-5 w-5" />
                          Appointment Card
                        </Button>
                      )}
                    {selectedBooking.status !== "Not Booked" &&
                      selectedBooking.status !== "Cancelled" && (
                        <Button color="blue" onClick={sendEmail}>
                          <HiMail className="mr-2 h-5 w-5" />
                          Send Email
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          >
            <Modal.Header>Confirm Delete</Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this booking?
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button color="failure" onClick={handleDeleteBooking}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showBookModal}
            onClose={() => setShowBookModal(false)}
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500">
                  {isRebooking ? "Rebook Appointment" : "Book Appointment"}
                </h3>
                <form onSubmit={handleBookAppointment} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center">
                      <Label htmlFor="type" className="mr-2">
                        Type:
                      </Label>
                      <span className="text-gray-700">
                        {formData.type || ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Label htmlFor="date" className="mr-2">
                        Date:
                      </Label>
                      <span className="text-gray-700">
                        {new Date(formData.date).toLocaleDateString() || ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Label htmlFor="time" className="mr-2">
                        Time:
                      </Label>
                      <span className="text-gray-700">
                        {formData.time || ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Label htmlFor="doctorName" className="mr-2">
                        Doctor Name:
                      </Label>
                      <span className="text-gray-700">
                        {formData.doctorName || ""}
                      </span>
                    </div>
                    {formData.type === "Hospital Booking" && (
                      <div className="flex items-center">
                        <Label htmlFor="roomNo" className="mr-2">
                          Room:
                        </Label>
                        <span className="text-gray-700">
                          {formData.roomNo || ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Label htmlFor="selectedPatientId" className="mr-2">
                        Select Patient:
                      </Label>
                      <Select
                        id="selectedPatientId"
                        className="mt-1"
                        onChange={(e) => setSelectedPatientId(e.target.value)}
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
                  </div>
                  <div className="flex justify-center mt-6 space-x-4">
                    <Button color="blue" type="submit" outline>
                      {isRebooking ? "Rebook" : "Book"}
                    </Button>
                    <Button
                      color="red"
                      onClick={() => {
                        setShowBookModal(false);
                        setFormData({});
                        setSelectedPatientId("");
                        setIsRebooking(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Modal.Body>
          </Modal>
          <Modal
  show={showUpdateModal}
  onClose={() => setShowUpdateModal(false)}
  size="md"
>
  <Modal.Header />
  <Modal.Body>
    <div className="text-center">
      <h3 className="mb-4 text-lg text-gray-500">Update Booking</h3>
      <form onSubmit={handleUpdateBooking} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center">
            <p className="font-bold mr-2">Type:</p>
            <p>{updateFormData.type || ""}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold mr-2">Date:</p>
            <p>{new Date(updateFormData.date).toLocaleDateString() || ""}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold mr-2">Time:</p>
            <p>{updateFormData.time || ""}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold mr-2">Doctor Name:</p>
            <p>{updateFormData.doctorName || ""}</p>
          </div>
          {updateFormData.type === "Hospital Booking" && (
            <div className="flex items-center">
              <p className="font-bold mr-2">Room:</p>
              <p>{updateFormData.roomNo || ""}</p>
            </div>
          )}
          <div className="flex items-center">
            <Label htmlFor="selectedPatientId" className="mr-2">
              Select Patient:
            </Label>
            <Select
              id="selectedPatientId"
              className="mt-1"
              value={selectedPatientId || updateFormData.patientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
            >
              <option value={updateFormData.patientId}>
                {updateFormData.patientName || ""}
              </option>
              {patientOptions
                .filter((patient) => patient.value !== updateFormData.patientId)
                .map((patient) => (
                  <option key={patient.value} value={patient.value}>
                    {patient.label}
                  </option>
                ))}
            </Select>
          </div>
          <div className="flex items-center">
            <Label htmlFor="selectedStatus" className="mr-2">
              Select Status:
            </Label>
            <Select
              id="selectedStatus"
              className="mt-1"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex justify-center mt-6 space-x-4">
          <Button color="blue" type="submit" outline>
            Update
          </Button>
          <Button
            color="red"
            onClick={() => {
              setShowUpdateModal(false);
              setUpdateFormData({});
              setSelectedPatientId("");
              setSelectedStatus("");
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  </Modal.Body>
</Modal>
          <Modal
            show={showCancelModal}
            onClose={() => setShowCancelModal(false)}
          >
            <Modal.Header>Cancel Booking</Modal.Header>
            <Modal.Body>
              <div className="mb-4">
                <Label htmlFor="cancellationReason">Cancellation Reason:</Label>
                <TextInput
                  id="cancellationReason"
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowCancelModal(false)}>
                Close
              </Button>
              <Button color="failure" onClick={confirmCancellation}>
                Cancel Booking
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
