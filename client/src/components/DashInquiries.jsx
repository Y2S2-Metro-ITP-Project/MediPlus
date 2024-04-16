import {
  Button,
  ButtonGroup,
  Modal,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import ReactPaginate from "react-paginate";
export default function DashInquiries() {
  const { currentUser } = useSelector((state) => state.user);
  const [inquiries, setInquirires] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inquiryIdToDelete, setInquiryIdToDelete] = useState("");
  const [inquiryIdToReply, setInquiryIdToReply] = useState("");
  const [modalMessagePopUp, setModalMessagePopUp] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [filterOption, setFilterOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [lastmonthInquiries, setLastMonthInquiries] = useState(0);
  const [totalAnsweredInquiries, setTotalAnsweredInquiries] = useState(0);
  const [totalUnAnsweredInquiries, setTotalUnAnsweredInquiries] = useState(0);
  const [totalAnweredOneMonth, setTotalAnsweredOneMonth] = useState(0);
  const [totalUnAnsweredOneMonth, setTotalUnAnsweredOneMonth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inquiriesPerPage, setInquiriesPerPage] = useState(10);
  const fetchInquires = async () => {
    try {
      const res = await fetch(`/api/inquiry/getinquiries`);
      const data = await res.json();
      if (res.ok) {
        setInquirires(data.inquiries);
        setTotalInquiries(data.totalInquiries);
        setLastMonthInquiries(data.lastMonthInquiries);
        setTotalAnsweredInquiries(data.totalAnswered);
        setTotalUnAnsweredInquiries(data.totalNotAnswered);
        setTotalAnsweredOneMonth(data.totalAnsweredOneMonth);
        setTotalUnAnsweredOneMonth(data.totalNotAnsweredOneMonth);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchInquires = async () => {
      try {
        const res = await fetch(`/api/inquiry/getinquiries`);
        const data = await res.json();
        if (res.ok) {
          setInquirires(data.inquiries);
          setTotalInquiries(data.totalInquiries);
          setLastMonthInquiries(data.lastMonthInquiries);
          setTotalAnsweredInquiries(data.totalAnswered);
          setTotalUnAnsweredInquiries(data.totalNotAnswered);
          setTotalAnsweredOneMonth(data.totalAnsweredOneMonth);
          setTotalUnAnsweredOneMonth(data.totalNotAnsweredOneMonth);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin || currentUser.isReceptionist) {
      fetchInquires();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = inquiries.length;
    try {
      const res = await fetch(
        `/api/inquiry/getinquiries?&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setInquirires((prev) => [...prev, ...data.inquiries]);
        if (data.inquiries.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleInquiryDelete = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inquiry/delete/${inquiryIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        fetchInquires();
        setShowModal(false);
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleViewMessage = (message) => {
    setModalMessage(message);
    setModalMessagePopUp(true);
  };
  const handleViewReplyMessage = (reply) => {
    setModalMessage(reply);
    setModalMessagePopUp(true);
  };
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleFilterChange = async (e) => {
    e.preventDefault();
    const selectedOption = e.target.value;
    try {
      const res = await fetch(`/api/inquiry/filterInquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption: selectedOption }),
      });
      const data = await res.json();
      if (res.ok) {
        setInquirires(data);
      } else {
        setInquirires([]);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inquiry/update/${inquiryIdToReply}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchInquires();
        setShowReplyModal(false);
        toast.success("Reply Submitted Successfully");
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inquiry/searchInquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({});
        toast.success(data.message);
        setInquirires(data);
        console.log(data);
      } else {
        toast.error(data.error);
        setInquirires([]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleReset = async () => {
    setSearchTerm("");
    const res = await fetch(`/api/inquiry/getinquiries`);
    const data = await res.json();
    if (res.ok) {
      setInquirires(data.inquiries);
    }
  };

  {
    /** Pagination implementation */
  }
  const [pageNumber, setPageNumber] = useState(0);
  const InquiriesPerPage = 5;

  const pageCount = Math.ceil(inquiries.length / InquiriesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayInquires = inquiries
    .slice(pageNumber * InquiriesPerPage, (pageNumber + 1) * InquiriesPerPage)
    .map((inquiry) => (
      <Table.Body className="divide-y" key={inquiry._id}>
        <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
          <Table.Cell>
            {new Date(inquiry.createdAt).toLocaleDateString()}
          </Table.Cell>
          <Table.Cell>{inquiry.name}</Table.Cell>
          <Table.Cell>{inquiry.email}</Table.Cell>
          <Table.Cell>{inquiry.phone}</Table.Cell>
          <Table.Cell>
            <HiEye
              className="text-blue-500 cursor-pointer"
              onClick={() => handleViewMessage(inquiry.message)}
            />
          </Table.Cell>
          <Table.Cell>
            {inquiry.isAnswer ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </Table.Cell>
          <Table.Cell>
            {inquiry.isAnswer ? (
              <HiEye
                className="text-blue-500 cursor-pointer"
                onClick={() => handleViewReplyMessage(inquiry.reply)}
              />
            ) : (
              <p className="text-red-500">{inquiry.reply}</p>
            )}
          </Table.Cell>
          <Table.Cell>
            <Link className="text-teal-500 hover:underline">
              <span
                onClick={() => {
                  setShowReplyModal(true);
                  setInquiryIdToReply(inquiry._id);
                }}
              >
                Reply
              </span>
            </Link>
          </Table.Cell>
          <Table.Cell>
            <span
              onClick={() => {
                setShowModal(true);
                setInquiryIdToDelete(inquiry._id);
              }}
              className="font-medium text-red-500 hover:underline cursor-pointer"
            >
              Delete
            </span>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
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
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Completed Inquiries
                </h3>
                <p className="text-2xl">{totalAnsweredInquiries}</p>
              </div>
              <HiAnnotation className="bg-green-700 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {totalAnweredOneMonth}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Pending Inquiries
                </h3>
                <p className="text-2xl">{totalUnAnsweredInquiries}</p>
              </div>
              <HiAnnotation className="bg-red-700 text-white rounded-full text-5xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-500 flex items-center">
                <HiArrowNarrowUp className="w-5 h-5 text-green-500" />
                {totalUnAnsweredOneMonth}
              </span>
              <div className="text-gray-500">Last Month</div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <form onSubmit={handleSearch}>
            <TextInput
              type="text"
              placeholder="Search...."
              rightIcon={AiOutlineSearch}
              className="hidden lg:inline"
              id="search"
              onChange={onChange}
              style={{ width: "300px" }}
            />
            <Button className="w-12 h-10 lg:hidden" color="gray">
              <AiOutlineSearch />
            </Button>
          </form>
        </div>
        <Button
          className="w-200 h-10 ml-4 lg:ml-0 lg:w-32"
          color="gray"
          onClick={() => handleReset()}
        >
          Reset
        </Button>
        <select
          id="filter"
          onChange={handleFilterChange}
          className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value="defaultvalue" disabled selected>
            Choose a filter option
          </option>
          <option value="answer">Answered</option>
          <option value="notanswer">UnAnswered</option>
        </select>
      </div>
      {(currentUser.isAdmin || currentUser.isReceptionist) &&
      inquiries.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Customer Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Message</Table.HeadCell>
              <Table.HeadCell>Answered</Table.HeadCell>
              <Table.HeadCell>Reply</Table.HeadCell>
              <Table.HeadCell>Submit</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {displayInquires}
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
        <p>You have no Inquiries</p>
      )}
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
              Are you sure you want to delete this inquiry?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleInquiryDelete}>
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={modalMessagePopUp}
        onClose={() => {
          setModalMessagePopUp(false);
          setFormData({});
        }}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb- text-lg text-gray-500 dark:text-gray-400">
              Message:
            </h3>
            <p>{modalMessage}</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={() => setModalMessagePopUp(false)}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4">Reply to Inquiry</h3>
            <form onSubmit={handleReplySubmit}>
              <textarea
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                rows="4"
                placeholder="Enter your reply here..."
                id="reply"
                onChange={onChange}
              ></textarea>
              <div className="flex justify-center mt-4">
                <Button color="primary" type="submit">
                  Submit
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    setShowReplyModal(false);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
