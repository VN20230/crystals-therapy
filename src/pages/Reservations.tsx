import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Reservations() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Swedish Massage',
    reservationDate: '',
    reservationTime: '10:00',
    duration: 60,
    notes: '',
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const createReservation = trpc.reservations.create.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'duration' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formData.reservationDate) {
      setFormError('Please select a date');
      return false;
    }
    const selectedDate = new Date(formData.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setFormError('Please select a future date');
      return false;
    }
    if (!formData.reservationTime) {
      setFormError('Please select a time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');

    try {
      const [datePart, timePart] = [formData.reservationDate, formData.reservationTime];
      const reservationDateTime = new Date(`${datePart}T${timePart}:00`);

      await createReservation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceType: formData.serviceType,
        reservationDate: reservationDateTime,
        duration: formData.duration,
        notes: formData.notes,
      });

      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: 'Swedish Massage',
        reservationDate: '',
        reservationTime: '10:00',
        duration: 60,
        notes: '',
      });

      setTimeout(() => setFormStatus('idle'), 3000);
    } catch (error) {
      console.error('Reservation error:', error);
      setFormError('Failed to create reservation. Please try again.');
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl md:text-6xl font-serif font-light tracking-widest text-foreground mb-4">
          Book Your <span className="text-accent">Massage</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 font-light leading-relaxed tracking-wide max-w-2xl">
          Schedule your relaxation session with Crystal. Fill out the form below and we'll confirm your reservation.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Reservation Form */}
          <Card className="bg-card p-8 rounded-lg border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-foreground font-light tracking-wide mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="Your name"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-foreground font-light tracking-wide mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="your@email.com"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-foreground font-light tracking-wide mb-2">
                  Phone (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-foreground font-light tracking-wide mb-2">
                  Massage Type
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  aria-required="true"
                >
                  <option value="Swedish Massage">Swedish Massage</option>
                  <option value="Deep Tissue Massage">Deep Tissue Massage</option>
                  <option value="Trigger Point Therapy">Trigger Point Therapy</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reservationDate" className="block text-foreground font-light tracking-wide mb-2">
                    Date
                  </label>
                  <input
                    id="reservationDate"
                    type="date"
                    name="reservationDate"
                    value={formData.reservationDate}
                    onChange={handleChange}
                    disabled={formStatus === 'loading'}
                    className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="reservationTime" className="block text-foreground font-light tracking-wide mb-2">
                    Time
                  </label>
                  <input
                    id="reservationTime"
                    type="time"
                    name="reservationTime"
                    value={formData.reservationTime}
                    onChange={handleChange}
                    disabled={formStatus === 'loading'}
                    className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-foreground font-light tracking-wide mb-2">
                  Duration (minutes)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-foreground font-light tracking-wide mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={formStatus === 'loading'}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-50"
                  placeholder="Any special requests or areas of concern..."
                />
              </div>

              {formError && formStatus === 'error' && (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={20} />
                  <span>{formError}</span>
                </div>
              )}

              {formStatus === 'success' && (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                  <CheckCircle size={20} />
                  <span>Reservation created successfully! We'll confirm via email.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus === 'loading' || formStatus === 'success'}
                className="w-full bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-lg font-light tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                {formStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-foreground border-t-transparent" />
                    Creating Reservation...
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Book Your Massage
                  </>
                )}
              </button>
            </form>
          </Card>

          {/* Service Info */}
          <div className="space-y-6">
            <Card className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-2xl font-serif font-light tracking-wide text-accent mb-4">Our Services</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-light tracking-wide text-foreground mb-2">Swedish Massage</p>
                  <p className="text-sm text-muted-foreground font-light">Relaxing massage using long, flowing strokes to ease tension.</p>
                </div>
                <div>
                  <p className="font-light tracking-wide text-foreground mb-2">Deep Tissue Massage</p>
                  <p className="text-sm text-muted-foreground font-light">Targets deep muscle layers to release chronic tension.</p>
                </div>
                <div>
                  <p className="font-light tracking-wide text-foreground mb-2">Trigger Point Therapy</p>
                  <p className="text-sm text-muted-foreground font-light">Specialized technique to release tight muscle knots.</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-2xl font-serif font-light tracking-wide text-accent mb-4">Hours</h3>
              <div className="flex items-center gap-3 text-foreground font-light">
                <Clock size={20} className="text-accent flex-shrink-0" />
                <div>
                  <p>Daily: 9:30 AM – 9:00 PM</p>
                  <p className="text-sm text-muted-foreground">Book your preferred time slot</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-2xl font-serif font-light tracking-wide text-accent mb-4">Questions?</h3>
              <p className="text-foreground font-light mb-4">
                Call us at <a href="tel:+19253610760" className="text-accent hover:underline">+1 (925) 361-0760</a> or fill out our contact form.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
