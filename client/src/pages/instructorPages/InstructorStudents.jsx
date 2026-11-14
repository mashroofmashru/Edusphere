import React, { useState, useEffect } from 'react';
import InstructorLayout from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import { EmptyState, TableSkeleton } from '../../components/UI/Feedback';
import { initialOf } from '../../utils/format';

const ProgressBar = ({ value }) => (
    <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[6rem]">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${value || 0}%` }}></div>
        </div>
        <span className="text-sm font-bold text-navy-900 whitespace-nowrap">{value || 0}%</span>
    </div>
);

const InstructorStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.get('/instructor/enrolled-students')
            .then(({ data }) => setStudents(data.data || []))
            .catch(() => console.error('Failed to fetch enrolled students'))
            .finally(() => setLoading(false));
    }, []);

    const q = searchQuery.toLowerCase();
    const filteredStudents = students.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.courseTitle || '').toLowerCase().includes(q)
    );

    return (
        <InstructorLayout>
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">Enrolled Students</h1>
                <p className="text-gray-500 mt-1">Track student progress and enrollments.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                        <input
                            type="search"
                            aria-label="Search students"
                            placeholder="Search by name, email or course..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!loading && <p className="text-sm text-gray-500">{filteredStudents.length} of {students.length} enrollments</p>}
                </div>

                {!loading && filteredStudents.length === 0 ? (
                    <EmptyState
                        icon="fa-users-slash"
                        title={searchQuery ? 'No matching students' : 'No students enrolled yet'}
                        message={searchQuery ? 'Try a different name, email or course.' : 'Students will appear here once they enroll in your courses.'}
                    />
                ) : (
                    <>
                        <ul className="md:hidden divide-y divide-gray-100">
                            {loading ? [1, 2, 3].map(i => <li key={i} className="p-4"><div className="h-14 bg-gray-100 rounded-lg animate-pulse"></div></li>)
                                : filteredStudents.map((item, idx) => (
                                    <li key={idx} className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-sm shrink-0">{initialOf(item.name)}</div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-navy-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.email}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-blue-700">{item.courseTitle}</p>
                                        <ProgressBar value={item.progress} />
                                    </li>
                                ))}
                        </ul>

                        <div className="hidden md:block overflow-x-auto">
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
                                    {loading ? <TableSkeleton cols={4} /> : filteredStudents.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="p-5 font-bold text-navy-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-xs">{initialOf(item.name)}</div>
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="p-5 text-gray-600">{item.email}</td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{item.courseTitle}</span>
                                            </td>
                                            <td className="p-5"><ProgressBar value={item.progress} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </InstructorLayout>
    );
};

export default InstructorStudents;
