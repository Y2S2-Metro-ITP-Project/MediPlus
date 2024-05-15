import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Checkbox,
  Accordion,
  Card,
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
    console.log("Total Amount:", totalAmount);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      if (!selectedSession || !formData._id) {
        throw new Error("No session or patient selected");
      }

      const response = await fetch(`/api/booking/pendingStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedSession._id,
          status: "Pending Payment",
          patientId: formData._id, // Include patientId in the request body
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      // Open the payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(
        "An error occurred while updating booking status. Please try again."
      );
    }
  };

  const handlePaymentSubmit = async (cardDetails) => {
    try {
      
      const response = await fetch("/api/payment/submitPayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: formData._id,
          patientName: formData.name,
          patientEmail: formData.contactEmail,
          OrderType: "Consultation",
          totalPayment: totalAmount,
          paymentType: "Card",
          status: "Completed",
          cardDetails,
          bookingId: selectedSession._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit payment");
      }

      // Payment successful
      setShowPaymentModal(false);
      setModalIsOpen(false);
      setPaymentStatus("success");
      toast.success("Payment successful!");
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error(
        "An error occurred while submitting payment. Please try again."
      );
    }
  };

  useEffect(() => {
    console.log("DoctorProfile doctor:", doctor);
    console.log("user:", user?._id);
    if (doctor && doctor.doctorDetails && doctor.doctorDetails.userId) {
      fetchBookings(doctor.doctorDetails.userId);
    }
  }, [doctor]);

  const handleClosewithSessionModal = () => {
    setModalIsOpen(false);
    setSelectedSession(null);
    setFormData({});
    setPaymentStatus(null);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
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
      toast.success("Patient details updated successfully");
    } catch (error) {
      console.error("Error updating patient details:", error);
      toast.error(
        "An error occurred while updating patient details. Please try again."
      );
    }
  };

  const groupedSessions = groupSessionsByDateAndTime();

  const PaymentModal = ({ show, onClose, onSubmit, totalAmount }) => {
    const [cardDetails, setCardDetails] = useState({
      cardNumber: "1234567890123456", // Dummy card number
      expiryDate: "05/25", // Dummy expiry date
      cvv: "123", // Dummy CVV
    });
    const [errors, setErrors] = useState({});
  
    const handleSubmit = (e) => {
      e.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length === 0) {
        onSubmit(cardDetails);
      } else {
        setErrors(errors);
      }
    };
  
    const validateForm = () => {
      const errors = {};
  
      // Validate card number
      const cardNumberRegex = /^[0-9]{16}$/;
      if (!cardNumberRegex.test(cardDetails.cardNumber)) {
        errors.cardNumber = "Please enter a valid 16-digit card number.";
      }
  
      // Validate expiry date
      const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryDateRegex.test(cardDetails.expiryDate)) {
        errors.expiryDate = "Please enter a valid expiry date in the format MM/YY.";
      }
  
      // Validate CVV
      const cvvRegex = /^[0-9]{3}$/;
      if (!cvvRegex.test(cardDetails.cvv)) {
        errors.cvv = "Please enter a valid 3-digit CVV.";
      }
  
      return errors;
    };
  
    return (
      <Modal show={show} onClose={onClose} size="md" popup={true}>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900">
              Payment Details (Total: Rs {totalAmount?.toFixed(2) || 0})
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="cardNumber">Card Number</Label>
                <TextInput
                  id="cardNumber"
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                  }
                  required
                  helperText={errors.cardNumber}
                  color={errors.cardNumber ? "failure" : "gray"}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <TextInput
                  id="expiryDate"
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                  }
                  required
                  helperText={errors.expiryDate}
                  color={errors.expiryDate ? "failure" : "gray"}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="cvv">CVV</Label>
                <TextInput
                  id="cvv"
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value })
                  }
                  required
                  helperText={errors.cvv}
                  color={errors.cvv ? "failure" : "gray"}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Submit Payment</Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <div className="doctor-profile-container bg-white rounded-lg shadow-lg p-6">
      <div className="doctor-profile-header flex justify-between items-center mb-5">
        <div className="flex items-center">
          <img
            src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
            alt={`Dr. ${doctor.doctorDetails.Name}`}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dr. {doctor.doctorDetails.Name}
            </h2>
            <p className="text-gray-600">
              {doctor.doctorDetails.specialization}
            </p>
          </div>
        </div>
        <button
          className="back-button bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      <div className="doctor-profile-content">
        <Accordion flush>
          <Accordion.Panel>
            <Accordion.Title>About the Doctor</Accordion.Title>
            <Accordion.Content>
              <p className="text-gray-600">
                {doctor.doctorDetails.about ||
                  "No additional information available."}
              </p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Availability</Accordion.Title>
            <Accordion.Content>
              <div className="doctor-profile-content flex-1 overflow-y-auto">
                {Object.entries(groupedSessions).map(([key, bookings]) => (
                  <div key={key} className="booking-date mb-4">
                    <h3 className="text-lg font-semibold">{key}</h3>
                    <div className="session border border-gray-300 rounded-lg p-4">
                      <div className="session-details flex justify-between">
                        <div>
                          <p>
                            {bookings[0].time.includes("AM")
                              ? "Morning"
                              : "Evening"}
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
                          <p>Type:</p>
                          <p>
                            {bookings[0].type}
                          </p>
                        </div>
                        <div>
                          <p>Channelling Fee</p>
                          <p className="text-green-500">
                            Rs.{doctor.doctorDetails.consultationFee} + Booking
                            Fee
                          </p>
                        </div>
                        {bookings.some(
                          (session) => session.status === "Not Booked"
                        ) ? (
                          <button
                            className="button bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 transition-colors"
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
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
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
                      class="border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p.5"
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
                handlePayToBook();
              }}
              className="bg-green-500 hover:bg-green-600 text-white focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg text-sm font-medium px-5 py-2.5"
            >
              Pay to Book
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
      />

      <Modal
        show={paymentStatus === "success"}
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
        show={paymentStatus === "failed"}
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
