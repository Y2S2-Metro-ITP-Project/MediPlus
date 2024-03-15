import { Button, Modal, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
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
  useEffect(() => {
    const fetchInquires = async () => {
      try {
        const res = await fetch(`/api/inquiry/getinquiries`);
        const data = await res.json();
        if (res.ok) {
          setInquirires(data.inquiries);
          if (data.inquiries.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin) {
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
        setInquirires((prev) =>
          prev.filter((inquiry) => inquiry._id !== inquiryIdToDelete)
        );
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
  }
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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
        setInquirires((prev) =>  prev.filter((inquiry) => inquiry._id !== inquiryIdToReply)
        );
        setShowReplyModal(false);
        toast.success("Reply Submitted Successfully");
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      {currentUser.isAdmin && inquiries.length > 0 ? (
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
            {inquiries.map((inquiry) => (
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
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show More
            </button>
          )}
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
        onClose={() => {setModalMessagePopUp(false);setFormData({})}}
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