import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector,useDispatch} from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
export default function Header() {
  const dispatch=useDispatch();
  const path = useLocation().pathname;
  const { currentUser } = useSelector((state) => state.user);
  const {theme}=useSelector(state=>state.theme);
  const handleSignout = async () => {
    try {
      const res = await fetch(`/api/user/signout`, {
        method: "POST",
      });
      if (res.ok) {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Navbar className="border-b-2">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-gradient-to-r  from-indigo-500 via-purple-500 to-pink-500  rounded-lg text-white">
          Medi
        </span>
        Plus
      </Link>
      <form>
        <TextInput
          type="text"
          placeholder="Search...."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        />
      </form>
      <Button className="w-12 h-10 lg:hidden" color="gray" pill>
        <AiOutlineSearch />
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline" color="gray" pill onClick={()=>dispatch(toggleTheme())}>
          {theme==='light'?<FaSun/>:<FaMoon/>}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={<Avatar size="sm" img={currentUser.profilePicture} rounded />}
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Header>
                  <Link to={'/dashboard?tab=profile'}>
                    <Dropdown.Item>Profile</Dropdown.Item>
                  </Link>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
                </Dropdown.Header>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue" outline>
              Sign In
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to="/">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path == "/about"} as={"div"}>
          <Link to="/about">About</Link>
        </Navbar.Link>
        <Navbar.Link active={path == "/contact-us"} as={"div"}>
          <Link to="/contact-us">Contact Us</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
