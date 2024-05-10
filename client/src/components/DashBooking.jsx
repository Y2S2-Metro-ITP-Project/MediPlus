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
import { ro } from "date-fns/locale";

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
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    const doctorName = selectedBooking.doctorName;
    const roomName = selectedBooking.roomName;
    const patientName = selectedBooking.patientName;
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
    } finally {
      setIsBooking(false);
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationReason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    setIsCancelling(true);

    const doctorName = selectedBooking.doctorName;
    const roomName = selectedBooking.roomName;

    try {
      const res = await fetch(`/api/booking/cancel/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: cancellationReason,
          doctorName,
          roomName,
        }),
      });

      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        setShowCancelModal(false);
        setShowViewModal(false);
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
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const doctorName = selectedBooking.doctorName;
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
            selectedBooking.patientId,
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
        await fetchBookings();
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

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/booking/generateReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filterDate,
          filterPatient,
          filterType,
          filterRoom,
        }),
      });
  
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "bookings_report.pdf";
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error("Failed to generate the report");
      }
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
      const { date, time, doctorName, roomName } = selectedBooking;
      const contactEmail = selectedBooking.patientId.contactEmail;
      console.log(contactEmail);
      const emailContent = `
      Dear ${selectedBooking.patientName},

      Here are the details of your upcoming appointment:

      <h3 style="color: #4CAF50; font-family: 'Roboto', sans-serif;">Appointment Details</h3>

      <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
        <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br>
        <strong>Time:</strong> ${time}<br>
        <strong>Doctor:</strong> ${doctorName}<br>
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
          to: contactEmail,
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.patientName &&
        booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = filterDate
      ? new Date(booking.date).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
      : true;
    const matchesPatient = filterPatient
      ? booking.patientId === filterPatient
      : true;
    const matchesType = filterType ? booking.type === filterType : true;
    const matchesRoom = filterRoom ? booking.roomName === filterRoom : true;
    return (
      matchesSearch &&
      matchesDate &&
      matchesPatient &&
      matchesType &&
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mr-2"
              >
                <option value="">All Types</option>
                <option value="Online Appointment">Online Appointment</option>
                <option value="Hospital Booking">Hospital Booking</option>
              </Select>
              <Button color="gray" onClick={() => setFilterType("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Type
              </Button>
            </div>
            <div className="flex items-center">
              <Select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="mr-2"
              >
                <option value="">All Rooms</option>
                {/* Add room options based on your data */}
              </Select>
              <Button color="gray" onClick={() => setFilterRoom("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Room
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
                            disabled={isBooking}
                          >
                            {isBooking ? (
                              <Spinner size="sm" aria-label="Loading spinner" />
                            ) : (
                              <>
                                <HiIdentification className="mr-2 h-5 w-5" />
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
                                doctorName: booking.doctorName,
                                roomNo: booking.roomName,
                              });
                              setIsRebooking(true);
                              setShowBookModal(true);
                            }}
                            disabled={isBooking}
                          >
                            {isBooking ? (
                              <Spinner size="sm" aria-label="Loading spinner" />
                            ) : (
                              <>
                                <BsBookmarkStar className="mr-2 h-5 w-5" />
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
                              doctorName: booking.doctorName,
                              roomNo: booking.roomName,
                              patientName: booking.patientName,
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
                              <HiPencil className="mr-2 h-5 w-5" />
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
                              <HiTrash className="mr-2 h-5 w-5" />
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
          ) : (
            <p className="px-4">No bookings found.</p>
          )}
          <div className="mt-4">
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
