import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Checkbox,
} from "flowbite-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const DoctorProfile = ({ doctor, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({});
  const [hospitlFee, setHospitalFee] = useState(0);
  const [eChannellingFee, setEChannellingFee] = useState(0);
  const totalAmount =
    doctor.doctorDetails.consultationFee + hospitlFee + eChannellingFee;
  const [paymentStatus, setPaymentStatus] = useState(null);

  const user = useSelector((state) => state.user.currentUser);

  const handleBookSession = (session) => {
    if (!user) {
      navigate("/sign-in", { state: { fromBooking: true } });
      return;
    }
    setHospitalFee(500.0);
    setEChannellingFee(100.0);
    setSelectedSession(session);
    setModalIsOpen(true);
  };

  const fetchBookings = async (doctorId) => {
    try {
      console.log("Fetching bookings for doctorId:", doctorId);
      const response = await fetch(
        `/api/booking/getBookingsForDoctor/${doctorId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setSessions(data);
      setLoading(false);
      console.log("Fetched bookings for doctor:", data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setLoading(false);
    }
  };

  const handlePayToBook = async () => {
    try {
      // Make an API call to update the booking status to "payment pending"
      const response = await fetch(`/api/booking/updateStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedSession._id,
          status: "Pending Payment",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      setModalIsOpen(false);
      setPaymentStatus("pending");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(
        "An error occurred while updating booking status. Please try again."
      );
    }
  };

  const handlePayment = async (paymentSuccess) => {
    try {
      if (paymentSuccess) {
        setPaymentStatus("success");
        handleCloseModal();
        toast.success("Payment successful!");
      } else {
        setPaymentStatus("failed");
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("An error occurred during payment. Please try again.");
    }
  };

  useEffect(() => {
    console.log("DoctorProfile doctor:", doctor);
    console.log("user:", user?._id);
    if (doctor && doctor.doctorDetails && doctor.doctorDetails.userId) {
      fetchBookings(doctor.doctorDetails.userId);
    }
  }, [doctor]);

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setSelectedSession(null);
    setFormData({});
    setPaymentStatus(null);
  };

  useEffect(() => {
    if (modalIsOpen && user) {
      fetchPatientDetails(user._id);
    }
  }, [modalIsOpen, user]);

  const fetchPatientDetails = async (userId) => {
    try {
      const response = await fetch(`/api/patient/getPatientByUser/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const userData = await response.json();
      console.log("Fetched user details:", userData);
      setFormData({
        _id: userData._id,
        name: `${userData.name}`,
        contactEmail: userData.contactEmail,
        contactPhone: userData.contactPhone,
        address: userData.address,
        identification: userData.identification,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const groupSessionsByDateAndTime = () => {
    const groupedSessions = {};
    sessions.forEach((session) => {
      const date = new Date(session.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const time = new Date(session.time).getHours() >= 12 ? "PM" : "AM";
      const key = `${date} - ${time}`;
      if (!groupedSessions[key]) {
        groupedSessions[key] = [];
      }
      groupedSessions[key].push(session);
    });
    return groupedSessions;
  };

  const handleUpdatePatientDetails = async () => {
    const { _id, name, contactEmail, contactPhone, address } = formData;
    try {
      const response = await fetch(`/api/patient/updatePatientDetails`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: _id,
          name,
          contactEmail,
          contactPhone,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient details");
      }

      const updatedPatient = await response.json();
      console.log("Updated patient:", updatedPatient);
      // Handle success, e.g., close the modal, show a success message
      handleCloseModal();
      toast.success("Patient details updated successfully");
    } catch (error) {
      console.error("Error updating patient details:", error);
      toast.error(
        "An error occurred while updating patient details. Please try again."
      );
    }
  };

  const groupedSessions = groupSessionsByDateAndTime();

  const PaymentForm = ({ totalAmount, onPayment }) => (
    <Modal
      show={paymentStatus === "pending"}
      onClose={() => setPaymentStatus(null)}
      size="md"
      popup={true}
    >
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900">Payment</h3>
          <p>Total Amount: Rs {totalAmount.toFixed(2)}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={() => onPayment(true)}
          className="bg-green-500 hover:bg-green-600 text-white focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg text-sm font-medium px-5 py-2.5 mr-2"
        >
          Simulate Success
        </button>
        <button
          onClick={() => onPayment(false)}
          className="bg-red-500 hover:bg-red-600 text-white focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-sm font-medium px-5 py-2.5"
        >
          Simulate Failure
        </button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="doctor-profile-container flex flex-col h-full p-5 border border-gray-300 rounded-lg shadow-md mb-5">
      <div className="doctor-profile-header flex justify-between items-center mb-5">
        <span>{doctor.doctorDetails.specialization}</span>
        <button
          className="back-button bg-blue-500 text-white rounded-md px-4 py-2"
          onClick={onBack}
        >
          Back
        </button>
      </div>
      <div className="profile-info flex items-center mb-5">
        <img
          src={doctor.doctorDetails.employeeimg}
          alt="Avatar"
          className="avatar w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div className="name font-bold">{doctor.doctorDetails.Name}</div>
          <div className="hospital text-gray-600">
            {doctor.doctorDetails.specialization}
          </div>
        </div>
      </div>
      <div className="doctor-profile-content flex-1 overflow-y-auto">
        {Object.entries(groupedSessions).map(([key, bookings]) => (
          <div key={key} className="booking-date mb-4">
            <h2 className="text-lg font-semibold">{key}</h2>
            <div className="session border border-gray-300 rounded-lg p-4">
              <div className="session-details flex justify-between">
                <div>
                  <p>
                    {bookings[0].time.includes("AM") ? "Morning" : "Evening"}
                  </p>
                  <p className="text-blue-500">{bookings[0].time}</p>
                </div>
                <div>
                  <p>Patients:</p>
                  <p>
                    {bookings.reduce(
                      (total, session) =>
                        session.status === "Booked" ? total + 1 : total,
                      0
                    )}
                  </p>
                </div>
                <div>
                  <p>Channelling Fee</p>
                  <p className="text-green-500">
                    Rs.{doctor.doctorDetails.consultationFee} + Booking Fee
                  </p>
                </div>
                {bookings.some((session) => session.status === "Not Booked") ? (
                  <button
                    className="button bg-green-500 text-white rounded-md px-4 py-2"
                    onClick={() =>
                      handleBookSession(
                        bookings.find(
                          (session) => session.status === "Not Booked"
                        )
                      )
                    }
                  >
                    Book
                  </button>
                ) : (
                  <div className="button-container flex items-center">
                    <button
                      className="button bg-gray-400 text-white rounded-md px-4 py-2 flex items-center cursor-not-allowed"
                      disabled
                    >
                      Full{" "}
                      <span className="padlock-icon ml-2 text-lg">
                        &#x1F512;
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={modalIsOpen}
        onClose={handleCloseModal}
        size="4xl"
        popup={true}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Book Appointment
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <TextInput
                    type="hidden"
                    id="patientId"
                    name="patientId"
                    value={formData._id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                  />
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <TextInput
                      id="name"
                      type="text"
                      value={formData.name || ""}
                      placeholder="Enter your name"
                      required={true}
                      class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <TextInput
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail || ""}
                      placeholder="Enter your email"
                      required={true}
                      class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <TextInput
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone || ""}
                        placeholder="Enter your phone number"
                        required={true}
                        class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="identification">NIC</Label>
                      <TextInput
                        id="identification"
                        type="text"
                        value={formData.identification || ""}
                        placeholder="Enter your NIC"
                        required={true}
                        readOnly
                        class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <TextInput
                      id="address"
                      type="text"
                      value={formData.address || ""}
                      placeholder="Enter your address"
                      required={true}
                      class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="mb-4">
                <h4 className="text-base font-semibold mb-2">
                  Appointment Details
                </h4>
                {selectedSession && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Label className="font-semibold">Date:</Label>
                      </div>
                      <p>
                        {new Date(selectedSession.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Label className="font-semibold">
                          Estimated TimeSlot:
                        </Label>
                      </div>
                      <p>{selectedSession.time.split(" - ")[0]}</p>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Label className="font-semibold">Doctor:</Label>
                      </div>
                      <p>{doctor.doctorDetails.Name}</p>
                    </div>
                  </div>
                )}
              </div>
              <br />
              <br />
              <br />
              <h4 className="text-base font-semibold mb-2">Payment Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Label className="font-semibold">Doctor fee:</Label>
                  </div>
                  <p className="text-gray-600">
                    Rs {doctor.doctorDetails.consultationFee.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Label className="font-semibold">Hospital fee:</Label>
                  </div>
                  <p className="text-gray-600">Rs {hospitlFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Label className="font-semibold">eChannelling fee:</Label>
                  </div>
                  <p className="text-gray-600">Rs {eChannellingFee}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Label className="font-semibold">Total fee:</Label>
                  </div>
                  <p className="text-blue-600 text-lg">
                    Rs {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-between">
            <button
              onClick={handleCloseModal}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 mr-2"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleUpdatePatientDetails();
                handlePayToBook();
              }}
              className="bg-green-500 hover:bg-green-600 text-white focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg text-sm font-medium px-5 py-2.5"
            >
              Pay to Book
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      <PaymentForm totalAmount={totalAmount} onPayment={handlePayment} />

      <Modal
        show={paymentStatus == "success"}
        onClose={() => setPaymentStatus(null)}
        size="md"
        popup={true}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900">
              Payment Successful
            </h3>
            <p>Your appointment has been booked successfully.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setPaymentStatus(null)}
            className="bg-green-500 hover:bg-green-600 text-white focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg text-sm font-medium px-5 py-2.5"
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={paymentStatus == "failed"}
        onClose={() => setPaymentStatus(null)}
        size="md"
        popup={true}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900">
              Payment Failed
            </h3>
            <p>Your payment was unsuccessful. Please try again later.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setPaymentStatus(null)}
            className="bg-red-500 hover:bg-red-600 text-white focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-sm font-medium px-5 py-2.5"
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default DoctorProfile;
