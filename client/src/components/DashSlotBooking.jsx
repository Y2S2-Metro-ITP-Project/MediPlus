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
  HiMail,
  HiIdentification,
  HiPencil,
  HiDownload,
  HiArrowLeft,
  HiOfficeBuilding,
} from "react-icons/hi";
import {
  HiCalendarDays,
  HiClock,
  HiUser,
  HiCheckCircle,
  HiXCircle,
  HiMinusCircle,
} from "react-icons/hi2";
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
import { useNavigate, useLocation } from "react-router-dom";

export default function DashSlotBooking() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const slotId = location.search.split("/")[1];
  const navigate = useNavigate();
  const [slotBookings, setSlotBookings] = useState([]);
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
  const [filterPatient, setFilterPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [formData, setFormData] = useState({});
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateFormData, setUpdateFormData] = useState({});
  const [cancellationReason, setCancellationReason] = useState("");
  const [isRebooking, setIsRebooking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingAppointmentCard, setIsGeneratingAppointmentCard] =
    useState(false);

  const [slotDetails, setSlotDetails] = useState({
    date: "",
    startTime: "",
    endTime: "",
    doctorName: "",
    roomName: "",
    status: "",
    totalBookings: 0,
    bookedCount: 0,
    cancelledCount: 0,
    notBookedCount: 0,
  });

  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchSlotBookings();
    fetchPatients();
    fetchStatusOptions();
    fetchSlotDetails();
  }, []);

  const generateBookingReport = async (booking) => {
    try {
      const reportContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              h1 {
                color: #333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
              }
              .logo {
                text-align: center;
                margin-bottom: 20px;
              }
              .logo img {
                max-width: 150px;
              }
            </style>
          </head>
          <body>
            <div class="logo">
              <img src="https://example.com/hospital-logo.png" alt="Hospital Logo">
            </div>
            <h1>Booking Report</h1>
            <table>
              <tr>
                <th>Booking Date</th>
                <td>${new Date(booking.date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Booking Time</th>
                <td>${booking.time}</td>
              </tr>
              <tr>
                <th>Doctor</th>
                <td>${booking.doctorId.username}</td>
              </tr>
              <tr>
                <th>Patient</th>
                <td>${booking.patientId ? booking.patientId.name : "-"}</td>
              </tr>
              <tr>
                <th>Room/Location</th>
                <td>${booking.roomName || "Online"}</td>
              </tr>
              <tr>
                <th>Booking Status</th>
                <td>${booking.status}</td>
              </tr>
            </table>
            <h2>Booking History</h2>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${booking.history
                  .map(
                    (entry) => `
                      <tr>
                        <td>${entry.action}</td>
                        <td>${new Date(entry.timestamp).toLocaleString()}</td>
                        <td>${entry.details || "-"}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const options = {
        filename: `booking_report_${booking._id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().set(options).from(reportContent).save();
    } catch (error) {
      console.error("Error generating booking report:", error);
      toast.error(
        "Failed to generate the booking report. Please try again later."
      );
    }
  };

  const fetchSlotBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/booking/getBookingsForSlot/${slotId}`);
      const data = await res.json();

      if (res.ok) {
        setSlotBookings(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch slot bookings. Please try again later.");
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
          contactNumber: patient.contactNumber,
        }));
        setPatientOptions(options);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch patients. Please try again later.");
    }
  };

  const fetchSlotDetails = async () => {
    try {
      const res = await fetch(`/api/slot/getSlotDetails/${slotId}`);
      const data = await res.json();

      if (res.ok) {
        setSlotDetails(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch slot details. Please try again later.");
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
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/booking/delete/${selectedBooking._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Booking deleted successfully.");
        setShowDeleteModal(false);
        setSelectedBooking(null);
        await fetchSlotBookings();
      } else {
        toast.error("Failed to delete the booking. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while deleting the booking. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    const doctorName = selectedBooking.doctorId.username;
    const roomName = selectedBooking.roomName;
    const patientName = selectedBooking.patientId
      ? selectedBooking.patientId.name
      : "";

    if (!selectedPatientId) {
      toast.error("Please select a patient.");
      setIsBooking(false);
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
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorName,
          roomName,
        }),
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
        await fetchSlotBookings();
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
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!cancellationReason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/booking/cancel/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: cancellationReason,
        }),
      });

      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        setShowCancelModal(false);
        setShowViewModal(false);
        setSelectedBooking(null);
        setCancellationReason("");
        await fetchSlotBookings();
      } else {
        toast.error("Failed to cancel the booking. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while cancelling the booking. Please try again later."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const doctorName = selectedBooking.doctorId.username;
    const roomName = selectedBooking.roomName;

    if (!selectedStatus) {
      toast.error("Please select a status.");
      setIsUpdating(false);
      return;
    }

    try {
      const res = await fetch(`/api/booking/update/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId:
            selectedPatientId ||
            updateFormData.patientId ||
            selectedBooking.patientId._id,
          status: selectedStatus,
          doctorName,
          roomName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowUpdateModal(false);
        setSelectedPatientId("");
        setSelectedStatus("");
        await fetchSlotBookings();
      } else {
        toast.error(
          data.message ||
            "Failed to update the booking. Please try again later."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while updating the booking. Please try again later."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const generateReport = () => {
    setIsGeneratingReport(true);
    try {
      const reportContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .logo {
                text-align: center;
                margin-bottom: 20px;
              }
              .logo img {
                max-width: 200px;
              }
              .report-title {
                text-align: center;
                margin-bottom: 20px;
              }
              .report-date {
                text-align: right;
                font-style: italic;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="logo">
              <img src="https://example.com/hospital-logo.png" alt="Hospital Logo">
            </div>
            <div class="report-title">
              <h1>Slot Booking Report</h1>
            </div>
            <div class="report-date">
              Report Generated on ${new Date().toLocaleDateString()}
            </div>
            <div>
              <h2>Slot Details</h2>
              <p><strong>Date:</strong> ${new Date(
                slotDetails.date
              ).toLocaleDateString()}</p>
              <p><strong>Start Time:</strong> ${slotDetails.startTime}</p>
              <p><strong>End Time:</strong> ${slotDetails.endTime}</p>
              <p><strong>Doctor:</strong> ${slotDetails.doctorName}</p>
              <p><strong>Room:</strong> ${slotDetails.roomName || "Online"}</p>
              <p><strong>Status:</strong> ${slotDetails.status}</p>
              <p><strong>Total Bookings:</strong> ${
                slotDetails.totalBookings
              }</p>
              <p><strong>Booked Count:</strong> ${slotDetails.bookedCount}</p>
              <p><strong>Cancelled Count:</strong> ${
                slotDetails.cancelledCount
              }</p>
              <p><strong>Not Booked Count:</strong> ${
                slotDetails.notBookedCount
              }</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>TimeSlot</th>
                  <th>Patient</th>
                  <th>Contact Number</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSlotBookings
                  .map(
                    (booking) => `
                      <tr>
                      <td>${
                        booking.time
                      }</td>
                        <td>${
                          booking.patientId ? booking.patientId.name : "NULL"
                        }</td>
                        <td>${
                          booking.patientId
                            ? booking.patientId.contactPhone
                            : "NULL"
                        }</td>
                        <td>${booking.status}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>`;
      const options = {
        filename: "slot_bookings_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      };

      html2pdf().set(options).from(reportContent).save();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate the report. Please try again later.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateAppointmentCard = async (booking) => {
    setIsGeneratingAppointmentCard(true);
    try {
      const response = await fetch(
        `/api/booking/generateAppointmentCard/${booking._id}`,
        {
          method: "GET",
          headers: {
            Authorization: ` Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "appointment_card.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        toast.error(
          "Failed to generate appointment card. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error generating appointment card:", error);
      toast.error(
        "An error occurred while generating the appointment card. Please try again later."
      );
    } finally {
      setIsGeneratingAppointmentCard(false);
    }
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const { date, time, doctorId, roomName } = selectedBooking;
      const patientEmail = selectedBooking.patientId.contactEmail;
      const emailContent = `
        Dear ${selectedBooking.patientId.username},
        Here are the details of your upcoming appointment:
        <h3 style="color: #4CAF50; font-family:'Roboto', sans-serif;">Appointment Details</h3>
        <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br>
        <strong>Time:</strong> ${time}<br>
        <strong>Doctor:</strong> ${doctorId.username}<br>
        <strong>Room:</strong> ${roomName}<br>
        <strong>Status:</strong> Booked
        </p><p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
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

      await fetch("/api/booking/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: patientEmail,
          subject: "Appointment Details",
          html: emailContent,
        }),
      });

      toast.success("Email sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again later.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredSlotBookings = slotBookings.filter((booking) => {
    const matchesSearch =
      booking.doctorId?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.patientId &&
        booking.patientId.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesPatient = filterPatient
      ? booking.patientId && booking.patientId._id === filterPatient
      : true;
    const matchesStatus = filterStatus ? booking.status === filterStatus : true;
    const matchesType = filterType ? booking.type === filterType : true;
    const matchesRoom = filterRoom ? booking.roomName === filterRoom : true;
    return (
      matchesSearch &&
      matchesPatient &&
      matchesStatus &&
      matchesType &&
      matchesRoom
    );
  });
  const handleSelectAll = () => {
    const updatedSlotBookings = slotBookings.map((booking) => ({
      ...booking,
      isSelected: !selectAll,
    }));
    setSlotBookings(updatedSlotBookings);
    setSelectAll(!selectAll);
  };
  const handleSelectBooking = (bookingId) => {
    const updatedSlotBookings = slotBookings.map((booking) => {
      if (booking._id === bookingId) {
        return {
          ...booking,
          isSelected: !booking.isSelected,
        };
      }
      return booking;
    });
    setSlotBookings(updatedSlotBookings);
  };
  const cancelSelectedBookings = async () => {
    const selectedBookingIds = slotBookings
      .filter((booking) => booking.isSelected)
      .map((booking) => booking._id);
    if (selectedBookingIds.length === 0) {
      toast.error("Please select at least one booking to cancel.");
      return;
    }

    if (!cancellationReason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    setIsCancelling(true);

    try {
      const res = await fetch(`/api/booking/cancelSelectedBookings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingIds: selectedBookingIds,
          reason: cancellationReason,
        }),
      });

      if (res.ok) {
        toast.success("Selected bookings cancelled successfully.");
        setShowCancelModal(false);
        setCancellationReason("");
        setSelectAll(false);
        await fetchSlotBookings();
      } else {
        toast.error(
          "Failed to cancel selected bookings. Please try again later."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while cancelling the selected bookings. Please try again later."
      );
    } finally {
      setIsCancelling(false);
    }
  };

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
              <h1 className="text-3xl font-bold mb-0 mr-4">Slot Bookings</h1>
            </div>
            <div className="flex items-center">
              <Button
                color="gray"
                onClick={() => navigate("/dashboard?tab=slots")}
                className="mr-2"
              >
                <HiArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-1 lg:grid-cols-1 gap-4">
            <Card className="p-6 h-auto">
              <div className="flex flex-col items-start">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white mb-2">
                  Slot Details
                </h5>
                <div className="flex items-center mb-2">
                  <HiCalendarDays className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">Date:</span>
                  {slotDetails.date
                    ? new Date(slotDetails.date).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="flex items-center mb-2">
                  <HiClock className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">Start Time:</span>
                  {slotDetails.startTime || "N/A"}
                </div>
                <div className="flex items-center mb-2">
                  <HiClock className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">End Time:</span>
                  {slotDetails.endTime || "N/A"}
                </div>
                <div className="flex items-center mb-2">
                  <HiUser className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">Doctor:</span>
                  {slotDetails.doctorName || "N/A"}
                </div>
                <div className="flex items-center mb-2">
                  <HiOfficeBuilding className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">Room:</span>
                  {slotDetails.roomName || "N/A"}
                </div>
                <div className="flex items-center mb-2">
                  <HiCheckCircle className="mr-2 h-5 w-5" />
                  <span className="font-bold mr-2">Status:</span>
                  {slotDetails.status || "N/A"}
                </div>
              </div>
            </Card>
          </div>
          <div className="mb-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Bookings
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {slotDetails.totalBookings}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Booked
                </h5>
                <Badge color="success" className="text-2xl font-bold">
                  {slotDetails.bookedCount}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Cancelled
                </h5>
                <Badge color="failure" className="text-2xl font-bold">
                  {slotDetails.cancelledCount}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Not Booked
                </h5>
                <Badge color="gray" className="text-2xl font-bold">
                  {slotDetails.notBookedCount}
                </Badge>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Pending
                </h5>
                <Badge color="warning" className="text-2xl font-bold">
                  {slotDetails.totalBookings -
                    slotDetails.bookedCount -
                    slotDetails.cancelledCount -
                    slotDetails.notBookedCount}
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search by Patient Name..."
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
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mr-2"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button color="gray" onClick={() => setFilterStatus("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Status
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mr-2"
              >
                <option value="">All Types</option>
                <option value="Online Appointment">Online Appointment</option>
                <option value="Hospital Booking">Hospital Booking</option>
                <option value="MACS">MACS</option>
              </Select>
              <Button color="gray" onClick={() => setFilterType("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Type
              </Button>
            </div>
          </div>
          <div className="my-4 flex justify-between">
            <Button onClick={generateReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? (
                <Spinner size="sm" aria-label="Loading spinner" />
              ) : (
                <>
                  <HiDocumentReport className="mr-2 h-5 w-5" />
                  Generate Report
                </>
              )}
            </Button>
            <div className="flex items-center">
              <Button
                color="failure"
                onClick={() => setShowCancelModal(true)}
                disabled={isCancelling}
                className="mr-2"
              >
                {isCancelling ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Cancel Selected Bookings"
                )}
              </Button>
              <Button
                color="failure"
                onClick={cancelSelectedBookings}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Cancel All Bookings"
                )}
              </Button>
            </div>
          </div>
          {filteredSlotBookings.length > 0 ? (
            <>
              <Table hoverable className="shadow-md">
                <Table.Head>
                  <Table.HeadCell>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
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
                        sortColumn === "patientId.username"
                          ? "text-blue-500"
                          : ""
                      }`}
                      onClick={() => handleSort("patientId.username")}
                    >
                      Patient
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "contactNumber" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("contactNumber")}
                    >
                      Contact Number
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
                  {filteredSlotBookings.map((booking) => (
                    <Table.Row
                      key={booking._id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>
                        <input
                          type="checkbox"
                          checked={booking.isSelected}
                          onChange={() => handleSelectBooking(booking._id)}
                        />
                      </Table.Cell>
                      <Table.Cell>{booking.time}</Table.Cell>
                      <Table.Cell>
                        {booking.patientId ? booking.patientId.name : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        {booking.patientId
                          ? booking.patientId.contactPhone
                          : "-"}
                      </Table.Cell>
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
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            color="gray"
                            onClick={() => handleViewBooking(booking)}
                          >
                            <HiEye className="mr-2 h-4 w-4" />
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
                                  doctorName: booking.doctorId.username,
                                  roomNo: booking.roomName,
                                });
                                setIsRebooking(false);
                                setShowBookModal(true);
                              }}
                              disabled={isBooking}
                            >
                              {isBooking ? (
                                <Spinner
                                  size="sm"
                                  aria-label="Loading spinner"
                                />
                              ) : (
                                <>
                                  <HiIdentification className="mr-2 h-4 w-4" />
                                  Book
                                </>
                              )}
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
                                  doctorName: booking.doctorId.username,
                                  roomNo: booking.roomName,
                                });
                                setIsRebooking(true);
                                setShowBookModal(true);
                              }}
                              disabled={isBooking}
                            >
                              {isBooking ? (
                                <Spinner
                                  size="sm"
                                  aria-label="Loading spinner"
                                />
                              ) : (
                                <>
                                  <BsBookmarkStar className="mr-2 h-4 w-4" />
                                  Rebook
                                </>
                              )}
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
                                doctorName: booking.doctorId.username,
                                roomNo: booking.roomName,
                                patientName: booking.patientId
                                  ? booking.patientId.username
                                  : "",
                                status: booking.status,
                              });
                              setShowUpdateModal(true);
                            }}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Spinner size="sm" aria-label="Loading spinner" />
                            ) : (
                              <>
                                <HiPencil className="mr-2 h-4 w-4" />
                                Update
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDeleteModal(true);
                            }}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Spinner size="sm" aria-label="Loading spinner" />
                            ) : (
                              <>
                                <HiTrash className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          ) : (
            <p className="px-4">No bookings found.</p>
          )}
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
                    <p>{selectedBooking.doctorId.username}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Patient:</p>
                    <p>
                      {selectedBooking.patientId
                        ? selectedBooking.patientId.name
                        : "NULL"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Contact Number:</p>
                    <p>
                      {selectedBooking.patientId
                        ? selectedBooking.patientId.contactPhone
                        : "NULL"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold mr-2">Room/Location:</p>
                    <p>{selectedBooking.roomName || "Online"}</p>
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
                    <Button
                      color="gray"
                      onClick={() => generateBookingReport(selectedBooking)}
                      className="mr-2"
                    >
                      <HiDownload className="mr-2 h-5 w-5" />
                      Download Report
                    </Button>
                    {selectedBooking.status !== "Cancelled" &&
                      selectedBooking.status !== "Completed" &&
                      selectedBooking.status !== "In Consultation" && (
                        <Button
                          color="failure"
                          onClick={handleCancelBooking}
                          className="mr-2"
                          disabled={
                            selectedBooking.status === "Not Booked" ||
                            isCancelling
                          }
                        >
                          {isCancelling ? (
                            <Spinner size="sm" aria-label="Loading spinner" />
                          ) : (
                            "Cancel Booking"
                          )}
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
                          disabled={isGeneratingAppointmentCard}
                        >
                          {isGeneratingAppointmentCard ? (
                            <Spinner size="sm" aria-label="Loading spinner" />
                          ) : (
                            <>
                              <HiIdentification className="mr-2 h-5 w-5" />
                              Appointment Card
                            </>
                          )}
                        </Button>
                      )}
                    {selectedBooking.status !== "Not Booked" &&
                      selectedBooking.status !== "Cancelled" && (
                        <Button
                          color="blue"
                          onClick={sendEmail}
                          disabled={isSendingEmail}
                        >
                          {isSendingEmail ? (
                            <Spinner size="sm" aria-label="Loading spinner" />
                          ) : (
                            <>
                              <HiMail className="mr-2 h-5 w-5" />
                              Send Email
                            </>
                          )}
                        </Button>
                      )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Booking History
                    </h4>
                    <ul className="space-y-2">
                      {selectedBooking.history.map((entry, index) => (
                        <li key={index} className="border-b pb-2">
                          <p className="font-semibold">{entry.action}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                          {entry.user && (
                            <p className="text-sm text-gray-500">
                              User: {entry.user.username}
                            </p>
                          )}
                          {entry.details && (
                            <p className="text-sm text-gray-500">
                              Details: {entry.details}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
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
              <Button
                color="failure"
                onClick={handleDeleteBooking}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Delete"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={showBookModal}
            onClose={() => setShowBookModal(false)}
            size="md"
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                {isRebooking ? "Rebook An Appointment" : "Book An Appointment"}
              </h3>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500"></h3>
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
                          {formData.roomNo?.description || ""}
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
                        <option value="">Select a Patient</option>
                        {patientOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6 space-x-4">
                    <Button
                      color="blue"
                      type="submit"
                      outline
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <Spinner size="sm" aria-label="Loading spinner" />
                      ) : isRebooking ? (
                        "Rebook"
                      ) : (
                        "Book"
                      )}
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
            <Modal.Header>
              <h3 className="text-xl font-semibold">Update Booking</h3>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center">
                <form onSubmit={handleUpdateBooking} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center">
                      <p className="font-bold mr-2">Type:</p>
                      <p>{updateFormData.type || ""}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="font-bold mr-2">Date:</p>
                      <p>
                        {new Date(updateFormData.date).toLocaleDateString() ||
                          ""}
                      </p>
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
                          .filter(
                            (patient) =>
                              patient.value !== updateFormData.patientId
                          )
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
                    <Button
                      color="blue"
                      type="submit"
                      outline
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Spinner size="sm" aria-label="Loading spinner" />
                      ) : (
                        "Update"
                      )}
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
            <Modal.Header>
              <h3 className="text-xl font-semibold">Cancel Booking</h3>
            </Modal.Header>
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
              <Button
                color="failure"
                onClick={confirmCancellation}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Cancel Booking"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
