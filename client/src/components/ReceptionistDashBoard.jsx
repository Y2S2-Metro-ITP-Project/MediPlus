import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaUserInjured } from "react-icons/fa";
import { FaCheck, FaTimes } from "react-icons/fa";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { Button, Table } from "flowbite-react";
import { Link } from "react-router-dom";
export default function ReceptionistDashBoard() {
  const [outPatients, setOutPatients] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [lastmonthOutPatients, setLastmonthOutPatients] = useState(0);
  const [lastmonthInquiries, setLastmonthInquiries] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchOutPatients = async () => {
      try {
        const res = await fetch(`/api/patient/getPatients?limit=10`);
        const data = await res.json();
        if (res.ok) {
          setOutPatients(data.patients);
          setTotalPatients(data.totalUser);
          setLastmonthOutPatients(data.lastMonthPatients);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const fetchInquiries = async () => {
      try {
        const res = await fetch(`/api/inquiry/getInquiries?limit=10`);
        const data = await res.json();
        if (res.ok) {
          setInquiries(data.inquiries);
          setTotalInquiries(data.totalInquiries);
          setLastmonthInquiries(data.lastMonthInquiries);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isReceptionist) {
      fetchOutPatients();
      fetchInquiries();
    }
  }, [currentUser]);
  return (
    <div className="p-3 md:mx-auto">
      <div className=" flex-wrap flex gap-4 justify-center">
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Out Patients
              </h3>
              <p className="text-2xl">{totalPatients}</p>
            </div>
            <FaUserInjured  className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              {lastmonthOutPatients}
            </span>
            <div className="text-gray-500">Last Month</div>
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Inquiries
              </h3>
              <p className="text-2xl">{totalInquiries}</p>
            </div>
            <HiAnnotation className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              {lastmonthInquiries}
            </span>
            <div className="text-gray-500">Last Month</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className=" flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Outpatients</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=patients"}>See all</Link>
            </Button>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Patient Name</Table.HeadCell>
              <Table.HeadCell>Patient Email</Table.HeadCell>
              <Table.HeadCell>Patient Phone</Table.HeadCell>
            </Table.Head>
            {outPatients &&
              outPatients.map((patient) => (
                <Table.Body key={patient._id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{patient.name}</Table.Cell>
                  <Table.Cell>{patient.contactEmail}</Table.Cell>
                  <Table.Cell>{patient.contactPhone}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className=" flex justify-between p-3 text-sm font-semibold">
            <h1 className="text-center p-2">Recent Inquiries</h1>
            <Button outline gradientDuoTone="purpleToPink">
              <Link to={"/dashboard?tab=inquiries"}>See all</Link>
            </Button>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Customer Name</Table.HeadCell>
              <Table.HeadCell>Customer Phone No</Table.HeadCell>
              <Table.HeadCell>Inquiry Status</Table.HeadCell>
            </Table.Head>
            {inquiries &&
              inquiries.map((inquiry) => (
                <Table.Body key={inquiry._id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{inquiry.name}</Table.Cell>
                  <Table.Cell>{inquiry.phone}</Table.Cell>
                  <Table.Cell>
                    {inquiry.isAnswer ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
          </Table>
        </div>
    </div>
    </div>
  );
}
