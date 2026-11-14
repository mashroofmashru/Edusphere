import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/FooterHome';
import api from '../../config/server';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { initialOf } from '../../utils/format';

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

// Only features the platform actually has
const FEATURES = [
    { icon: 'fa-chalkboard-teacher', title: 'Vetted instructors', text: 'Every instructor is reviewed and approved by our team before they can publish a course.' },
    { icon: 'fa-clock', title: 'Learn at your pace', text: 'Lifetime access to every course you enroll in. Pick up exactly where you left off.' },
    { icon: 'fa-robot', title: 'AI tutor in every lesson', text: 'Stuck on a concept? Ask the built-in AI tutor, which knows the lesson you are on.' },
    { icon: 'fa-clipboard-check', title: 'Quizzes that teach', text: 'Check your understanding with quizzes, then review every answer to see where you went wrong.' },
    { icon: 'fa-certificate', title: 'Certificates', text: 'Finish a course to earn a downloadable certificate with a unique ID you can share.' },
    { icon: 'fa-mobile-alt', title: 'Any device', text: 'Watch, read and practise on your phone, tablet or laptop. No app to install.' },
];

const STEPS = {
    learners: [
        { icon: 'fa-search', title: 'Find a course', text: 'Browse by category, level and price. Many courses are free to start.' },
        { icon: 'fa-play-circle', title: 'Learn your way', text: 'Watch videos, read lessons and take quizzes, with the AI tutor on hand.' },
        { icon: 'fa-award', title: 'Earn your certificate', text: 'Complete every lesson to unlock your certificate of completion.' },
    ],
    instructors: [
        { icon: 'fa-user-plus', title: 'Apply to teach', text: 'Create an instructor account and complete your profile, bio and links.' },
        { icon: 'fa-user-check', title: 'Get approved', text: 'Our admin team reviews your application and approves your account to publish.' },
        { icon: 'fa-upload', title: 'Publish & grow', text: 'Build courses with videos, readings and quizzes, then track students and reviews.' },
    ],
};

const VALUES = [
    { icon: 'fa-gem', title: 'Excellence', text: 'High-quality content and an experience that respects your time.' },
    { icon: 'fa-universal-access', title: 'Accessibility', text: 'World-class learning that is affordable for learners from every background.' },
    { icon: 'fa-lightbulb', title: 'Innovation', text: 'We keep improving the platform to match how people really learn today.' },
];

// Initials avatars until real team photos are supplied
const TEAM = [
    { name: 'Riyaz', title: 'CEO & Founder', bio: 'Leads EduSphere with a passion for accessible education and modern technology.' },
    { name: 'Nandana', title: 'Chief Learning Officer', bio: 'Shapes our curriculum standards so every course is practical and relevant.' },
    { name: 'Swetha', title: 'Head of Technology', bio: 'Keeps the platform fast and reliable, and builds the tools learners use every day.' },
];

const FAQS = [
    { q: 'Are there free courses?', a: 'Yes. Many courses are free. Use the "Free" price filter on the Courses page to find them. Paid courses show their price before you enroll.' },
    { q: 'How do certificates work?', a: 'When you complete every lesson in a course (including passing its quizzes), a "Certificate" button appears in the course player. You can view and download it from your profile at any time.' },
    { q: 'How do I become an instructor?', a: 'Sign up and choose "Teach". Complete your instructor profile with a bio and professional links; our team will review your application and you can start publishing once approved.' },
    { q: 'How are payments handled?', a: 'Payments are processed securely through Stripe. You can pay with cards, UPI or net banking, and you get access to the course as soon as the payment is confirmed.' },
    { q: 'I forgot my password. What should I do?', a: 'Send us a message using the contact form below with the email address on your account, and our support team will help you regain access.' },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                                */
/* ------------------------------------------------------------------ */

const SectionHeading = ({ eyebrow, title, text, center = true }) => (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-2xl mb-12`}>
        {eyebrow && <p className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">{eyebrow}</p>}
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{title}</h2>
        {text && <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">{text}</p>}
    </div>
);

const IconBadge = ({ icon, tone = 'bg-blue-50 text-blue-600' }) => (
    <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${tone}`}>
        <i className={`fas ${icon}`} aria-hidden="true"></i>
    </span>
);

