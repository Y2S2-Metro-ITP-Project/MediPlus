import React, { useState, useEffect } from "react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { HiArrowNarrowUp, HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";
import TextArea from "./TextArea";
import puppeteer from "puppeteer";

const PatientBooking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState("");
  const [showBookModal, setShowBookModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [showViewBookingModal, setShowViewBookingModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    if (currentUser.isOutPatient) {
      fetchPatientBookings();
    }
  }, [currentUser._id]);

  const fetchPatientBookings = async () => {
    try {
      const res = await fetch(`/api/booking/getPatientBookings/${currentUser._id}`);
      const data = await res.json();

      if (res.ok) {
        // Update bookings with doctor and patient names
        const updatedBookings = await Promise.all(
          data.bookings.map(async (booking) => {
            const doctorName = await fetchDoctorName(booking.doctorId);
            const patientName = await fetchPatientName(booking.patientId);

            // Format date with time
            const date = new Date(booking.date);
            const formattedDate = `${date.toLocaleDateString()} ${booking.time}`;

            return { ...booking, doctorName, patientName, formattedDate };
          })
        );

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

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
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
      roomNo: roomName || "",
      date: formattedDate || "",
      doctorName: booking.doctorName || "",
      patientName: booking.patientName || "",
      time: booking.time || "",
      status: booking.status || "",
      selectedPatientId: booking.patientId || "",
    });
    setShowViewBookingModal(true);
  };

  const generateReport = async () => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Report</title>
          <style>
            /* Add your CSS styles here */
          </style>
        </head>
        <body>
          <h1>Appointment Report</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Room</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings.map(
                (booking) => `
                  <tr>
                    <td>${booking.formattedDate}</td>
                    <td>${booking.type}</td>
                    <td>${
                      booking.roomNo === "1"
                        ? "Consultation"
                        : booking.roomNo === "2"
                        ? "OPD"
                        : "Emergency Room"
                    }</td>
                    <td>${booking.doctorName}</td>
                    <td>${booking.patientName}</td>
                    <td>${booking.status}</td>
                  </tr>
                `
              ).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      await page.setContent(html);
      await page.pdf({
        path: `appointment-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        format: "A4",
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      await browser.close();
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="p-3 md:mx-auto">
        <h1 className="text-3xl font-bold mb-4 ">Your Bookings</h1>
        <div className="flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Total Bookings
                </h3>
                <p className="text-2xl">{bookings.length}</p>
              </div>
              <FaCalendar className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">Your Appointments</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <form onSubmit={(e) => handleSearch(e)}>
            <TextInput
              type="text"
              placeholder="Search...."
              rightIcon={AiOutlineSearch}
              className="hidden lg:inline"
              id="search"
              onChange={handleSearch}
              style={{ width: "300px" }}
            />
          </form>
        </div>
        <Button color="purple" onClick={generateReport}>
          Generate Report
        </Button>
      </div>
      {currentUser.isOutPatient && bookings.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Time</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>View</Table.HeadCell>
            </Table.Head>
            {bookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage).map((booking) => (
              <Table.Body className="divide-y" key={booking._id}>
                <Table.Row
                  className={`bg-white dar:border-gray-700 dark:bg-gray-800`}
                >
                  <Table.Cell>
                    {new Date(booking.date).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{booking.time}</Table.Cell>
                  <Table.Cell>{booking.type}</Table.Cell>
                  <Table.Cell>{booking.doctorName}</Table.Cell>
                  <Table.Cell>
                    {booking.status === "Not Booked" ? (
                      <span className="text-yellow-500">Not Booked</span>
                    ) : booking.status === "Pending Payment" ? (
                      <span className="text-orange-500">Pending Payment</span>
                    ) : booking.status === "Cancelled" ? (
                      <span className="text-red-500">Cancelled</span>
                    ) : (
                      <span className="text-green-500">Booked</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span onClick={() => handleViewBookingDetails(booking)}>
                        View
                      </span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
            >
              Prev
            </button>
            {[
              ...Array(Math.ceil(bookings.length / bookingsPerPage)),
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
                Math.ceil(bookings.length / bookingsPerPage)
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
        show={showViewBookingModal}
        onClose={() => setShowViewBookingModal(false)}
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500">View Booking Details</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Label htmlFor="type" className="mr-2">
                  Type:
                </Label>
                <span className="text-gray-700">{formData.type || ""}</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="date" className="mr-2">
                  Date:
                </Label>
                <span className="text-gray-700">{formData.date || ""}</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="time" className="mr-2">
                  Time:
                </Label>
                <span className="text-gray-700">{formData.time || ""}</span>
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
                <Label htmlFor="patientName" className="mr-2">
                  Patient Name:
                </Label>
                <span className="text-gray-700">{formData.patientName}</span></div>
              <div className="flex items-center">
                <Label htmlFor="status" className="mr-2">
                  Status:
                </Label>
                <span className="text-gray-700">{formData.status}</span>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

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
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
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
        show={showBookModal}
        onClose={() => setShowBookModal(false)}
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500">Book Appointment</h3>
            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div className="grid grid-cols-1gap-6">
                <div className="flex items-center">
                  <Label htmlFor="type" className="mr-2">
                    Type:
                  </Label>
                  <span className="text-gray-700">{formData.type || ""}</span>
                </div>
                <div className="flex items-center">
                  <Label htmlFor="date" className="mr-2">
                    Date:
                  </Label>
                  <span className="text-gray-700">{formData.date || ""}</span>
                </div>
                <div className="flex items-center">
                  <Label htmlFor="time" className="mr-2">
                    Time:
                  </Label>
                  <span className="text-gray-700">{formData.time || ""}</span>
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
                  <span className="text-gray-700">{currentUser.name}</span>
                </div>
              </div>
              <div className="flex justify-center mt-6 space-x-4">
                <Button color="blue" type="submit" outline>
                  Book
                </Button>
                <Button
                  color="red"
                  onClick={() => {
                    setShowBookModal(false);
                    setFormData({});
                    setSelectedTimeSlots([]);
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
        show={showViewBookingModal}
        onClose={() => setShowViewBookingModal(false)}
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-4 text-lg text-gray-500">View Booking Details</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Label htmlFor="type" className="mr-2">
                  Type:
                </Label>
                <span className="text-gray-700">{formData.type || ""}</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="date" className="mr-2">
                  Date:
                </Label>
                <span className="text-gray-700">{formData.date || ""}</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="time" className="mr-2">
                  Time:
                </Label>
                <span className="text-gray-700">{formData.time || ""}</span>
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
                <Label htmlFor="patientName" className="mr-2">
                  Patient Name:
                </Label>
                <span className="text-gray-700">{formData.patientName}</span>
              </div>
              <div className="flex items-center">
                <Label htmlFor="status" className="mr-2">
                  Status:
                </Label>
                <span className="text-gray-700">{formData.status}</span>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default PatientBooking;