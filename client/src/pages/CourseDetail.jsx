import React from "react";
import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import CourseHeader from "../components/CouseDetail/CouseHeader";
import Curriculum from "../components/CouseDetail/Curriculum";
import EnrollmentCard from "../components/CouseDetail/EntrolmentCard";
import InstructorCard from "../components/CouseDetail/InstructorCard";
import EnrollmentModal from "../components/CouseDetail/EntrolmentModel";

const CourseDetail= () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const customColors = {
        'deep-blue': '#183661',
        'accent-blue': '#4a7de8',
        'text-dark': '#1f2937',
        'subtle-gray': '#f5f7fa',
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-subtle-gray antialiased">
            <Navbar />
            <main className="py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 rounded-xl overflow-hidden shadow-xl">
                        <img 
                            src="https://media.istockphoto.com/id/2215674535/photo/young-asian-software-development-manager-leads-a-late-night-office-discussion-with-his.jpg?s=2048x2048&w=is&k=20&c=OueOn75ZgEbe0bUfWu0XDOmmPci7j8Dvd7Y72L4hg5k=" 
                            alt="Hero Image for Course" 
                            className="w-full h-48 sm:h-64 object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; }}
                        />
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-10">
                            <CourseHeader  />
                            <Curriculum />
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                            <EnrollmentCard onEnrollClick={() => setIsModalOpen(true)} />
                            <InstructorCard />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <EnrollmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default CourseDetail;