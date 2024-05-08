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
} from "react-icons/hi";
import { HiCalendarDays } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {
  BsBookmarkXFill,
  BsBookmarkDashFill,
  BsBookmarkCheckFill,
  BsBookmarkFill,
} from "react-icons/bs";
import LoadingSpinner from "./LoadingSpinner";
import html2pdf from "html2pdf.js";

export default function DashBooking() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchPatients();
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

  const handleCancelBooking = async () => {
    try {
      const res = await fetch(`/api/booking/cancel/${selectedBooking._id}`, {
        method: "PUT",
      });

      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        setShowViewModal(false);
        setSelectedBooking(null);
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

  const handleBookAppointment = async (booking) => {
    try {
      const selectedPatientId = prompt("Enter the patient ID:");
      if (!selectedPatientId) {
        return;
      }

      const res = await fetch(`/api/booking/bookAppointment/${booking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: selectedPatientId }),
      });

      if (res.ok) {
        toast.success("Appointment booked successfully.");
        await fetchBookings();
      } else {
        toast.error("Failed to book the appointment. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while booking the appointment. Please try again later."
      );
    }
  };

  const generateReport = () => {
    const reportContent = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
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
                  <td>${
                    booking.patientName ? booking.patientName : "-"
                  }</td>
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
            .card {
              width: 400px;
              border: 1px solid #ccc;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .card h2 {
              margin-top: 0;
            }
            .card p {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Appointment Card</h2>
            <p><strong>Date:</strong> ${new Date(
              booking.date
            ).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Doctor:</strong> ${booking.doctorName}</p>
            <p><strong>Patient:</strong> ${
              booking.patientName ? booking.patientName : "-"
            }</p>
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

      Here are the details of your appointment:

      Date: ${new Date(selectedBooking.date).toLocaleDateString()}
      Time: ${selectedBooking.time}
      Doctor: ${selectedBooking.doctorName}
      Room: ${selectedBooking.roomName}
      Status: ${selectedBooking.status}

      Please arrive on time for your appointment.

      Thank you,
      Your Healthcare Provider
    `;

    const mailtoLink = `mailto:${
      selectedBooking.patientEmail
    }?subject=Appointment%20Details&body=${encodeURIComponent(emailContent)}`;
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
      matchesSearch && matchesDate && matchesDoctor && matchesPatient && matchesRoom
    );
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
                  Pending Bookings
                </h5>
                <Badge color="warning" className="text-2xl font-bold">
                  {
                    bookings.filter((booking) => booking.status === "Pending")
                      .length
                  }
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Completed Bookings
                </h5>
                <Badge color="success" className="text-2xl font-bold">
                  {
                    bookings.filter((booking) => booking.status === "Completed")
                      .length
                  }
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Cancelled Bookings
                </h5>
                <Badge color="failure" className="text-2xl font-bold">
                  {
                    bookings.filter((booking) => booking.status === "Cancelled")
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
                    onClick={() => handleBookAppointment(booking)}
                  >
                    <HiIdentification className="mr-2 h-5 w-5" />
                    Book
                  </Button>
                )}
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
    <Modal.Header>Booking Details</Modal.Header>
    <Modal.Body>
      {selectedBooking && (
        <div>
          <div className="mb-4">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedBooking.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {selectedBooking.time}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedBooking.doctorName}
            </p>
            <p>
              <strong>Patient:</strong>{" "}
              {selectedBooking.patientName
                ? selectedBooking.patientName
                : "-"}
            </p>
            <p>
              <strong>Room:</strong> {selectedBooking.roomName}
            </p>
            <p>
              <strong>Status:</strong> {selectedBooking.status}
            </p>
          </div>
          <div className="flex justify-end">
            {selectedBooking.status !== "Cancelled" && (
              <Button
                color="failure"
                onClick={handleCancelBooking}
                className="mr-2"
              >
                Cancel Booking
              </Button>
            )}
            <Button
              color="purple"
              onClick={() => generateAppointmentCard(selectedBooking)}
              className="mr-2"
            >
              <HiIdentification className="mr-2 h-5 w-5" />
              Appointment Card
            </Button>
            <Button color="blue" onClick={sendEmail}>
              <HiMail className="mr-2 h-5 w-5" />
              Send Email
            </Button>
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
</>

    )
  }
  </div>
  );
  }