import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/FooterHome';
import api from '../../config/server';
import { useUI } from '../../context/UIContext';
import { initialOf } from '../../utils/format';

// Initials avatar until real team photos are supplied (stock photos misrepresent real people)
const TeamMember = ({ name, title, bio, imgUrl }) => (
    <div className="p-8 rounded-xl shadow-md bg-white border border-gray-100 transition duration-300 hover:shadow-xl">
        {imgUrl ? (
            <img src={imgUrl} alt={name} className="w-28 h-28 rounded-full mx-auto mb-4 object-cover ring-4 ring-blue-100" />
        ) : (
            <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-gradient-to-br from-navy-900 to-blue-700 ring-4 ring-blue-100 flex items-center justify-center text-4xl font-bold text-white" aria-hidden="true">
                {initialOf(name)}
            </div>
        )}
        <h3 className="text-xl sm:text-2xl font-bold text-navy-900 mb-1">{name}</h3>
        <p className="text-base font-medium text-blue-600 mb-4">{title}</p>
        <p className="text-gray-600 leading-relaxed">
            {bio}
        </p>
    </div>
);

const ValueCard = ({ title, description }) => (
    <div className="p-6 rounded-xl shadow-sm bg-white border border-gray-100 hover:shadow-md transition duration-300 h-full text-left">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-navy-900 border-b border-blue-100 pb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">
            {description}
        </p>
    </div>
);

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const { toast } = useUI();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/contact', formData);
            toast("Message sent! We'll reply to your email soon.");
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            toast(err.response?.data?.message || "Failed to send message. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-16 sm:py-20 bg-gray-50 scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 sm:p-10 bg-navy-900 text-white flex flex-col justify-center">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Get in Touch</h2>
                            <p className="mb-8 text-blue-200">Have questions about our courses or platform? We're here to help!</p>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <i className="fas fa-envelope w-8 text-blue-400" aria-hidden="true"></i>
                                    <a href="mailto:support@edusphere.com" className="hover:underline break-all">support@edusphere.com</a>
                                </div>
                                <div className="flex items-center">
                                    <i className="fas fa-phone w-8 text-blue-400" aria-hidden="true"></i>
                                    <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
                                </div>
                                <div className="flex items-start">
                                    <i className="fas fa-map-marker-alt w-8 text-blue-400 mt-1" aria-hidden="true"></i>
                                    <span>SES College, Sreekandapuram<br />Kannur, Kerala</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        id="contact-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="contact-email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        id="contact-subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...</> : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const About = () => {
    const { hash } = useLocation();

    // Support deep links such as /about#contact (used by "Forgot password?")
    useEffect(() => {
        if (!hash) return;
        const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
        return () => clearTimeout(t);
    }, [hash]);

    const teamMembers = [
        { name: "Riyaz", title: "CEO & Founder", bio: "Riyaz is a visionary leader with a passion for accessible education and cutting-edge technology.", imgUrl: null },
        { name: "Nandana", title: "Chief Learning Officer", bio: "Nandana is an educational expert who curates our curriculum for maximum impact and relevance.", imgUrl: null },
        { name: "Swetha", title: "Head of Technology", bio: "Swetha ensures our platform is fast, reliable, and uses the latest innovations for a smooth learning journey.", imgUrl: null },
    ];

    const coreValues = [
        { title: "Excellence", description: "We are committed to delivering the highest quality educational content and an unparalleled learning experience." },
        { title: "Accessibility", description: "We strive to make world-class education available and affordable for learners from all backgrounds, globally." },
        { title: "Innovation", description: "We continuously innovate our platform and course offerings to meet the evolving demands of the future job market." },
    ];

    return (
        <div className="min-h-screen font-sans bg-white text-navy-900">
            <Navbar />
            <section className="relative min-h-[420px] overflow-hidden flex items-center justify-center text-center">
                <img
                    src="https://images.unsplash.com/photo-1563506443035-706db5447a56?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 w-full min-h-[420px] bg-navy-900/70 flex flex-col justify-center items-center px-4 py-16">
                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 text-white animate-fade-in-up">
                        About EduSphere
                    </h1>
                    <p className="text-lg sm:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
                        EduSphere is a platform dedicated to empowering your future. We connect passionate learners with top industry experts through flexible, engaging, and high-quality online courses.
                    </p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-16 text-left">
                        {/* card 1 */}
                        <div className="p-6 rounded-lg border-l-4 border-blue-600 shadow-md hover:shadow-xl transition duration-300">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-navy-900">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our mission is to democratize education by making the world's best professional and personal development courses universally accessible. We aim to equip you with practical, job-ready skills that drive career growth and personal fulfillment.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="p-6 rounded-lg border-l-4 border-blue-600 shadow-md hover:shadow-xl transition duration-300">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-navy-900">Our Vision</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                We envision a future where continuous learning is not a luxury, but a seamless and exciting part of everyday life. EduSphere will be the central hub for global upskilling and knowledge sharing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values*/}
            <section className="py-16 sm:py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-navy-900 border-b-2 border-blue-600 inline-block pb-1">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {coreValues.map((value, index) => (
                            <ValueCard key={index} {...value} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-navy-900 border-b-2 border-blue-600 inline-block pb-1">Meet Our Leadership</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {teamMembers.map((member, index) => (
                            <TeamMember key={index} {...member} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <ContactSection />

            {/* CTA Footer */}
            <section className="py-16 px-4 bg-navy-900 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Ready to Start Your Learning Journey?
                </h2>
                <p className="text-lg sm:text-xl text-blue-100 mb-8">
                    Join thousands of learners achieving their dreams with EduSphere.
                </p>
                <Link to="/viewCourses" className="inline-block bg-blue-600 text-white px-10 py-4 text-lg font-bold rounded-full hover:bg-blue-500 transition duration-300 shadow-xl">
                    Explore Courses
                </Link>
            </section>
            <Footer />
        </div>
    );
};

export default About;