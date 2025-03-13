
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Calendar, CheckCircle, XCircle, Clock, Phone, ArrowUpRight } from 'lucide-react';
import { toast } from "sonner";
import TransitionWrapper from './TransitionWrapper';
import { getAppointments, cancelAppointment, sendAppointmentReminder } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AppointmentsCalendarProps {
  onClose: () => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ onClose }) => {
  // State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const data = await getAppointments(0, 100);
      const appointmentsList = data.appointments || [];
      setAppointments(appointmentsList);
      
      // Calculate statistics
      const scheduledAppointments = appointmentsList.filter((a: any) => a.status === 'confirmed');
      const completedAppointments = appointmentsList.filter((a: any) => a.status === 'completed');
      const cancelledAppointments = appointmentsList.filter((a: any) => a.status === 'cancelled');
      
      setStats({
        total: appointmentsList.length,
        scheduled: scheduledAppointments.length,
        completed: completedAppointments.length,
        cancelled: cancelledAppointments.length
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Erreur de chargement des rendez-vous');
      toast.error("Erreur", {
        description: "Impossible de charger les rendez-vous",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Format date for display
  const formatAppointmentDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Cancel an appointment
  const handleCancelAppointment = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    
    try {
      await cancelAppointment(id, true);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ));
      
      setSelectedAppointment(prev => prev && prev.id === id ? { ...prev, status: 'cancelled' } : prev);
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        scheduled: prev.scheduled - 1,
        cancelled: prev.cancelled + 1
      }));
      
      toast.success("Succès", {
        description: "Rendez-vous annulé avec succès",
      });
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      toast.error("Erreur", {
        description: "Impossible d'annuler le rendez-vous",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />
      });
    }
  };

  // Send a reminder for an appointment
  const handleSendReminder = async (id: number) => {
    try {
      await sendAppointmentReminder(id);
      toast.success("Succès", {
        description: "Rappel envoyé avec succès",
      });
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      toast.error("Erreur", {
        description: "Impossible d'envoyer le rappel",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />
      });
    }
  };

  // Get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    const newDate = new Date(date);
    newDate.setDate(1);
    return newDate;
  };

  // Get the last day of the month
  const getLastDayOfMonth = (date: Date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    newDate.setDate(0);
    return newDate;
  };

  // Get all days in a month for calendar view
  const getDaysInMonth = (date: Date) => {
    const days = [];
    const firstDay = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);
    
    // Add days from previous month to complete the first week
    let start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());
    
    // Add all days until the end of the last week of the month
    let end = new Date(lastDay);
    if (end.getDay() < 6) {
      end.setDate(end.getDate() + (6 - end.getDay()));
    }
    
    let currentDay = new Date(start);
    while (currentDay <= end) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Render the calendar based on the current view
  const renderCalendar = () => {
    if (currentView === 'month') {
      const days = getDaysInMonth(currentDate);
      const weeks = [];
      
      // Split days into weeks
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      
      return (
        <div>
          {/* Calendar header with month/year */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-medium">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          
          {/* Week days */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
              <div key={index} className="p-2 font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-1 gap-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  // Filter appointments for this day
                  const dayAppointments = appointments.filter(apt => {
                    const aptDate = new Date(apt.appointment_date);
                    return aptDate.getDate() === day.getDate() && 
                           aptDate.getMonth() === day.getMonth() && 
                           aptDate.getFullYear() === day.getFullYear();
                  });
                  
                  // Filter by status if needed
                  const filteredAppointments = statusFilter === 'all' 
                    ? dayAppointments 
                    : dayAppointments.filter(apt => apt.status === statusFilter);
                  
                  // Filter by search term
                  const searchFilteredAppointments = searchTerm 
                    ? filteredAppointments.filter(apt => 
                        apt.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        apt.user_id?.includes(searchTerm) ||
                        apt.description?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    : filteredAppointments;
                  
                  // Check if it's a day of the current month
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  
                  // Check if it's today
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={dayIndex}
                      className={`min-h-[100px] p-1 rounded border ${
                        isCurrentMonth ? 'bg-card/30' : 'bg-background/50 opacity-50'
                      } ${isToday ? 'ring-2 ring-whatsapp' : 'border-border/30'}`}
                    >
                      <div className="text-right p-1">
                        <span className={`inline-block rounded-full w-6 h-6 text-center ${
                          isToday ? 'bg-whatsapp text-black' : ''
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                      
                      <div className="overflow-y-auto max-h-20">
                        {searchFilteredAppointments.map(apt => (
                          <div 
                            key={apt.id}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowDetailsModal(true);
                            }}
                            className={`text-xs p-1 mb-1 rounded cursor-pointer ${
                              apt.status === 'confirmed' ? 'bg-blue-500/20 border-l-4 border-blue-500' : 
                              apt.status === 'completed' ? 'bg-whatsapp/20 border-l-4 border-whatsapp' :
                              'bg-destructive/20 border-l-4 border-destructive'
                            }`}
                          >
                            <div className="font-medium truncate">{apt.user_name}</div>
                            <div>{apt.appointment_time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (currentView === 'list') {
      // Filter appointments based on search criteria
      const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = !searchTerm || apt.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              apt.user_id?.includes(searchTerm);
        
        // Filter by status if needed
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      // Sort by date (most recent first)
      const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return dateB - dateA;
      });
      
      return (
        <div>
          <h3 className="text-xl font-medium mb-4">Liste des rendez-vous</h3>
          
          {sortedAppointments.length > 0 ? (
            <div className="space-y-2">
              {sortedAppointments.map(apt => (
                <div 
                  key={apt.id}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowDetailsModal(true);
                  }}
                  className={`p-4 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                    apt.status === 'confirmed' ? 'bg-card border-l-4 border-blue-500' : 
                    apt.status === 'completed' ? 'bg-card border-l-4 border-whatsapp' :
                    'bg-card border-l-4 border-destructive'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{apt.user_name}</h4>
                      <p className="text-sm text-muted-foreground">+{apt.user_id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      apt.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                      apt.status === 'completed' ? 'bg-whatsapp/20 text-whatsapp-light' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {apt.status === 'confirmed' ? 'Confirmé' :
                       apt.status === 'completed' ? 'Complété' : 'Annulé'}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-foreground">
                      {formatAppointmentDate(apt.appointment_date, apt.appointment_time)} à {apt.appointment_time}
                    </p>
                    {apt.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{apt.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-card rounded-lg">
              <p className="text-muted-foreground">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Change month
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Loading and error states
  if (loading && !isRefreshing) {
    return (
      <TransitionWrapper animation="fade" className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-whatsapp border-border/30 rounded-full animate-spin"></div>
        <p className="mt-4 text-foreground">Chargement des rendez-vous...</p>
      </TransitionWrapper>
    );
  }

  if (error && !isRefreshing) {
    return (
      <TransitionWrapper animation="fade" className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <p className="mt-4 text-foreground">{error}</p>
        <button 
          onClick={fetchAppointments}
          className="mt-4 px-4 py-2 bg-whatsapp text-black rounded-lg"
        >
          Réessayer
        </button>
      </TransitionWrapper>
    );
  }

  return (
    <TransitionWrapper animation="fade" className="min-h-screen bg-background text-foreground p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {onClose && (
            <button 
              onClick={onClose}
              className="mr-3 p-2 bg-card rounded-full hover:bg-accent/50 transition-colors"
              title="Retour à l'interface principale"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda des Rendez-vous</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestion et visualisation des rendez-vous clients
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un client..."
              className="p-2 pl-10 bg-card rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-whatsapp"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
          </div>
          
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmés</option>
            <option value="completed">Complétés</option>
            <option value="cancelled">Annulés</option>
          </select>
          
          {/* Refresh button */}
          <button 
            onClick={fetchAppointments}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-card hover:bg-accent/50 transition-colors text-muted-foreground"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-whatsapp' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total appointments */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden glass-morphism">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Total</p>
              <h3 className="text-3xl font-bold">
                {stats.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-violet-500" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <Calendar className="w-24 h-24 text-violet-500" />
          </div>
        </div>

        {/* Confirmed appointments */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden glass-morphism">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Confirmés</p>
              <h3 className="text-3xl font-bold">
                {stats.scheduled.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.scheduled / stats.total) * 100) : 0}% du total
            </span>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <CheckCircle className="w-24 h-24 text-blue-500" />
          </div>
        </div>

        {/* Completed appointments */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden glass-morphism">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Complétés</p>
              <h3 className="text-3xl font-bold">
                {stats.completed.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-whatsapp/20 rounded-lg">
              <Clock className="w-6 h-6 text-whatsapp" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% du total
            </span>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <Clock className="w-24 h-24 text-whatsapp" />
          </div>
        </div>

        {/* Cancelled appointments */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden glass-morphism">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Annulés</p>
              <h3 className="text-3xl font-bold">
                {stats.cancelled.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-destructive/20 rounded-lg">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0}% du total
            </span>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <XCircle className="w-24 h-24 text-destructive" />
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-card rounded-lg p-6 shadow-neon mb-6 glass-morphism">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentView('month')}
              className={`px-4 py-2 rounded-lg ${currentView === 'month' ? 'bg-whatsapp text-black' : 'bg-background text-muted-foreground'}`}
            >
              Mois
            </button>
            <button 
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg ${currentView === 'list' ? 'bg-whatsapp text-black' : 'bg-background text-muted-foreground'}`}
            >
              Liste
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={goToCurrentMonth}
              className="px-4 py-2 bg-background text-foreground rounded-lg hover:bg-whatsapp hover:text-black transition-colors"
            >
              Aujourd'hui
            </button>
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 bg-background text-foreground rounded-lg hover:bg-whatsapp hover:text-black transition-colors"
            >
              ◀
            </button>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 bg-background text-foreground rounded-lg hover:bg-whatsapp hover:text-black transition-colors"
            >
              ▶
            </button>
          </div>
        </div>
        
        <div className="bg-background rounded-lg p-4 min-h-[600px]">
          {renderCalendar()}
        </div>
      </div>

      {/* Status legend */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-foreground">Confirmé</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-whatsapp rounded-full mr-2"></div>
          <span className="text-sm text-foreground">Complété</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-destructive rounded-full mr-2"></div>
          <span className="text-sm text-foreground">Annulé</span>
        </div>
      </div>

      {/* Appointment metrics */}
      <div className="bg-card rounded-lg p-6 shadow-neon mt-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Métriques des rendez-vous</h3>
        </div>
        {stats.total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de confirmation</p>
                <span className="text-whatsapp font-medium">
                  {Math.round((stats.scheduled / (stats.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-border/50 h-2 rounded-full">
                <div 
                  className="h-2 bg-whatsapp rounded-full" 
                  style={{ width: `${(stats.scheduled / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux d'annulation</p>
                <span className="text-destructive font-medium">
                  {Math.round((stats.cancelled / (stats.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-border/50 h-2 rounded-full">
                <div 
                  className="h-2 bg-destructive rounded-full" 
                  style={{ width: `${(stats.cancelled / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de complétion</p>
                <span className="text-sky-500 font-medium">
                  {Math.round((stats.completed / (stats.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-border/50 h-2 rounded-full">
                <div 
                  className="h-2 bg-sky-500 rounded-full" 
                  style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <AlertCircle className="w-12 h-12 opacity-50 mx-auto mb-2" />
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Upcoming appointments */}
      <div className="bg-card rounded-lg p-6 shadow-neon mt-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Prochains rendez-vous</h3>
        </div>
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments
                  .filter(apt => apt.status === 'confirmed' && new Date(`${apt.appointment_date}T${apt.appointment_time}`) >= new Date())
                  .sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`))
                  .slice(0, 5)
                  .map((appointment, index) => (
                  <TableRow key={index}>
                    <TableCell>{appointment.user_name}</TableCell>
                    <TableCell>+{appointment.user_id}</TableCell>
                    <TableCell>
                      {formatAppointmentDate(appointment.appointment_date, appointment.appointment_time)}
                    </TableCell>
                    <TableCell>{appointment.appointment_time}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        appointment.status === 'completed' ? 'bg-whatsapp/20 text-whatsapp-light' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmé' :
                         appointment.status === 'completed' ? 'Complété' : 'Annulé'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReminder(appointment.id)}
                          className="p-1 bg-amber-500/20 rounded hover:bg-amber-500/30 transition-colors"
                          title="Envoyer un rappel"
                        >
                          <Clock className="w-4 h-4 text-amber-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="p-1 bg-blue-500/20 rounded hover:bg-blue-500/30 transition-colors"
                          title="Voir les détails"
                        >
                          <ArrowUpRight className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="p-1 bg-destructive/20 rounded hover:bg-destructive/30 transition-colors"
                          title="Annuler"
                        >
                          <XCircle className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <Calendar className="w-12 h-12 text-border opacity-50 mx-auto mb-2" />
            <p>Aucun rendez-vous à venir</p>
          </div>
        )}
      </div>

      {/* Details modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg w-full max-w-2xl shadow-neon glass-morphism">
            <div className="p-6 border-b border-border/30">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Détails du Rendez-vous</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Header with status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-blue-400 mr-2">👤</span>
                  <h3 className="text-lg font-medium">{selectedAppointment.user_name}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  selectedAppointment.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                  selectedAppointment.status === 'completed' ? 'bg-whatsapp/20 text-whatsapp-light' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {selectedAppointment.status === 'confirmed' ? 'Confirmé' :
                   selectedAppointment.status === 'completed' ? 'Complété' : 'Annulé'}
                </div>
              </div>
              
              {/* Main information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-muted-foreground mr-2 mt-0.5">📅</span>
                    <div>
                      <p className="text-foreground">Date et heure</p>
                      <p className="font-medium">
                        {formatAppointmentDate(
                          selectedAppointment.appointment_date, 
                          selectedAppointment.appointment_time
                        )}
                      </p>
                      <p className="text-whatsapp">{selectedAppointment.appointment_time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-muted-foreground mr-2 mt-0.5">📞</span>
                    <div>
                      <p className="text-foreground">Téléphone</p>
                      <p className="font-medium">+{selectedAppointment.user_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-muted-foreground mr-2 mt-0.5">📝</span>
                    <div>
                      <p className="text-foreground">Description</p>
                      <p className="font-medium">{selectedAppointment.description || "Aucune description"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <span className="text-blue-400 mr-2">ℹ️</span>
                    Informations supplémentaires
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span>{selectedAppointment.id}</span>
                    </div>
                    {selectedAppointment.created_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Créé le</span>
                        <span>
                          {new Date(selectedAppointment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedAppointment.event_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Événement</span>
                        <span className="truncate max-w-[180px]">{selectedAppointment.event_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent"
                >
                  Fermer
                </button>
                
                <button
                  onClick={() => {
                    handleSendReminder(selectedAppointment.id);
                  }}
                  disabled={selectedAppointment.status !== 'confirmed'}
                  className={`px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center ${
                    selectedAppointment.status !== 'confirmed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'
                  }`}
                >
                  <span className="mr-2">💬</span>
                  Envoyer un rappel
                </button>
                
                <button
                  onClick={() => {
                    handleCancelAppointment(selectedAppointment.id);
                    setShowDetailsModal(false);
                  }}
                  disabled={selectedAppointment.status !== 'confirmed'}
                  className={`px-4 py-2 bg-destructive text-white rounded-lg flex items-center ${
                    selectedAppointment.status !== 'confirmed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-destructive/80'
                  }`}
                >
                  <span className="mr-2">❌</span>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TransitionWrapper>
  );
};

export default AppointmentsCalendar;
