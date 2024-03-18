import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../components/DashSideBar";
import DashProfile from "../components/DashProfile";
import DashUserProfiles from "../components/DashUserProfiles";
import DashInquiries from "../components/DashInquiries";
import DashInventory from "../components/DashInventory";
import DashPatients from "../components/DashOutPatients";
import DashInpatients from "../components/DashInpatients";
import DashUserInquiries from "../components/DashUserInquiries";
import DashStaffManagement from "../components/DashStaffManagement";
import DashEMPLeave from "../components/DashEMPLeave";
export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return(
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* <DashSideBar /> */}
      <div className=" md:w-56">
        <DashSideBar />
      </div>
      {/* <DashProfile /> */}
      {tab === "profile" && <DashProfile />}
      {/** <DashUserProfiles /> */}
      {tab === "users" && <DashUserProfiles/>}
      {/** <DashInquiries /> */}
      {tab==="inquiries" && <DashInquiries/>}
      {/** <DashInventory /> */}
      {tab==="inventory" && <DashInventory/>}
      {/** <DashPatients /> */}
      {tab==="patients" && <DashPatients/>}
      {/** <DashInpatients /> */}
      {tab==="inpatients" && <DashInpatients/>}
      {/** <DashUserInquires/> */}
      {tab==="userInquiries" && <DashUserInquiries/>}
      {/** <DashStaffManagement /> */}
      {tab=="staff" && <DashStaffManagement/>}
      {/**<EmployeeLeave/> */}
      {tab==="leave" && <DashEMPLeave/>}
    </div>
  );
}
