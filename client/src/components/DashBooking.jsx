import React, { useEffect, useState } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Pagination,
} from "flowbite-react";
import {
  HiArrowNarrowUp,
  HiOutlineExclamationCircle,
  HiPrinter,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiCalendar,
  HiDocumentText,
  HiClipboardCheck,
  HiOutlineX,
  HiOfficeBuilding,
  HiClipboardList,
} from "react-icons/hi";
import { HiCalendarDays } from "react-icons/hi2";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCalendar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TextArea from "./TextArea";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2pdf from "html2pdf.js";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./LoadingSpinner";

export default function Booking() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
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
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewBookingModal, setShowViewBookingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedBookings, setGroupedBookings] = useState({});

  // Pagination
  const bookingsPerPage = 5;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  useEffect(() => {
    const timeSlots = generateTimeSlots();
    setTimeSlots(timeSlots);
    if (
      currentUser.isAdmin ||
      currentUser.isDoctor ||
      currentUser.isReceptionist
    ) {
      fetchBookings();
      fetchPatient();
    }
  }, [currentUser._id]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
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

            // Format date with time
            const date = new Date(booking.date);
            const formattedDate = `${date.toLocaleDateString()} ${
              booking.time
            }`;

            return { ...booking, doctorName, patientName, formattedDate };
          })
        );

        const groupedBookings = groupBookingsByDoctor(updatedBookings);
        setGroupedBookings(groupedBookings);

        setBookings(updatedBookings);
        setFilteredBookings(updatedBookings);

        const currentDate = new Date().toLocaleDateString();

        const bookingsForToday = filteredBookings.filter((booking) => {
          const bookingDate = new Date(booking.date).toLocaleDateString();
          return bookingDate === currentDate;
        });

        const total = bookingsForToday.length;
        const pending = bookingsForToday.filter(
          (booking) => booking.status === "Pending Payment"
        ).length;
        const completed = bookingsForToday.filter(
          (booking) => booking.status === "Completed"
        ).length;
        const cancelled = bookingsForToday.filter(
          (booking) => booking.status === "Cancelled"
        ).length;

        setTotalBookings(total);
        setPendingBookings(pending);
        setCompletedBookings(completed);
        setCancelledBookings(cancelled);

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
        setFilteredBookings(updatedBookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatient = async () => {
    try {
      const response = await fetch("/api/patient/getPatientsforBooking");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      const options = data.map((patient) => ({
        value: patient._id,
        label: patient.name,
      }));
      console.log("Patient Options:", options);
      setPatientOptions(options);
    } catch (error) {
      console.error("Error fetching Patients:", error);
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

  const fetchPatientName = async (patientId) => {
    try {
      const res = await fetch(`/api/patient/getPatient/${patientId}`);
      const data = await res.json();
      if (res.ok) {
        console.log("Patient Name:", data.name);
        return data.name;
      }
      return "Not Assigned";
    } catch (error) {
      console.error(error);
      return "Not Assigned";
    }
  };

  const handleBookModal = (booking) => {
    setBookingData(booking);
    setSelectedBooking(booking);
    console.log("Selected Booking:", booking);
    const formattedDate = new Date(booking.date).toISOString().split("T")[0];

    let roomName;

    if (booking.roomNo == "1") {
      roomName = "Consultation";
    } else if (booking.roomNo == "2") {
      roomName = "OPD";
    } else if (booking.roomNo == "3") {
      roomName = "Emergency Room";
    }

    setFormData({
      type: booking.type,
      roomNo: roomName,
      date: formattedDate,
      time: booking.time,
      doctorName: booking.doctorName,
    });

    console.log("Booking Data:", roomName);

    setShowBookModal(true);
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

  const handleUpdateBooking = (booking) => {
    setSelectedBooking(booking);
    const formattedDate = new Date(booking.date).toISOString().split("T")[0];
    setFormData({
      type: booking.type,
      roomNo: booking.roomNo,
      date: formattedDate,
      patient: booking.patientId,
      time: booking.time,
      status: booking.status,
      selectedPatientId: booking.patientId, // Set the selected patient ID here
    });
    setSelectedPatientId(booking.patientId); // Set the selected patient ID here
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { type, date, roomNo, status, time } = formData; // Remove 'patient' from here

      // Add patient to formData with selectedPatientId
      const updatedBooking = {
        _id: selectedBooking._id,
        type,
        date,
        time,
        roomNo,
        status,
        patientId: selectedPatientId, // Use selectedPatientId here
      };

      if (!type || !date || !time || !selectedPatientId || !status) {
        // Change 'patient' to 'selectedPatientId'
        toast.error("Type, date, time, patient, and status are required"); // Change 'patient' to 'selectedPatientId'
        return;
      }

      console.log("Updated Booking:", updatedBooking);

      const res = await fetch(`/api/booking/update/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBooking),
      });

      const data = await res.json();

      console.log("Response:", data);

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

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    const formattedDate = new Date(booking.date).toISOString().split("T")[0];

    let roomName; // Declare roomName variable without assignment

    if (booking.roomNo == "1") {
      roomName = "Consultation";
    } else if (booking.roomNo == "2") {
      roomName = "OPD";
    } else if (booking.roomNo == "3") {
      roomName = "Emergency Room";
    }

    setFormData({
      type: booking.type,
      roomNo: roomName || "",
      date: formattedDate || "",
      doctorName: booking.doctorName || "", // Set doctorName
      patientName: booking.patientName || "", // Set patientName
      time: booking.time || "",
      status: booking.status || "",
      selectedPatientId: booking.patientId || "",
    });
    setShowViewBookingModal(true);
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
        setShowDeleteModal(false); // Close the delete modal
        setBookingIdToDelete(""); // Reset the bookingIdToDelete state
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

  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = e.target.value.toLowerCase();
    const filteredBookings = bookings.filter((booking) => {
      // Customize this condition based on your search requirements
      return (
        booking.doctorName.toLowerCase().includes(searchQuery) ||
        booking.patientName.toLowerCase().includes(searchQuery) ||
        booking.type.toLowerCase().includes(searchQuery) ||
        new Date(booking.date).toLocaleDateString().includes(searchQuery) ||
        booking.time.includes(searchQuery)
      );
    });
    setFilteredBookings(filteredBookings);
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
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleStatusFilterChange = async (e) => {
    e.preventDefault();
    const selectedStatus = e.target.value;
    const filteredBookings = bookings.filter(
      (booking) => booking.status === selectedStatus
    );

    // Update filtered bookings with doctor and patient names
    const updatedBookings = await Promise.all(
      filteredBookings.map(async (booking) => {
        const doctorName = await fetchDoctorName(booking.doctorId);
        const patientName = await fetchPatientName(booking.patientId);

        // Format date with time
        const date = new Date(booking.date);
        const formattedDate = `${date.toLocaleDateString()} ${booking.time}`;

        return { ...booking, doctorName, patientName, formattedDate };
      })
    );

    setFilteredBookings(updatedBookings);
  };

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

  const generateReport = () => {
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    const contentWidth = document.body.clientWidth - marginLeft - marginRight;
    const contentHeight = document.body.clientHeight - marginTop - marginBottom;

    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in "YYYY-MM-DD" format

    const filename = `AppointmentReport_${currentDate}.pdf`; // Construct filename with current date

    let report = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Report</title>
            <style>
            .top_rw{ background-color:#f4f4f4; }
            .td_w{ }
            button{ padding:5px 10px; font-size:14px;}
            .invoice-box {
                max-width: 890px;
                margin: auto;
                padding:10px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, .15);
                font-size: 14px;
                line-height: 24px;
                font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                color: #555;
            }
            .invoice-box table {
                width: 100%;
                line-height: inherit;
                text-align: left;
                border-bottom: solid 1px #ccc;
            }
            .invoice-box table td {
                padding: 5px;
                vertical-align:top; /* Adjusted vertical alignment */
            }
            .invoice-box table tr td:nth-child(2) {
                text-align: left; /* Adjusted text alignment */
            }
            .invoice-box table tr.top table td {
                padding-bottom: 20px;
            }
            .invoice-box table tr.top table td.title {
                font-size: 45px;
                line-height: 45px;
                color: #333;
            }
            .invoice-box table tr.information table td {
                padding-bottom: 10px; /* Adjusted padding */
            }
            .invoice-box table tr.heading td {
                background: #eee;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                font-size:12px;
            }
            .invoice-box table tr.details td {
                padding-bottom: 10px; /* Adjusted padding */
            }
            .invoice-box table tr.item td{
                border-bottom: 1px solid #eee;
            }
            .invoice-box table tr.item.last td {
                border-bottom: none;
            }
            .invoice-box table tr.total td:nth-child(2) {
                border-top: 2px solid #eee;
                font-weight: bold;
            }
            @media only screen and (max-width: 600px) {
                .invoice-box table tr.top table td {
                    width: 100%;
                    display: block;
                    text-align: center;
                }
                .invoice-box table tr.information table td {
                    width: 100%;
                    display: block;
                    text-align: center;
                }
            }
            /** RTL **/
            .rtl {
                direction: rtl;
                font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            }
            .rtl table {
                text-align: right;
            }
            .rtl table tr td:nth-child(2) {
                text-align: left;
            }
            </style>
            </head>
            <body>
            
            <div class="invoice-box">
                <table cellpadding="0" cellspacing="0">
                    <tr class="top_rw">
                        <td colspan="2">
                            <h2 style="margin-bottom: 0px;"> Isamils Hospital Pvt Ltd </h2>
                            <span style=""> Booking Report </span>
                        </td>
                    </tr>
                    <tr class="information">
                        <td colspan="2">
                            <b>Hospital Information:</b> <br>
                            <b>Hospital Name:</b> Isamils Hospital Pvt Ltd <br>
                            <b>Address:</b> 123, Sample Street, City, Country <br>
                            <b>Phone:</b> +1234567890 <br>
                            <b>Email:</b> info@example.com <br>
                        </td>
                    </tr>
                </table>
                <h2 style="margin-bottom: 20px;">Booking Details</h2>
                <table cellpadding="0" cellspacing="0">
                  <tr class="heading">
                  <td style="width:15%;">Date</td>
                  <td style="width:15%;">Type</td>
                  <td style="width:15%;">Room</td>
                  <td style="width:20%;">Doctor</td>
                  <td style="width:25%;">Patient</td>
                  <td style="width:15%;">Status</td>
              </tr>
              <tbody>
                        ${filteredBookings
                          .map((booking) => {
                            let roomName;

                            if (booking.roomNo == "1") {
                              roomName = "Consultation";
                            } else if (booking.roomNo == "2") {
                              roomName = "OPD";
                            } else if (booking.roomNo == "3") {
                              roomName = "Emergency Room";
                            }

                            return `
                            <tr class="item">
                                <td>${booking.formattedDate}</td>
                                <td>${booking.type}</td>
                                <td>${roomName}</td>
                                <td>${booking.doctorName}</td>
                                <td>${booking.patientName}</td>
                                <td>${booking.status}</td>
                            </tr>
                            `;
                          })
                          .join("")}
              </tbody>
                </table>
            </div>
            
            </body>
            </html>
            
            `;

    html2pdf().from(report).toPdf().save(filename);
  };

  const generateDoctorsReport = () => {
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    const contentWidth = document.body.clientWidth - marginLeft - marginRight;
    const contentHeight = document.body.clientHeight - marginTop - marginBottom;

    let roomName = ""; // Initialize roomName variable

    if (filteredBookings.length > 0) {
      // Get room name from the first booking
      const firstBooking = filteredBookings[0];
      if (firstBooking.roomNo == "1") {
        roomName = "Consultation";
      } else if (firstBooking.roomNo == "2") {
        roomName = "OPD";
      } else if (firstBooking.roomNo == "3") {
        roomName = "Emergency Room";
      }
    }

    // Generate a filename based on doctor's name, date, and starting time
    const doctorName = filteredBookings[0]?.doctorName || "";
    const date = new Date().toLocaleDateString().replace(/\//g, "-"); // Replace slashes with hyphens for safe filename
    const startingTime =
      filteredBookings.length > 0 ? filteredBookings[0].time : "";

    const filename = `${doctorName}_${date}_${startingTime}.pdf`;

    let report = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Doctor's Daily Schedule</title>
                <style>
                .top_rw{ background-color:#f4f4f4; }
              .td_w{ }
              button{ padding:5px 10px; font-size:14px;}
              .invoice-box {
                  max-width: 890px;
                  margin: auto;
                  padding:10px;
                  border: 1px solid #eee;
                  box-shadow: 0 0 10px rgba(0, 0, 0, .15);
                  font-size: 14px;
                  line-height: 24px;
                  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                  color: #555;
              }
              .invoice-box table {
                  width: 100%;
                  line-height: inherit;
                  text-align: left;
                  border-bottom: solid 1px #ccc;
              }
              .invoice-box table td {
                  padding: 5px;
                  vertical-align:top; /* Adjusted vertical alignment */
              }
              .invoice-box table tr td:nth-child(2) {
                  text-align: left; /* Adjusted text alignment */
              }
              .invoice-box table tr.top table td {
                  padding-bottom: 20px;
              }
              .invoice-box table tr.top table td.title {
                  font-size: 45px;
                  line-height: 45px;
                  color: #333;
              }
              .invoice-box table tr.information table td {
                  padding-bottom: 10px; /* Adjusted padding */
              }
              .invoice-box table tr.heading td {
                  background: #eee;
                  border-bottom: 1px solid #ddd;
                  font-weight: bold;
                  font-size:12px;
              }
              .invoice-box table tr.details td {
                  padding-bottom: 10px; /* Adjusted padding */
              }
              .invoice-box table tr.item td{
                  border-bottom: 1px solid #eee;
              }
              .invoice-box table tr.item.last td {
                  border-bottom: none;
              }
              .invoice-box table tr.total td:nth-child(2) {
                  border-top: 2px solid #eee;
                  font-weight: bold;
              }
              @media only screen and (max-width: 600px) {
                  .invoice-box table tr.top table td {
                      width: 100%;
                      display: block;
                      text-align: center;
                  }
                  .invoice-box table tr.information table td {
                      width: 100%;
                      display: block;
                      text-align: center;
                  }
              }
              /** RTL **/
              .rtl {
                  direction: rtl;
                  font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
              }
              .rtl table {
                  text-align: right;
              }
              .rtl table tr td:nth-child(2) {
                  text-align: left;
              }
                </style>
                </head>
                <body>
            
                <div class="invoice-box">
                    <table cellpadding="0" cellspacing="0">
                        <tr class="top_rw">
                            <td colspan="2">
                                <h2 style="margin-bottom: 0px;"> Isamils Hospital Pvt Ltd </h2>
                                <span style=""> Doctor's Daily Schedule </span><br>
                                <b>Doctor:</b> ${doctorName} <br>
                                <b>Date:</b> ${new Date().toLocaleDateString()} <br>
                                <b>Room:</b> ${roomName} <br>
                            </td>
                        </tr>
                    </table>
            
                    <table cellpadding="0" cellspacing="0">
                        <tr class="heading">
                            <td style="width:20%;">Time</td>
                            <td style="width:20%;">Type</td>
                            <td style="width:60%;">Patient</td>
                        </tr>
                        <tbody>
                            ${filteredBookings
                              .map((booking) => {
                                return `
                                    <tr class="item">
                                        <td>${booking.time}</td>
                                        <td>${booking.type}</td>
                                <td>${booking.patientName}</td>
                            </tr>
                            `;
                              })
                              .join("")}
                </tbody>
            </table>
        </div>
        </body>
    </html>

`;

    html2pdf().from(report).toPdf().save(filename);
  };

  const handleReasonChange = (newValue) => {
    setReason(newValue);
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

  const handleReset = async () => {
    try {
      const res = await fetch("/api/booking/getBookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings);
        setFilteredBookings(data.bookings); // Reset filtered bookings
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Booked":
        return "Booked";
      case "Cancelled":
        return "Cancelled";
      case "Pending Payment":
        return "Pending Payment";
      case "Not Booked":
        return "Not Booked";
      case "Completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Booked":
        return <HiCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <HiXCircle className="text-red-500" />;
      case "Pending Payment":
        return <HiOutlineExclamationCircle className="text-orange-500" />;
      case "Not Booked":
        return <HiOutlineExclamationCircle className="text-yellow-500" />;
      case "Completed":
        return <HiCheckCircle className="text-blue-500" />;
      default:
        return null;
    }
  };

  const groupBookingsByDoctor = (bookings) => {
    const currentDate = new Date().toLocaleDateString();
    const todaysBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date).toLocaleDateString();
      return bookingDate === currentDate;
    });
  
    const groupedBookings = {};
  
    todaysBookings.forEach((booking) => {
      const doctorName = booking.doctorName;
  
      if (!groupedBookings[doctorName]) {
        groupedBookings[doctorName] = [];
      }
  
      groupedBookings[doctorName].push(booking);
    });
  
    return groupedBookings;
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ToastContainer />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold mb-4">
              <HiCalendarDays className="inline-block mr-1 align-middle" />
              Today's Appointments
            </h1>
          </div>
          <div className="p-3 md:mx-auto">
            <div className="flex-wrap flex gap-4 justify-center">
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Total Bookings
                    </h3>
                    <p className="text-2xl">{totalBookings}</p>
                  </div>
                  <FaCalendar className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-500 flex items-center">
                    <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Pending Bookings
                    </h3>
                    <p className="text-2xl">{pendingBookings}</p>
                  </div>
                  <FaCalendar className="bg-yellow-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-500 flex items-center">
                    <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Completed Bookings
                    </h3>
                    <p className="text-2xl">{completedBookings}</p>
                  </div>
                  <FaCalendar className="bg-green-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-500 flex items-center">
                    <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      Cancelled Bookings
                    </h3>
                    <p className="text-2xl">{cancelledBookings}</p>
                  </div>
                  <FaCalendar className="bg-red-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-500 flex items-center">
                    <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center mb-4">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-slate-300 scrollbar-track-slate-100 dark:scrollbar-thumb-slate-500 dark:scrollbar-track-slate-700 py-4">
  {Object.entries(groupedBookings).length === 0 ? (
    <p>No Bookings today</p>
  ) : (
    Object.entries(groupedBookings).map(([doctorName, doctorBookings]) => (
      <div key={doctorName} className="flex flex-col mr-4">
        <h2 className="text-xl font-bold mb-4">{doctorName}</h2>
        <div className="flex gap-4 min-w-max">
          {doctorBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col justify-between w-72"
            >
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-bold">Type:</span> {booking.type}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-bold">Date:</span> {booking.formattedDate}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-bold">Time:</span> {booking.time}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-bold">Patient:</span> {booking.patientName}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  color="blue"
                  size="xs"
                  onClick={() => handleViewBookingDetails(booking)}
                  className="w-20 h-8 text-sm"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  )}
</div>

          </div>
          <div className="flex mb-2">
            <h1 className="text-3xl font-bold mb-4 ">
              {currentUser.isDoctor
                ? "Doctors Appointments"
                : "Patient Appointments"}
            </h1>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <form onSubmit={(e) => handleSearch(e)}>
                <TextInput
                  type="text"
                  placeholder="Search..."
                  rightIcon={AiOutlineSearch}
                  className="hidden lg:inline"
                  id="search"
                  onChange={handleSearch}
                  style={{ width: "300px" }}
                />
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
              <option value="">Filter by Type</option>
              <option value="Hospital Booking">Hospital Booking</option>
              <option value="Online Appointment">Online Appointment</option>
              <option value="MACS">MACS</option>
            </select>
            <select
              id="statusFilter"
              onChange={handleStatusFilterChange}
              className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            </select>
            <Button color="purple" onClick={generateReport}>
              Generate Report
            </Button>
            <Button color="purple" onClick={generateDoctorsReport}>
              Doctors Report
            </Button>
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
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {currentBookings.map((booking, index) => (
                  <Table.Body className="divide-y" key={booking._id}>
                    <Table.Row
                      className={`bg-white dark:border-gray-700 dark:bg-gray-800 ${
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
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-gray-500 cursor-pointer ${
                              booking.status === "Booked"
                                ? "bg-green-200 text-green-500"
                                : booking.status === "Cancelled"
                                ? "bg-red-200 text-red-500"
                                : booking.status === "Pending Payment"
                                ? "bg-orange-200 text-orange-500"
                                : booking.status === "Not Booked"
                                ? "bg-yellow-200 text-yellow-500"
                                : booking.status === "Completed"
                                ? "bg-blue-200 text-blue-500"
                                : "bg-gray-200"
                            }`}
                            title={getStatusText(booking.status)}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-2">
                              {booking.status === "Not Booked"
                                ? "Not Booked"
                                : booking.status === "Pending Payment"
                                ? "Pending Payment"
                                : booking.status === "Cancelled"
                                ? "Cancelled"
                                : booking.status === "Booked"
                                ? "Booked"
                                : booking.status === "Completed"
                                ? "Completed"
                                : ""}
                            </span>
                          </span>
                        </Table.Cell>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-2">
                          <Link className="text-teal-500 hover:underline">
                            {booking.status === "Cancelled" ? (
                              <span>
                                <HiOutlineExclamationCircle className="inline-block w-5 h-5 mr-1 text-red-500" />
                              </span>
                            ) : booking.status === "Booked" ? (
                              <Button
                                color="blue"
                                size="xs"
                                onClick={() =>
                                  handleViewBookingDetails(booking)
                                }
                                className="w-20 h-8 text-sm"
                              >
                                View
                              </Button>
                            ) : booking.status === "Pending Payment" ? (
                              <span>
                                <HiOutlineExclamationCircle className="inline-block w-5 h-5 mr-1 text-red-500" />
                              </span>
                            ) : (
                              <Button
                                color="blue"
                                size="xs"
                                onClick={() => handleBookModal(booking)}
                                className="w-20 h-8 text-sm"
                              >
                                Book
                              </Button>
                            )}
                          </Link>
                          <Link className="text-teal-500 hover:underline">
                            <Button
                              color="blue"
                              size="xs"
                              onClick={() => {
                                handleUpdateBooking(booking);
                              }}
                              className="w-20 h-8 text-sm"
                            >
                              Update
                            </Button>
                          </Link>
                          <Button
                            color="red"
                            size="xs"
                            onClick={() => {
                              setShowDeleteModal(true);
                              setBookingIdToDelete(booking._id);
                            }}
                            className="w-20 h-8 text-sm"
                          >
                            Delete
                          </Button>
                        </div>
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
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
                >
                  Prev
                </button>
                {[
                  ...Array(
                    Math.ceil(filteredBookings.length / bookingsPerPage)
                  ),
                ].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`mx-1 px-3 py-2 rounded-md ${
                      currentPage === index + 1
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredBookings.length / bookingsPerPage)
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                >
                  Next
                </button>
              </div>
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
                <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
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
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                  Update Booking
                </h3>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-full">
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
                        <option value="Hospital Booking">
                          Hospital Booking
                        </option>
                      </Select>
                    </div>
                    {formData.type === "Hospital Booking" && (
                      <div className="w-full">
                        <Label htmlFor="roomNo">Room No.</Label>
                        <Select
                          id="roomNo"
                          onChange={onChange}
                          className="input-field"
                          value={formData.roomNo || ""}
                        >
                          <option value="">Select Room </option>
                          <option value="1">Consultation</option>
                          <option value="2">OPD</option>
                          <option value="3">Emergency Room </option>
                        </Select>
                      </div>
                    )}

                    <div className="w-full">
                      <Label htmlFor="date">Date</Label>
                      <TextInput
                        type="date"
                        id="date"
                        onChange={onChange}
                        className="input-field"
                        value={formData.date || ""}
                      />
                    </div>
                    <div className="w-full">
                      <Label htmlFor="time">Time</Label>
                      <Select
                        id="time"
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="input-field"
                        value={formData.time || ""}
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label htmlFor="selectedPatientId" className="mr-2">
                        Select Patient:
                      </Label>
                      <Select
                        id="selectedPatientId"
                        className="mt-1"
                        value={selectedPatientId}
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
                    <div className="w-full">
                      <Label htmlFor="status" className="mr-2">
                        Select Status:
                      </Label>
                      <Select
                        id="status"
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="input-field"
                        value={formData.status || ""}
                      >
                        <option value="">Select Status</option>
                        <option value="Not Booked" className="text-yellow-500">
                          Not Booked
                        </option>
                        <option
                          value="Pending Payment"
                          className="text-orange-500"
                        >
                          Pending Payment
                        </option>
                        <option value="Cancelled" className="text-red-500">
                          Cancelled
                        </option>
                        <option value="Booked" className="text-green-500">
                          Booked
                        </option>
                      </Select>
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
                </div>
              </form>
            </Modal.Body>
          </Modal>

          <Modal
            show={showBookModal}
            onClose={() => setShowBookModal(false)}
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500">Book Appointment</h3>
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
                        {formData.date || ""}
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
                        <span className="text-gray-700">{formData.roomNo}</span>
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
                      Book
                    </Button>
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => {
                        setShowBookModal(false);
                        setFormData({});
                        setSelectedTimeSlots([]);
                      }}
                    >
                      <HiOutlineX className="inline-block mr-1 align-middle" />{" "}
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={showViewBookingModal}
            onClose={() => setShowViewBookingModal(false)}
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500">
                  View Booking Details
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Label htmlFor="type" className="mr-2">
                      <HiClipboardList className="inline-block mr-2" />
                      Type:
                    </Label>
                    <span className="text-gray-700">{formData.type || ""}</span>
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="date" className="mr-2">
                      <HiCalendar className="inline-block mr-2" />
                      Date:
                    </Label>
                    <span className="text-gray-700">{formData.date || ""}</span>
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="time" className="mr-2">
                      <HiClock className="inline-block mr-2" />
                      Time:
                    </Label>
                    <span className="text-gray-700">{formData.time || ""}</span>
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="doctorName" className="mr-2">
                      <HiDocumentText className="inline-block mr-2" />
                      Doctor Name:
                    </Label>
                    <span className="text-gray-700">
                      {formData.doctorName || ""}
                    </span>
                  </div>
                  {formData.type === "Hospital Booking" && (
                    <div className="flex items-center">
                      <HiOfficeBuilding className="inline-block mr-2" />
                      <Label htmlFor="roomNo" className="mr-2">
                        Room:
                      </Label>
                      <span className="text-gray-700">{formData.roomNo}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Label htmlFor="patientName" className="mr-2">
                      <HiDocumentText className="inline-block mr-2" />
                      Patient Name:
                    </Label>
                    <span className="text-gray-700">
                      {formData.patientName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="status" className="mr-2">
                      Status:
                    </Label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-gray-500 cursor-pointer ${
                        formData.status === "Booked"
                          ? "bg-green-200 text-green-500"
                          : formData.status === "Cancelled"
                          ? "bg-red-200 text-red-500"
                          : formData.status === "Pending Payment"
                          ? "bg-orange-200 text-orange-500"
                          : formData.status === "Not Booked"
                          ? "bg-yellow-200 text-yellow-500"
                          : formData.status === "Completed"
                          ? "bg-blue-200 text-blue-500"
                          : "bg-gray-200"
                      }`}
                      title={getStatusText(formData.status)}
                    >
                      {getStatusIcon(formData.status)}
                      <span className="ml-2">
                        {formData.status === "Not Booked"
                          ? "Not Booked"
                          : formData.status === "Pending Payment"
                          ? "Pending Payment"
                          : formData.status === "Cancelled"
                          ? "Cancelled"
                          : formData.status === "Booked"
                          ? "Booked"
                          : formData.status === "Completed"
                          ? "Completed"
                          : ""}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  color="red"
                  size="xs"
                  onClick={() => setShowViewBookingModal(false)}
                  className="ml-auto"
                >
                  <HiOutlineX className="inline-block mr-1 align-middle" />{" "}
                  Close
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}
