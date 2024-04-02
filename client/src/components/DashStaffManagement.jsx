import React, { useEffect, useState } from "react";
import { Button, Table, TextInput, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { AiOutlineSearch } from "react-icons/ai"

export default function DashStaffManagement() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [sortConfig, setSortConfig] = useState({ field: "", direction: "" });
  const [filterRole, setFilterRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch users data
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/getemployee`);
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

    if (currentUser.isAdmin || currentUser.isHRM) {
      fetchUser();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/getemployee?&startIndex=${startIndex}`);
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
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal1(false);
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenUpdateModal = (user) => {
    setUserToUpdate(user);
    setUpdatedUserData({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!userToUpdate || !userToUpdate._id) {
        console.error("User to update is invalid");
        return;
      }

      const res = await fetch(`/api/user/updateEmp/${userToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userToUpdate._id ? { ...user, ...updatedUserData } : user
          )
        );
        setShowModal(false);
        toast.success(data.message);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const requestSort = (field) => {
    let direction = "asc";
    if (sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.field].localeCompare(b[sortConfig.field]);
    }
    if (sortConfig.direction === "desc") {
      return b[sortConfig.field].localeCompare(a[sortConfig.field]);
    }
    return 0;
  });

  const filteredUsers = filterRole
    ? sortedUsers.filter((user) => {
        switch (filterRole) {
          case "Admin":
            return user.isAdmin;
          case "HRM":
            return user.isHRM;
          case "Doctor":
            return user.isDoctor;
          case "Nurse":
            return user.isNurse;
          case "Pharmacist":
            return user.isPharmacist;
          case "Receptionist":
            return user.isReceptionist;
          case "HeadNurse":
            return user.isHeadNurse;
          default:
            return true; // Return true to include all users if no filter is applied
        }
      })
    : sortedUsers;

  const searchFilter = (user) => {
    if (searchTerm === "") {
      return true;
    }
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const searchedUsers = filteredUsers.filter(searchFilter);

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      
      <div className="flex items-center">
  <div className="mr-4">
    {/* Filter dropdown for roles */}
    <select
      value={filterRole}
      onChange={(e) => setFilterRole(e.target.value)}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="">All Roles</option>
      <option value="Admin">Admin</option>
      <option value="HRM">HRM</option>
      <option value="Doctor">Doctor</option>
      <option value="Nurse">Nurse</option>
      <option value="Pharmacist">Pharmacist</option>
      <option value="Receptionist">Receptionist</option>
      <option value="HeadNurse">Head Nurse</option>
    </select>
  </div>
  <div>
    {/* Search input field */}
    <TextInput
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by username or email"
      rightIcon={AiOutlineSearch}
      className="ml-4 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    />
  </div>
</div>
<br />
      {currentUser.isAdmin || currentUser.isHRM ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell onClick={() => requestSort("createdAt")}>
                Date Created
              </Table.HeadCell>
              <Table.HeadCell>Employee Image</Table.HeadCell>
              <Table.HeadCell onClick={() => requestSort("username")}>
                Username
              </Table.HeadCell>
              <Table.HeadCell onClick={() => requestSort("email")}>
                Email
              </Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {searchedUsers.map((user) => (
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
                    {user.isAdmin ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {/* Display roles */}
                    {user.isAdmin ? <span style={{ color: '#007FFF' }}>Admin </span> : ''}
                    {user.isHRM ? <span style={{ color: '#89CFF0' }}>HRM </span> : ''}
                    {user.isDoctor ? <span style={{ color: '#7FFFD4' }}>Doctor </span> : ''}
                    {user.isNurse ? <span style={{ color: '#eec0c8' }}>Nurse </span> : ''}
                    {user.isPharmacist ? <span style={{ color: '#F0E68C' }}>Pharmacist </span> : ''}
                    {user.isReceptionist ? <span style={{ color: "orange" }}>Receptionist </span> : ''}
                    {user.isHeadNurse ? <span style={{ color: "pink"}}>Head Nurse </span> : ''}
                    {/* Add more roles as needed */}
                    {(!user.isAdmin && !user.isHRM && !user.isDoctor && !user.isNurse && !user.isPharmacist && !user.isReceptionist && !user.isHeadNurse) && 'Staff'}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => handleOpenUpdateModal(user)}
                      className="font-medium text-blue-500 hover:underline cursor-pointer"
                    >
                      Edit
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal1(true);
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
        show={showModal1}
        onClose={() => setShowModal1(false)}
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
              Yes, I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal1(false)}>
              No, cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          {/* Update form */}
          <TextInput
            type="text"
            id="username"
            value={updatedUserData.username}
            onChange={(e) =>
              setUpdatedUserData({ ...updatedUserData, username: e.target.value })
            }
            placeholder="Enter username"
          />
          <TextInput
            type="email"
            id="email"
            value={updatedUserData.email}
            onChange={(e) =>
              setUpdatedUserData({ ...updatedUserData, email: e.target.value })
            }
            placeholder="Enter email"
          />
          {/* Dropdown selection for user roles */}
          <select
            id="role"
            value={updatedUserData.role}
            onChange={(e) =>
              setUpdatedUserData({ ...updatedUserData, role: e.target.value })
            }
          >
            <option value="">Select Role</option>
            <option value="isAdmin">Admin</option>
            <option value="isDoctor">Doctor</option>
            <option value="isNurse">Nurse</option>
            <option value="isPharmacist">Pharmacist</option>
            <option value="isReceptionist">Receptionist</option>
            <option value="isHeadNurse">Head Nurse</option>
            <option value="isHRM">HRM</option>
            {/* Add more options for different roles */}
          </select>
          {/* Buttons for update */}
          <div className="flex justify-center gap-4 mt-4">
            <Button color="success" onClick={handleUpdateUser}>
              Update
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