/** Live numbers from the same endpoint the home page uses; never shows invented figures. */
const StatsStrip = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/users/stats')
            .then(({ data }) => data.success && setStats(data.data))
            .catch(() => setStats({}));
    }, []);

    const items = [
        { icon: 'fa-user-graduate', label: 'Learners', value: stats && stats.activeStudents != null ? `${Number(stats.activeStudents).toLocaleString('en-IN')}+` : null },
        { icon: 'fa-book-open', label: 'Courses', value: stats && stats.coursesAvailable != null ? `${Number(stats.coursesAvailable).toLocaleString('en-IN')}+` : null },
        { icon: 'fa-star', label: 'Satisfaction', value: stats?.satisfactionRate || null },
        { icon: 'fa-robot', label: 'AI tutor', value: '24/7' },
    ];

    return (
        <div className="relative z-10 -mt-12 sm:-mt-16 container mx-auto px-4 sm:px-6 lg:px-8">
            {/* gap-px over a grey background draws even 1px dividers at every breakpoint */}
            <div className="rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
                {items.map((item) => (
                    <div key={item.label} className="bg-white p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <IconBadge icon={item.icon} />
                        <div className="min-w-0">
                            <p className="text-2xl font-extrabold text-navy-900 h-8 flex items-center">
                                {stats || item.value ? (item.value ?? '—') : <span className="block w-16 h-6 bg-gray-100 rounded animate-pulse"></span>}
                            </p>
                            <p className="text-sm text-gray-500">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { toast } = useUI();
    const { user } = useAuth();

    // Pre-fill for signed-in users
    useEffect(() => {
        if (user) setFormData(f => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }));
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/contact', formData);
            toast("Message sent! We'll reply to your email soon.");
            setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
            setSent(true);
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition';

    return (
        <section id="contact" className="py-16 sm:py-24 bg-white scroll-mt-20" aria-labelledby="contact-heading">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 max-w-6xl mx-auto">
                    <div className="lg:col-span-2">
                        <p className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">Contact</p>
                        <h2 id="contact-heading" className="text-3xl sm:text-4xl font-bold text-navy-900">Get in touch</h2>
                        <p className="mt-4 text-gray-600 leading-relaxed">
                            Questions about a course, payments, teaching on EduSphere or your account? Send us a message and our team will reply by email.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {[
                                { icon: 'fa-envelope', label: 'Email', value: 'support@edusphere.com', href: 'mailto:support@edusphere.com' },
                                { icon: 'fa-phone', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
                                { icon: 'fa-map-marker-alt', label: 'Address', value: 'SES College, Sreekandapuram, Kannur, Kerala' },
                            ].map(c => (
                                <li key={c.label} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <IconBadge icon={c.icon} tone="bg-white text-blue-600 shadow-sm" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{c.label}</p>
                                        {c.href
                                            ? <a href={c.href} className="font-semibold text-navy-900 hover:text-blue-600 break-all">{c.value}</a>
                                            : <p className="font-semibold text-navy-900">{c.value}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8">
                            {sent && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm flex items-start gap-3" role="status">
                                    <i className="fas fa-check-circle mt-0.5" aria-hidden="true"></i>
                                    <span>Thanks! Your message has been sent. We'll get back to you by email. Need to add something? Send another message below.</span>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                                        <input type="text" id="contact-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <input type="email" id="contact-email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        id="contact-subject"
                                        name="subject"
                                        list="contact-topics"
                                        placeholder="e.g. Question about a course"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    />
                                    <datalist id="contact-topics">
                                        <option value="Question about a course" />
                                        <option value="Payment or refund" />
                                        <option value="Becoming an instructor" />
                                        <option value="Account access / forgot password" />
                                        <option value="Report a problem" />
                                    </datalist>
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        maxLength={2000}
                                        className={`${inputClass} resize-y min-h-[120px]`}
                                    ></textarea>
                                    <p className="text-xs text-gray-400 text-right mt-1">{formData.message.length}/2000</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    {loading
                                        ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...</>
                                        : <><i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const About = () => {
    const { hash } = useLocation();
    const { isAuthenticated } = useAuth();
    const [track, setTrack] = useState('learners');

    // Support deep links such as /about#contact (used by "Forgot password?")
    useEffect(() => {
        if (!hash) return;
        const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
        return () => clearTimeout(t);
    }, [hash]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white text-navy-900">
            <Navbar />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-blue-900 text-white">
                    {/* Subtle dot grid */}
                    <div
                        className="absolute inset-0 opacity-[0.07] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                        aria-hidden="true"
                    ></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" aria-hidden="true"></div>

                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 sm:pt-20 sm:pb-36">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="animate-fade-in-up">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm font-medium text-blue-100">
                                    <i className="fas fa-graduation-cap text-blue-300" aria-hidden="true"></i> About EduSphere
                                </span>
                                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                                    Learning that fits <span className="text-blue-300">your life.</span>
                                </h1>
                                <p className="mt-6 text-lg sm:text-xl text-blue-100/90 leading-relaxed max-w-xl">
                                    EduSphere connects curious learners with experienced instructors through flexible, practical online courses, with an AI tutor beside you in every lesson.
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                    <Link to="/viewCourses" className="px-7 py-3.5 bg-blue-500 hover:bg-blue-400 rounded-xl font-bold text-center shadow-lg shadow-blue-900/40 transition">
                                        Browse Courses
                                    </Link>
                                    {!isAuthenticated && (
                                        <Link to="/auth" state={{ mode: 'signup' }} className="px-7 py-3.5 border-2 border-white/30 hover:border-white hover:bg-white hover:text-navy-900 rounded-xl font-bold text-center transition">
                                            Teach on EduSphere
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Visual: a mock lesson card showing what learning here looks like */}
                            <div className="hidden lg:block relative" aria-hidden="true">
                                <div className="absolute -inset-4 bg-blue-400/20 rounded-3xl rotate-3"></div>
                                <div className="relative bg-white text-navy-900 rounded-2xl shadow-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-play"></i></span>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Lesson 4 of 12 · Video</p>
                                            <p className="font-bold">Understanding the fundamentals</p>
                                        </div>
                                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">68%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-blue-600 rounded-full"></div></div>
                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                                        <div className="flex gap-2">
                                            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0"><i className="fas fa-robot"></i></span>
                                            <p className="text-sm bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2">Want a quick summary of this lesson before the quiz?</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <p className="text-sm bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3 py-2">Yes please!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><i className="fas fa-certificate"></i></span>
                                        <p className="text-sm text-gray-600">Finish all lessons to earn your <strong className="text-navy-900">certificate</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <StatsStrip />

                {/* Story + mission / vision */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
                            <div>
                                <p className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">Our story</p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">Built to make good teaching easy to find</h2>
                                <div className="mt-6 space-y-4 text-gray-600 text-base sm:text-lg leading-relaxed">
                                    <p>
                                        Too many online courses are hard to judge, hard to afford, or easy to abandon halfway through. EduSphere is our answer: one place for practical courses that people actually finish.
                                    </p>
                                    <p>
                                        Approved instructors share what they know, and learners study on their own schedule, with quizzes to check understanding,
                                        an AI tutor for the moments you get stuck, and a certificate to show for it at the end.
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                <div className="p-6 sm:p-8 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <IconBadge icon="fa-bullseye" tone="bg-blue-600 text-white" />
                                        <h3 className="text-2xl font-bold text-navy-900">Our mission</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        To make high-quality, job-ready learning universally accessible, so anyone can build skills that grow their career and confidence.
                                    </p>
                                </div>
                                <div className="p-6 sm:p-8 rounded-2xl bg-navy-900 text-white">
                                    <div className="flex items-center gap-4 mb-4">
                                        <IconBadge icon="fa-eye" tone="bg-white/10 text-blue-300" />
                                        <h3 className="text-2xl font-bold">Our vision</h3>
                                    </div>
                                    <p className="text-blue-100 leading-relaxed">
                                        A world where continuous learning is a natural part of everyday life, with EduSphere as a trusted home for upskilling and sharing knowledge.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16 sm:py-24 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeading
                            eyebrow="Why EduSphere"
                            title="Everything you need to actually finish a course"
                            text="We focus on the things that help learners keep going, from the first lesson to the certificate."
                        />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {FEATURES.map(f => (
                                <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                                    <IconBadge icon={f.icon} />
                                    <h3 className="mt-5 text-lg font-bold text-navy-900">{f.title}</h3>
                                    <p className="mt-2 text-gray-600 leading-relaxed">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="How it works" title="Three steps, whichever side you're on" />

                        <div className="flex justify-center mb-10">
                            <div className="inline-flex p-1 rounded-xl bg-gray-100" role="tablist" aria-label="How it works for">
                                {[['learners', 'For learners', 'fa-user-graduate'], ['instructors', 'For instructors', 'fa-chalkboard-teacher']].map(([key, label, icon]) => (
                                    <button
                                        key={key}
                                        role="tab"
                                        id={`tab-${key}`}
                                        aria-selected={track === key}
                                        aria-controls="how-panel"
                                        onClick={() => setTrack(key)}
                                        className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${track === key ? 'bg-white text-navy-900 shadow' : 'text-gray-500 hover:text-navy-900'}`}
                                    >
                                        <i className={`fas ${icon}`} aria-hidden="true"></i> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ol id="how-panel" role="tabpanel" aria-labelledby={`tab-${track}`} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" key={track}>
                            {STEPS[track].map((step, i) => (
                                <li key={step.title} className="relative p-6 sm:p-8 rounded-2xl border border-gray-100 bg-white shadow-sm animate-fade-in-up">
                                    <span className="absolute top-6 right-6 text-5xl font-extrabold text-gray-100 select-none" aria-hidden="true">{i + 1}</span>
                                    <IconBadge icon={step.icon} tone="bg-navy-900 text-white" />
                                    <h3 className="mt-5 text-lg font-bold text-navy-900"><span className="sr-only">Step {i + 1}: </span>{step.title}</h3>
                                    <p className="mt-2 text-gray-600 leading-relaxed">{step.text}</p>
                                </li>
                            ))}
                        </ol>

                        <div className="text-center mt-10">
                            {track === 'learners' ? (
                                <Link to="/viewCourses" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
                                    Start exploring courses <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                </Link>
                            ) : !isAuthenticated ? (
                                <Link to="/auth" state={{ mode: 'signup' }} className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
                                    Apply to teach <i className="fas fa-arrow-right" aria-hidden="true"></i>
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 sm:py-24 bg-navy-900 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <p className="text-sm font-bold tracking-wider text-blue-300 uppercase mb-2">What we stand for</p>
                            <h2 className="text-3xl sm:text-4xl font-bold">Our core values</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {VALUES.map(v => (
                                <div key={v.title} className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                                    <IconBadge icon={v.icon} tone="bg-blue-500/20 text-blue-300" />
                                    <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
                                    <p className="mt-2 text-blue-100/80 leading-relaxed">{v.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="py-16 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="Our team" title="The people behind EduSphere" />
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {TEAM.map(m => (
                                <div key={m.name} className="text-center p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-navy-900 to-blue-700 flex items-center justify-center text-3xl font-bold text-white rotate-3" aria-hidden="true">
                                        {initialOf(m.name)}
                                    </div>
                                    <h3 className="mt-6 text-xl font-bold text-navy-900">{m.name}</h3>
                                    <p className="text-sm font-semibold text-blue-600">{m.title}</p>
                                    <p className="mt-3 text-gray-600 leading-relaxed text-sm">{m.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 sm:py-24 bg-gray-50" aria-labelledby="faq-heading">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <p className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">FAQ</p>
                            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-navy-900">Frequently asked questions</h2>
                        </div>
                        <div className="max-w-3xl mx-auto space-y-3">
                            {FAQS.map((f, i) => (
                                <details key={f.q} className="group bg-white rounded-xl border border-gray-100 shadow-sm open:shadow-md transition" open={i === 0}>
                                    <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-bold text-navy-900">
                                        {f.q}
                                        <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true">
                                            <i className="fas fa-plus text-xs"></i>
                                        </span>
                                    </summary>
                                    <p className="px-5 pb-5 -mt-1 text-gray-600 leading-relaxed">{f.a}</p>
                                </details>
                            ))}
                        </div>
                        <p className="text-center mt-8 text-gray-600">
                            Still have a question? <a href="#contact" className="font-bold text-blue-600 hover:underline">Contact our team</a>
                        </p>
                    </div>
                </section>

                <ContactSection />

                {/* CTA */}
                <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
                    <div className="relative overflow-hidden max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-blue-700 to-navy-900 px-6 py-12 sm:p-16 text-center text-white">
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" aria-hidden="true"></div>
                        <h2 className="relative text-3xl sm:text-4xl font-bold">Ready to start learning?</h2>
                        <p className="relative mt-4 text-lg text-blue-100 max-w-xl mx-auto">
                            Find a course that fits your goals and start today. Free courses are available.
                        </p>
                        <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/viewCourses" className="px-8 py-3.5 bg-white text-navy-900 font-bold rounded-xl hover:bg-blue-50 transition">
                                Explore Courses
                            </Link>
                            {!isAuthenticated && (
                                <Link to="/auth" state={{ mode: 'signup' }} className="px-8 py-3.5 border-2 border-white/40 font-bold rounded-xl hover:bg-white/10 transition">
                                    Create Free Account
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
