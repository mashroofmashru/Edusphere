import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Modal from "../UI/Modal";
import { useUI } from "../../context/UIContext";

const CERT_W = 842;
const CERT_H = 595;

const CertificateTemplate = ({ certificate, user, onClose }) => {
    const certRef = useRef(null);
    const areaRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [downloading, setDownloading] = useState(false);
    const { toast } = useUI();

    // Shrink the fixed-size A4 design to fit small screens (the PDF is still rendered full size)
    useEffect(() => {
        const el = areaRef.current;
        if (!el) return;
        const fit = () => setScale(Math.min(1, (el.clientWidth - 16) / CERT_W));
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const handleDownload = async () => {
        const input = certRef.current;
        if (!input) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                // Undo the on-screen fit-to-width scaling in the cloned document
                onclone: (doc) => {
                    const wrap = doc.getElementById("cert-scale");
                    if (wrap) wrap.style.transform = "none";
                },
            });
            const imgData = canvas.toDataURL("image/png");

            // Standard A4 landscape dimensions in mm
            const pdf = new jsPDF("l", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            const safeTitle = (certificate.course?.title || "Course").replace(/[^\w\- ]+/g, "").trim();
            pdf.save(`Certificate_${safeTitle}.pdf`);
            toast("Certificate downloaded");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast("Failed to download certificate. Please try again.", "error");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal onClose={onClose} maxWidth="max-w-5xl" label="Certificate preview" className="flex flex-col !overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-navy-900 flex items-center gap-2">
                        <i className="fas fa-certificate text-amber-500" aria-hidden="true"></i>
                        Certificate Preview
                    </h3>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60"
                        >
                            <i className={`fas ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`} aria-hidden="true"></i> {downloading ? 'Preparing…' : 'Download PDF'}
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition"
                        >
                            <i className="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                {/* Preview area: the certificate is scaled down to fit narrow screens */}
                <div ref={areaRef} className="flex-1 overflow-auto p-2 sm:p-6 bg-gray-200 flex items-center justify-center">
                    <div style={{ width: CERT_W * scale, height: CERT_H * scale }} className="relative flex-shrink-0">
                    <div id="cert-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute top-0 left-0">
                    <div
                        ref={certRef}
                        className="bg-white w-[842px] h-[595px] p-10 flex-shrink-0 relative shadow-2xl border-4 border-double border-navy-900 font-display"
                    >
                        {/* Decorative Borders/Corners */}
                        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500" />
                        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500" />
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500" />

                        {/* Background Watermark */}
                        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                            <i className="fas fa-graduation-cap text-[300px] text-navy-900" aria-hidden="true"></i>
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
                                        <i className="fas fa-medal text-3xl" aria-hidden="true"></i>
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
        </Modal>
    );
};

export default CertificateTemplate;
