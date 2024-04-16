import React, { useEffect, useState } from "react";
import { Button, Modal, Table, TextInput } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashSpecialization = () => {
  const [specializations, setSpecializations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const res = await fetch("/api/specializations");
      const data = await res.json();
      if (res.ok) {
        setSpecializations(data);
      } else {
        throw new Error(data.message || "Failed to fetch specializations");
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const handleCreateSpecialization = async () => {
    try {
      const res = await fetch("/api/specializations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you're using JWT for authentication
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSpecializations((prev) => [...prev, data]);
        setShowModal(false);
        setFormData({ name: "", description: "" });
        toast.success("Specialization added successfully");
      } else {
        throw new Error(data.message || "Failed to create specialization");
      }
    } catch (error) {
      console.error("Error creating specialization:", error);
      toast.error(error.message || "Failed to create specialization");
    }
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)}>Add Specialization</Button>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {specializations.map((specialization) => (
            <Table.Row key={specialization._id}>
              <Table.Cell>{specialization.name}</Table.Cell>
              <Table.Cell>{specialization.description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Add Specialization</Modal.Header>
        <Modal.Body>
          <TextInput
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCreateSpecialization}>Save</Button>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default DashSpecialization;
