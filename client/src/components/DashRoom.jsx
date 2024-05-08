import React, { useEffect, useState } from "react";
import {
  Button,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Card,
  Badge,
  Spinner,
} from "flowbite-react";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiDocumentReport,
  HiEye,
  HiSearch,
  HiFilter,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";

export default function DashRoom() {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewSlotsModal, setShowViewSlotsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/rooms");
      const data = await response.json();
      if (response.ok) {
        setRooms(data);
      } else {
        setRooms([]);
        console.error("Error fetching rooms:", data.error);
        toast.error(
          data.error || "Failed to fetch rooms. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomNumber, description }),
      });
      const data = await response.json();
      if (response.ok) {
        setRoomNumber("");
        setDescription("");
        setShowAddModal(false);
        fetchRooms();
        toast.success("Room created successfully.");
      } else {
        console.error("Error creating room:", data.error);
        toast.error(
          data.error || "Error creating room. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Error creating room. Please try again later.");
    }
  };

  const updateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/rooms/update/${editingRoom._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomNumber, description }),
      });
      const data = await response.json();
      if (response.ok) {
        setRoomNumber("");
        setDescription("");
        setEditingRoom(null);
        setShowEditModal(false);
        fetchRooms();
        toast.success("Room updated successfully.");
      } else {
        console.error("Error updating room:", data.error);
        toast.error(
          data.error || "Error updating room. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Error updating room. Please try again later.");
    }
  };

  const deleteRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/delete/${selectedRoom._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedRoom(null);
        fetchRooms();
        toast.success("Room deleted successfully.");
      } else {
        console.error("Error deleting room:", data.error);
        if (data.error.includes("associated slots")) {
          // Handle associated slots
          setShowDeleteModal(false);
          setSelectedRoom(null);
          toast.error("Cannot delete room. There are slots associated with this room.");
        } else {
          toast.error("Error deleting room. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Error deleting room. Please try again later.");
    }
  };

  const generateRoomReport = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/report/${roomId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `room_report_${roomId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Room report generated successfully.");
    } catch (error) {
      console.error("Error generating room report:", error);
      toast.error("Failed to generate room report. Please try again later.");
    }
  };

  const generateTotalReport = async () => {
    try {
      const response = await fetch("/api/rooms/report");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "total_rooms_report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Total rooms report generated successfully.");
    } catch (error) {
      console.error("Error generating total rooms report:", error);
      toast.error(
        "Failed to generate total rooms report. Please try again later."
      );
    }
  };

  const startEditing = (room) => {
    setRoomNumber(room.roomNumber);
    setDescription(room.description);
    setEditingRoom(room);
    setShowEditModal(true);
  };

  const cancelEditing = () => {
    setRoomNumber("");
    setDescription("");
    setEditingRoom(null);
    setShowEditModal(false);
  };

  const viewSlots = async (room) => {
    setSelectedRoom(room);
    try {
      const response = await fetch(`/api/slot/room/${room._id}`);
      const data = await response.json();
      if (response.ok) {
        setSlotsForRoom(data);
      } else {
        console.error("Error fetching slots for room:", data.error);
        toast.error(
          data.error ||
            "Failed to fetch slots for room. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error fetching slots for room:", error);
      toast.error("Failed to fetch slots for room. Please try again later.");
    }
    setShowViewSlotsModal(true);
  };

  const [slotsForRoom, setSlotsForRoom] = useState([]);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDescription = room.description
      .toLowerCase()
      .includes(filterDescription.toLowerCase());
    return matchesSearch && matchesDescription;
  });

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="info" aria-label="Loading spinner" />
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 px-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-0 mr-4">Room Management</h1>
            </div>
            <div className="flex items-center">
              <Button
                className="mr-4"
                gradientDuoTone="purpleToPink"
                outline
                onClick={() => setShowAddModal(true)}
              >
                <HiPlus className="mr-2 h-5 w-5" />
                Add Room
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Rooms
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {rooms.length}
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search by room number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setSearchTerm("")}>
                <HiSearch className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Filter by description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setFilterDescription("")}>
                <HiFilter className="mr-2 h-5 w-5" />
                Filter by Description
              </Button>
            </div>
          </div>
          {filteredRooms.length > 0 ? (
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Room Number</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredRooms.map((room) => (
                  <Table.Row
                    key={room._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>{room.roomNumber}</Table.Cell>
                    <Table.Cell>{room.description}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => startEditing(room)}
                        >
                          <HiPencil className="mr-2 h-5 w-5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => viewSlots(room)}
                        >
                          <HiEye className="mr-2 h-5 w-5" />
                          View Slots
                        </Button>
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => generateRoomReport(room._id)}
                        >
                          <HiDocumentReport className="mr-2 h-5 w-5" />
                          Report
                        </Button>
                        <Button
                          size="sm"
                          color="failure"
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowDeleteModal(true);
                          }}
                        >
                          <HiTrash className="mr-2 h-5 w-5" />
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="px-4">No rooms found.</p>
          )}
          <div className="mt-4">
            <Button onClick={generateTotalReport}>
              <HiDocumentReport className="mr-2 h-5 w-5" />
              Generate Total Report
            </Button>
          </div>
          <Modal
            show={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setRoomNumber("");
              setDescription("");
            }}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                  Add Room
                </h3>
              </div>
              <form onSubmit={createRoom}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <TextInput
                      type="text"
                      id="roomNumber"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <TextInput
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <Button color="blue" type="submit" outline>
                    Submit
                  </Button>
                  <Button
                    className="ml-4"
                    color="red"
                    onClick={() => {
                      setShowAddModal(false);
                      setRoomNumber("");
                      setDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
          <Modal
            show={showEditModal}
            onClose={() => cancelEditing()}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-4 text-lg text-gray-500 dark:text-gray-400">
                  Edit Room
                </h3>
              </div>
              <form onSubmit={updateRoom}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <TextInput
                      type="text"
                      id="roomNumber"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <TextInput
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <Button color="blue" type="submit" outline>
                    Update
                  </Button>
                  <Button className="ml-4" color="red" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
          <Modal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          >
            <Modal.Header>Confirm Delete</Modal.Header>
            <Modal.Body>Are you sure you want to delete this room?</Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button color="failure" onClick={deleteRoom}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={showViewSlotsModal}
            onClose={() => setShowViewSlotsModal(false)}
            size="xl"
          >
            <Modal.Header>
              Slots for Room {selectedRoom ? selectedRoom.roomNumber : ""}
            </Modal.Header>
            <Modal.Body>
              {slotsForRoom.length > 0 ? (
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Start Time</Table.HeadCell>
                    <Table.HeadCell>End Time</Table.HeadCell>
                    <Table.HeadCell>Doctor</Table.HeadCell>
                    <Table.HeadCell>Type</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {slotsForRoom.map((slot) => (
                      <Table.Row
                        key={slot._id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell>
                          {new Date(slot.date).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>{slot.startTime}</Table.Cell>
                        <Table.Cell>{slot.endTime}</Table.Cell>
                        <Table.Cell>{slot.doctorId.username}</Table.Cell>
                        <Table.Cell>{slot.type}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <p>No slots found for this room.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setShowViewSlotsModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
