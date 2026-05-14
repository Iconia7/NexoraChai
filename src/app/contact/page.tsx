'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useToastStore } from '@/lib/toastStore';
import { useState } from 'react';

export default function ContactPage() {
    const addToast = useToastStore((state) => state.addToast);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            addToast("Message sent! We'll get back to you within 24 hours.", "success");
            setLoading(false);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-brand-beige-light text-foreground font-sans selection:bg-brand-primary/10 pt-24">
            <PublicNavbar />

            <main className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Left: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
                            Let's talk about your <span className="text-brand-primary">creative future.</span>
                        </h1>
                        <p className="text-xl text-brand-muted font-medium mb-12 leading-relaxed">
                            Have questions about fees, integrations, or just want to say hi? Our team is always ready to support the African creator community.
                        </p>

                        <div className="space-y-8">
                            {[
                                { icon: Mail, label: 'Email Us', value: 'info@nexoracreatives.co.ke' },
                                { icon: MessageSquare, label: 'Live Chat', value: 'Available 9am - 6pm EAT' },
                                { icon: MapPin, label: 'Office', value: 'Nairobi, Kenya' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white rounded-2xl card-shadow flex items-center justify-center text-brand-primary shrink-0">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">{item.label}</p>
                                        <p className="text-lg font-bold">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-10 md:p-16 rounded-[3.5rem] card-shadow border border-black/[0.02]"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                                    <input required type="text" placeholder="John Doe" className="input-base py-4" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                                    <input required type="email" placeholder="john@example.com" className="input-base py-4" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Subject</label>
                                <select className="input-base py-4 appearance-none">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Partnership</option>
                                    <option>Billing</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block ml-1">Message</label>
                                <textarea required placeholder="How can we help?" rows={5} className="input-base py-4 resize-none" />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full btn-primary py-5 text-lg font-black bg-[#914D00] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Send Message"} <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
