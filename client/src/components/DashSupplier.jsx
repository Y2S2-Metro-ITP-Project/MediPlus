import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Modal,
  Table,
  TextInput,
  Label,
  Pagination,
} from "flowbite-react";
import { HiOutlineExclamationCircle, HiPencil } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import { set } from "mongoose";

const DashSupplier = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [suppliers, setSuppliers] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [supplierIdToDelete, setSupplierIdToDelete] = useState("");
  const [supplierIdToUpdate, setSupplierIdToUpdate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, [currentUser._id, searchTerm, sortDirection]);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/supplier/getSupplier");
      const data = await res.json();
      if (res.ok) {
        setSuppliers(data.supplierData);
        setTotalSuppliers(data.totalSupplier);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(suppliers);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortDirection(e.target.value);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/supplier/addSupplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuppliers([...suppliers, data.supplier]);
        setFormData({
          supplierName: "",
          supplierEmail: "",
          supplierPhone: "",
        });
        setShowModal(false);
        toast.success("Supplier added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      const res = await fetch(
        `/api/supplier/deleteSupplier/${supplierIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSuppliers(
          suppliers.filter((supplier) => supplier._id !== supplierIdToDelete)
        );
        setShowModal(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/supplier/updateSupplier/${supplierIdToUpdate}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSuppliers(
          suppliers.map((supplier) =>
            supplier._id === supplierIdToUpdate ? data.supplier : supplier
          )
        );
        setShowModal(false);
        setFormData({
          supplierName: "",
          supplierEmail: "",
          supplierPhone: "",
        });
        toast.success("Supplier updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <TextInput
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={handleSearch}
            className="mr-4"
          />
          <select value={sortDirection} onChange={handleSortChange}>
            <option value="asc">Sort Ascending</option>
            <option value="desc">Sort Descending</option>
          </select>
        </div>
        <Button onClick={() => setShowModal(true)}>Add Supplier</Button>
      </div>
      {currentUser.isAdmin || currentUser.isPharmacist ? (
        <Table>
          <Table.Head>
            <Table.HeadCell>Supplier Name</Table.HeadCell>
            <Table.HeadCell>Supplier Email</Table.HeadCell>
            <Table.HeadCell>Supplier Phone</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {suppliers.map((supplier) => (
              <Table.Row key={supplier._id}>
                <Table.Cell>{supplier.supplierName}</Table.Cell>
                <Table.Cell>{supplier.supplierEmail}</Table.Cell>
                <Table.Cell>{supplier.supplierPhone}</Table.Cell>
                <Table.Cell>
                  <Button
                    color="failure"
                    onClick={() => {
                      setShowModal(true);
                      setSupplierIdToDelete(supplier._id);
                    }}
                    className="mr-2"
                  >
                    Delete
                  </Button>
                  <Button
                    color="info"
                    onClick={() => {
                      setShowModal(true);
                      setSupplierIdToUpdate(supplier._id);
                      setFormData({
                        supplierName: supplier.supplierName,
                        supplierEmail: supplier.supplierEmail,
                        supplierPhone: supplier.supplierPhone,
                      });
                    }}
                  >
                    <HiPencil className="mr-2 h-5 w-5" />
                    Update
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <p>You are not authorized to view suppliers.</p>
      )}
      <Pagination
        currentPage={1}
        totalPages={Math.ceil(totalSuppliers / 10)}
        layout="pagination"
      />
      <Modal show={showModal} onClose={() => setShowModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          {supplierIdToDelete ? (
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this supplier?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={handleDeleteSupplier}>
                  Yes, I'm sure
                </Button>
                <Button color="gray" onClick={() => setShowModal(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          ) : supplierIdToUpdate ? (
            <form onSubmit={handleUpdateSupplier}>
              <div className="mb-4">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <TextInput
                  type="text"
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="supplierEmail">Supplier Email</Label>
                <TextInput
                  type="email"
                  id="supplierEmail"
                  value={formData.supplierEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="supplierPhone">Supplier Phone</Label>
                <TextInput
                  type="text"
                  id="supplierPhone"
                  value={formData.supplierPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button type="submit">Update Supplier</Button>
                <Button
                  color="gray"
                  onClick={() => {
                    setShowModal(false);
                    setSupplierIdToUpdate("");
                    setFormData({
                      supplierName: "",
                      supplierEmail: "",
                      supplierPhone: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddSupplier}>
              <div className="mb-4">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <TextInput
                  type="text"
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="supplierEmail">Supplier Email</Label>
                <TextInput
                  type="email"
                  id="supplierEmail"
                  value={formData.supplierEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="supplierPhone">Supplier Phone</Label>
                <TextInput
                  type="text"
                  id="supplierPhone"
                  value={formData.supplierPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-center gap-4">
                <Button type="submit">Add Supplier</Button>
                <Button color="gray" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default DashSupplier;
