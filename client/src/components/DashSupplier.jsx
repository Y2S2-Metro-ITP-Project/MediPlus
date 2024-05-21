import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Modal,
  Table,
  TextInput,
  Label,
  Card,
  Badge,
  Select,
} from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiPencil,
  HiSearch,
  HiFilter,
  HiTrash,
  HiEye,
  HiDocumentReport,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import { set } from "mongoose";

const DashSupplier = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [suppliers, setSuppliers] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [supplierIdToDelete, setSupplierIdToDelete] = useState("");
  const [supplierIdToUpdate, setSupplierIdToUpdate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    itemName: "",
  });
  const [itemNames, setItemNames] = useState([]);
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
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
      toast.error("Failed to fetch suppliers. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchItemNames();
  }, [currentUser._id, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
          itemName: "",
        });
        setShowModal(false);
        fetchSuppliers();
        toast.success("Supplier added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add supplier. Please try again later.");
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
        fetchSuppliers();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete supplier. Please try again later.");
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
          itemName: "",
        });
        fetchSuppliers();
        toast.success("Supplier updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update supplier. Please try again later.");
    }
  };
  const fetchItemNames = async () => {
    try {
      const res = await fetch("/api/inventory/getItemNames");
      const data = await res.json();
      if (res.ok) {
        setItemNames(data.itemNames);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch item names. Please try again later.");
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
  
    if (id === 'supplierPhone') {
      if (value.length > 10) {
        setPhoneError('Phone number cannot exceed 10 digits');
      } else if (!/^[0-9]*$/.test(value)) {
        setPhoneError('Phone number can only contain digits');
      } else {
        setPhoneError('');
      }
    }
  
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [detailsShow, setDetailsShow] = useState(false);
  const [detailsData, setDetailsData] = useState({});
  const handleDetailsMessageBox = (supplier) => {
    setDetailsData(supplier);
    setDetailsShow(true);
  };

  console.log(detailsData);
  return (
    <div className="p-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ToastContainer />
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mb-0 mr-4">Suppliers</h1>
            </div>
            <div className="flex items-center">
              <Button
                className="mr-4"
                gradientDuoTone="purpleToPink"
                outline
                onClick={() => setShowModal(true)}
              >
                Add Supplier
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Total Suppliers
                </h5>
                <Badge color="info" className="text-2xl font-bold">
                  {totalSuppliers}
                </Badge>
              </div>
            </Card>
          </div>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <TextInput
                type="text"
                placeholder="Search by supplier name"
                value={searchTerm}
                onChange={handleSearch}
                className="mr-2"
              />
              <Button color="gray" onClick={() => setSearchTerm("")}>
                <HiSearch className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>
          {currentUser.isAdmin || currentUser.isPharmacist ? (
            filteredSuppliers.length > 0 ? (
              <Table hoverable className="shadow-md">
                <Table.Head>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "supplierName" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("supplierName")}
                    >
                      Supplier Name
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "supplierEmail" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("supplierEmail")}
                    >
                      Supplier Email
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "supplierPhone" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("supplierPhone")}
                    >
                      Supplier Phone
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "supplierItem" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("Item Name")}
                    >
                      Item Name
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "itemName" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("itemName")}
                    >
                      No of Items
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>
                    <span
                      className={`cursor-pointer ${
                        sortColumn === "itemDetials" ? "text-blue-500" : ""
                      }`}
                      onClick={() => handleSort("itemDetials")}
                    >
                      Item Details
                    </span>
                  </Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {filteredSuppliers.map((supplier) => (
                    <Table.Row
                      key={supplier._id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>{supplier.supplierName}</Table.Cell>
                      <Table.Cell>{supplier.supplierEmail}</Table.Cell>
                      <Table.Cell>{supplier.supplierPhone}</Table.Cell>
                      <Table.Cell>{supplier.itemName}</Table.Cell>
                      <Table.Cell>{supplier.item.length}</Table.Cell>
                      <Table.Cell>
                        {supplier.item.length > 0 ? (
                          <>
                            <HiEye
                              className="text-blue-500 cursor-pointer"
                              onClick={() =>
                                handleDetailsMessageBox(supplier.item)
                              }
                            />
                          </>
                        ) : (
                          <span className="text-red-500">
                            No items assigned
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-4">
                          <Button
                            size="sm"
                            color="gray"
                            onClick={() => {
                              setSupplierIdToUpdate(supplier._id);
                              setFormData({
                                supplierName: supplier.supplierName,
                                supplierEmail: supplier.supplierEmail,
                                supplierPhone: supplier.supplierPhone,
                                supplierItem: supplier.itemName,
                              });
                              setShowModal(true);
                            }}
                          >
                            <HiPencil className="mr-2 h-5 w-5" />
                            Update
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => {
                              setSupplierIdToDelete(supplier._id);
                              setShowModal(true);
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
              <p className="px-4">No suppliers found.</p>
            )
          ) : (
            <p>You are not authorized to view suppliers.</p>
          )}
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
                      type="number"
                      id="supplierPhone"
                      value={formData.supplierPhone}
                      onChange={handleInputChange}
                      maxLength={10}
                      required
                    />
                    {phoneError && (
                      <p className="text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Select
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      required
                    >
                      <option value="">Select an item</option>
                      {itemNames.map((itemName) => (
                        <option key={itemName} value={itemName}>
                          {itemName}
                        </option>
                      ))}
                    </Select>
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
                          itemName: "",
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
                      type="Number"
                      id="supplierPhone"
                      value={formData.supplierPhone}
                      onChange={handleInputChange}
                      maxLength={10}
                      required
                    />
                    {phoneError && (
                      <p className="text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Select
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      required
                    >
                      <option value="">Select an item</option>
                      {itemNames.map((itemName) => (
                        <option key={itemName} value={itemName}>
                          {itemName}
                        </option>
                      ))}
                    </Select>
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
          <Modal
            show={detailsShow}
            onClose={() => setDetailsShow(false)}
            size="xlg"
          >
            <Modal.Header>Supplier Details</Modal.Header>
            <Modal.Body>
              {detailsData.length > 0 ? (
                <Table hoverable className="shadow-md">
                  <Table.Head>
                    <Table.HeadCell>Item Name</Table.HeadCell>
                    <Table.HeadCell>Item Category</Table.HeadCell>
                    <Table.HeadCell>Item Description</Table.HeadCell>
                    <Table.HeadCell>Item Price</Table.HeadCell>
                    <Table.HeadCell>Item Quantity</Table.HeadCell>
                    <Table.HeadCell>Item Min Value</Table.HeadCell>
                    <Table.HeadCell>Item Expire Date</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {detailsData.map((item) => (
                      <Table.Row key={item._id}>
                        <Table.Cell>{item.itemName}</Table.Cell>
                        <Table.Cell>{item.itemCategory}</Table.Cell>
                        <Table.Cell>{item.itemDescription}</Table.Cell>
                        <Table.Cell>{item.itemPrice}</Table.Cell>
                        <Table.Cell>{item.itemQuantity}</Table.Cell>
                        <Table.Cell>{item.itemMinValue}</Table.Cell>
                        <Table.Cell>{item.itemExpireDate}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <p className="px-4">No items found.</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setDetailsShow(false)}>Close</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DashSupplier;
