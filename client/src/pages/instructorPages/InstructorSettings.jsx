import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import Toast from '../../components/Alert/Toast';

const InstructorSettings = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        headline: '',
        bio: '',
        website: '',
        linkedin: ''
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                if (data.success) {
                    setProfile({
                        name: data.data.name || '',
                        email: data.data.email || '',
                        headline: data.data.headline || '',
                        bio: data.data.bio || '',
                        website: data.data.website || '',
                        linkedin: data.data.linkedin || ''
                    });
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile/update', profile);
            setNotification({ show: true, message: "Profile updated successfully!", type: "success" });

            // Update local storage user name if changed, to keep UI in sync immediately
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.name = profile.name;
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (error) {
            setNotification({
                show: true,
                message: error.response?.data?.message || "Failed to update profile",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Instructor Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your public profile and account preferences.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-2">Professional Headline</label>
                            <input
                                type="text"
                                name="headline"
                                value={profile.headline}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                placeholder="e.g. Senior Software Engineer at Google"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-2">Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                placeholder="Tell students about yourself..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2">Website URL</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={profile.website}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2">LinkedIn Profile</label>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={profile.linkedin}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Toast
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, show: false })}
            />
        </div>
    );
};

export default InstructorSettings;
