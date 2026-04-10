import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Phone, Clock, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState('home');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'reviews', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveNav(sectionId);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.message.trim()) {
      setFormError('Please enter a message');
      return false;
    }
    return true;
  };

  const createMessageMutation = trpc.messages.create.useMutation();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');
    
    try {
      await createMessageMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      setFormError('Failed to send message. Please try again.');
      setFormStatus('error');
    }
  };

  const reviews = [
    {
      author: 'Kylie Fan',
      rating: 5,
      text: 'I was referred to Crystal after sleeping awkwardly and my neck stiffened up. I could barely look up and turn my head without pain. Crystal\'s expertise and care made all the difference!',
      date: '2 years ago'
    },
    {
      author: 'Grace Li',
      rating: 5,
      text: 'Best massage I have ever had. I was thoroughly impressed! From the moment I walked into the spa, I was greeted with a warm smile and a relaxing atmosphere.',
      date: '3 years ago'
    },
    {
      author: 'Princess Dela Pena',
      rating: 5,
      text: 'My fiancé & I booked our massages at Crystal\'s for the first time recently and let me tell you all, we both left feeling AMAZING. The ambiance here is very peaceful, very clean and friendly masseuses!',
      date: '2 years ago'
    },
    {
      author: 'Sam',
      rating: 5,
      text: 'This is a new place but same masseuse Crystal who used to work for Advance Massage. Really nice, clean and fairly large place. Crystal\'s massage techniques are unique as always.',
      date: '4 years ago'
    },
    {
      author: 'Martin Gadea',
      rating: 5,
      text: 'It\'s a fantastic and professional place. The massage therapists are very well-trained and manage to put you in a state of total relaxation, taking very special care of their clients.',
      date: 'a month ago'
    }
  ];

  const services = [
    {
      name: 'Swedish Massage',
      description: 'A classic relaxation massage using long, flowing strokes to ease tension and promote overall wellness.',
      price: '$65',
      duration: '60 min'
    },
    {
      name: 'Deep Tissue Massage',
      description: 'Targets deep muscle layers to release chronic tension and improve mobility with focused pressure techniques.',
      price: '$80',
      duration: '90 min'
    },
    {
      name: 'Trigger Point Therapy',
      description: 'Specialized technique to release tight muscle knots and alleviate pain with precision and care.',
      price: '$75',
      duration: '60 min'
    }
  ];

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-accent text-accent' : 'text-muted'}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-card shadow-md border-b border-border" style={{backgroundColor: '#2e0e00'}}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-serif font-light tracking-widest text-accent">Crystal's Massage</div>
          <div className="hidden md:flex gap-8">
            {['home', 'about', 'services', 'reviews', 'contact'].map(item => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize font-medium transition-colors ${
                  activeNav === item
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-foreground hover:text-accent'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="spa-section min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-widest text-foreground mb-8">
            Welcome to <span className="text-accent">Crystal's</span> Therapy Massage
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
            Experience the healing power of professional massage therapy in a warm, welcoming environment. Over 20 years of expertise dedicated to your wellness.
          </p>
          <Button
            onClick={() => setLocation('/reservations')}
            className="bg-accent text-accent-foreground hover:opacity-90 px-10 py-4 text-lg rounded-lg font-light tracking-wide transition-all duration-300 hover:shadow-lg"
          >
            Book a Session
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="spa-section bg-card">
        <div className="container mx-auto px-4">
          <h2 className="spa-section-title text-center font-serif font-light tracking-widest">About Crystal's Therapy Massage</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-base md:text-lg text-foreground mb-6 leading-relaxed tracking-wide font-light">
                With <span className="spa-accent-text font-medium">over 20 years of professional experience</span>, Crystal brings expertise, compassion, and dedication to every session. Her unique massage techniques are tailored to address your specific needs, whether you're seeking relaxation, pain relief, or wellness maintenance.
              </p>
              <p className="text-base md:text-lg text-foreground mb-6 leading-relaxed tracking-wide font-light">
                Our spa is designed as a sanctuary of peace and tranquility. From the moment you walk through our doors, you'll be greeted with warmth and professionalism. We maintain the highest standards of cleanliness and comfort to ensure your experience is truly restorative.
              </p>
              <p className="text-base md:text-lg text-foreground leading-relaxed tracking-wide font-light">
                Every client is treated as family. We listen to your concerns, respect your preferences, and work collaboratively to help you achieve your wellness goals.
              </p>
            </div>
            <div className="spa-warm-card">
              <div className="text-center">
                <div className="text-6xl font-serif font-light tracking-widest text-accent mb-4">20+</div>
                <p className="text-xl font-serif font-light tracking-wide text-foreground mb-2">Years of Experience</p>
                <p className="text-muted-foreground font-light tracking-wide">Dedicated to your wellness and relaxation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="spa-section bg-background">
        <div className="container mx-auto px-4">
          <h2 className="spa-section-title text-center font-serif font-light tracking-widest">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <Card key={idx} className="spa-warm-card">
                <h3 className="text-2xl font-serif font-light tracking-wide text-accent mb-2">{service.name}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-accent font-serif text-lg font-light">{service.price}</span>
                  <span className="text-muted-foreground text-sm font-light">{service.duration}</span>
                </div>
                <p className="text-foreground text-base leading-relaxed tracking-wide font-light">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="spa-section bg-card">
        <div className="container mx-auto px-4">
          <h2 className="spa-section-title text-center font-serif font-light tracking-widest">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {reviews.map((review, idx) => (
              <Card key={idx} className="bg-background p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-light tracking-wide text-foreground">{review.author}</h3>
                  <span className="text-sm text-muted-foreground font-light">{review.date}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-foreground mt-4 leading-relaxed tracking-wide font-light">{review.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Info & Map Section */}
      <section className="spa-section bg-background">
        <div className="container mx-auto px-4">
          <h2 className="spa-section-title text-center mb-12 font-serif font-light tracking-widest">Visit Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="spa-warm-card">
                <div className="flex items-start gap-4">
                  <MapPin className="text-accent flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-serif font-light tracking-wide text-lg text-foreground mb-2">Address</h3>
                    <p className="text-foreground font-light tracking-wide">9260 Alcosta Blvd Building C, Suite 20A</p>
                    <p className="text-foreground font-light tracking-wide">San Ramon, CA 94583</p>
                  </div>
                </div>
              </div>

              <div className="spa-warm-card">
                <div className="flex items-start gap-4">
                  <Phone className="text-accent flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-serif font-light tracking-wide text-lg text-foreground mb-2">Phone</h3>
                    <a href="tel:+19253610760" className="text-accent hover:underline text-lg font-light tracking-wide">
                      +1 (925) 361-0760
                    </a>
                  </div>
                </div>
              </div>

              <div className="spa-warm-card">
                <div className="flex items-start gap-4">
                  <Clock className="text-accent flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-serif font-light tracking-wide text-lg text-foreground mb-2">Hours</h3>
                    <p className="text-foreground font-light tracking-wide">Daily: 9:30 AM – 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden shadow-md h-96">
              <iframe
                title="Crystal's Therapy Massage location on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.891584427755!2d-121.96419!3d37.77049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e5e5e5e5e5d%3A0x5e5e5e5e5e5e5e5e!2s9260%20Alcosta%20Blvd%20Building%20C%20Suite%2020A%20San%20Ramon%20CA%2094583!5e0!3m2!1sen!2sus!4v1712707200"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="spa-section bg-card">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="spa-section-title text-center font-serif font-light tracking-widest">Get in Touch</h2>
          <p className="text-center text-foreground text-base md:text-lg mb-8 font-light leading-relaxed tracking-wide">
            Have questions or ready to book your session? Send us a message and we'll get back to you soon.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-foreground font-light tracking-wide mb-2">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                disabled={formStatus === 'loading'}
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                placeholder="Your name"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-foreground font-light tracking-wide mb-2">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                disabled={formStatus === 'loading'}
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                placeholder="your@email.com"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-foreground font-light tracking-wide mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                disabled={formStatus === 'loading'}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-50"
                placeholder="Tell us about your massage preferences or ask any questions..."
                aria-required="true"
              />
            </div>

            {formError && formStatus === 'error' && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle size={20} />
                <span>{formError}</span>
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
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>

            {formStatus === 'success' && (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2 border border-green-200">
                <CheckCircle size={20} />
                <span>Thank you! We'll be in touch soon.</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-accent-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-lg font-semibold mb-2">Crystal's Therapy Massage</p>
              <p className="text-accent-foreground/80">
                
              </p>
            </div>
            <button
              onClick={() => setLocation('/admin/login')}
              className="text-sm text-accent-foreground/60 hover:text-accent-foreground transition-colors underline"
            >
              Staff Login
            </button>
          </div>
          <div className="border-t border-accent-foreground/20 pt-4 text-center text-sm text-accent-foreground/60">
            <p>&copy; 2024 Crystal's Therapy Massage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
