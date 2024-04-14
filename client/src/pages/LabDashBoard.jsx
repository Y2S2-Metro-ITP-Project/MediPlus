import { useEffect,useState } from "react";
import { useLocation } from "react-router-dom";
import DashLabSideBar from "../components/DashLabSideBar"
import DashCollectionCentre from "../components/DashCollectionCentre";
import DashTestManager from "../components/DashTestManager";
import DashLabTestOrder from "../components/DashLabTestOrder";

export default function LabDashBoard() {

  const location = useLocation();
  const [tab , setTab] = useState('')
  useEffect(() => {

    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get("tab")
    
    if(tabFromUrl){
      setTab(tabFromUrl);
    }

  }, [location.search]
  );
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className=" md: w-56">
        {/* Sidebar */}
        <DashLabSideBar/>
      </div>
      {/*Sample Collection Center */}
      {tab === 'sampleCollection' && <DashCollectionCentre /> }
      {/*Lab tests manager*/}
      {tab=== "tests" && <DashTestManager/>}
      {/*Lab test order*/}
      {tab=== "testOrder" && <DashLabTestOrder/>}
    </div>
  )
}
