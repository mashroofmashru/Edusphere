import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificateTemplate = ({ certificate, user, onClose }) => {
    const certRef = useRef(null);

    const handleDownload = async () => {
        const input = certRef.current;
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            // Standard A4 landscape dimensions in mm
            const pdf = new jsPDF("l", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate_${certificate.course.title}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to download certificate. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-navy-900 flex items-center gap-2">
                        <i className="fas fa-certificate text-amber-500"></i>
                        Certificate Preview
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <i className="fas fa-download"></i> Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Scrollable Preview Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-200 flex items-center justify-center">
                    {/* Unique Certificate Design */}
                    <div
                        ref={certRef}
                        className="bg-white w-[842px] h-[595px] p-10 flex-shrink-0 relative shadow-2xl border-4 border-double border-navy-900"
                        style={{ fontFamily: "'Cinzel', serif" }} // Ideally load a serif font
                    >
                        {/* Decorative Borders/Corners */}
                        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500" />
                        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500" />
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500" />

                        {/* Background Watermark */}
                        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                            <i className="fas fa-graduation-cap text-[300px] text-navy-900"></i>
                        </div>

                        {/* Content */}
                        <div className="h-full border border-navy-100 flex flex-col items-center justify-center text-center relative z-10 px-12">

                            {/* Logo / Header */}
                            <div className="mb-12">
                                <h1 className="text-5xl font-black text-navy-900 uppercase tracking-widest mb-2 font-serif">
                                    Certificate
                                </h1>
                                <p className="text-xl text-amber-600 font-bold tracking-[0.2em] uppercase">
                                    Of Completion
                                </p>
                            </div>

                            <p className="text-gray-500 text-lg mb-4 font-sans italic">
                                This certifies that
                            </p>

                            <h2 className="text-4xl font-bold text-blue-800 mb-2 border-b-2 border-amber-500 pb-2 px-12 inline-block min-w-[400px]">
                                {user.name}
                            </h2>

                            <p className="text-gray-500 text-lg my-6 font-sans">
                                has successfully completed the course
                            </p>

                            <h3 className="text-3xl font-bold text-navy-900 mb-12 max-w-2xl leading-tight">
                                {certificate.course?.title || "Course Title"}
                            </h3>

                            <div className="w-full flex justify-between items-end mt-auto px-12">
                                <div className="text-center">
                                    <p className="font-bold text-lg text-navy-900 border-t border-gray-400 pt-2 px-8">
                                        EduSphere Platform
                                    </p>
                                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mt-1">Verified Issuer</p>
                                </div>

                                <div className="flex flex-col items-center">
                                    {/* <img src="/seal.png" alt="Seal" className="w-24 h-24 mb-2 opacity-80" /> */}
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2 border-2 border-amber-500 border-dashed">
                                        <i className="fas fa-medal text-3xl"></i>
                                    </div>
                                    <p className="text-[10px] font-mono text-gray-400">
                                        ID: {certificate.certificateId}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="font-bold text-lg text-navy-900 border-t border-gray-400 pt-2 px-8">
                                        {new Date(certificate.issuedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mt-1">Date Issued</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;
