import {
  Button,
  ButtonGroup,
  FileInput,
  Label,
  Modal,
  Select,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { app } from "../firebase";
import React, { useEffect, useState } from "react";
import {
  HiOutlineExclamationCircle,
  HiEye,
  HiArrowNarrowUp,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaBox, FaCheck, FaTimes } from "react-icons/fa";
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
import ReactPaginate from "react-paginate";
import { IoReceiptOutline } from "react-icons/io5";
import ReactSelect from "react-select";
export default function DashOutPatients() {
  const { currentUser } = useSelector((state) => state.user);
  const [inventory, setInventory] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState("");
  const [inquiryIdToReply, setInquiryIdToReply] = useState("");
  const [searchTerm1, setSearchTerm1] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [AddInventoryItemModal, setAddInventoryItemModal] = useState(false);
  const [filterOption, setFilterOption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemId, setItemId] = useState("");
  const [totalInventoryItems, setTotalInventoryItems] = useState(0);
  const [inventoryItemsInStock, setInventoryItemsInStock] = useState(0);
  const [inventoryItemsOutOfStock, setInventoryItemsOutOfStock] = useState(0);
  const [inventoryItemsExpired, setInventoryItemsExpired] = useState(0);
  const [inventoryItemsLowStock, setInventoryItemsLowStock] = useState(0);
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [orderShowModal, setOrderShowModal] = useState(false);
  const [itemCloseToExpairy, setItemCloseToExpairy] = useState(0);
  const [orderItemId, setOrderItemId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [selectedItemDetails, setSelectedItemDetails] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    itemPrice: "",
    itemQuantity: "",
    itemMinValue: "",
    itemImage: "",
    itemExpireDate: "",
    supplierName: "",
    supplierEmail: "",
  });
  const [inventoryUpdateID, setInventoryUpdateID] = useState("");
  const [invetoryUpdateModal, setUpdateInventoryItemModal] = useState(false);
  const [inventoryData, setInventoryData] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    itemPrice: "",
    itemQuantity: "",
    itemMinValue: "",
    itemImage: "",
    itemExpireDate: "",
    supplierName: "",
    supplierEmail: "",
  });
  const handleInvenoryUpdateData = (
    itemName,
    itemCategory,
    itemDescription,
    itemPrice,
    itemQuantity,
    itemMinValue,
    itemImage,
    itemExpireDate,
    supplierName,
    supplierEmail
  ) => {
    setInventoryData({
      itemName,
      itemCategory,
      itemDescription,
      itemPrice,
      itemQuantity,
      itemMinValue,
      itemImage,
      itemExpireDate,
      supplierName,
      supplierEmail,
    });
  };
  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory/getInventory`);
      const data = await res.json();
      if (res.ok) {
        setInventory(data.items);
        setTotalInventoryItems(data.totalItems);
        setInventoryItemsInStock(data.InstockItems);
        setInventoryItemsOutOfStock(data.outOfStockItems);
        setInventoryItemsExpired(data.expiredItems);
        setInventoryItemsLowStock(data.lowStockItems);
        setItemCloseToExpairy(data.lengthOfCloseToExpireItems);
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
          const filteredData = data.items.filter((item) =>
            item.itemName.toLowerCase().includes(searchTerm1.toLowerCase())
          );
          setInventory(filteredData);
          setTotalInventoryItems(data.totalItems);
          setInventoryItemsInStock(data.InstockItems);
          setInventoryItemsOutOfStock(data.outOfStockItems);
          setInventoryItemsExpired(data.expiredItems);
          setInventoryItemsLowStock(data.lowStockItems);
          setItemCloseToExpairy(data.lengthOfCloseToExpireItems);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (
      currentUser.isAdmin ||
      currentUser.isReceptionist ||
      currentUser.isPharmacist
    ) {
      fetchInventory();
    }
  }, [currentUser._id, searchTerm1]);
  const handleShowMore = async () => {};
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleFilterChange = async (e) => {
    setFilterOption(e.target.value);
  };

  const handleSearch = async (e) => {};

  const handleReset = async () => {
    if (
      currentUser.isAdmin ||
      currentUser.isReceptionist ||
      currentUser.isPharmacist
    ) {
      fetchInventory();
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
    // Retrieve form data from state or wherever it's stored
    const { itemName, itemCategory, itemExpireDate, supplierEmail } = formData;
    const { itemQuantity, itemPrice, itemMinValue } = formData;

    // Perform validation for each field
    if (!itemName || !itemCategory || !itemExpireDate || !supplierEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Check if any of the numerical fields contain negative values
    if (itemQuantity < 0 || itemPrice < 0 || itemMinValue < 0) {
      toast.error("Please enter non-negative values for numerical fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplierEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
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
        toast.error(data.message);
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
    itemExpireDate,
    supplierName,
    supplierEmail
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
      supplierName,
      supplierEmail,
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
  const renderCell = (item) => {
    const expirationDate = new Date(item.itemExpireDate);
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() + 1);

    let className = "";
    if (expirationDate < new Date()) {
      className = "expired";
    } else if (expirationDate < oneMonthBefore) {
      className = "one-month-away";
    }

    return (
      <Table.Cell
        style={{
          backgroundColor:
            className === "expired"
              ? "red"
              : className === "one-month-away"
              ? "yellow"
              : "green",
          color: "black",
        }}
      >
        {item.itemExpireDate}
      </Table.Cell>
    );
  };

  {
    /** Pagination implementaion */
  }
  const [pageNumber, setPageNumber] = useState(0);
  const InventoryItemsPerPage = 5;

  const pageCount = Math.ceil(inventory.length / InventoryItemsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayInventoryItems = inventory
    .slice(
      pageNumber * InventoryItemsPerPage,
      (pageNumber + 1) * InventoryItemsPerPage
    )
    .map((item) => (
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
                  item.itemExpireDate,
                  item.supplierName,
                  item.supplierEmail
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
          {renderCell(item)}
          <Table.Cell>
            {(new Date(item.itemExpireDate) < new Date() ||
              item.itemQuantity === 0 ||
              item.itemQuantity < item.itemMinValue) && (
              <span
                onClick={() => {
                  setOrderShowModal(true);
                  setOrderItemId(item._id);
                  setSupplierName(item.supplierName);
                  setSupplierEmail(item.supplierEmail);
                  setItemName(item.itemName);
                }}
                className="font-medium text-yellow-500 hover:underline cursor-pointer mr-2"
              >
                Order
              </span>
            )}
            <Link className="text-teal-500 hover:underline">
              <span
                className="mr-2"
                onClick={() => {
                  handleInvenoryUpdateData(
                    item.itemName,
                    item.itemCategory,
                    item.itemDescription,
                    item.itemPrice,
                    item.itemQuantity,
                    item.itemMinValue,
                    item.itemImage,
                    item.itemExpireDate,
                    item.supplierName,
                    item.supplierEmail
                  );
                  setUpdateInventoryItemModal(true);
                  setInventoryUpdateID(item._id);
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
    ));
  {
    /** Search Implemention */
  }
  {
    /** Inventory Update modal */
  }
  const handleInventoryItemUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/inventory/updateInventory/${inventoryUpdateID}`,
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
        toast.success("Item Updated Successfully");
        fetchInventory();
        setUpdateInventoryItemModal(false);
        setFormData({}),
          setImageFile(null),
          setImageFileUploadingError(false),
          setImageFileUploadingProgress(false),
          setFileUploadSuccess(false)
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  {
    /** Report Generation */
  }
  const [selectedStatus, setSelectedStatus] = useState(null);
  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    if (selectedOption) {
      setFilterOption(selectedOption.value);
    } else {
      setFilterOption("");
    }
  };
  const handleReportGeneration = async () => {
    if (filterOption === "all") {
      const res = await fetch(`/api/inventory/genrateInventoryReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `InventoryReport.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (filterOption === "expired") {
      const res = await fetch(`/api/inventory/genrateExpiaryInventoryReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `ExpiredItems.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (filterOption === "in-stock") {
      const res = await fetch(`/api/inventory/genrateInstockInventoryReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `InStockItems.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (filterOption === "low-stock") {
      const res = await fetch(`/api/inventory/genrateLowStockInventoryReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `LowStockItems.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (filterOption === "out-of-stock") {
      const res = await fetch(
        `/api/inventory/genrateOutofStockInventoryReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `OutofStockItems.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (filterOption === "one-month-away") {
      const res = await fetch(
        `/api/inventory/genrateOneMonthAwayInventoryReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      const pdfBlob = await res.blob();

      const url = window.URL.createObjectURL(pdfBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `OneMonthAwayItems.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  console.log(filterOption);
  {
    /** Order Item Model */
  }
  const handleOrderItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/inventory/orderItem/${orderItemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setOrderShowModal(false);
        setFormData({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleInventoryFilterByStatus = async (e) => {
    e.preventDefault();
    const selectedStatus = e.target.value;
    try {
      const res = await fetch(`/api/inventory/filterInventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setInventory(data.items);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      <div className="p-3 md:mx-auto">
        <div className=" flex-wrap flex gap-4 justify-center">
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Total Inventory Items
                </h3>
                <p className="text-2xl">{totalInventoryItems}</p>
              </div>
              <FaBox className="bg-indigo-600 text-white text-5xl p-3 shadow-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  In Stock Items
                </h3>
                <p className="text-2xl">{inventoryItemsInStock}</p>
              </div>
              <FaBox className="bg-green-600 text-white  text-5xl p-3 shadow-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Low Stock Items
                </h3>
                <p className="text-2xl">{inventoryItemsInStock}</p>
              </div>
              <FaBox className="bg-yellow-600 text-white  text-5xl p-3 shadow-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Out of Stock Items
                </h3>
                <p className="text-2xl">{inventoryItemsOutOfStock}</p>
              </div>
              <FaBox className="bg-red-600 text-white  text-5xl p-3 shadow-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Expired Items
                </h3>
                <p className="text-2xl">{inventoryItemsExpired}</p>
              </div>
              <FaBox className="bg-red-600 text-white  text-5xl p-3 shadow-lg" />
            </div>
          </div>
          <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
            <div className="flex justify-between">
              <div className="">
                <h3 className="text-gray-500 text-md uppercase">
                  Close to expiry items
                </h3>
                <p className="text-2xl">{itemCloseToExpairy}</p>
              </div>
              <FaBox className="bg-yellow-600 text-white  text-5xl p-3 shadow-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex ml-4 mb-4">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <span className="w-2.5 h-2.5 bg-green-700 rounded-full mr-1.5"></span>
          Good
        </span>
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full mr-1.5"></span>
          Close to expiry
        </span>
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <span className="w-2.5 h-2.5 bg-red-700 rounded-full mr-1.5"></span>
          Expired
        </span>
      </div>
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
          <TextInput
            type="text"
            placeholder="Search by item name..."
            rightIcon={AiOutlineSearch}
            className="hidden lg:inline"
            id="search"
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            style={{ width: "300px" }}
          />
          <Button className="w-12 h-10 lg:hidden" color="gray">
            <AiOutlineSearch />
          </Button>
          <Button
            className="w-200 h-10 ml-6lg:ml-0 lg:w-32 ml-4"
            color="gray"
            onClick={() => handleReset()}
          >
            Reset
          </Button>
          <ReactSelect
            id="filter"
            className="ml-4"
            onChange={handleStatusChange}
            placeholder="Select a criteria..."
            value={selectedStatus}
            styles={{
              control: (provided) => ({
                ...provided,
                width: "200px",
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "black",
              }),
            }}
            options={[
              { value: "all", label: "All" },
              { value: "expired", label: "Expired" },
              { value: "one-month-away", label: "One Month Away" },
              { value: "in-stock", label: "In Stock" },
              { value: "low-stock", label: "Low Stock" },
              { value: "out-of-stock", label: "Out of Stock" },
            ]}
            isClearable
            isSearchable
          />
          <Button
            gradientDuoTone="greenToBlue"
            outline
            onClick={() => {
              handleReportGeneration();
            }}
            className="ml-4"
            disabled={!selectedStatus}
          >
            Download Report
          </Button>
          <select
            id="filter"
            onChange={handleInventoryFilterByStatus}
            className="ml-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="defaultvalue" disabled selected>
              Choose a filter option
            </option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="Outofstock">Out Of Stock</option>
            <option value="expired">Expired</option>
            <option value="closetoexpire">Close to expire</option>
          </select>
        </div>
      </div>
      {currentUser.isAdmin ||
      currentUser.isPharmacist ||
      (currentUser.isReceptionist && inventory.length > 0) ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Created</Table.HeadCell>
              <Table.HeadCell>Item Name</Table.HeadCell>
              <Table.HeadCell>Item Description</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Expiration</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            {displayInventoryItems}
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
        <p>You have no Inventory Items</p>
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
      {/** Add Inventory Modal */}
      <Modal
        show={AddInventoryItemModal}
        onClose={() => {
          setAddInventoryItemModal(false),
            setFormData({}),
            setImageFile(null),
            setImageFileUploadingError(false),
            setFileUploadSuccess(false),
            fileUploadSuccess(false),
            setImageFileUploadingError(false),
            setImageFileUploadingProgress(false);
        }}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
              Add New Inventory Item
            </h3>
          </div>
          <form onSubmit={handleInventoryItemSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="mb-4">
                <Label htmlFor="itemName">Item Name</Label>
                <TextInput
                  type="text"
                  id="itemName"
                  placeholder="Enter Item Name"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemCategory">Item Category</Label>
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
                <Label htmlFor="itemExpireDate">Item Expire Date</Label>
                <TextInput
                  type="date"
                  id="itemExpireDate"
                  placeholder="Enter Item Expiry Date"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemQuantity">Item Quantity</Label>
                <TextInput
                  type="number"
                  id="itemQuantity"
                  placeholder="Enter Item Quantity"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemPrice">Item Price</Label>
                <TextInput
                  type="number"
                  id="itemPrice"
                  placeholder="Enter Item price"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemMinValue">Item Minimum Quantity</Label>
                <TextInput
                  type="number"
                  id="itemMinValue"
                  placeholder="Enter Item Minimum Quantity"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemMinValue">Supplier Email</Label>
                <TextInput
                  type="email"
                  id="supplierEmail"
                  placeholder="Enter Supplier Email"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemDescription">Supplier</Label>
                <TextInput
                  id="supplier"
                  placeholder="Enter Supplier Name"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemDescription">Item Description</Label>
                <Textarea
                  id="itemDescription"
                  placeholder="Enter Item Description"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemImage">Item Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="input-field ml-5"
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
                    setImageFileUploadingError(false),
                    setImageFileUploadingProgress(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/** Inventory Update Modal */}
      <Modal
        show={invetoryUpdateModal}
        onClose={() => {
          setUpdateInventoryItemModal(false),
            setFormData({}),
            setImageFile(null),
            setImageFileUploadingError(false),
            setFileUploadSuccess(false),
            fileUploadSuccess(false),
            setImageFileUploadingError(false),
            setImageFileUploadingProgress(null);
        }}
        popup
        size="xlg"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
              Update Inventory Item
            </h3>
          </div>
          <form onSubmit={handleInventoryItemUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="mb-4">
                <Label htmlFor="itemName">Item Name</Label>
                <TextInput
                  type="text"
                  id="itemName"
                  placeholder={inventoryData.itemName}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemCategory">Item Category</Label>
                <Select
                  id="itemCategory"
                  label="itemCategory"
                  placeholder={inventoryData.itemCategory}
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
                <Label htmlFor="itemExpireDate">Item Expire Date</Label>
                <TextInput
                  type="date"
                  id="itemExpireDate"
                  placeholder={inventoryData.itemExpireDate}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemQuantity">Item Quantity</Label>
                <TextInput
                  type="number"
                  id="itemQuantity"
                  placeholder={inventoryData.itemQuantity}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemPrice">Item Price</Label>
                <TextInput
                  type="number"
                  id="itemPrice"
                  placeholder={inventoryData.itemPrice}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemMinValue">Item Minimum Quantity</Label>
                <TextInput
                  type="number"
                  id="itemMinValue"
                  placeholder={inventoryData.itemMinValue}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemMinValue">Supplier Email</Label>
                <TextInput
                  type="email"
                  id="supplierEmail"
                  placeholder={inventoryData.supplierEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemDescription">Supplier Name</Label>
                <TextInput
                  id="supplier"
                  placeholder={inventoryData.supplierName}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemDescription">Item Description</Label>
                <Textarea
                  id="itemDescription"
                  placeholder={inventoryData.itemDescription}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="itemImage">Item Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field ml-5"
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
            </div>
            <div className="flex justify-center gap-4">
              <Button
                type="submit"
                gradientDuoTone="pinkToPurple"
                color="red"
                outline
              >
                Update Item
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setUpdateInventoryItemModal(false),
                    setFormData({}),
                    setImageFile(null),
                    setImageFileUploadingError(false),
                    setFileUploadSuccess(false),
                    fileUploadSuccess(false),
                    setImageFileUploadingError(false),
                    setImageFileUploadingProgress(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/** Item Details Modal */}
      <Modal
        show={showItemDetailsModal}
        onClose={() => setShowItemDetailsModal(false)}
        popup
        size="xlg"
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
                Item Supplier Name:
              </label>
              {selectedItemDetails.supplierName ? (
                <p>{selectedItemDetails.supplierName}</p>
              ) : (
                <p>No Supplier Deails Were Added</p>
              )}
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Supplier Email:
              </label>
              {selectedItemDetails.supplierEmail ? (
                <p>{selectedItemDetails.supplierEmail}</p>
              ) : (
                <p>No Supplier Deails Were Added</p>
              )}
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Category:
              </label>
              <p>{selectedItemDetails.itemCategory}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Price LKR:
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
            <div className="mb-4">
              <label className="text-gray-600 dark:text-gray-400 font-semibold">
                Item Expire Date:
              </label>
              <p>{selectedItemDetails.itemExpireDate}</p>
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
                Item Description:
              </label>
              <p>{selectedItemDetails.itemDescription}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/** Order Show Modal */}
      <Modal
        show={orderShowModal}
        onClose={() => {
          setOrderShowModal(false);
        }}
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
          <div className="grid grid-cols-1">
            <div className="text-center">
              <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                Order Inventory Item
              </h3>
            </div>
            <form onSubmit={handleOrderItem}>
              <div className="grid grid-cols-1">
                <div className="mb-4">
                  <Label htmlFor="itemName">Item Name</Label>
                  <TextInput
                    type="text"
                    id="itemName"
                    value={itemName}
                    className="bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-400"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="itemName">Supplier Name</Label>
                  <TextInput
                    type="text"
                    id="itemName"
                    value={supplierName}
                    className="bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-400"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="itemName">Supplier Email</Label>
                  <TextInput
                    type="text"
                    id="itemName"
                    value={supplierEmail}
                    className="bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-400"
                    disabled
                  />
                </div>
              </div>
              <div className="">
                <div className="mb-4">
                  <Label htmlFor="itemName">Enter Quantity</Label>
                  <TextInput
                    type="number"
                    min="100"
                    id="itemQuantity"
                    placeholder="Enter Item Quantity"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  gradientDuoTone="pinkToPurple"
                  color="red"
                  outline
                >
                  Order Item
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    setOrderShowModal(false), setFormData({});
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
