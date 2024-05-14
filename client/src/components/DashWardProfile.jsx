import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
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

export default function DashWardProfile() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const tab = queryParams.get("tab");
  const id = queryParams.get("wardId");
  const { currentUser } = useSelector((state) => state.user);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ward, setWard] = useState({});
  const fetchWard = async () => {
    try {
      const res = await fetch(`/api/ward/getWard/${id}`);
      const data = await res.json();
      setWard(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  console.log(id);
  useEffect(() => {
    const fetchWard = async () => {
      try {
        const res = await fetch(`/api/ward/getWardId/${id}`);
        const data = await res.json();
        setWard(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    if (currentUser.isDoctor || currentUser.isHeadNurse) {
      fetchWard();
    }
  }, [currentUser._id]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <a href="dashboard?tab=DoctorInpatient">
        <Button outline gradientDuoTone="purpleToPink" className="mb-5">
          Go Back
        </Button>
      </a>
      <div className="flex mb-2">
        <h1 className="text-3xl font-bold mb-4 "></h1>
      </div>
      <div className="bg-white shadow-md rounded-md p-6 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Ward Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Ward Name</p>
              <p className="font-semibold">{ward.WardName}</p>
            </div>
            <div>
              <p className="text-gray-600">Ward Capacity</p>
              <p className="font-semibold">{ward.WardCapacity}</p>
            </div>
            <div>
              <p className="text-gray-600">Ward Type</p>
              <p className="font-semibold">{ward.WardType}</p>
            </div>
            <div>
              <p className="text-gray-600">Doctor Incahrged</p>
              <p className="font-semibold">{ward.doctorName}</p>
            </div>
            <div>
              <p className="text-gray-600">Nurse Incharged</p>
              <p className="font-semibold">{ward.nurseName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-2">
          <h1 className="text-3xl font-bold mb-4 ">Bed Details</h1>
        </div>
        <div className="">
          <div className="mb-4">
            <div className="flex items-center">
              <div className="flex ml-4"></div>
            </div>
            {ward.beds.length > 0 ? (
              <>
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Bed Number</Table.HeadCell>
                    <Table.HeadCell>Date of Addmission</Table.HeadCell>
                    <Table.HeadCell>Patient Name</Table.HeadCell>
                    <Table.HeadCell>Patient Phone</Table.HeadCell>
                    <Table.HeadCell>Bed Status</Table.HeadCell>
                    <Table.HeadCell>View Patient Details</Table.HeadCell>
                  </Table.Head>
                  {ward.beds.map((beds) => (
                    <Table.Body className="divide-y" key={beds._id}>
                      <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                        <Table.Cell>{beds.number}</Table.Cell>
                        {beds.patient ? ( // Check if a patient is assigned to the bed
                          <>
                            <Table.Cell>
                              {new Date(
                                beds.patient.admissionDate
                              ).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>{beds.patient.name}</Table.Cell>
                            <Table.Cell>{beds.patient.contactPhone}</Table.Cell>
                          </>
                        ) : (
                          // If no patient is assigned, render empty cells
                          <>
                            <Table.Cell>No Patient Assigned</Table.Cell>
                            <Table.Cell>No Patient Assigned</Table.Cell>
                            <Table.Cell>No Patient Assigned</Table.Cell>
                          </>
                        )}
                        <Table.Cell
                          className={`${
                            beds.isAvailable ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {beds.isAvailable ? "Available" : "Occupied"}
                        </Table.Cell>
                        <Table.Cell>
                          {beds.patient ? (
                            <Link
                              to={`/dashboard?tab=InpatientProfile&id=${beds.patient._id}`}
                            >
                              <HiEye className="text-blue-500 cursor-pointer" />
                            </Link>
                          ) : (
                            // Render "No Patient Assigned" if no patient is assigned
                            <span className="text-gray-500">
                              No Patient Assigned
                            </span>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  ))}
                </Table>
              </>
            ) : (
              <p>Ward Does not Have Beds</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
