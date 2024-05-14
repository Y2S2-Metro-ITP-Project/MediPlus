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
import {
  faHeartbeat,
  faThermometerHalf,
  faTint,
} from "@fortawesome/free-solid-svg-icons";
import { set } from "mongoose";
export default function DashMedicineDispence() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const tab = queryParams.get("tab");
  const id = queryParams.get("id");
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [patient, setPatient] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `/api/prescriptionOrder/getPrescriptionPatientOrder/${id}`
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
          setLoading(false);
        }
        setOrders(data.prescriptionOrders);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    if (currentUser.isPharmacist) {
      fetchOrders();
    }
  }, [currentUser._id]);
  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(orders);
  const formatDateOfBirth = (dateOfBirth) => {
    const date = new Date(dateOfBirth);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  const handleDeletePrescription = async (prescriptionId) => {
    try {
      const res = await fetch(
        `/api/prescription/deletePrescription/${prescriptionId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        toast.success("Prescription Deleted Successfully");
        setPrescriptions((prev) =>
          prev.filter((prescription) => prescription._id !== prescriptionId)
        );
      } else {
        toast.error("Failed to Delete Prescription");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOrderConfirmation = async () => {
    try {
      const res = await fetch(
        `/api/prescriptionOrder/confirmPrescriptionOrder/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalPayment: totalPrice1 }),
        }
      );
      if (res.ok) {
        if (orders.patientId.patientType == "Outpatient") {
          toast.success("Order Confirmed Successfully");
          window.location.href =
            "http://localhost:5173/dashboard?tab=orderPrescritions";
        }else if(orders.patientId.patientType="Inpatient"){
          toast.success("Order Confirmed Successfully");
          window.location.href =
            "http://localhost:5173/dashboard?tab=DoctorOrderIn";
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOrderRejection = async () => {
    try {
      const res = await fetch(
        `/api/prescriptionOrder/rejectPrescriptionOrder/${id}`
      );
      if (res.ok) {
        toast.success("Order Rejected Successfully");
        window.location.href =
          "http://localhost:5173/dashboard?tab=orderPrescritions";
      }
    } catch (error) {
      console.log(error);
    }
  };
  let totalPrice1 = 0;

  orders.prescriptions.forEach((prescription) => {
    let itemPrice = prescription.itemId.itemPrice;
    let dosage = prescription.dosage;
    totalPrice1 += itemPrice * dosage;
  });
  console.log(orders.patientId.address);
  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      {orders.patientId.patientType == "Outpatient" ? (
        <a href="dashboard?tab=orderPrescritions">
          <Button outline gradientDuoTone="purpleToPink" className="mb-5">
            Go Back
          </Button>
        </a>
      ) : (
        <a href="dashboard?tab=DoctorOrderIn">
          <Button outline gradientDuoTone="purpleToPink" className="mb-5">
            Go Back
          </Button>
        </a>
      )}
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 ">
          {orders.patientId.name} Prescription Order
        </h1>
      </div>
      <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <div className="mb-4 flex items-center">
            <p className="text-gray-600 mr-4">Patient Profile</p>
            <img
              src={orders.patientId.patientProfilePicture}
              alt="Patient"
              className="h-20 w-20 rounded-full border-2 border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{orders.patientId.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-semibold">{orders.patientId.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-semibold">
                {formatDateOfBirth(orders.patientId.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Phone</p>
              <p className="font-semibold">
                {orders.patientId.contactPhone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Identification</p>
              <p className="font-semibold">
                {orders.patientId.identification || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact Email</p>
              <p className="font-semibold">
                {orders.patientId.contactEmail || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">
                {orders.patientId.address || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-red-600">Emergency Contact Name</p>
              <p className="font-semibold">
                {orders.patientId.emergencyContact
                  ? orders.patientId.emergencyContact.name
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-red-600">Emergency Contact Phone</p>
              <p className="font-semibold">
                {orders.patientId.emergencyContact
                  ? orders.patientId.emergencyContact.phoneNumber
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Patient Prescriptions</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <div className="flex ml-4"></div>
            </div>
            {orders.prescriptions.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Medicine</Table.HeadCell>
                    <Table.HeadCell>Quantity</Table.HeadCell>
                    <Table.HeadCell>Price per Unit</Table.HeadCell>
                    <Table.HeadCell>Total Price</Table.HeadCell>
                    <Table.HeadCell>Stock Level</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  {orders.prescriptions.map((prescription) => (
                    <Table.Body className="divide-y" key={prescription._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>{prescription.itemId.itemName}</Table.Cell>
                        <Table.Cell>{prescription.dosage}</Table.Cell>
                        <Table.Cell>{prescription.itemId.itemPrice}</Table.Cell>
                        <Table.Cell>
                          {prescription.itemId.itemPrice * prescription.dosage}
                        </Table.Cell>
                        <Table.Cell>
                          {prescription.itemId.itemQuantity >
                          prescription.dosage ? (
                            <span className="font-bold text-green-500">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-red-500">Out of Stock</span>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className="font-medium text-red-500 hover:underline cursor-pointer"
                            onClick={() => {
                              handleDeletePrescription(prescription._id);
                            }}
                          >
                            Delete
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
                </Table>
              </>
            ) : (
              <p>Patient Has No recorded Diagnosis</p>
            )}
          </div>
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800 flex items-center flex-col">
              {" "}
              {/* Changed flex direction to column */}
              <h1 className="mb-2 font-semibold">Total Price:</h1>
              <span className="font-bold text-xl mb-4">
                {totalPrice1} LKR
              </span>{" "}
              {/* Replace with actual total price */}
              <div className="flex">
                <Button
                  className="mr-5"
                  gradientDuoTone="greenToBlue"
                  outline
                  onClick={() => handleOrderConfirmation()}
                >
                  Confirm
                </Button>
                <Button
                  gradientDuoTone="purpleToPink"
                  outline
                  onClick={() => handleOrderRejection()}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
