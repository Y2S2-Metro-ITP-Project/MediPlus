import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocument,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from "react-icons/hi";
import { BiCalendarCheck } from "react-icons/bi";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaShippingFast } from "react-icons/fa";
import { FaUserInjured } from "react-icons/fa";
import { FaBox } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaRegCalendarTimes } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import { TbBrandBooking } from "react-icons/tb";
import { FaCheckToSlot } from "react-icons/fa6";
import { GiHospital } from "react-icons/gi";
import { BiCapsule } from "react-icons/bi";
import { FaClipboardList } from "react-icons/fa";
import { FaHeartbeat } from "react-icons/fa";
import { FaMoneyBill } from 'react-icons/fa';
import { IoReceiptOutline } from "react-icons/io5";
import { FaMedkit } from "react-icons/fa";
import { FaMoneyBillAlt } from 'react-icons/fa';
export default function DashSideBar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Sidebar className="w-full md:w-55">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {currentUser.isReceptionist && (
            <Link to="/dashboard?tab=receptionist">
              <Sidebar.Item
                active={tab === "receptionist" || !tab}
                icon={HiChartPie}
                labelColor="dark"
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>

          )}
          {currentUser && currentUser.isAdmin && (
            <Link to="#">
              <Sidebar.Item
                active={tab === "dash" || !tab}
                icon={HiChartPie}
                labelColor="dark"
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>     
          )}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={
                currentUser.isAdmin
                  ? "Admin"
                  : currentUser.isDoctor
                  ? "Doctor"
                  : currentUser.isNurse
                  ? "Nurse"
                  : currentUser.isPharmacist
                  ? "Pharmacist"
                  : currentUser.isReceptionist
                  ? "Receptionist"
                  : currentUser.isHeadNurse
                  ? "Head Nurse"
                  : currentUser.isHRM
                  ? "HRM"
                  : currentUser.isOutPatient
                  ? "OutPatient"
                  : currentUser.isInPatient
                  ? "InPatient"
                  : currentUser.isCashier
                  ? "Cashier"
                  : "User"
              }
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser.isDoctor && (
            <>
              <Link to="/dashboard?tab=patients">
                <Sidebar.Item
                  active={tab === "patients"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Outpatients
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=DoctorInpatient">
                <Sidebar.Item
                  active={tab === "DoctorInpatient"}
                  icon={FaUserInjured}
                  as="div"
                >
                  InPatients
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=disease">
                <Sidebar.Item
                  active={tab === "disease"}
                  icon={FaMedkit}
                  as="div"
                >
                  Add Disease
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isAdmin && (
            <>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  Users
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=booking">
                <Sidebar.Item
                  active={tab === "booking"}
                  icon={BiCalendarCheck}
                  as="div"
                >
                  Appointments
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=schedule">
                <Sidebar.Item
                  active={tab === "schedule"}
                  icon={FaCheckToSlot}
                  as="div"
                >
                  Schedule Slots
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=inquiries">
                <Sidebar.Item
                  active={tab === "inquiries"}
                  icon={HiAnnotation}
                  as="div"
                >
                  Inquiries
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=inventory">
                <Sidebar.Item
                  active={tab === "inventory"}
                  icon={FaBox}
                  as="div"
                >
                  Inventory
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=patients">
                <Sidebar.Item
                  active={tab === "patients"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Outpatients
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=inpatients">
                <Sidebar.Item
                  active={tab === "inpatients"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Inpatients
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=staff">
                <Sidebar.Item active={tab === "staff"} icon={FaUsers} as="div">
                  Employee
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=Add_staff">
                <Sidebar.Item
                  active={tab === "Add_staff"}
                  icon={FaUserPlus}
                  as="div"
                >
                  Add Employee
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=rooms">
              <Sidebar.Item
                active={tab === "rooms"}
                icon={HiDocument}
                labelColor="dark"
                as="div"
              >
                Rooms
              </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=slots">
              <Sidebar.Item active={tab === "slots"} icon={HiDocumentText} as="div">  
                Slots
              </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=leave">
                <Sidebar.Item
                  active={tab === "leave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Employee Leave
                </Sidebar.Item>
              </Link>
              
              <Link to="/dashboard?tab=Empsalary">
                <Sidebar.Item
                  active={tab === "Empsalary"}
                  icon={FaMoneyBill}
                  as="div"
                >
                  Salary
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=ConsultPayment">
                <Sidebar.Item
                  active={tab === "ConsultPayment"}
                  icon={FaMoneyBillAlt}
                  as="div"
                >
                  Consultation Payment
                </Sidebar.Item>
              </Link>

            </>
          )}
          {currentUser.isDoctor && (
            <>
              <Link to="/dashboard?tab=booking">
                <Sidebar.Item
                  active={tab === "booking"}
                  icon={BiCalendarCheck}
                  as="div"
                >
                  Appointment
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=schedule">
                <Sidebar.Item
                  active={tab === "schedule"}
                  icon={FaCheckToSlot}
                  as="div"
                >
                  Schedule Slots
                </Sidebar.Item>
              </Link>
            </>
          )}

          {currentUser.isCashier && (
            <>
              <Link to="/dashboard?tab=OutPatientBilling">
                <Sidebar.Item
                  active={tab === "OutPatientBilling"}
                  icon={IoReceiptOutline}
                  as="div"
                >
                  Out Patient Billing
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=InpatientPayment">
                <Sidebar.Item
                  active={tab === "InpatientPayment"}
                  icon={IoReceiptOutline}
                  as="div"
                >
                  In Patient Billing
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=ConsultationBilling">
                <Sidebar.Item
                  active={tab === "CounsultationBilling"}
                  icon={TbBrandBooking}
                  as="div"
                >
                  Consultation
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isPharmacist && (
            <>
              <Link to="/dashboard?tab=orderPrescritions">
                <Sidebar.Item
                  active={tab === "orderPrescritions"}
                  icon={FaClipboardList}
                  as="div"
                >
                  Doctor Orders{" "}
                  <span
                    style={{
                      color: tab === "orderPrescritions" ? "green" : "red", // Adjust colors as needed
                      fontWeight: "bold",
                      marginLeft: "5px",
                    }}
                  >
                    OUT
                  </span>
                  <span style={{ fontSize: "12px", color: "gray" }}></span>
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=DoctorOrderIn">
                <Sidebar.Item
                  active={tab === "DoctorOrderIn"}
                  icon={FaClipboardList}
                  as="div"
                >
                  Doctor Orders{" "}
                  <span
                    style={{
                      color: tab === "DoctorOrderIn" ? "green" : "red", // Adjust colors as needed
                      fontWeight: "bold",
                      marginLeft: "5px",
                    }}
                  >
                    IN
                  </span>
                  <span style={{ fontSize: "12px", color: "gray" }}></span>
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=inventory">
                <Sidebar.Item
                  active={tab === "inventory"}
                  icon={FaBox}
                  as="div"
                >
                  Inventory
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=supplier">
                <Sidebar.Item className="cursor-pointer" icon={FaUsers}>
                  Supplier
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=supplierorder">
                <Sidebar.Item className="cursor-pointer" icon={FaShippingFast}>
                  Supplier Orders
                </Sidebar.Item>
              </Link>
            </>
          )}

          {currentUser.isReceptionist && (
            <>
              <Link to="/dashboard?tab=patients">
                <Sidebar.Item
                  active={tab === "patients"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Out Patients
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=booking">
                <Sidebar.Item
                  active={tab === "booking"}
                  icon={BiCalendarCheck}
                  as="div"
                >
                  Appointment
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=schedule">
                <Sidebar.Item
                  active={tab === "schedule"}
                  icon={FaCheckToSlot}
                  as="div"
                >
                  Schedule Slots
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=inquiries">
                <Sidebar.Item
                  active={tab === "inquiries"}
                  icon={HiAnnotation}
                  as="div"
                >
                  Inquiries
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>
            </>
          )}
          {(currentUser.isUser ||
            currentUser.isOutPatient ||
            currentUser.isHeadNurse) && (
            <Link to="/dashboard?tab=userInquiries">
              <Sidebar.Item
                active={tab === "userInquiries"}
                icon={HiAnnotation}
                as="div"
              >
                Inquiries
              </Sidebar.Item>
            </Link>
          )}
          {(currentUser.isOutPatient || currentUser.isInPatient) && (
            <>
              <Link to="/dashboard?tab=patientDashboard">
                <Sidebar.Item
                  active={tab === "patientDashboard"}
                  icon={MdDashboard}
                  as="div"
                >
                  Dashboard
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=PatientPrescriptions">
                <Sidebar.Item
                  active={tab === "PatientPrescriptions"}
                  icon={BiCapsule} // Use the capsule icon here
                  as="div"
                >
                  Prescriptions
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=PatientDiagnosis">
                <Sidebar.Item
                  active={tab === "PatientDiagnosis"}
                  icon={FaClipboardList}
                  as="div"
                >
                  Diagnosis
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=PatientVitals">
                <Sidebar.Item
                  active={tab === "PatientVitals"}
                  icon={FaHeartbeat}
                  as="div"
                >
                  Vitals
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isOutPatient && (
            <>
              <Link to="/dashboard?tab=bookings">
                <Sidebar.Item
                  active={tab === "bookings"}
                  icon={BiCalendarCheck}
                  as="div"
                >
                  Your Appointments
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isHRM && (
            <>
              <Link to="/dashboard?tab=staff_dashbord">
                <Sidebar.Item active={tab==="staff_dashbord"} icon={HiChartPie} as="div">
                  Dashboard
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=staff">
                <Sidebar.Item active={tab === "staff"} icon={FaUsers} as="div">
                  Employee
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=Add_staff">
                <Sidebar.Item
                  active={tab === "Add_staff"}
                  icon={FaUserPlus}
                  as="div"
                >
                  Add Employee
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=leave">
                <Sidebar.Item
                  active={tab === "leave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Employee Leave
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=Empsalary">
                <Sidebar.Item
                  active={tab === "Empsalary"}
                  icon={FaMoneyBill}
                  as="div"
                >
                  Salary
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isHeadNurse && (
            <>
              <Link to="/dashboard?tab=inpatients">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Inpatients
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=beds">
                <Sidebar.Item active={tab === "beds"} icon={FaBed} as="div">
                  Beds
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=wards">
                <Sidebar.Item
                  active={tab === "wards"}
                  icon={GiHospital}
                  as="div"
                >
                  Wards
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=EMPleave">
                <Sidebar.Item
                  active={tab === "EMPleave"}
                  icon={FaRegCalendarTimes}
                  as="div"
                >
                  Leave
                </Sidebar.Item>
              </Link>
            </>
          )}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
