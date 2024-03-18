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
import { FaUserInjured } from "react-icons/fa";
import { FaBox } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
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
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
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
                  : "User"
              }
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
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
                  Patients
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=inpatients">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={FaUserInjured}
                  as="div"
                >
                  Inpatients
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
              <Link to="/dashboard?tab=inquiries">
                <Sidebar.Item
                  active={tab === "inquiries"}
                  icon={HiAnnotation}
                  as="div"
                >
                  Inquiries
                </Sidebar.Item>
              </Link>
            </>
          )}
          {
            currentUser.isUser && (
              <Link to="/dashboard?tab=userInquiries">
              <Sidebar.Item
                active={tab === "inquiries"}
                icon={HiAnnotation}
                as="div"
              >
                Inquiries
              </Sidebar.Item>
            </Link>
            )
          }
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
