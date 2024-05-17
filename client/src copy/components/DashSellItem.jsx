import React, { useState, useEffect } from "react";
import { Button, TextInput, Modal, ToastContainer, Table } from "flowbite-react";
import { HiOutlineExclamationCircle, HiEye } from "react-icons/hi";
import { useSelector } from "react-redux";
import { FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SellItem() {
    const { currentUser } = useSelector((state) => state.user);
    const [sellItems, setSellItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedItemDetails, setSelectedItemDetails] = useState({});


    const [itemName, setItemName] = useState("");
}  