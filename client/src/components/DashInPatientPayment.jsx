import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, TextInput, Button, Modal } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiEye,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { format } from "date-fns";
import { BiCapsule } from "react-icons/bi";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { IoReceiptOutline } from "react-icons/io5";
import { set } from "mongoose";

export default function DashInPatientPayment() {
  const [paymentOrders, setPaymentOrders] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPaymentOrders, setTotalPaymentOrders] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);
  const paymentOrdersPerPage = 5;
  const [totalPaymentOrdersLastMonth, setTotalPaymentOrdersLastMonth] =
    useState(0);
  const [
    totalPaymentOrderRejectionLastMonth,
    setTotalPaymentOrderRejectionLastMonth,
  ] = useState(0);
  const [
    totalPaymentOrdersCompletedLastMonth,
    setTotalPaymentOrdersCompletedLastMonth,
  ] = useState(0);
  const [completedPaymentOrder, setCompletedPaymentOrder] = useState([]);
  const [rejectedPaymentOrder, setRejectedPaymentOrder] = useState([]);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState([]);
  const [showWardModal, setShowWardModal] = useState(false);
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
  const fetchPaymentOrders = async () => {
    try {
      const res = await fetch(`/api/paymentOrder/getInPaymentOrder`);
      const data = await res.json();
      if (res.ok) {
        const filteredOrders = data.paymentOrders.filter((order) =>
          order.PatientName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const uniqueDates = [
          ...new Set(
            data.paymentOrders.map((orders) =>
              format(new Date(orders.date), "MMMM dd, yyyy")
            )
          ),
        ];
        setDates(uniqueDates);
        setPaymentOrders(filteredOrders);
        setTotalPaymentOrders(data.totalPaymentOrders);
        setTotalPaymentOrdersLastMonth(data.totalPaymentOrdersLastMonth);
        setTotalPaymentOrderRejectionLastMonth(
          data.totalPaymentOrderRejectionLastMonth
        );
        setTotalPaymentOrdersCompletedLastMonth(
          data.totalPaymentOrdersCompletedLastMonth
        );
        setCompletedPaymentOrder(data.completedPaymentOrder);
        setRejectedPaymentOrder(data.rejectedPaymentOrder);
        setPendingPaymentOrder(data.pendingPaymentOrder);
      }
    } catch (error) {
      toast.error("Failed to fetch payment orders");
    }
  };
  useEffect(() => {
    const fetchPaymentOrders = async () => {
      try {
        const res = await fetch(`/api/paymentOrder/getInPaymentOrder`);
        const data = await res.json();
        if (res.ok) {
          const filteredOrders = data.paymentOrders.filter((order) =>
            order.PatientName.toLowerCase().includes(searchTerm.toLowerCase())
          );

          const uniqueDates = [
            ...new Set(
              data.paymentOrders.map((orders) =>
                format(new Date(orders.date), "MMMM dd, yyyy")
              )
            ),
          ];
          setDates(uniqueDates);
          setPaymentOrders(filteredOrders);
          setTotalPaymentOrders(data.totalPaymentOrders);
          setTotalPaymentOrdersLastMonth(data.totalPaymentOrdersLastMonth);
          setTotalPaymentOrderRejectionLastMonth(
            data.totalPaymentOrderRejectionLastMonth
          );
          setTotalPaymentOrdersCompletedLastMonth(
            data.totalPaymentOrdersCompletedLastMonth
          );
          setCompletedPaymentOrder(data.completedPaymentOrder);
          setRejectedPaymentOrder(data.rejectedPaymentOrder);
          setPendingPaymentOrder(data.pendingPaymentOrder);
        }
      } catch (error) {}
    };
    if (currentUser.isAdmin || currentUser.isCashier) {
      fetchPaymentOrders();
    }
  }, [currentUser._id, searchTerm]);
  const [ward, setWard] = useState([{}]);
  const handleWardToshow = (order) => {
    setWard(order);
  };
  console.log(ward);
  const pageCount = Math.ceil(paymentOrders.length / paymentOrdersPerPage);
  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayPaymentOrders = paymentOrders
    .slice(
      pageNumber * paymentOrdersPerPage,
      (pageNumber + 1) * paymentOrdersPerPage
    )
    .map((order) => (
      <Table.Body className="divide-y" key={order._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            {new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Table.Cell>
          <Table.Cell>{order.PatientName}</Table.Cell>
          <Table.Cell
            style={{ color: order.patient[0].dicharged ? "green" : "red" }}
          >
            {order.patient[0].dicharged ? "Yes" : "No"}
          </Table.Cell>
          <Table.Cell>{order.patient[0].contactPhone}</Table.Cell>
          <Table.Cell>
            {!order.patient[0].dicharged ? (
              <HiEye
                className="text-blue-500 cursor-pointer"
                onClick={() => {
                  setShowModal(true), handleWardToshow(order);
                }}
              />
            ) : (
              <span className="text-red-500">Patient Discharged</span>
            )}
          </Table.Cell>
          <Table.Cell>{order.Payment.length}</Table.Cell>
          <Table.Cell>
            <span style={{ color: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </Table.Cell>
          <Table.Cell>
            <Link
              to={`/dashboard?tab=OutPatientPaymentProfile&id=${order._id}`}
            >
              <HiEye className="text-blue-500 cursor-pointer" />
            </Link>
          </Table.Cell>
          <Table.Cell>
            <span
              onClick={() => {
                setShowModal(true);
                setOrderIdToDelete(order._id);
              }}
              className="font-medium text-red-500 hover:underline cursor-pointer ml-4"
            >
              Delete
            </span>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));
  const handleDateChange = (selectedOption) => {
    setSelectedDate(selectedOption);
  };
  console.log(selectedDate);
  const handleDownloadReport = async () => {
    try {
      const res = await fetch(`/api/paymentOrder/downloadInPaymentReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedDate.value}-Payment-Report`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download report");
    }
  };
  const handlePaymentOrderDelete = async () => {
    try {
      const res = await fetch(
        `/api/paymentOrder/deletePaymentOrder/${orderIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete order");
      }
      const data = await res.json();
      if (res.ok) {
        toast.success("Order deleted successfully");
        setShowModal(false);
        fetchPaymentOrders();
      }
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Total Payment Orders
                </h3>
                <p className="text-2xl">{totalPaymentOrders}</p>
              </div>
              <IoReceiptOutline className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {totalPaymentOrdersLastMonth}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Pending Orders
                </h3>
                <p className="text-2xl">{pendingPaymentOrder}</p>
              </div>
              <IoReceiptOutline className="bg-yellow-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Completed Orders
                </h3>
                <p className="text-2xl">{completedPaymentOrder}</p>
              </div>
              <IoReceiptOutline className="bg-green-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Rejected Orders
                </h3>
                <p className="text-2xl">{rejectedPaymentOrder}</p>
              </div>
              <IoReceiptOutline className="bg-red-600 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className=" flex items-center mb-2">
          <TextInput
            type="text"
            placeholder="Search by Doctor's Name or patients name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-96 md:w-96 lg:w-96 xl:w-96 2xl:w-96"
          />
          <Button className="w-5 h-5 lg:hidden ml-4" color="gray">
            <AiOutlineSearch />
          </Button>
          <Select
            className="ml-4"
            placeholder="Select Date"
            isSearchable
            isClearable
            onChange={handleDateChange}
            value={selectedDate}
            options={dates.map((date) => ({
              value: date,
              label: format(new Date(date), "MMMM dd, yyyy"),
            }))}
            styles={{
              control: (provided) => ({
                ...provided,
                width: "200px",
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "black",
              }),
            }}
          />
          <Select
            className="ml-4"
            placeholder="Select Patient"
            isSearchable
            isClearable
            styles={{
              control: (provided) => ({
                ...provided,
                width: "200px",
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "black",
              }),
            }}
          />
          <Button
            outline
            gradientDuoTone="greenToBlue"
            className=" ml-4"
            onClick={handleDownloadReport}
            disabled={!selectedDate}
          >
            Download Payment Order Report
          </Button>
        </div>
      </div>

      {paymentOrders.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Patient Name</Table.HeadCell>
              <Table.HeadCell>Discharge Status</Table.HeadCell>
              <Table.HeadCell>Contact Number</Table.HeadCell>
              <Table.HeadCell>Ward Details</Table.HeadCell>
              <Table.HeadCell>No of Payments</Table.HeadCell>
              <Table.HeadCell>Payment Status</Table.HeadCell>
              <Table.HeadCell>View Payments</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            {displayPaymentOrders}
          </Table>
          <div className="mt-9 center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName={"pagination flex justify-center"}
              previousLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              nextLinkClassName={
                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
              disabledClassName={"opacity-50 cursor-not-allowed"}
              activeClassName={"bg-indigo-500 text-white"}
            />
          </div>
        </>
      ) : (
        <p>No payment Orders found</p>
      )}
      {/** Delete Order Modal */}
      {ward && ward.bed && ward.ward && (
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
              <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                Ward and Bed Details
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ward.bed && (
                <div className="flex flex-col">
                  <label className="text-gray-600 dark:text-gray-400">
                    Bed Number:
                  </label>
                  <p>{ward.bed[0].number}</p>
                </div>
              )}
              {ward.ward && (
                <>
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-400">
                      Ward Name:
                    </label>
                    <p>{ward.ward[0].WardName}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-400">
                      Ward Type:
                    </label>
                    <p>{ward.ward[0].WardType}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-400">
                      Doctor Name:
                    </label>
                    <p>{ward.ward[0].doctorName}</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-400">
                      Nurse Name:
                    </label>
                    <p>{ward.ward[0].nurseName}</p>
                  </div>
                </>
              )}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
