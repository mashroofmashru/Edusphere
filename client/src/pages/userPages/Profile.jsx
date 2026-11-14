import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/FooterHome';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import api from '../../config/server';
import CertificateTemplate from '../../components/Profile/CertificateTemplate';
import { initialOf } from '../../utils/format';

const ROLE_LABEL = { user: 'Student', instructor: 'Instructor', admin: 'Administrator' };

const Profile = () => {
    const { user, logout, update } = useAuth();
    const { toast } = useUI();
    const [certificates, setCertificates] = useState([]);
    const [enrolledCount, setEnrolledCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    const isStudent = user?.role === 'user';

    useEffect(() => {
        if (!user) return;
        if (!isStudent) {
            setLoading(false);
            return;
        }
        Promise.allSettled([api.get('/users/certificates'), api.get('/users/my-courses')])
            .then(([certs, mine]) => {
                if (certs.status === 'fulfilled') setCertificates(certs.value.data.data || []);
                if (mine.status === 'fulfilled') setEnrolledCount((mine.value.data.data || []).length);
            })
            .finally(() => setLoading(false));
    }, [user?._id, isStudent]);

    if (!user) return null;

    const saveName = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setSaving(true);
        try {
            // The endpoint writes every field it receives, so send the current values back
            // unchanged; otherwise an instructor's headline/bio/links could be cleared.
            const { data: current } = await api.get('/users/profile');
            const { headline, bio, website, linkedin } = current.data || {};
            await api.put('/users/profile/update', { name: trimmed, headline, bio, website, linkedin });
            update({ name: trimmed });
            toast('Profile updated');
            setEditing(false);
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 w-full max-w-4xl mx-auto py-10 sm:py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-gradient-to-r from-navy-900 to-blue-900 h-32 sm:h-40 relative">
                        <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-8">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white bg-blue-600 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-lg">
                                {initialOf(user.name)}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 sm:pt-20 pb-8 px-6 sm:px-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="min-w-0 flex-1">
                                {editing ? (
                                    <form onSubmit={saveName} className="flex flex-col sm:flex-row gap-2">
                                        <label htmlFor="profile-name" className="sr-only">Full name</label>
                                        <input
                                            id="profile-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            autoFocus
                                            required
                                            className="flex-1 min-w-0 p-2.5 border border-gray-200 rounded-xl text-lg font-bold text-navy-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                                                {saving ? <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> : 'Save'}
                                            </button>
                                            <button type="button" onClick={() => { setEditing(false); setName(user.name); }} className="px-4 py-2 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 break-words flex items-center gap-3">
                                        {user.name}
                                        <button onClick={() => setEditing(true)} aria-label="Edit name" title="Edit name" className="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition text-base">
                                            <i className="fas fa-pen" aria-hidden="true"></i>
                                        </button>
                                    </h1>
                                )}
                                <p className="text-blue-600 font-bold flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" aria-hidden="true"></span>
                                    {ROLE_LABEL[user.role] || user.role}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {user.role === 'instructor' && (
                                    <Link to="/instructor/settings" className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition flex items-center gap-2">
                                        <i className="fas fa-cog" aria-hidden="true"></i> Instructor Settings
                                    </Link>
                                )}
                                <button onClick={logout} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                                    <i className="fas fa-sign-out-alt" aria-hidden="true"></i> Log Out
                                </button>
                            </div>
                        </div>

                        <div className={`mt-8 grid grid-cols-1 ${isStudent ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                            <div className="p-5 bg-navy-50 rounded-2xl border border-navy-100 min-w-0">
                                <p className="text-[11px] text-navy-500 uppercase font-black tracking-widest mb-1.5">Email Address</p>
                                <p className="text-navy-900 font-bold break-all">{user.email}</p>
                            </div>
                            {isStudent && (
                                <>
                                    <Link to="/my-courses" className="p-5 bg-navy-50 rounded-2xl border border-navy-100 hover:border-blue-300 transition">
                                        <p className="text-[11px] text-navy-500 uppercase font-black tracking-widest mb-1.5">Enrolled Courses</p>
                                        <p className="text-navy-900 font-bold">{enrolledCount ?? '—'}</p>
                                    </Link>
                                    <div className="p-5 bg-navy-50 rounded-2xl border border-navy-100">
                                        <p className="text-[11px] text-navy-500 uppercase font-black tracking-widest mb-1.5">Certificates Earned</p>
                                        <p className="text-navy-900 font-bold">{loading ? '—' : certificates.length}</p>
                                    </div>
                                </>
                            )}
                            {!isStudent && (
                                <div className="p-5 bg-navy-50 rounded-2xl border border-navy-100">
                                    <p className="text-[11px] text-navy-500 uppercase font-black tracking-widest mb-1.5">Account Type</p>
                                    <p className="text-navy-900 font-bold">{ROLE_LABEL[user.role]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isStudent && (
                    <section className="space-y-6" aria-labelledby="certs-heading">
                        <div className="flex items-center justify-between">
                            <h2 id="certs-heading" className="text-xl sm:text-2xl font-bold text-navy-900">My Certificates</h2>
                            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full" aria-hidden="true"></div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map(i => <div key={i} className="bg-gray-100 h-44 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : certificates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {certificates.map(cert => (
                                    <div key={cert._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-amber-100 transition" aria-hidden="true"></div>
                                        <i className="fas fa-certificate absolute top-4 right-4 text-amber-500 text-2xl" aria-hidden="true"></i>
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex-1 pr-8">
                                                <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">Completion Certificate</p>
                                                <h3 className="text-lg sm:text-xl font-bold text-navy-900 mb-2 line-clamp-2">{cert.course?.title}</h3>
                                                <p className="text-xs text-gray-500 font-medium">Issued on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between gap-3">
                                                <span className="text-[11px] font-mono text-gray-400 truncate">ID: {cert.certificateId}</span>
                                                <button
                                                    onClick={() => setSelectedCertificate(cert)}
                                                    className="shrink-0 px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition flex items-center gap-1.5"
                                                >
                                                    View <i className="fas fa-external-link-alt text-[10px]" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-10 sm:p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
                                    <i className="fas fa-award text-4xl" aria-hidden="true"></i>
                                </div>
                                <h3 className="text-xl font-bold text-navy-900 mb-2">No certificates yet</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">Complete a course 100% to earn your certificate.</p>
                                <Link
                                    to={enrolledCount ? '/my-courses' : '/viewCourses'}
                                    className="inline-block mt-6 px-6 py-2.5 bg-navy-900 text-white font-bold rounded-xl hover:bg-blue-900 transition text-sm"
                                >
                                    {enrolledCount ? 'Continue Learning' : 'Explore Courses'}
                                </Link>
                            </div>
                        )}
                    </section>
                )}
            </main>
            <Footer />
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
