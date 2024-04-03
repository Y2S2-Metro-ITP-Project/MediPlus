import { Button, Modal, Table, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai";

export default function DashUserProfiles() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/getusers`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin) {
      fetchUser();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getusers?&startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIudToDelete));
        setShowModal(false);
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    const search = document.getElementById("search").value;
    try {
      const res = await fetch(`/api/user/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFilterChange = async (e) => {
    const filterOption = e.target.value;
    try {
      const res = await fetch(`/api/user/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleReset = async () => {
    try {
      const res = await fetch(`/api/user/getusers`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
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
              style={{ width: "300px" }}
            />
            <Button className="w-12 h-10 lg:hidden" color="gray">
              <AiOutlineSearch />
            </Button>
          </form>
        </div>
        <Button
          className="w-200 h-10 ml-6lg:ml-0 lg:w-32"
          color="gray"
          onClick={handleReset}
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
          <option value="user">User</option>
          <option value="outPatients">Out Patients</option>
          <option value="inPatients">In Patients</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="hrManager">HR Manager</option>
          <option value="labTechnician">Lab Technician</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="receptionist">Receptionist</option>
        </select>
      </div>
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>User Image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className="divide-y" key={user._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 object-cover b-gray-500 rounded-full"
                    />
                  </Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap">
                      {/* Check and display each role with different background colors */}
                      {user.isAdmin && (
                        <div className=" text-red-700 bold mr-2 mb-2">
                          Admin
                        </div>
                      )}
                      {user.isInPatient && (
                        <div className=" text-yellow-500 bold mr-2 mb-2">
                          In-Patient
                        </div>
                      )}
                      {user.isOutPatient && (
                        <div className="text-orange-500 bold mr-2 mb-2">
                          Out-Patient
                        </div>
                      )}
                      {user.isDoctor && (
                        <div className="text-blue-500 bold mr-2 mb-2">
                          Doctor
                        </div>
                      )}
                      {user.isNurse && (
                        <div className="text-green-700 bold mr-2 mb-2">
                          Nurse
                        </div>
                      )}
                      {user.isPharmacist && (
                        <div className="text-purple-700 bold mr-2 mb-2">
                          Pharmacist
                        </div>
                      )}
                      {user.isReceptionist && (
                        <div className="text-amber-700 bold mr-2 mb-2">
                          Receptionist
                        </div>
                      )}
                      {user.isHeadNurse && (
                        <div className=" text-amber-700 bold mr-2 mb-2">
                          Head Nurse
                        </div>
                      )}
                      {user.isHRM && (
                        <div className=" text-green-700 bold mr-2 mb-2">
                          HR Manager
                        </div>
                      )}
                      {user.isUser && (
                        <div className=" text-red-700 bold mr-2 mb-2">User</div>
                      )}
                      {user.isLabTech && (
                        <div className=" text-amber-700 bold mr-2 mb-2">
                          Lab Technician
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
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
        <p>You have no users</p>
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
              Are you sure you want to delete this user?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteUser}>
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
