import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, TextInput, Button, Modal } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp, HiOutlineExclamationCircle } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { format } from "date-fns";
import { BiCapsule } from "react-icons/bi";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
export default function DashDoctorsOrdersPrecriptions() {
  const [orders, setOrders] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const prescriptionOrdersPerPage = 5;
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [OrderIdToDelete, setOrderIdToDelete] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [totalRejectedOrders, setTotalRejectedOrders] = useState(0);
  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/prescriptionOrder/getPrescriptionOrder`);
      const data = await res.json();
      if (res.ok) {
        const filteredOrders = data.prescriptionOrders.filter(
          (order) =>
            order.doctorId.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.patientId.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
        setTotalOrders(data.totalOrders);
        setTotalCompletedOrders(data.totalCompletedOrders);
        setTotalPendingOrders(data.totalPendingOrders);
        setTotalRejectedOrders(data.totalRejectedOrders);
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/prescriptionOrder/getPrescriptionOrder`);
        const data = await res.json();
        if (res.ok) {
          const filteredOrders = data.prescriptionOrders.filter(
            (order) =>
              order.doctorId.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.patientId.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
          setTotalOrders(data.totalOrders);
          setTotalCompletedOrders(data.totalCompletedOrders);
          setTotalPendingOrders(data.totalPendingOrders);
          setTotalRejectedOrders(data.totalRejectedOrders);
          setOrders(filteredOrders);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.isPharmacist) {
      fetchOrders();
    }
  }, [currentUser._id, searchTerm]);

  const pageCount = Math.ceil(orders.length / prescriptionOrdersPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
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

  const displayPrescriptionOrders = orders
    .slice(
      pageNumber * prescriptionOrdersPerPage,
      (pageNumber + 1) * prescriptionOrdersPerPage
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
          <Table.Cell>{order.patientId.name}</Table.Cell>
          <Table.Cell>{order.patientId.contactPhone}</Table.Cell>
          <Table.Cell>{order.patientId.contactEmail}</Table.Cell>
          <Table.Cell>{order.doctorId.username}</Table.Cell>
          <Table.Cell>{order.prescriptions.length}</Table.Cell>
          <Table.Cell>
            <span style={{ color: getStatusColor(order.status) }}>
              {order.status}
            </span>
          </Table.Cell>
          <Table.Cell>
          {order.status === "Pending" && (
              <Link
                to={`/dashboard?tab=Dispence&id=${order._id}`}
                style={{ color: "green" }}
              >
                Dispense
              </Link>
            )}
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

  const handleOrderDelete = async () => {
    try {
      const res = await fetch(
        `/api/prescriptionOrder/deletePrescriptionOrder/${OrderIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        const updatedOrders = orders.filter(
          (order) => order._id !== OrderIdToDelete
        );
        toast.success("Order deleted successfully");
        fetchOrders();
        setOrders(updatedOrders);
        setShowModal(false);
      }
    } catch (error) {
      console.log(error);
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
                  Total Prescriptions
                </h3>
                <p className="text-2xl">{totalOrders}</p>
              </div>
              <BiCapsule className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  Pending Prescriptions
                </h3>
                <p className="text-2xl">{totalPendingOrders}</p>
              </div>
              <BiCapsule className="bg-yellow-600 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  Completed Prescriptions
                </h3>
                <p className="text-2xl">{totalCompletedOrders}</p>
              </div>
              <BiCapsule className="bg-green-600 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  Rejected Prescriptions
                </h3>
                <p className="text-2xl">{totalRejectedOrders}</p>
              </div>
              <BiCapsule className="bg-red-600 text-white rounded-full text-5xl p-3 shadow-lg" />
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
            placeholder="Select Doctor"
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
          <Select
            className="ml-4"
            placeholder="Select Date"
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
          <Button outline gradientDuoTone="greenToBlue" className=" ml-4">
            Download Prescription Order Report
          </Button>
        </div>
      </div>

      {orders.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Patient Name</Table.HeadCell>
              <Table.HeadCell>Contact Number</Table.HeadCell>
              <Table.HeadCell>Contact Email</Table.HeadCell>
              <Table.HeadCell>Doctor</Table.HeadCell>
              <Table.HeadCell>No of Prescriptions</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            {displayPrescriptionOrders}
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
        <p>No prescription Orders found</p>
      )}
      {/** Delete Order Modal */}
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
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this Order?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleOrderDelete}>
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
