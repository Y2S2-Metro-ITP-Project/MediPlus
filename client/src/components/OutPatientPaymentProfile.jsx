import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  Button,
  Label,
  Modal,
  Table,
  TableCell,
  TextInput,
  Textarea,
} from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { set } from "mongoose";

export default function OutPatientPaymentProfile() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const tab = queryParams.get("tab");
  const id = queryParams.get("id");
  const { currentUser } = useSelector((state) => state.user);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formdata, setFormData] = useState({});
  const [showRejectModal, setRejectModal] = useState(false);
  const onChangePaymentType = (selectedOption) => {
    setFormData({ ...formdata, paymentType: selectedOption.value });
  };
  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `/api/paymentOrder/getSpecificPaymentOrder/${id}`
      );
      const data = await res.json();
      setPaymentOrder(data);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.log(error);
      setLoading(false); // Set loading to false in case of an error
    }
  };
  console.log(formdata);
  const handleReject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/paymentOrder/rejectPayment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Rejected" }),
      });
      if (!res.ok) {
        throw new Error("Failed to reject payment");
      }
      const data = await res.json();
      toast.success("Payment Rejected Successfully");
      setShowModal(false);
      setFormData({});
      setRejectModal(false);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to reject payment");
    }
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/paymentOrder/updatePayment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      if (!res.ok) {
        throw new Error("Failed to add payment");
      }
      const data = await res.json();
      toast.success("Payment Added Successfully");
      setShowModal(false);
      setFormData({});
      fetchOrders();
    } catch (error) {
      toast.error("Failed to add payment");
    }
  };
  const formatDateOfBirth = (dateOfBirth) => {
    const date = new Date(dateOfBirth);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Completed":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "black";
    }
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `/api/paymentOrder/getSpecificPaymentOrder/${id}`
        );
        const data = await res.json();
        setPaymentOrder(data);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.log(error);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    // Only fetch orders if user is admin and cashier
    if (currentUser.isAdmin && currentUser.isCashier) {
      fetchOrders();
    }
    fetchOrders();
  }, [currentUser._id]);
  if (loading) {
    return <div>Loading...</div>;
  }
  const totalPayment = paymentOrder.Payment.reduce(
    (total, payment) => total + payment.totalPayment,
    0
  );
  const handleGenerateInvoice = async () => {
    try {
      const res = await fetch(
        `/api/paymentOrder/generateInvoice/${paymentOrder._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${paymentOrder.date}-${paymentOrder.PatientName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {}
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <a href="dashboard?tab=OutPatientBilling">
        <Button outline gradientDuoTone="purpleToPink" className="mb-5">
          Go Back
        </Button>
      </a>
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">
          {paymentOrder.PatientName} Payment Order Profile
        </h1>
      </div>
      <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <div className="mb-4 flex items-center">
            <p className="text-gray-600 mr-4">Patient Profile</p>
            <img
              src={paymentOrder.PatientID.patientProfilePicture}
              alt="Patient"
              className="h-20 w-20 rounded-full border-2 border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{paymentOrder.PatientName}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-semibold">{paymentOrder.PatientID.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-semibold">
                {formatDateOfBirth(paymentOrder.PatientID.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Email</p>
              <p className="font-semibold">
                {paymentOrder.PatientID.contactEmail}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Identification</p>
              <p className="font-semibold">
                {paymentOrder.PatientID.identification}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Phone</p>
              <p className="font-semibold">
                {paymentOrder.PatientID.contactPhone}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">{paymentOrder.PatientID.address}</p>
            </div>
            <div>
              <p className="text-red-600">Emergency Contact Name</p>
              <p className="font-semibold">
                {paymentOrder.PatientID.emergencyContact.name}
              </p>
            </div>
            <div>
              <p className="text-red-600">Emergency Phone</p>
              <p className="font-semibold">
                {paymentOrder.PatientID.emergencyContact.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Orders</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <div className="flex ml-4"></div>
            </div>
            {paymentOrder.Payment.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Order Type</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Payment Type</Table.HeadCell>
                    <Table.HeadCell>Price</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  {paymentOrder.Payment.map((payment) => (
                    <Table.Body className="divide-y" key={payment._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>
                          {formatDateOfBirth(payment.dateAndTime)}
                        </Table.Cell>
                        <Table.Cell>{payment.OrderType}</Table.Cell>
                        <Table.Cell>
                          <span
                            style={{ color: getStatusColor(payment.status) }}
                          >
                            {payment.status}
                          </span>
                        </Table.Cell>
                        <Table.Cell>{payment.paymentType}</Table.Cell>
                        <Table.Cell>{payment.totalPayment}</Table.Cell>
                        <Table.Cell>
                          <span className="font-medium text-red-500 hover:underline cursor-pointer">
                            Delete
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
                </Table>
              </>
            ) : (
              <p>Patient Has No recorded Payment Records</p>
            )}
          </div>
          {paymentOrder.status === "Pending" && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800 flex items-center flex-col">
                {/* Changed flex direction to column */}
                <h1 className="mb-2 font-semibold">Total Price:</h1>
                <span className="font-bold text-xl mb-4">
                  {totalPayment} LKR
                </span>{" "}
                {/* Replace with actual total price */}
                <div className="flex">
                  <Button
                    className="mr-5"
                    gradientDuoTone="greenToBlue"
                    outline
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    className="mr-5"
                    gradientDuoTone="greenToBlue"
                    outline
                    onClick={() => {
                      handleGenerateInvoice();
                    }}
                  >
                    Generate Invoice
                  </Button>
                  <Button
                    gradientDuoTone="purpleToPink"
                    outline
                    onClick={() => {
                      setRejectModal(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
          {paymentOrder.status === "Completed" && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800 flex items-center flex-col">
                {/* Changed flex direction to column */}
                <h1 className="mb-2 font-semibold text-green-600">Completed</h1>
                <h1 className="mb-2 font-semibold">Total Price:</h1>
                <span className="font-bold text-xl mb-4">
                  {totalPayment} LKR
                </span>{" "}
                {/* Replace with actual total price */}
                <div className="flex">
                  <Button
                    className="mr-5"
                    gradientDuoTone="greenToBlue"
                    outline
                    onClick={() => {
                      handleGenerateInvoice();
                    }}
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}
          {paymentOrder.status === "Rejected" && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800 flex items-center flex-col">
                {/* Changed flex direction to column */}
                <h1 className="mb-2 font-semibold text-red-600">Rejected</h1>
                <h1 className="mb-2 font-semibold">Total Price:</h1>
                <span className="font-bold text-xl mb-4">
                  {totalPayment} LKR
                </span>{" "}
                {/* Replace with actual total price */}
                <div className="flex">
                  <Button
                    className="mr-5"
                    gradientDuoTone="greenToBlue"
                    outline
                    onClick={() => {
                      handleGenerateInvoice();
                    }}
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal
          show={showModal}
          onClose={() => {
            setShowModal(false), setFormData({});
          }}
          popup
          size="lg"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                Add Payment Type
              </h3>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="temperature">Select Payment Type</Label>
                  <Select
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "Card", label: "Card" },
                      { value: "Insurance", label: "Insurance" },
                    ]}
                    onChange={onChangePaymentType}
                  />
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <Button color="blue" type="submit" outline>
                  Submit
                </Button>
                <Button
                  className="ml-4"
                  color="red"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
        {/** Reject Modal */}
        <Modal
          show={showRejectModal}
          onClose={() => setRejectModal(false)}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
              <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
                Are you sure you want to reject this Order?{" "}
                <p className="text-red-500 font-bold">
                  This action cannot be undone
                </p>
              </h3>
            </div>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleReject}>
                Yes,I am sure
              </Button>
              <Button color="gray" onClick={() => setRejectModal(false)}>
                No,cancel
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
