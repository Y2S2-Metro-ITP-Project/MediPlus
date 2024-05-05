import React, { useEffect, useState } from "react";
import { Button, Table, TextInput, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { AiOutlineSearch } from "react-icons/ai";
import { HiOutlineEye } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function DashStaffManagement() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal1, setShowModal1] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "", direction: "" });
  const [filterRole, setFilterRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showModal2, setShowUpdateModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [EmployeeIdDownloadPDF, setEmployeeIdDownloadPDF] = useState("");

  const [updatedUserData, setUpdatedUserData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [updatedEmployeeDetails, setUpdatedEmployeeDetails] = useState({
    gender: "",
    dateOfBirth: "",
    salary: "",
    address: "",
    contactPhone: "",
    Name: '',
    specialization: "",
    experience: '',
    qualifications: '',
    consultationFee: '',
    bio: '',
    employeeimg: '',
  });

  const handleOpenUpdateModal = async (user) => {
    if (!user) return;

    setUserToUpdate(user);
    const role = Object.keys(user)
      .filter(key => user[key] === true && key.startsWith('is'))
      .map(key => key.substring(2))
      .join(', ');

    setUpdatedUserData({
      username: user.username,
      email: user.email,
      role: role,
    });

    console.log("User role:", role);
    try {
      const res = await fetch(`/api/employee/getEMPById/${user._id}`);
      const data = await res.json();
      if (res.ok) {
        setUpdatedEmployeeDetails({
          gender: data.employeeDetails.gender || "",
          dateOfBirth: data.employeeDetails.dateOfBirth
            ? formatDate(data.employeeDetails.dateOfBirth)
            : "",
          salary: data.employeeDetails.salary || "",
          address: data.employeeDetails.address || "",
          contactPhone: data.employeeDetails.contactPhone || "",
          specialization: data.employeeDetails.specialization || "",
          Name: data.employeeDetails.Name || "",
          experience: data.employeeDetails.experience || "",
          qualifications: data.employeeDetails.qualifications || "",
          consultationFee: data.employeeDetails.consultationFee || "",
          bio: data.employeeDetails.bio || "",
          employeeimg: data.employeeDetails.employeeimg || "",
        });
      } else {
        console.error("Failed to fetch employee details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }

    setShowUpdateModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUpdatedUserData({ ...updatedUserData, role: newRole });
  };
  // Function to handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setUpdatedEmployeeDetails(prevData => ({
      ...prevData,
      employeeimg: file, // Update the employeeimg field with the selected file
    }));
  };



  const handleUpdateUser = async () => {
    try {
      // Check if user's _id exists
      if (!userToUpdate._id) {
        throw new Error("User ID not found.");
      }

      // Fetch EmployeeDetails based on the user's _id
      const res = await fetch(`/api/employee/getEMPById/${userToUpdate._id}`);
      const data = await res.json();

      if (!res.ok) {
        // If employee details are not found, create new details for the user
        console.error(`Failed to fetch employee details: ${data.message}`);
        await createNewEmployeeDetails();
      } else {
        // Employee details found, update them
        await updateEmployeeDetails();
      }

      // Update the user details
      await updateUserData();

      // Update the local state with the updated data
      updateUserState();

      // Close the update modal and show success message
      closeUpdateModalAndShowSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    }
  };

  const createNewEmployeeDetails = async () => {
    try {
      const createRes = await fetch(`/api/employee/createEmployeeDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userToUpdate._id,
          ...updatedEmployeeDetails,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create employee details");
    }
  };

  const updateEmployeeDetails = async () => {
    try {
      const updateRes = await fetch(`/api/employee/updateEmp/${userToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: updatedUserData,
          employeeDetails: updatedEmployeeDetails,
          role: updatedUserData.role,
        }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update employee details");
    }
  };

  const updateUserData = async () => {
    try {
      const updateUserRes = await fetch(`/api/employee/updateEmp/${userToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: updatedUserData,
          role: updatedUserData.role,
        }),
      });
      const updateUserData = await updateUserRes.json();
      if (!updateUserRes.ok) {
        throw new Error(updateUserData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user details");
    }
  };

  const updateUserState = () => {
    setUserToUpdate(prevUser => ({
      ...prevUser,
      ...updatedUserData,
      role: updatedUserData.role,
    }));
  };

  const closeUpdateModalAndShowSuccess = () => {
    setShowUpdateModal(false);
    toast.success("User updated successfully");
  };

  // useEffect(() => {
  //   console.log("Updated Employee Details:", updatedEmployeeDetails);
  // }, [updatedEmployeeDetails]);


  const getSelectedRole = (userDetails) => {
    const selectedRoles = userDetails.selectedRoles;
    return selectedRoles.join(", ");
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/employee/getemployee`);
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
      const res = await fetch(
        `/api/employee/getemployee?&startIndex=${startIndex}`
      );
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

  const handleShowDetailsWithNameTag = async (
    userId,
    setSelectedUserDetails,
    setShowDetailsModal
  ) => {
    try {
      const userRes = await fetch(`/api/employee/${userId}`);
      const userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.message);
      }

      const empDetailsRes = await fetch(`/api/employee/getEMPById/${userId}`);
      const empDetailsData = await empDetailsRes.json();
      if (!empDetailsRes.ok) {
        throw new Error(empDetailsData.message);
      }

      const userDetails = {
        ...userData,
        employeeDetails: empDetailsData.employeeDetails,
      };

      // Determine the selected roles
      const selectedRoles = [];
      const roles = ["Doctor", "Nurse", "Pharmacist", "Receptionist", "HeadNurse", "HRM"];
      roles.forEach(role => {
        if (userData[`is${role}`]) {
          selectedRoles.push(role);
        }
      });

      userDetails.selectedRoles = selectedRoles;

      if (userDetails.employeeDetails && userDetails.employeeDetails.dateOfBirth) {
        userDetails.employeeDetails.dateOfBirth = new Date(userDetails.employeeDetails.dateOfBirth).toLocaleDateString('en-US');
      }
      setSelectedUserDetails(userDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching Employee details:", error.message);
      toast.error("Employee details not added", { autoClose: 5000 });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/employee/deleteEmp/${userIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.filter((user) => user._id !== userIdToDelete)
        );
        setShowModal1(false);
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
          return true;
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




  const handleDownloadPdf = async (userId, name) => {
    try {
      const res = await fetch(
        `/api/employee/DownloadPDFEmployee/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      // Create blob URL
      const url = window.URL.createObjectURL(pdfBlob);

      // Create temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `Employee-${name}.pdf`; // Set download attribute
      document.body.appendChild(a);

      // Click link to initiate download
      a.click();

      // Remove link from DOM
      document.body.removeChild(a);
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="flex items-center">
        <div className="mr-4">
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
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell> Details</Table.HeadCell>
              <Table.HeadCell>Update</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Report</Table.HeadCell>
            </Table.Head>
            {searchedUsers.map((user) => (
              <Table.Body className="divide-y" key={user._id}>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
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
                      <span style={{ color: "#007FFF" }}>Admin </span>
                    ) : (
                      ""
                    )}
                    {user.isHRM ? (
                      <span style={{ color: "#89CFF0" }}>HRM </span>
                    ) : (
                      ""
                    )}
                    {user.isDoctor ? (
                      <span style={{ color: "#7FFFD4" }}>Doctor </span>
                    ) : (
                      ""
                    )}
                    {user.isNurse ? (
                      <span style={{ color: "#eec0c8" }}>Nurse </span>
                    ) : (
                      ""
                    )}
                    {user.isPharmacist ? (
                      <span style={{ color: "#F0E68C" }}>Pharmacist </span>
                    ) : (
                      ""
                    )}
                    {user.isReceptionist ? (
                      <span style={{ color: "orange" }}>Receptionist </span>
                    ) : (
                      ""
                    )}
                    {user.isHeadNurse ? (
                      <span style={{ color: "pink" }}>Head Nurse </span>
                    ) : (
                      ""
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() =>
                        handleShowDetailsWithNameTag(
                          user._id,
                          setSelectedUserDetails,
                          setShowDetailsModal
                        )
                      }
                      className="font-medium text-gray-500 hover:text-blue-500 cursor-pointer"
                    >
                      <HiOutlineEye />
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={!user.isAdmin && !user.isHRM ? () => handleOpenUpdateModal(user) : null}
                      className={`font-medium text-blue-500 hover:underline cursor-pointer ${user.isAdmin || user.isHRM ? 'text-gray-400 opacity-50 cursor-not-allowed' : ''
                        }`}
                      style={{ pointerEvents: user.isAdmin || user.isHRM ? 'none' : 'auto' }}
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
                  <Table.Cell>
                    <span
                      onClick={() => {
                        console.log("User ID:", user._id);
                        console.log("Username:", user.username);
                        handleDownloadPdf(user._id, user.username);
                      }}
                      className="font-medium text-green-700 hover:underline cursor-pointer"
                    >
                      Download PDF
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
              Cancel
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer />
      </Modal>

      <Modal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          {selectedUserDetails && (
            <div>
              <h2 className="text-lg font-semibold">
                {selectedUserDetails.username}
              </h2>
              <p>Email: {selectedUserDetails.email}</p>
              <p>Role: {getSelectedRole(selectedUserDetails)}</p>
              {selectedUserDetails.employeeDetails && (
                <>
                  <p>
                    Name:{" "}
                    {selectedUserDetails.employeeDetails.Name}
                  </p>
                  <p>Gender: {selectedUserDetails.employeeDetails.gender}</p>
                  <p>
                    Date of Birth:{" "}
                    {selectedUserDetails.employeeDetails.dateOfBirth}
                  </p>
                  <p>Salary: {selectedUserDetails.employeeDetails.salary}</p>
                  <p>Address: {selectedUserDetails.employeeDetails.address}</p>
                  <p>
                    Contact Phone:{" "}
                    {selectedUserDetails.employeeDetails.contactPhone}
                  </p>
                  {getSelectedRole(selectedUserDetails) === "Doctor" && (
                    <>
                      <p>
                        Specialization:{" "}
                        {selectedUserDetails.employeeDetails.specialization}
                      </p>
                      <p>
                        Experience:{" "}
                        {selectedUserDetails.employeeDetails.experience}
                      </p>
                      <p>
                        Qualifications:{" "}
                        {selectedUserDetails.employeeDetails.qualifications}
                      </p>
                      <p>
                        ConsultationFee:{" "}
                        {selectedUserDetails.employeeDetails.consultationFee}
                      </p>
                      <p>
                        Bio:{" "}
                        {selectedUserDetails.employeeDetails.bio}
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer />
      </Modal>

      <Modal
        show={showModal2}
        onClose={() => setShowUpdateModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <h2 className="text-lg font-semibold">Update Employee</h2>
          <div className="mt-4">
            <label className="block">Username/Employee Name</label>
            <TextInput
              type="text"
              value={updatedUserData.username}
              onChange={(e) => {
                const newValue = e.target.value;
                setUpdatedUserData({ ...updatedUserData, username: newValue });
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, Name: newValue });
              }}
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>


          <div className="mt-4">
            <label className="block">Email</label>
            <TextInput
              type="email"
              value={updatedUserData.email}
              onChange={(e) =>
                setUpdatedUserData({ ...updatedUserData, email: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="role" className="block">Role</label>
            <select
              id="role"
              value={updatedUserData.role}
              onChange={handleRoleChange}
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select Role</option>
              <option value="HRM">HRM</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Receptionist">Receptionist</option>
              <option value="HeadNurse">Head Nurse</option>
            </select>
          </div>
          {updatedUserData.role === "Doctor" && (
            <>
              <div className="mt-4">
                <label className="block">Specialization</label>
                <TextInput
                  type="text"
                  value={updatedEmployeeDetails.specialization}
                  onChange={(e) =>
                    setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, specialization: e.target.value })
                  }
                // Add classNames and other attributes as needed
                />
              </div>
              <div className="mt-4">
                <label className="block">Experience</label>
                <TextInput
                  type="number" // Change to lowercase "number"
                  id="experience"
                  value={updatedEmployeeDetails.experience}
                  onChange={(e) =>
                    setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, experience: e.target.value })
                  }
                />
              </div>
              <div className="mt-4">
                <label className="block">Qualifications</label>
                <TextInput
                  type="text" // Change to lowercase "number"
                  id="qualifications"
                  value={updatedEmployeeDetails.qualifications}
                  onChange={(e) =>
                    setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, qualifications: e.target.value })
                  }
                />
              </div>
              <div className="mt-4">
                <label className="block">ConsultationFee</label>
                <TextInput
                  type="number" // Change to lowercase "number"
                  id="consultationFee"
                  value={updatedEmployeeDetails.consultationFee}
                  onChange={(e) =>
                    setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, consultationFee: e.target.value })
                  }
                />
              </div>
              <div className="mt-4">
                <label className="block">Bio</label>
                <textarea
                  type="number" // Change to lowercase "number"
                  id="bio"
                  style={{ width: "350px" }}
                  value={updatedEmployeeDetails.bio}
                  onChange={(e) =>
                    setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, bio: e.target.value })
                  }
                />
              </div>

            </>
          )}
          <div className="mt-4">
            <label className="block">Gender</label>
            <select
              value={updatedEmployeeDetails.gender}
              onChange={(e) =>
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, gender: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block">Date of Birth</label>
            <TextInput
              type="date"
              value={updatedEmployeeDetails.dateOfBirth}
              onChange={(e) =>
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, dateOfBirth: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={userToUpdate?.employeeDetails?.dateOfBirth || "Select Date of Birth"}
            />
          </div>
          <div className="mt-4">
            <label className="block">Salary</label>
            <TextInput
              type="number"
              value={updatedEmployeeDetails.salary}
              onChange={(e) =>
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, salary: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={userToUpdate?.employeeDetails?.salary || "Enter Salary"}
            />
          </div>
          <div className="mt-4">
            <label className="block">Address</label>
            <TextInput
              type="text"
              value={updatedEmployeeDetails.address}
              onChange={(e) =>
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, address: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={userToUpdate?.employeeDetails?.address || "Enter Address"}
            />
          </div>
          <div className="mt-4">
            <label className="block">Contact Phone</label>
            <TextInput
              type="tel"
              value={updatedEmployeeDetails.contactPhone}
              onChange={(e) =>
                setUpdatedEmployeeDetails({ ...updatedEmployeeDetails, contactPhone: e.target.value })
              }
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={userToUpdate?.employeeDetails?.contactPhone || "Enter Contact Phone"}
            />
          </div>

          <div className="mt-4">
                <label className="block">Profile Image</label>
                <input
                    value={updatedEmployeeDetails.employeeimg ? updatedEmployeeDetails.employeeimg.name : ''}
                  type="file"
                  onChange={handleImageChange}
                  className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

          <div className="mt-4 flex justify-end gap-4">
            <Button onClick={handleUpdateUser}>Update</Button>
            <Button onClick={() => setShowUpdateModal(false)}>Cancel</Button>
          </div>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    </div>
  );
}
