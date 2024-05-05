import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Appointemnt from "./pages/Appointment/Index";
import Appoint from "./pages/Appointment/dummy";
import ContactUs from "./pages/ContactUs";
import Header from "./components/Header";
import FooterComp from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import LabDashBoard from "./pages/LabDashBoard";
import CollectionCentre from "./pages/CollectionCentre";
import TestProfileManager from "./pages/TestProfileManager";
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/appointment" element={<Appointemnt />} />
        <Route path="/appoint" element={<Appoint />} />
        <Route element={<PrivateRoute/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/lab-dashboard" element={<LabDashBoard/>}/>
        <Route path="/lab-sample-collection" element={<CollectionCentre/>}/>
        <Route path="/lab-test-profile-manager" element={<TestProfileManager/>}/>
      </Routes>
      <FooterComp/>
    </BrowserRouter>
  );
}
