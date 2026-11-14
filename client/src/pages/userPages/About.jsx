import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/FooterHome';
import api from '../../config/server';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { initialOf } from '../../utils/format';

// Only things the platform actually does
const WHAT_YOU_GET = [
    ['Instructors we check', 'Nobody can publish until our team has looked at their profile and approved them.'],
    ['No deadlines', 'Once you enroll, the course is yours. Stop for a week, come back, and you start where you left off.'],
    ['An AI tutor on every lesson', 'It knows which lesson you are on, so you can ask "what does this mean?" and get a useful answer.'],
    ['Quizzes you can learn from', 'After a quiz you can go through every answer and see where you went wrong.'],
    ['A certificate at the end', 'Finish every lesson and you get a certificate with its own ID that you can download and share.'],
    ['Works on your phone', 'Everything runs in the browser. Nothing to install.'],
];

// Initials until real team photos are supplied
const TEAM = [
    { name: 'Riyaz', title: 'Founder', bio: 'Started EduSphere and decides what we build next.' },
    { name: 'Nandana', title: 'Learning', bio: 'Reviews instructor applications and helps instructors shape their courses.' },
    { name: 'Swetha', title: 'Technology', bio: 'Builds and runs the platform, including the course player and AI tutor.' },
];

const FAQS = [
    { q: 'Are there free courses?', a: 'Yes, quite a few. On the Courses page, set the price filter to "Free". Paid courses always show the price before you enroll.' },
    { q: 'How do certificates work?', a: 'Complete every lesson in a course, including passing its quizzes, and a "Certificate" button appears in the course player. You can download it again from your profile any time.' },
    { q: 'How do I become an instructor?', a: 'Sign up and pick "Teach". Fill in your instructor profile with a short bio and a link or two. We review it, and once you are approved you can publish.' },
    { q: 'How are payments handled?', a: 'Through Stripe. You can pay by card, UPI or net banking, and the course opens as soon as the payment goes through.' },
    { q: 'I forgot my password.', a: 'Send us a message below from the email on your account and we will help you get back in.' },
];

const CONTACT = [
    { label: 'Email', value: 'support@edusphere.com', href: 'mailto:support@edusphere.com' },
    { label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
    { label: 'Address', value: 'SES College, Sreekandapuram, Kannur, Kerala' },
];

const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

const ContactForm = () => {
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
            toast("Message sent. We'll reply by email.");
            setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
            setSent(true);
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {sent && (
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800" role="status">
                    Got it, thanks. We'll reply to your email. You can send another message if you forgot something.
                </p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-900 mb-1.5">Name</label>
                    <input type="text" id="contact-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
                    <input type="email" id="contact-email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
            </div>
            <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-900 mb-1.5">Subject</label>
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
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-900 mb-1.5">Message</label>
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
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-blue-700 transition disabled:opacity-70"
            >
                {loading ? <><i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>Sending…</> : 'Send message'}
            </button>
        </form>
    );
};

const About = () => {
    const { hash } = useLocation();
    const { isAuthenticated } = useAuth();

    // Support deep links such as /about#contact (used by "Forgot password?")
    useEffect(() => {
        if (!hash) return;
        const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
        return () => clearTimeout(t);
    }, [hash]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Intro */}
                <section className="py-10 sm:py-14 border-b border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight">About EduSphere</h1>
                    <div className="mt-4 max-w-2xl space-y-3 text-gray-700 leading-relaxed">
                        <p>
                            A lot of online courses are hard to judge before you pay, and easy to give up on halfway. We started EduSphere to be a
                            smaller, friendlier place: practical courses from instructors we've actually checked, that people tend to finish.
                        </p>
                        <p>
                            You learn on your own schedule, test yourself with quizzes, ask the AI tutor when something doesn't click, and get a
                            certificate when you're done.
                        </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                        <Link to="/viewCourses" className="text-blue-600 hover:underline">Browse courses</Link>
                        {!isAuthenticated && (
                            <Link to="/auth" state={{ mode: 'signup' }} className="text-blue-600 hover:underline">Apply to teach</Link>
                        )}
                        <a href="#contact" className="text-blue-600 hover:underline">Get in touch</a>
                    </div>
                </section>

                {/* What you get */}
                <section className="py-10 border-b border-gray-200">
                    <h2 className="text-xl font-bold">What you get</h2>
                    <dl className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                        {WHAT_YOU_GET.map(([title, text]) => (
                            <div key={title}>
                                <dt className="font-semibold">{title}</dt>
                                <dd className="mt-1 text-sm text-gray-600 leading-relaxed">{text}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Teaching + team */}
                <section className="py-10 border-b border-gray-200 grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
                    <div>
                        <h2 className="text-xl font-bold">Teaching here</h2>
                        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                            Create an account and choose "Teach", then fill in your profile. Someone on our team reads every application. Once
                            you're approved you can build courses with videos, readings and quizzes, and see who's enrolled and what they think.
                        </p>
                        {!isAuthenticated && (
                            <Link to="/auth" state={{ mode: 'signup' }} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                                Start an application
                            </Link>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Who we are</h2>
                        <ul className="mt-4 grid sm:grid-cols-3 gap-6">
                            {TEAM.map(m => (
                                <li key={m.name}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold" aria-hidden="true">
                                            {initialOf(m.name)}
                                        </span>
                                        <div>
                                            <p className="font-semibold leading-tight">{m.name}</p>
                                            <p className="text-sm text-gray-500">{m.title}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{m.bio}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-10 border-b border-gray-200" aria-labelledby="faq-heading">
                    <h2 id="faq-heading" className="text-xl font-bold">Common questions</h2>
                    <div className="mt-4 max-w-3xl divide-y divide-gray-200 border-y border-gray-200">
                        {FAQS.map((f) => (
                            <details key={f.q} className="group">
                                <summary className="flex items-center justify-between gap-4 py-3.5 cursor-pointer list-none font-medium">
                                    {f.q}
                                    <i className="fas fa-chevron-down text-xs text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true"></i>
                                </summary>
                                <p className="pb-4 -mt-1 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="py-10 scroll-mt-20 grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12" aria-labelledby="contact-heading">
                    <div>
                        <h2 id="contact-heading" className="text-xl font-bold">Get in touch</h2>
                        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                            Questions about a course, a payment, teaching, or your account? Write to us and we'll reply by email.
                        </p>
                        <dl className="mt-5 space-y-3 text-sm">
                            {CONTACT.map(c => (
                                <div key={c.label}>
                                    <dt className="text-gray-500">{c.label}</dt>
                                    <dd className="font-medium">
                                        {c.href ? <a href={c.href} className="hover:text-blue-600 break-all">{c.value}</a> : c.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="max-w-2xl">
                        <ContactForm />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
