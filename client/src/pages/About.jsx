import React from 'react';

import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const TeamMember = ({ name, title, bio, imgUrl }) => (
    <div className="p-8 rounded-xl shadow-xl bg-white transition duration-500 hover:shadow-2xl hover:scale-[1.02] transform">
        <img
            src={imgUrl}
            alt={name}
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-[#667EEA]/50"
        />
        <h3 className="text-2xl font-bold text-[#1A2B4C] mb-1">{name}</h3>
        <p className="text-lg font-medium text-[#667EEA] mb-4">{title}</p>
        <p className="text-md text-[#334D6E] leading-relaxed">
            {bio}
        </p>
    </div>
);

const ValueCard = ({ title, description }) => (
    <div className="p-6 rounded-xl shadow-lg bg-[#F0F4F8] hover:bg-[#E6EEF5] transition duration-300 h-full">
        <h3 className="text-2xl font-semibold mb-3 text-[#1A2B4C] border-b border-[#667EEA]/30 pb-2">{title}</h3>
        <p className="text-md text-[#334D6E] leading-relaxed">
            {description}
        </p>
    </div>
);

const About = () => {
    const navigate = useNavigate()
    const ExploreCousers = () => {
        navigate('/viewCourses');
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const teamMembers = [
        { name: "Riyaz", title: "CEO & Founder", bio: "Riyaz is a visionary leader with a passion for accessible education and cutting-edge technology.", imgUrl: "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { name: "Nandana", title: "Chief Learning Officer", bio: "Nandana is an educational expert who curates our curriculum for maximum impact and relevance.", imgUrl: "https://images.unsplash.com/photo-1688888745596-da40843a8d45?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { name: "Swetha", title: "Head of Technology", bio: "Swetha ensures our platform is fast, reliable, and uses the latest innovations for a smooth learning journey.", imgUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    ];

    const coreValues = [
        { title: "Excellence", description: "We are committed to delivering the highest quality educational content and an unparalleled learning experience." },
        { title: "Accessibility", description: "We strive to make world-class education available and affordable for learners from all backgrounds, globally." },
        { title: "Innovation", description: "We continuously innovate our platform and course offerings to meet the evolving demands of the future job market." },
    ];

    return (
        <div className="min-h-screen font-sans bg-white text-[#1A2B4C]">
            <Navbar />
            <section className="relative h-[450px] sm:h-[450px] overflow-hidden flex items-center justify-center text-center">
                <img
                    src="https://images.unsplash.com/photo-1563506443035-706db5447a56?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="About Us Banner"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 z-10 flex flex-col justify-center items-center p-4">
                    <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 text-white animate-fadeInDown">
                        About EduVerse
                    </h1>
                    <p className="text-xl sm:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed animate-fadeInUp delay-200">
                        EduVerse is a platform dedicated to empowering your future. We connect passionate learners with top industry experts through flexible, engaging, and high-quality online courses.
                    </p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 text-left">
                        {/* card 1 */}
                        <div className="p-6 rounded-lg border-l-4 border-[#667EEA] shadow-md hover:shadow-xl transition duration-300">
                            <h2 className="text-4xl font-bold mb-4 text-[#1A2B4C]">Our Mission</h2>
                            <p className="text-lg text-[#334D6E] leading-relaxed">
                                Our mission is to democratize education by making the world's best professional and personal development courses universally accessible. We aim to equip you with practical, job-ready skills that drive career growth and personal fulfillment.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="p-6 rounded-lg border-l-4 border-[#667EEA] shadow-md hover:shadow-xl transition duration-300">
                            <h2 className="text-4xl font-bold mb-4 text-[#1A2B4C]">Our Vision</h2>
                            <p className="text-lg text-[#334D6E] leading-relaxed">
                                We envision a future where continuous learning is not a luxury, but a seamless and exciting part of everyday life. EduVerse will be the central hub for global upskilling and knowledge sharing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values*/}
            <section className="py-20 bg-[#F8F9FA]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-12 text-[#1A2B4C] border-b-2 border-[#667EEA] inline-block pb-1">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {coreValues.map((value, index) => (
                            <ValueCard key={index} {...value} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-12 text-[#1A2B4C] border-b-2 border-[#667EEA] inline-block pb-1">Meet Our Leadership</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {teamMembers.map((member, index) => (
                            <TeamMember key={index} {...member} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-16 bg-[#1A2B4C] text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Ready to Start Your Learning Journey?
                </h2>
                <p className="text-xl text-[#F8F9FA] mb-8">
                    Join thousands of learners achieving their dreams with EduVerse.
                </p>
                <button onClick={ExploreCousers} className="bg-[#667EEA] text-white px-10 py-4 text-lg font-bold rounded-full hover:bg-[#5A6FDC] transition duration-300 shadow-xl transform hover:scale-105">
                    Explore Courses
                </button>
            </section>
            <Footer />
        </div>
    );
};

export default About;