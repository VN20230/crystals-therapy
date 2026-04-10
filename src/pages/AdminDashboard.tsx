import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Calendar, Mail, Bell, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  reservationDate: Date;
  duration: number;
  notes?: string;
  status: string;
  createdAt: Date;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
}

interface Notification {
  id: string;
  type: 'reservation' | 'message';
  title: string;
  message: string;
  timestamp: Date;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'messages' | 'calendar'>('reservations');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const previousCountRef = useRef({ reservations: 0, messages: 0 });

  const { data: reservations, isLoading: reservationsLoading, refetch: refetchReservations } = trpc.reservations.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = trpc.messages.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Check if user is authenticated via localStorage
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      setLocation('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      if (session.authenticated) {
        setIsAuthenticated(true);
      } else {
        setLocation('/admin/login');
      }
    } catch {
      setLocation('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  // Set up polling for new reservations and messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollInterval = setInterval(() => {
      refetchReservations();
      refetchMessages();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, refetchReservations, refetchMessages]);

  // Check for new reservations and messages
  useEffect(() => {
    if (!reservations || !messages) return;

    const currentReservationCount = reservations.length;
    const currentMessageCount = messages.length;

    // Check for new reservations
    if (currentReservationCount > previousCountRef.current.reservations) {
      const newCount = currentReservationCount - previousCountRef.current.reservations;
      const lastReservation = reservations[0] as Reservation;
      
      const notification: Notification = {
        id: `res-${Date.now()}`,
        type: 'reservation',
        title: 'New Reservation!',
        message: `${lastReservation.name} booked a ${lastReservation.serviceType} massage. Reload to see details.`,
        timestamp: new Date(),
      };
      
      setNotifications(prev => [notification, ...prev]);
      previousCountRef.current.reservations = currentReservationCount;
    }

    // Check for new messages
    if (currentMessageCount > previousCountRef.current.messages) {
      const newCount = currentMessageCount - previousCountRef.current.messages;
      const lastMessage = messages[0] as ContactMessage;
      
      const notification: Notification = {
        id: `msg-${Date.now()}`,
        type: 'message',
        title: 'New Message!',
        message: `${lastMessage.name} sent you a message. Reload to see it.`,
        timestamp: new Date(),
      };
      
      setNotifications(prev => [notification, ...prev]);
      previousCountRef.current.messages = currentMessageCount;
    }
  }, [reservations, messages]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setLocation('/admin/login');
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-5 ${
              notification.type === 'reservation'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Bell className={`flex-shrink-0 mt-1 ${
                  notification.type === 'reservation' ? 'text-green-600' : 'text-blue-600'
                }`} size={20} />
                <div className="flex-1">
                  <p className={`font-semibold ${
                    notification.type === 'reservation' ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm mt-1 ${
                    notification.type === 'reservation' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {notification.message}
                  </p>
                  <button
                    onClick={handleReloadPage}
                    className={`text-sm font-semibold mt-2 px-3 py-1 rounded transition-colors ${
                      notification.type === 'reservation'
                        ? 'bg-green-200 hover:bg-green-300 text-green-900'
                        : 'bg-blue-200 hover:bg-blue-300 text-blue-900'
                    }`}
                  >
                    Reload Page
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-serif font-light tracking-widest text-foreground">
            Admin Dashboard
          </h1>
          <Button
            onClick={handleLogout}
            className="bg-accent text-accent-foreground hover:opacity-90 px-6 py-2 rounded-lg font-light tracking-wide flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-4 px-2 font-light tracking-wide transition-colors ${
              activeTab === 'reservations'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="inline mr-2" size={18} />
            Reservations ({reservations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-4 px-2 font-light tracking-wide transition-colors ${
              activeTab === 'messages'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="inline mr-2" size={18} />
            Messages ({messages?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-4 px-2 font-light tracking-wide transition-colors ${
              activeTab === 'calendar'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="inline mr-2" size={18} />
            Calendar View
          </button>
        </div>

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            {reservationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
                <p className="text-muted-foreground mt-4 font-light">Loading reservations...</p>
              </div>
            ) : reservations && reservations.length > 0 ? (
              <div className="space-y-4">
                {(reservations as Reservation[]).map((reservation) => (
                  <Card key={reservation.id} className="bg-card p-6 rounded-lg border border-border">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground font-light mb-1">Name</p>
                        <p className="text-foreground font-light tracking-wide">{reservation.name}</p>

                        <p className="text-sm text-muted-foreground font-light mb-1 mt-4">Email</p>
                        <p className="text-foreground font-light tracking-wide break-all">{reservation.email}</p>

                        {reservation.phone && (
                          <>
                            <p className="text-sm text-muted-foreground font-light mb-1 mt-4">Phone</p>
                            <p className="text-foreground font-light tracking-wide">{reservation.phone}</p>
                          </>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground font-light mb-1">Service</p>
                        <p className="text-foreground font-light tracking-wide">{reservation.serviceType}</p>

                        <p className="text-sm text-muted-foreground font-light mb-1 mt-4">Date & Time</p>
                        <p className="text-foreground font-light tracking-wide">
                          {formatDate(reservation.reservationDate)}
                        </p>

                        <p className="text-sm text-muted-foreground font-light mb-1 mt-4">Duration</p>
                        <p className="text-foreground font-light tracking-wide">{reservation.duration} minutes</p>

                        <p className="text-sm text-muted-foreground font-light mb-1 mt-4">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-light ${
                          reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground font-light mb-2">Notes</p>
                        <p className="text-foreground font-light tracking-wide">{reservation.notes}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground font-light mt-4">
                      Booked on: {formatDate(reservation.createdAt)}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card p-12 rounded-lg border border-border text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-light">No reservations yet</p>
              </Card>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            {messagesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
                <p className="text-muted-foreground mt-4 font-light">Loading messages...</p>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {(messages as ContactMessage[]).map((message) => (
                  <Card key={message.id} className="bg-card p-6 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-foreground font-light tracking-wide text-lg">{message.name}</p>
                        <p className="text-muted-foreground font-light text-sm break-all">{message.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-light whitespace-nowrap ${
                        message.status === 'unread' ? 'bg-yellow-100 text-yellow-800' :
                        message.status === 'read' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.status}
                      </span>
                    </div>

                    <p className="text-foreground font-light tracking-wide mb-4 whitespace-pre-wrap">
                      {message.message}
                    </p>

                    <p className="text-xs text-muted-foreground font-light">
                      Received: {formatDate(message.createdAt)}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card p-12 rounded-lg border border-border text-center">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-light">No messages yet</p>
              </Card>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            {reservationsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
                <p className="text-muted-foreground mt-4 font-light">Loading calendar...</p>
              </div>
            ) : reservations && reservations.length > 0 ? (
              <div className="space-y-6">
                {/* Month view header */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-2xl font-serif font-light tracking-wide text-foreground mb-6">Reservation Calendar</h3>
                  
                  {/* Group reservations by date */}
                  {Object.entries(
                    (reservations as Reservation[]).reduce((acc, res) => {
                      const date = new Date(res.reservationDate).toLocaleDateString();
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(res);
                      return acc;
                    }, {} as Record<string, Reservation[]>)
                  )
                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                    .map(([date, dayReservations]) => (
                      <div key={date} className="mb-6 pb-6 border-b border-border last:border-b-0">
                        <h4 className="text-lg font-serif font-light tracking-wide text-accent mb-4">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h4>
                        <div className="space-y-3">
                          {dayReservations.map((res) => (
                            <div key={res.id} className="bg-background p-4 rounded-lg border border-border/50 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-foreground font-light tracking-wide">
                                  <span className="text-accent font-serif">{res.name}</span> - {res.serviceType}
                                </p>
                                <p className="text-sm text-muted-foreground font-light mt-1">
                                  Duration: {res.duration} min | {res.email}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-light whitespace-nowrap ${
                                res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {res.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <Card className="bg-card p-12 rounded-lg border border-border text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-light">No reservations scheduled</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
