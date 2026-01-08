import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/server';
import CertificateTemplate from '../../components/Profile/CertificateTemplate';

const Profile = () => {
    const { user, logout } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const { data } = await api.get('/users/certificates');
                setCertificates(data.data);
            } catch (err) {
                console.error("Failed to fetch certificates", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCertificates();
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-gradient-to-r from-navy-900 to-blue-900 h-40 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-3xl border-4 border-white bg-blue-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-navy-900">{user.name}</h1>
                                <p className="text-blue-600 font-bold capitalize flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                    {user.role}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={logout} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                                    <i className="fas fa-sign-out-alt"></i> Log Out
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-navy-50/30 rounded-2xl border border-navy-100">
                                <p className="text-[10px] text-navy-400 uppercase font-black tracking-widest mb-1.5">Email Address</p>
                                <p className="text-navy-900 font-bold">{user.email}</p>
                            </div>
                            {user.role !== 'instructor' && (
                                <div className="p-5 bg-navy-50/30 rounded-2xl border border-navy-100">
                                    <p className="text-[10px] text-navy-400 uppercase font-black tracking-widest mb-1.5">Learning Status</p>
                                    <p className="text-navy-900 font-bold">{certificates.length} Certificates Earned</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Certificates Section */}
                {/* Certificates Section - Hidden for Instructors */}
                {user.role !== 'instructor' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-navy-900">My Certificates</h2>
                            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full"></div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-gray-100 h-48 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : certificates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {certificates.map(cert => (
                                    <div key={cert._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-amber-100 transition"></div>
                                        <i className="fas fa-certificate absolute top-4 right-4 text-amber-500 text-2xl group-hover:scale-110 transition-transform"></i>

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Completion Certificate</p>
                                                <h3 className="text-xl font-bold text-navy-900 mb-2 line-clamp-2">{cert.course?.title}</h3>
                                                <p className="text-xs text-gray-400 font-medium">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-gray-300">ID: {cert.certificateId}</span>
                                                <button
                                                    onClick={() => setSelectedCertificate(cert)}
                                                    className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                                                >
                                                    View <i className="fas fa-external-link-alt text-[10px]"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                                    <i className="fas fa-award text-4xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-navy-900 mb-2">No certificates yet</h3>
                                <p className="text-gray-400 max-w-xs mx-auto text-sm">Complete a course 100% to earn your professional certification.</p>
                                <button className="mt-6 px-6 py-2 bg-navy-900 text-white font-bold rounded-xl shadow-lg shadow-navy-100 hover:bg-blue-900 transition text-sm">
                                    Explore Courses
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {selectedCertificate && (
                <CertificateTemplate
                    certificate={selectedCertificate}
                    user={user}
                    onClose={() => setSelectedCertificate(null)}
                />
            )}
        </div>
    );
};

export default Profile;
