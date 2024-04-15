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
import DashLeave from "../components/DashLeave";
import DashEMPLeave from "../components/DashEMPLeave";
import { DashaddEmp } from "../components/DashaddEmp";
import DashBedManagement from "../components/DashBedManagement";
import DashWards from "../components/DashWards";
import DashBooking from "../components/DashBooking";
import DashScheduleBooking from "../components/DashScheduleBooking";
import ReceptionistDashBoard from "../components/ReceptionistDashBoard";
import DashOutPatientProfile from "../components/DashOutPatientProfile";
import PatientPrescriptions from "../components/PatientPrescriptions";
import PatientDiagnosis from "../components/PatientDiagnosis";
import PatientVitals from "../components/PatientVitals";
import DashDoctorsOrdersPrecriptions from "../components/DashDoctorsOrdersPrecriptions";
import DashMedicineDispence from "../components/DashMedicineDispence";
import DashOutPatientBilling from "../components/DashOutPatientBilling";
import OutPatientPaymentProfile from "../components/OutPatientPaymentProfile";



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
      {tab === "users" && <DashUserProfiles />}
      {/** <DashBooking /> */}
      {tab === "booking" && <DashBooking />}
      {/** <DashScheduleBooking /> */}
      {tab === "schedule" && <DashScheduleBooking />}
      {/** <DashInquiries /> */}
      {tab === "inquiries" && <DashInquiries />}
      {/** <DashInventory /> */}
      {tab === "inventory" && <DashInventory />}
      {/** <DashPatients /> */}
      {tab === "patients" && <DashPatients />}
      {/** <DashInpatients /> */}
      {tab === "inpatients" && <DashInpatients />}
      {/** <DashUserInquires/> */}
      {tab === "userInquiries" && <DashUserInquiries />}
      {/** <DashStaffManagement /> */}
      {tab=="staff" && <DashStaffManagement/>}
      {/**<Leave/> */}
      {tab==="leave" && <DashLeave/>}
       {/**<EMPleave/> */}
       {tab==="EMPleave" && <DashEMPLeave/>}
      {/**<AddEmployee/> */}
      {tab==="Add_staff" && <DashaddEmp/>}
      {/** <DashBedManagement/> */}
      {tab === "beds" && <DashBedManagement />}
      {/** <DashWards/> */}
      {tab === "wards" && <DashWards />}
      {/** <ReceptionistDashBoard/> */}
      {tab==="receptionist" && <ReceptionistDashBoard/>}
      {/**<DashPatientProfile */}
      {tab==="PatientProfile" && <DashOutPatientProfile/>}
      {/**<DashAddDiesease */}
      {tab==="AddDisease" && <DashAddDisease/>}
      {/** <DashPatientPrescriptions/> */}
      {tab==="PatientPrescriptions" && <PatientPrescriptions/>}
      {/** <DashDiagnosis/> */}
      {tab==="PatientDiagnosis" && <PatientDiagnosis/>}
      {/**<DashPatientVitals/> */}
      {tab==="PatientVitals" && <PatientVitals/>}
      {/** <DashPrecritionOrder/> */}
      {tab==="orderPrescritions" && <DashDoctorsOrdersPrecriptions/>}
      {/** <DashMedicineDispence/> */}
      {tab==="Dispence" && <DashMedicineDispence/>}
      {/** <DashOutPatientBilling/> */}
      {tab==="OutPatientBilling" && <DashOutPatientBilling/>}
      {/** <DashOutPatientPaymentProfile/> */}
      {tab==="OutPatientPaymentProfile" && <OutPatientPaymentProfile/>}
    </div>
  );
}
