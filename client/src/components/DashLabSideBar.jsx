import { Sidebar } from "flowbite-react";
import { HiUser, HiArrowSmRight } from "react-icons/hi";
import { FaHouseMedical } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ImLab } from "react-icons/im";

export default function DashLabSideBar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <Sidebar className=" w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link to="/lab-dashboard?tab=sampleCollection">
            <Sidebar.Item
              active={tab === "sampleCollection"}
              icon={FaHouseMedical}
              label={"User"}
              labelColor="dark"
            >
              Collection Center
            </Sidebar.Item>
          </Link>

          {/* add current user trace option */}

          <Link to=" ">
            <Sidebar.Item
              active={tab === "sampleManager"}
              icon={ImLab}
              as="div"
            >
              Sample Manager
            </Sidebar.Item>
          </Link>

          <Link to=" ">
            <Sidebar.Item active={tab === "testManager"} icon={ImLab} as="div">
              Tests Manager
            </Sidebar.Item>
          </Link>

          <Link to=" ">
            <Sidebar.Item active={tab === "testOrder"} icon={ImLab} as="div">
              Lab Test Order
            </Sidebar.Item>
          </Link>

          <Link to=" ">
            <Sidebar.Item
              active={tab === "orderedTestManager"}
              icon={ImLab}
              as="div"
            >
              Test Orders Manager
            </Sidebar.Item>
          </Link>

          <Link to=" ">
            <Sidebar.Item active={tab === "labReports"} icon={ImLab} as="div">
              Lab Reports
            </Sidebar.Item>
          </Link>

          <Sidebar.Item icon={HiArrowSmRight} className="cursor-pointer">
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
