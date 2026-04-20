import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

interface ContactForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    request: string;
}

const emptyForm: ContactForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    request: '',
};

const ContactPage = () => {
    const [form, setForm] = useState<ContactForm>(emptyForm);
    const [showThankYou, setShowThankYou] = useState(false);
    const [submittedName, setSubmittedName] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const continueRef = useRef<HTMLButtonElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'request' && value.length > 300) return;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedName(form.firstName);
        setShowThankYou(true);
    };

    const handleContinue = () => {
        setForm(emptyForm);
        setShowThankYou(false);
    };

    useEffect(() => {
        if (!showThankYou) return;

        // Focus the Continue button when modal opens
        continueRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleContinue();
                return;
            }
            // Focus trap: keep Tab/Shift+Tab inside the modal
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showThankYou]);

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <div className="contact-container">
                    <h2>Contact Us</h2>
                    <p className="contact-intro">We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.</p>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="contact-form-row">
                            <div className="contact-form-group">
                                <label htmlFor="firstName">First Name <span aria-hidden="true">*</span></label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="given-name"
                                    placeholder="Jane"
                                />
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="lastName">Last Name <span aria-hidden="true">*</span></label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="family-name"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="contact-form-group">
                            <label htmlFor="email">Email Address <span aria-hidden="true">*</span></label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                placeholder="jane.doe@example.com"
                            />
                        </div>
                        <div className="contact-form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                placeholder="(555) 000-0000"
                            />
                        </div>
                        <div className="contact-form-group">
                            <label htmlFor="request">
                                Your Request <span aria-hidden="true">*</span>
                                <span className="char-count" aria-live="polite">
                                    {form.request.length}/300
                                </span>
                            </label>
                            <textarea
                                id="request"
                                name="request"
                                value={form.request}
                                onChange={handleChange}
                                required
                                maxLength={300}
                                rows={5}
                                placeholder="Tell us how we can help you…"
                            />
                        </div>
                        <button type="submit" className="contact-submit-btn">Submit</button>
                    </form>
                </div>
            </main>
            <Footer />

            {showThankYou && (
                <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="thankyou-title" ref={modalRef}>
                    <div className="modal-content contact-thankyou-modal">
                        <h2 id="thankyou-title">Thank You, {submittedName}!</h2>
                        <p>
                            We really appreciate you reaching out to us. Your message has been received
                            and a member of our team will be in touch with you shortly.
                        </p>
                        <div className="contact-modal-actions">
                            <button
                                ref={continueRef}
                                className="contact-continue-btn"
                                onClick={handleContinue}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactPage;
