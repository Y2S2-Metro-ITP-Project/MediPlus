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
  Pagination,
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
} from "react-icons/hi";
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
  }, []);

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
      const res = await fetch(`/api/slots/getSlotDetails/${slotId}`);
      const data = await res.json();

      if (res.ok) {
        const {
          date,
          startTime,
          endTime,
          doctorName,
          roomName,
          status,
          totalBookings,
          bookedCount,
          cancelledCount,
          notBookedCount,
        } = data;

        setSlotDetails({
          date,
          startTime,
          endTime,
          doctorName,
          roomName,
          status,
          totalBookings,
          bookedCount,
          cancelledCount,
          notBookedCount,
        });
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
      ? selectedBooking.patientId.username
      : "";
    console.log();

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
            <table>
              <thead>
                <tr>
                  <th>Booking Date</th>
                  <th>Booking Time</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Room/Location</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSlotBookings
                  .map(
                    (booking) => `
                      <tr>
                        <td>${new Date(booking.date).toLocaleDateString()}</td>
                        <td>${booking.time}</td>
                        <td>${booking.doctorId.username}</td>
                        <td>${
                          booking.patientId ? booking.patientId.username : "-"
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

      const options = {
        filename: "slot_bookings_report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  const generateSlotBookingsReport = async () => {
    try {
      const reportContent = `       <html>           <head>             <style>               body {                 font-family: Arial, sans-serif;                 margin: 0;                 padding: 20px;               }               h1 {                 color: #333;               }               table {                 width: 100%;                 border-collapse: collapse;                 margin-top: 20px;               }               th, td {                 padding: 8px;                 text-align: left;                 border-bottom: 1px solid #ddd;               }               th {                 background-color: #f2f2f2;               }               .logo {                 text-align: center;                 margin-bottom: 20px;               }               .logo img {                 max-width: 150px;               }             </style>           </head>           <body>             <div class="logo">               <img src="https://example.com/hospital-logo.png" alt="Hospital Logo">             </div>             <h1>Slot Bookings Report</h1>             <table>               <thead>                 <tr>                   <th>Booking Date</th>                   <th>Booking Time</th>                   <th>Doctor</th>                   <th>Patient</th>                   <th>Room/Location</th>                   <th>Booking Status</th>                 </tr>               </thead>               <tbody>                 ${slotBookings
        .map((booking) => (
          <tr>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.time}</td>
            <td>${booking.doctorId.username}</td>
            <td>${booking.patientId ? booking.patientId.username : "-"}</td>
            <td>${booking.roomName}</td>
            <td>${booking.status}</td>
          </tr>
        ))
        .join(
          ""
        )}               </tbody>             </table>           </body>         </html>      `;

      const options = {
        filename: `slot_bookings_report_${slotId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().set(options).from(reportContent).save();
    } catch (error) {
      console.error("Error generating slot bookings report:", error);
      toast.error(
        "Failed to generate the slot bookings report. Please try again later."
      );
    }
  };
  const cancelSelectedBookings = async () => {
    setIsCancelling(true);
    try {
      const selectedBookingIds = slotBookings
        .filter((booking) => booking.isSelected)
        .map((booking) => booking._id);

      const response = await fetch("/api/booking/cancelSelectedBookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingIds: selectedBookingIds,
          reason: cancellationReason,
        }),
      });
      if (response.ok) {
        toast.success("Selected bookings cancelled successfully.");
        setShowCancelModal(false);
        setCancellationReason("");
        await fetchSlotBookings();
      } else {
        toast.error(
          "Failed to cancel the selected bookings. Please try again later."
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
  const filteredSlotBookings = slotBookings.filter((booking) => {
    const matchesSearch =
      booking.doctorId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.patientId &&
        booking.patientId.username?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPatient = filterPatient
      ? booking.patientId && booking.patientId._id === filterPatient
      : true;
    const matchesType = filterType ? booking.type === filterType : true;
    const matchesRoom = filterRoom ? booking.roomName === filterRoom : true;
    return matchesSearch && matchesPatient && matchesType && matchesRoom;
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

  
}
