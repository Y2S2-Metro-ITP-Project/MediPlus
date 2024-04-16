import { HiOutlineSun, HiOutlineCalendar, HiOutlineUser, HiOutlineBriefcase,  HiOutlineShoppingBag, HiOutlineUserGroup,  HiOutlineCurrencyDollar, HiOutlineBeaker } from "react-icons/hi";
import {FaUserNurse , FaUserMd } from "react-icons/fa";
import{ MdLocalHospital } from "react-icons/md"
import{ BsPeople } from "react-icons/bs"
import React, { useState, useEffect } from 'react';

export default function Dashstaff_dashboard() {
    const [leaves, setLeaves] = useState([]);
    const [totalPendingLeaves, setTotalPendingLeaves] = useState(0);
    const [todaysTotalLeave, setTodaysTotalLeave] = useState(0);
    const [employeesSummary, setEmployeesSummary] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch leaves
                const leavesResponse = await fetch(`/api/leaves/getAllLeaves`);
                if (!leavesResponse.ok) {
                    throw new Error('Failed to fetch leaves');
                }
                const leavesData = await leavesResponse.json();
                setLeaves(leavesData);

                // Fetch total pending leaves
                const pendingLeavesResponse = await fetch(`/api/leaves/getTotalPendingLeave`);
                if (!pendingLeavesResponse.ok) {
                    throw new Error('Failed to fetch total pending leaves');
                }
                const pendingLeavesData = await pendingLeavesResponse.json();
                setTotalPendingLeaves(pendingLeavesData.totalPendingLeave);

                // Fetch today's total leave
                const todaysLeaveResponse = await fetch(`/api/leaves/getTodaysTotalLeave`);
                if (!todaysLeaveResponse.ok) {
                    throw new Error('Failed to fetch today\'s total leave');
                }
                const todaysLeaveData = await todaysLeaveResponse.json();
                setTodaysTotalLeave(todaysLeaveData.todaysTotalLeave);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/leaves/getEmployeesSummary`);
                if (!response.ok) {
                    throw new Error('Failed to fetch employees summary');
                }
                const data = await response.json();
                setEmployeesSummary(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
            <div className="flex justify-between"></div> <br />
            <p className="text-2xl">Employee Summary</p> <br />
            <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-6 dark:bg-slate-800 gap-4 md:w-96 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Employees</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalEmployees}</p>
                        </div>
                        <BsPeople className="bg-red-700 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div> 
                </div> <br /><br />

                <div className="flex-wrap flex gap-4 justify-center"  >
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md" >
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Admin</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalAdmins}</p>
                        </div>
                        <HiOutlineUser className="bg-blue-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total HRM</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalHRMs}</p>
                        </div>
                        <HiOutlineBriefcase className="bg-blue-300 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                </div><br /><br />


                <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Doctor</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalDoctors}</p>
                        </div>
                        <FaUserMd className="bg-green-400 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>

                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Nurse</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalNurses}</p>
                        </div>
                        <FaUserNurse className="bg-pink-400 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                </div><br /><br />


                <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Pharmacist</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalPharmacists}</p>
                        </div>
                        <HiOutlineShoppingBag className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Receptionist</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalReceptionists}</p>
                        </div>
                        <HiOutlineUserGroup className="bg-orange-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                </div><br /><br />


                <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Head Nurse</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalHeadNurses}</p>
                        </div>
                        <MdLocalHospital className="bg-pink-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total LabTech</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalLabTechs}</p>
                        </div>
                        <HiOutlineBeaker className="bg-yellow-300 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                </div><br /><br />

                <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Cashier</h3>
                            <p className="text-2xl">{employeesSummary && employeesSummary.totalCashiers}</p>
                        </div>
                        <HiOutlineCurrencyDollar className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
            </div>
            <br/> <br />
            <p className="text-2xl">Employee Leave Summary</p> <br />
            <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Total Pending Leaves</h3>
                            <p className="text-2xl">{totalPendingLeaves}</p>
                        </div>
                        <HiOutlineCalendar className="bg-red-700 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 rounded-md shadow-md">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-500 text-md uppercase">Today's Leaves</h3>
                            <p className="text-2xl">{todaysTotalLeave}</p>
                        </div>
                        <HiOutlineSun className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                    </div>
                </div>
            </div>
            <br /><br />
        </div>
    );
}
