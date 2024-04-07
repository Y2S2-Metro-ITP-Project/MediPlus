import {
  Button,
  ButtonGroup,
  FileInput,
  Modal,
  Select,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { app } from "../firebase";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Link, json } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { get, set } from "mongoose";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FaExclamationTriangle } from "react-icons/fa";
export default function DashOutPatients() {
  const { currentUser } = useSelector((state) => state.user);
  const [inventory, setInventory] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState("");
  const [inquiryIdToReply, setInquiryIdToReply] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [AddInventoryItemModal, setAddInventoryItemModal] = useState(false);
  const [filterOption, setFilterOption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemId, setItemId] = useState("");
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    itemPrice: "",
    itemQuantity: "",
    itemMinValue: "",
    itemImage: "",
    itemExpireDate: "",
  });
  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory/getInventory`);
      const data = await res.json();
      if (res.ok) {
        setInventory(data.items);
        if (data.items.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`/api/inventory/getInventory`);
        const data = await res.json();
        if (res.ok) {
          setInventory(data.items);
          if (data.items.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (currentUser.isAdmin || currentUser.isReceptionist) {
      fetchInventory();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = patients.length;
    try {
      const res = await fetch(
        `/api/patient/getPatients?&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setPatients((prev) => [...prev, ...data.patients]);
        if (data.patients.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const handlePatientDelete = async (e) => {
    try {
      const res = await fetch(`/api/patient/delete/${patientIdToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setPatients((prev) =>
          prev.filter((patient) => patient._id !== patientIdToDelete)
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
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleFilterChange = async (e) => {
    e.preventDefault();
    const selectedOption = e.target.value;
    try {
      const res = await fetch(`/api/patient/filterPatient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filterOption: selectedOption }),
      });
      const data = await res.json();
      setPatients(data);
      setShowMore(data.patients.length > 9);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patient/searchPatient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({});
        setPatients(data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/api/patient/getPatients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
        if (data.patients.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  useEffect(() => {
    if (imageFile) {
      uploadPatientImage();
    }
  }, [imageFile]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [itemIdToDelete, setItemIdToDelete] = useState("");
  const uploadPatientImage = async () => {
    const storage = getStorage(app);
    const filename = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
        setFileUploadSuccess("File Uploaded Successfully");
      },
      (error) => {
        imageFileUploadingError(
          "Could not upload image(File must be less than 2MB)"
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, itemImage: downloadURL });
        });
      }
    );
  };

  const handleInventoryItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inventory/addInventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        fetchInventory();
        setAddInventoryItemModal(false);
        setFormData({});
        setFileUploadSuccess(false);
        toast.success("Item Added Successfully");
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDetailsMessageBox = (
    itemName,
    itemCategory,
    itemDescription,
    itemPrice,
    itemQuantity,
    itemMinValue,
    itemImage,
    itemExpireDate
  ) => {
    setSelectedItemDetails({
      itemName,
      itemCategory,
      itemDescription,
      itemPrice,
      itemQuantity,
      itemMinValue,
      itemImage,
      itemExpireDate,
    });
    setShowItemDetailsModal(true);
  };
  const handleItemDelete = async () => {
    try {
      const res = await fetch(`/api/inventory/deleteItem/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        fetchInventory();
        setShowModal(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
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
          <Button
            className="mr-4"
            gradientDuoTone="purpleToPink"
            outline
            onClick={() => setAddInventoryItemModal(true)}
          >
            Add Item
          </Button>
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
          className="w-200 h-10 ml-6lg:ml-0 lg:w-32"
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
          <option value="inpatients">Inpatients</option>
          <option value="outpatients">Outpatients</option>
        </select>
      </div>
      {currentUser.isAdmin ||
      (currentUser.isReceptionist && patients.length > 0) ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Item Name</Table.HeadCell>
              <Table.HeadCell>Item Description</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {inventory.map((item) => (
              <Table.Body className="divide-y" key={item._id}>
                <Table.Row className="bg-white dar:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>{item.itemName}</Table.Cell>
                  <Table.Cell>
                    <HiEye
                      className="text-blue-500 cursor-pointer"
                      onClick={() =>
                        handleDetailsMessageBox(
                          item.itemName,
                          item.itemCategory,
                          item.itemDescription,
                          item.itemPrice,
                          item.itemQuantity,
                          item.itemMinValue,
                          item.itemImage,
                          item.itemExpireDate
                        )
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {item.itemQuantity > item.itemMinValue ? (
                      <span className="text-green-500">
                        <FaCheck className="text-green-500" />
                        In Stock
                      </span>
                    ) : item.itemQuantity === 0 ? (
                      <span className="text-red-500">
                        <FaTimes className="text-red-500" />
                        Out of Stock
                      </span>
                    ) : (
                      <span className="text-yellow-500">
                        <FaExclamationTriangle className="text-yellow-500" />
                        Low Stock
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link className="text-teal-500 hover:underline">
                      <span
                        className="mr-2"
                        onClick={() => {
                          setShowReplyModal(true);
                          setInquiryIdToReply(inquiry._id);
                        }}
                      >
                        Update
                      </span>
                    </Link>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setItemId(item._id);
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
        <p>You have no Patients</p>
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
              Are you sure you want to delete this item?
            </h3>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button color="failure" onClick={handleItemDelete}>
              Yes,I am sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No,cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={AddInventoryItemModal}
        onClose={() => setAddInventoryItemModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
              Add New Inventory Item
            </h3>
          </div>
          <form onSubmit={handleInventoryItemSubmit}>
            <div className="mb-4">
              <TextInput
                type="text"
                id="itemName"
                placeholder="Enter Item Name"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Select
                id="itemCategory"
                label="itemCategory"
                required
                onChange={handleChange}
              >
                <option value="default" disabled selected>
                  Select item Category
                </option>
                <option value="OTC">OTC</option>
                <option value="prescription medicine">
                  Prescription medicine
                </option>
                <option value="pediatric medicine">Pediatric medicine</option>
              </Select>
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imageFileUploadingProgress && (
                <div className="mt-4">
                  <progress value={imageFileUploadingProgress} max="100" />
                </div>
              )}
              {}
              {imageFileUploadingError && (
                <div className="mt-4">
                  <p className="text-red-500">{imageFileUploadingError}</p>
                </div>
              )}
              {fileUploadSuccess && (
                <div className="mt-4">
                  <p className="text-green-500">{fileUploadSuccess}</p>
                </div>
              )}
            </div>
            <div className="mb-4">
              <TextInput
                type="date"
                id="itemExpireDate"
                placeholder="Enter Item Expiry Date"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="number"
                id="itemQuantity"
                placeholder="Enter Item Quantity"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="number"
                id="itemPrice"
                placeholder="Enter Item price"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="number"
                id="itemMinValue"
                placeholder="Enter Item Minimum Quantity"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <Textarea
                id="itemDescription"
                placeholder="Enter Item Description"
                required
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button
                type="submit"
                gradientDuoTone="pinkToPurple"
                color="red"
                outline
              >
                Add Item
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setAddInventoryItemModal(false),
                    setFormData({}),
                    setImageFile(null),
                    setImageFileUploadingError(false),
                    setFileUploadSuccess(false),
                    fileUploadSuccess(false),
                    setImageFileUploadingError(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showItemDetailsModal}
        onClose={() => setShowItemDetailsModal(false)}
        popup
        size="lg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center mb-4">
            <h3 className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
              Item Details
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Name:
              </label>
              <p>{selectedItemDetails.itemName}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Category:
              </label>
              <p>{selectedItemDetails.itemCategory}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Description:
              </label>
              <p>{selectedItemDetails.itemDescription}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Price:
              </label>
              <p>{selectedItemDetails.itemPrice}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Quantity:
              </label>
              <p>{selectedItemDetails.itemQuantity}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Min Value:
              </label>
              <p>{selectedItemDetails.itemMinValue}</p>
            </div>
            <div className="mb-4 col-span-2">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Image:
              </label>
              <img
                src={selectedItemDetails.itemImage}
                alt="Item"
                className="w-full max-w-sm"
              />
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Expire Date:
              </label>
              <p>{selectedItemDetails.itemExpireDate}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
