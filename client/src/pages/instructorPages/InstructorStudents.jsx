import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchEnrolledStudents();
    }, []);

    const fetchEnrolledStudents = async () => {
        try {
            const { data } = await api.get('/instructor/enrolled-students');
            setStudents(data.data);
        } catch (err) {
            console.error("Failed to fetch enrolled students");
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Enrolled Students</h1>
                        <p className="text-gray-500 mt-1">Track student progress and enrollments.</p>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative max-w-md">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search by name, email or course..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-5">Student Name</th>
                                    <th className="p-5">Email</th>
                                    <th className="p-5">Enrolled Course</th>
                                    <th className="p-5">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length > 0 ? filteredStudents.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="p-5 font-bold text-navy-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center font-bold text-xs">
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-600">{item.email}</td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
                                                {item.courseTitle}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-navy-900 to-blue-800 rounded-full transition-all duration-500"
                                                        style={{ width: `${item.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-navy-900 whitespace-nowrap">{item.progress || 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-gray-400">
                                            <div className="mb-2"><i className="fas fa-users-slash text-3xl"></i></div>
                                            {searchQuery ? "No matching students found." : "No students enrolled yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorStudents;
