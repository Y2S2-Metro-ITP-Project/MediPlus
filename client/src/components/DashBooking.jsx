import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { HiArrowNarrowUp, HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";
import TextArea from "./TextArea";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [showViewBookingModal,setShowViewBookingModal] = useState(false);

  //Pagination
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
    }
  };

  const fetchPatient = async () => {
    try {
      const response = await fetch("/api/patient/getPatientsforBooking");
      const data = await response.json();
      if (!response.ok) {
        throw newError(data.message);
      }
      const options = data.map((patient) => ({
        value: patient._id,
        label: patient.name,
      }));
      console.log("Patient Options:", options); // Log patient options
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
      return "Not Assgined";
    }
  };

  const handleBookModal = (booking) => {
    setBookingData(booking);
    setSelectedBooking(booking);
    console.log("Selected Booking:", booking);
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
      roomNo: roomName,
      date: formattedDate,
      time: booking.time,
      doctorName: booking.doctorName,
    });

    console.log("Booking Data:", roomName);

    setShowBookModal(true); // Show the book modal
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
        roomNo: roomName || '',
        date: formattedDate || '',
        doctorName: booking.doctorName || '', // Set doctorName
        patientName: booking.patientName || '', // Set patientName
        time: booking.time || '',
        status: booking.status || '',
        selectedPatientId: booking.patientId || '',
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
      setShowMore(data.bookings.length > 9);
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
    setFilteredBookings(filteredBookings);
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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
  
    const contentWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
    const contentHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;
  
    let report = `
      <h1 style="text-align: center;">Booking Report</h1>
      <h2>Summary</h2>
      <p>Total Bookings: ${totalBookings}</p>
      <p>Pending Bookings: ${pendingBookings}</p>
      <p>Completed Bookings: ${completedBookings}</p>
      <p>Cancelled Bookings: ${cancelledBookings}</p>
  
      <h2>Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse; max-width: ${contentWidth}pt;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Doctor</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Patient</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
        </tr>
        ${bookings.map((booking) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${booking.formattedDate}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${booking.type}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${booking.doctorName}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${booking.patientName}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${booking.status}</td>
          </tr>
        `).join('')}
      </table>
    `;
  
    doc.setFontSize(12);
    doc.html(report, {
      callback: function (doc) {
        doc.save('report.pdf');
      },
      x: marginLeft,
      y: marginTop,
      html2canvas: {
        scale: 1, 
      },
      autoPagination: true,
    });
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

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="p-3 md:mx-auto">
        <h1 className="text-3xl font-bold mb-4 ">Todays Bookings</h1>
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
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">
          {" "}
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
              placeholder="Search...."
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
          <option value="defaultvalue">Choose a filter option</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="comingweek">Coming Week</option>
          <option value="comingmonth">Coming Month</option>
          <option value="lastmonth">Last Month</option>
          <option value="lastyear">Last Year</option>
          <option value="Bydate">By Date</option>
        </select>
        <select
          id="statusFilter"
          onChange={handleStatusFilterChange}
          className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="">Filter by Status</option>
          <option value="Not Booked">Not Booked</option>
          <option value="Pending Payment">Pending Payment</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Booked">Booked</option>
        </select>
        <Button color="purple" onClick={generateReport}>
          Generate Report
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
              <Table.HeadCell>Book</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {currentBookings.map((booking, index) => (
              <Table.Body className="divide-y" key={booking._id}>
                <Table.Row
                  className={`bg-white dar:border-gray-700 dark:bg-gray-800 ${
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
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      {booking.status === "Cancelled" ? (
                        <span>
                          <HiOutlineExclamationCircle className="inline-block w-5 h-5 mr-1 text-red-500" />
                        </span>
                      ) : booking.status === "Booked" ? (
                        <span onClick={() => handleViewBookingDetails(booking)}>
                          View
                        </span>
                      ) : booking.status === "Pending Payment" ? (
                        <span>
                          <HiOutlineExclamationCircle className="inline-block w-5 h-5 mr-1 text-red-500" />
                        </span>
                      ) : booking.status === "Completed" ? (
                        <span onClick={() => handleGenerateBooking(booking)}>
                          Generate Booking
                        </span>
                      ) : (
                        <span onClick={() => handleBookModal(booking)}>
                          Book
                        </span>
                      )}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span
                        onClick={() => {
                          handleUpdateBooking(booking);
                        }}
                      >
                        Update
                      </span>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowDeleteModal(true);
                        setBookingIdToDelete(booking._id);
                      }}
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </span>
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
              ...Array(Math.ceil(filteredBookings.length / bookingsPerPage)),
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
                    <option value="Hospital Booking">Hospital Booking</option>
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
                      <option value="1">Consultaion</option>
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
                    onChange={(e) => setSelectedPatientId(e.target.value)} // Update the selectedPatientId state here
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
                    <option value="Pending Payment" className="text-orange-500">
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
                  <Select
                    id="selectedPatientId"
                    className="mt-1"
                    onChange={(e) => setSelectedPatientId(e.target.value)} // Update the selectedPatientId state here
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
            </div>
        </div>
    </Modal.Body>
</Modal>



    </div>
  );
}
