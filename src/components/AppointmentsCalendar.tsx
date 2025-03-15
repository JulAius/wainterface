
import React, { useState } from 'react';
import { Calendar, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import TransitionWrapper from './TransitionWrapper';

interface AppointmentsCalendarProps {
  onClose: () => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([
    {
      id: 1,
      user_name: 'John Doe',
      user_id: '14155552671',
      appointment_date: '2023-06-15',
      appointment_time: '10:00',
      status: 'confirmed',
      notes: 'Consultation initiale'
    },
    {
      id: 2,
      user_name: 'Jane Smith',
      user_id: '14155552672',
      appointment_date: '2023-06-16',
      appointment_time: '14:30',
      status: 'confirmed',
      notes: 'Suivi mensuel'
    },
    {
      id: 3,
      user_name: 'Bob Johnson',
      user_id: '14155552673',
      appointment_date: '2023-06-14',
      appointment_time: '09:15',
      status: 'completed',
      notes: 'Présentation des résultats'
    },
    {
      id: 4,
      user_name: 'Alice Brown',
      user_id: '14155552674',
      appointment_date: '2023-06-13',
      appointment_time: '11:45',
      status: 'cancelled',
      notes: 'Annulé par le client'
    }
  ]);

  // Organize appointments by date for calendar display
  const appointmentsByDate = appointments.reduce((acc: Record<string, any[]>, appointment) => {
    if (!acc[appointment.appointment_date]) {
      acc[appointment.appointment_date] = [];
    }
    acc[appointment.appointment_date].push(appointment);
    return acc;
  }, {});

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Generate blank spaces for days before the 1st of the month
    const blankDays = Array(startingDayOfWeek).fill(null);
    
    // Generate all days of the month
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateStr = date.toISOString().split('T')[0];
      const hasAppointments = appointmentsByDate[dateStr] ? appointmentsByDate[dateStr].length : 0;
      
      return {
        date,
        day: i + 1,
        dateStr,
        hasAppointments,
        appointments: appointmentsByDate[dateStr] || [],
        isToday: new Date().toISOString().split('T')[0] === dateStr
      };
    });
    
    return [...blankDays, ...days];
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <TransitionWrapper animation="fade" className="min-h-screen bg-background text-foreground p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-whatsapp text-black rounded-lg flex items-center hover:bg-whatsapp-light transition-colors mr-4"
        >
          <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" />
          Retour à la messagerie
        </button>
        <div>
          <h1 className="text-2xl font-bold">Calendrier des Rendez-vous</h1>
          <p className="text-muted-foreground">Gestion et suivi des rendez-vous programmés</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-whatsapp' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        {/* Calendar header */}
        <div className="bg-secondary p-4 flex justify-between items-center">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-accent/50 transition-colors"
          >
            <ArrowRight className="w-5 h-5 transform rotate-180" />
          </button>
          
          <h2 className="text-xl font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-accent/50 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekdays.map(day => (
              <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`min-h-[100px] p-2 rounded-md ${
                  !day ? 'bg-transparent' :
                  day.isToday ? 'bg-whatsapp/10 border border-whatsapp/30' : 
                  'bg-secondary hover:bg-accent/30 transition-colors'
                } relative`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`${
                        day.isToday ? 'bg-whatsapp text-black' : 'text-muted-foreground'
                      } ${day.isToday ? 'w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                        {day.day}
                      </span>
                      {day.hasAppointments > 0 && (
                        <span className="bg-whatsapp text-black text-xs px-1.5 py-0.5 rounded-full">
                          {day.hasAppointments}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {day.appointments.slice(0, 3).map((appointment: any, i: number) => (
                        <div 
                          key={i}
                          className={`text-xs p-1 rounded ${
                            appointment.status === 'confirmed' ? 'bg-sky-500/20 text-sky-400' :
                            appointment.status === 'completed' ? 'bg-whatsapp/20 text-whatsapp-light' :
                            'bg-destructive/20 text-destructive'
                          }`}
                        >
                          <div className="truncate font-medium">
                            {appointment.appointment_time} - {appointment.user_name}
                          </div>
                        </div>
                      ))}
                      {day.appointments.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{day.appointments.length - 3} autres
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des prochains rendez-vous */}
      <div className="bg-card rounded-lg p-6 shadow-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Liste des rendez-vous</h3>
        </div>
        
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Client</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Téléphone</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Date</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Heure</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Statut</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={index} className="hover:bg-accent/30 transition-colors">
                    <td className="p-2 border-b border-border/50">{appointment.user_name}</td>
                    <td className="p-2 border-b border-border/50">+{appointment.user_id}</td>
                    <td className="p-2 border-b border-border/50">{appointment.appointment_date}</td>
                    <td className="p-2 border-b border-border/50">{appointment.appointment_time}</td>
                    <td className="p-2 border-b border-border/50">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-sky-500/20 text-sky-400' :
                        appointment.status === 'completed' ? 'bg-whatsapp/20 text-whatsapp-light' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmé' :
                         appointment.status === 'completed' ? 'Complété' : 'Annulé'}
                      </span>
                    </td>
                    <td className="p-2 border-b border-border/50 max-w-xs truncate">{appointment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <AlertCircle className="w-12 h-12 opacity-50 mx-auto mb-2" />
            <p>Aucun rendez-vous disponible</p>
          </div>
        )}
      </div>
    </TransitionWrapper>
  );
};

export default AppointmentsCalendar;
