import React, { useState, useEffect } from 'react';
import InstructorLayout from '../../components/Navbar/Sidebar';
import api from '../../config/server';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

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
    const { toast } = useUI();
    const { update } = useAuth();

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
                        linkedin: data.data.linkedin || '',
                        instructorStatus: data.data.instructorStatus || 'pending'
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
            toast("Profile updated successfully!");
            // Keep the navbar/sidebar name in sync immediately
            update({ name: profile.name });
        } catch (error) {
            toast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <InstructorLayout>
                <header className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center">
                        Instructor Settings
                    </h1>

                    {/* Status Banner */}
                    {profile.instructorStatus === 'pending' && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                            <i className="fas fa-clock text-yellow-600 text-xl mt-0.5"></i>
                            <div>
                                <h3 className="font-bold text-yellow-800">Waiting for Approval</h3>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Your instructor application is currently under review. <br />
                                    Please ensure your profile is fully completed with a bio and professional links to speed up the process.
                                    You will be notified once an admin reviews your request.
                                </p>
                            </div>
                        </div>
                    )}

                    {profile.instructorStatus === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <i className="fas fa-times-circle text-red-600 text-xl mt-0.5"></i>
                            <div>
                                <h3 className="font-bold text-red-800">Application Rejected/Blocked</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    Your instructor access has been revoked or denied. Please contact support for more details.
                                </p>
                            </div>
                        </div>
                    )}

                    {profile.instructorStatus === 'approved' && (
                        <p className="text-green-600 font-medium mt-2 flex items-center gap-2">
                            <i className="fas fa-check-circle"></i> Verified Instructor Account
                        </p>
                    )}
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="settings-name" className="block text-sm font-bold text-navy-900 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    id="settings-name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-email" className="block text-sm font-bold text-navy-900 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="settings-email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="settings-headline" className="block text-sm font-bold text-navy-900 mb-2">Professional Headline</label>
                            <input
                                type="text"
                                id="settings-headline"
                                    name="headline"
                                value={profile.headline}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                placeholder="e.g. Senior Software Engineer at Google"
                            />
                        </div>

                        <div>
                            <label htmlFor="settings-bio" className="block text-sm font-bold text-navy-900 mb-2">Bio</label>
                            <textarea
                                id="settings-bio"
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
                                <label htmlFor="settings-website" className="block text-sm font-bold text-navy-900 mb-2">Website URL</label>
                                <input
                                    type="url"
                                    id="settings-website"
                                    name="website"
                                    value={profile.website}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-navy-900"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-linkedin" className="block text-sm font-bold text-navy-900 mb-2">LinkedIn Profile</label>
                                <input
                                    type="url"
                                    id="settings-linkedin"
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
        </InstructorLayout>
    );
};

export default InstructorSettings;
