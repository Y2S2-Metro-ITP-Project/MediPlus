import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { HiOutlineCalendar, HiOutlineSun } from "react-icons/hi";
import Chart from 'chart.js/auto'; // don't remove this

export default function Dashstaff_dashboard() {
    const [leaves, setLeaves] = useState([]);
    const [employeesSummary, setEmployeesSummary] = useState(null);
    const [totalPendingLeaves, setTotalPendingLeaves] = useState(0);
    const [todaysTotalLeave, setTodaysTotalLeave] = useState(0);

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
                console.error('Error fetching employees summary:', error);
            }
        }

        fetchData();
    }, []); // Empty dependency array means this effect runs only once when the component mounts
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
   
    }, [employeesSummary, totalPendingLeaves, todaysTotalLeave]); // Log whenever any of these state values change

    const chartData = {
        labels: ['Admin', 'HRM', 'Doctor', 'Nurse', 'Pharmacist', 'Receptionist', 'Head Nurse', 'LabTech', 'Cashier'],
        datasets: [
            {
                label: 'Total Employees',
                data: [
                    employeesSummary ? employeesSummary.totalAdmins : 0,
                    employeesSummary ? employeesSummary.totalHRMs : 0,
                    employeesSummary ? employeesSummary.totalDoctors : 0,
                    employeesSummary ? employeesSummary.totalNurses : 0,
                    employeesSummary ? employeesSummary.totalPharmacists : 0,
                    employeesSummary ? employeesSummary.totalReceptionists : 0,
                    employeesSummary ? employeesSummary.totalHeadNurses : 0,
                    employeesSummary ? employeesSummary.totalLabTechs : 0,
                    employeesSummary ? employeesSummary.totalCashiers : 0,
                ],
                backgroundColor: [
                    'rgb(187, 43, 74)', // Red
                    'rgba(54, 162, 235, 0.6)', // Blue
                    'rgb(51, 134, 38)', // Yellow
                    'rgb(201, 51, 201)', // Green
                    'rgba(153, 102, 255, 0.6)', // Purple
                    'rgb(131, 129, 16)', // Orange
                    'rgb(253, 100, 184)', // Lime
                    'rgb(245, 125, 45)', // Lavender
                    'rgba(51, 103, 86, 1)', // Cyan
                ],
            },
        ],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Set the step size to 1 to display only whole numbers
                    precision: 0, // Set the precision to 0 to ensure only integers are displayed
                },
            },
        },
    };
    
    
    return (
        <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
          
            <p className="text-2xl">Employee Summary</p>
            <br /> 
            <div className="flex-wrap flex gap-4 justify-center">
            <div style={{ height: '400px', width: '600px' }}> 
                <Bar
                    data={chartData}
                    options={chartOptions}
                />
            </div>
            </div>
            <br/>
                <p className="text-2xl">Employee Leave Summary</p>
                <br />
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
