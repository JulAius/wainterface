import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, CalendarCheck, Send, RefreshCw, 
  ArrowUpRight, ArrowRight, FileText, AlertCircle,
  ThumbsUp, CheckCircle, Eye, Clock, XCircle
} from 'lucide-react';
import TransitionWrapper from './TransitionWrapper';
import { getMetrics, getNpsStats, getAppointments, checkHealth } from '../services/api';

const FILTERED_PHONE_NUMBER = "605370542649440";

const Dashboard = ({ onClose }: { onClose: () => void }) => {
  // État pour la récupération des données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month'
  const [systemHealth, setSystemHealth] = useState<any>(null);
  
  // On initialise les statistiques avec des valeurs par défaut
  const [stats, setStats] = useState({
    conversations: { total: 0, active: 0, new: 0 },
    messages: { total: 0, sent: 0, received: 0, delivered: 0, read: 0, failed: 0 },
    appointments: { total: 0, scheduled: 0, completed: 0, cancelled: 0 },
    templates: { 
      total: 0,
      delivered: 0,
      read: 0,
      pending: 0,
      failed: 0
    }
  });

  // État pour les statistiques NPS
  const [npsStats, setNpsStats] = useState({
    total: 0,
    average: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    npsScore: 0
  });

  // Rendez-vous à venir
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour récupérer les statistiques depuis les API
  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      
      // Check system health
      try {
        const healthData = await checkHealth();
        setSystemHealth(healthData);
      } catch (err) {
        console.error('Health check failed:', err);
        // Continue execution even if health check fails
      }
      
      // Get metrics
      let metricsData;
      try {
        metricsData = await getMetrics();
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        throw new Error('Erreur lors du chargement des métriques');
      }
      
      // Get NPS stats
      let npsData;
      try {
        // Set date range based on selection
        let startDate, endDate;
        const now = new Date();
        if (dateRange === 'day') {
          startDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
        } else if (dateRange === 'week') {
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        } else if (dateRange === 'month') {
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        }
        endDate = new Date().toISOString().split('T')[0];
        
        npsData = await getNpsStats(startDate, endDate);
      } catch (err) {
        console.error('Failed to fetch NPS stats:', err);
        npsData = {
          total: 0,
          average: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          npsScore: 0,
          satisfaction_rate: 0,
          pourcentage_tres_satisfaits: 0,
          pourcentage_satisfaits: 0,
          pourcentage_insatisfaits: 0
        };
      }
      
      // Get appointments
      let appointmentsData;
      try {
        appointmentsData = await getAppointments();
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      
      // Calculate appointment statistics
      const appointments = appointmentsData.appointments || [];
      const scheduledAppointments = appointments.filter((a: any) => a.status === 'confirmed');
      const completedAppointments = appointments.filter((a: any) => a.status === 'completed');
      const cancelledAppointments = appointments.filter((a: any) => a.status === 'cancelled');
      
      const appointmentStats = {
        total: appointments.length,
        scheduled: scheduledAppointments.length,
        completed: completedAppointments.length,
        cancelled: cancelledAppointments.length
      };

      // Filter and sort upcoming appointments
      const upcomingAppts = [...appointments]
        .filter((a: any) => {
          if (a.status !== 'confirmed') return false;
          const apptDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
          return apptDate >= new Date();
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);

      // Template statistics from metrics
      const templateStats = metricsData.templates ? {
        total: metricsData.templates.total || 0,
        delivered: metricsData.templates.delivered || 0,
        read: metricsData.templates.read || 0,
        pending: metricsData.templates.pending || 0,
        failed: metricsData.templates.failed || 0
      } : {
        total: 0,
        delivered: 0,
        read: 0,
        pending: 0,
        failed: 0
      };

      // Update stats state with metrics data
      setStats({
        conversations: {
          total: metricsData.conversations?.total || 0,
          active: metricsData.conversations?.active || 0,
          new: metricsData.conversations?.new || 0
        },
        messages: {
          total: metricsData.total || 0,
          sent: metricsData.sent || 0,
          received: metricsData.received || 0,
          delivered: metricsData.delivered || 0,
          read: metricsData.read || 0,
          failed: metricsData.failed || 0
        },
        appointments: appointmentStats,
        templates: templateStats
      });

      // Update NPS stats
      setNpsStats({
        total: npsData.total || 0,
        average: npsData.average || 0,
        promoters: npsData.promoters || 0,
        passives: npsData.passives || 0,
        detractors: npsData.detractors || 0,
        npsScore: npsData.satisfaction_rate || 0
      });

      // Update upcoming appointments
      setUpcomingAppointments(upcomingAppts);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleRefresh = () => {
    fetchStats();
  };

  // Formatter pour les dates de rendez-vous
  const formatAppointmentDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E2D34]">
        <div className="w-16 h-16 border-4 border-t-emerald-500 border-gray-700/30 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-300">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E2D34]">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="mt-4 text-gray-300">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <TransitionWrapper animation="fade" className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-whatsapp text-black rounded-lg flex items-center hover:bg-whatsapp-light transition-colors mr-4"
        >
          <ArrowRight className="w-5 h-5 mr-2 transform rotate-180" />
          Retour à la messagerie
        </button>
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord WhatsApp</h1>
          <p className="text-muted-foreground">Vue d'ensemble des conversations et rendez-vous</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary rounded-lg overflow-hidden">
            <button 
              onClick={() => setDateRange('day')}
              className={`px-3 py-1.5 text-sm ${dateRange === 'day' ? 'bg-whatsapp text-black' : 'text-muted-foreground'}`}
            >
              Jour
            </button>
            <button 
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 text-sm ${dateRange === 'week' ? 'bg-whatsapp text-black' : 'text-muted-foreground'}`}
            >
              Semaine
            </button>
            <button 
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 text-sm ${dateRange === 'month' ? 'bg-whatsapp text-black' : 'text-muted-foreground'}`}
            >
              Mois
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-whatsapp' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </div>

      {/* System Health Banner */}
      {systemHealth && (
        <div className={`mb-6 p-4 rounded-lg ${
          systemHealth.status === 'OK' ? 'bg-whatsapp/10 border border-whatsapp/30' : 'bg-destructive/10 border border-destructive/30'
        }`}>
          <div className="flex items-center">
            {systemHealth.status === 'OK' ? (
              <CheckCircle className="w-5 h-5 text-whatsapp mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive mr-2" />
            )}
            <div>
              <span className="font-medium">État du système: {systemHealth.status}</span>
              <span className="text-sm text-muted-foreground ml-2">
                Version: {systemHealth.version} | Base de données: {systemHealth.database} | {new Date(systemHealth.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
        {/* Conversations */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Conversations</p>
              <h3 className="text-3xl font-bold">
                {stats.conversations.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-whatsapp/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-whatsapp" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center text-whatsapp">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {stats.conversations.new}
            </span>
            <span className="text-muted-foreground">nouveaux aujourd'hui</span>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <MessageSquare className="w-24 h-24 text-whatsapp" />
          </div>
        </div>

        {/* Messages */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Messages</p>
              <h3 className="text-3xl font-bold">
                {stats.messages.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-sky-500/20 rounded-lg">
              <Send className="w-6 h-6 text-sky-500" />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-sky-500">{stats.messages.sent.toLocaleString()}</span>
              <span className="text-muted-foreground">envoyés</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-whatsapp">{stats.messages.received.toLocaleString()}</span>
              <span className="text-muted-foreground">reçus</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <Send className="w-24 h-24 text-sky-500" />
          </div>
        </div>

        {/* Rendez-vous */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Rendez-vous</p>
              <h3 className="text-3xl font-bold">
                {stats.appointments.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-lg">
              <CalendarCheck className="w-6 h-6 text-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-sky-500">{stats.appointments.scheduled}</span>
              <span className="text-muted-foreground text-xs">planifiés</span>
            </div>
            <div className="flex flex-col">
              <span className="text-whatsapp">{stats.appointments.completed}</span>
              <span className="text-muted-foreground text-xs">complétés</span>
            </div>
            <div className="flex flex-col">
              <span className="text-destructive">{stats.appointments.cancelled}</span>
              <span className="text-muted-foreground text-xs">annulés</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <CalendarCheck className="w-24 h-24 text-violet-500" />
          </div>
        </div>

        {/* Templates envoyés */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Templates Envoyés</p>
              <h3 className="text-3xl font-bold">
                {stats.templates.total.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-sky-500">{stats.templates.delivered}</span>
              <span className="text-muted-foreground text-xs">livrés</span>
            </div>
            <div className="flex flex-col">
              <span className="text-whatsapp">{stats.templates.read}</span>
              <span className="text-muted-foreground text-xs">lus</span>
            </div>
            <div className="flex flex-col">
              <span className="text-destructive">{stats.templates.failed}</span>
              <span className="text-muted-foreground text-xs">échoués</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <FileText className="w-24 h-24 text-amber-500" />
          </div>
        </div>

        {/* Carte NPS */}
        <div className="bg-card rounded-lg p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Évaluations NPS</p>
              <h3 className="text-3xl font-bold">
                {npsStats.npsScore}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-whatsapp">{npsStats.promoters}</span>
              <span className="text-muted-foreground text-xs">promoteurs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-500">{npsStats.passives}</span>
              <span className="text-muted-foreground text-xs">passifs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-destructive">{npsStats.detractors}</span>
              <span className="text-muted-foreground text-xs">détracteurs</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <ThumbsUp className="w-24 h-24 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div className="bg-card rounded-lg p-6 shadow-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Prochains rendez-vous</h3>
        </div>
        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Client</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Téléphone</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Date</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Heure</th>
                  <th className="p-2 border-b border-border text-left text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment, index) => (
                  <tr key={appointment.id || index} className="hover:bg-accent/30 transition-colors">
                    <td className="p-2 border-b border-border/50">{appointment.user_name}</td>
                    <td className="p-2 border-b border-border/50">+{appointment.user_id}</td>
                    <td className="p-2 border-b border-border/50">
                      {formatAppointmentDate(appointment.appointment_date, appointment.appointment_time)}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <CalendarCheck className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-2" />
            <p>Aucun rendez-vous à venir</p>
          </div>
        )}
      </div>

      {/* Métriques des rendez-vous */}
      <div className="bg-card rounded-lg p-6 shadow-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Métriques des rendez-vous</h3>
        </div>
        {stats.appointments.total > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de confirmation</p>
                <span className="text-whatsapp font-medium">
                  {Math.round((stats.appointments.scheduled / (stats.appointments.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-whatsapp rounded-full" 
                  style={{ width: `${(stats.appointments.scheduled / (stats.appointments.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux d'annulation</p>
                <span className="text-destructive font-medium">
                  {Math.round((stats.appointments.cancelled / (stats.appointments.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-destructive rounded-full" 
                  style={{ width: `${(stats.appointments.cancelled / (stats.appointments.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de complétion</p>
                <span className="text-sky-500 font-medium">
                  {Math.round((stats.appointments.completed / (stats.appointments.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-sky-500 rounded-full" 
                  style={{ width: `${(stats.appointments.completed / (stats.appointments.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Ratio RDV/Conversations</p>
                <span className="text-amber-500 font-medium">
                  {Math.round((stats.appointments.total / (stats.conversations.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-amber-500 rounded-full" 
                  style={{ width: `${Math.min((stats.appointments.total / (stats.conversations.total || 1)) * 100, 100)}%` }}
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

      {/* Statistiques détaillées des templates */}
      <div className="bg-card rounded-lg p-6 shadow-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Statistiques des Templates</h3>
        </div>
        {stats.templates.total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-sky-500/20 rounded-full mr-3">
                  <CheckCircle className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Livrés</p>
                  <p className="font-semibold">{stats.templates.delivered}</p>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {Math.round((stats.templates.delivered / stats.templates.total) * 100)}%
              </span>
            </div>
            
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-whatsapp/20 rounded-full mr-3">
                  <Eye className="w-5 h-5 text-whatsapp" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Lus</p>
                  <p className="font-semibold">{stats.templates.read}</p>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {Math.round((stats.templates.read / stats.templates.total) * 100)}%
              </span>
            </div>
            
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-amber-500/20 rounded-full mr-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">En attente</p>
                  <p className="font-semibold">{stats.templates.pending}</p>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {Math.round((stats.templates.pending / stats.templates.total) * 100)}%
              </span>
            </div>
            
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-destructive/20 rounded-full mr-3">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Échoués</p>
                  <p className="font-semibold">{stats.templates.failed}</p>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {Math.round((stats.templates.failed / stats.templates.total) * 100)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <AlertCircle className="w-12 h-12 opacity-50 mx-auto mb-2" />
            <p>Aucune donnée disponible sur les templates</p>
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Taux de livraison et lecture</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de livraison</p>
                <span className="text-sky-500 font-medium">
                  {Math.round((stats.templates.delivered / (stats.templates.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-sky-500 rounded-full" 
                  style={{ width: `${(stats.templates.delivered / (stats.templates.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux de lecture</p>
                <span className="text-whatsapp font-medium">
                  {Math.round((stats.templates.read / (stats.templates.delivered || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-whatsapp rounded-full" 
                  style={{ width: `${(stats.templates.read / (stats.templates.delivered || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">Taux d'échec</p>
                <span className="text-destructive font-medium">
                  {Math.round((stats.templates.failed / (stats.templates.total || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div 
                  className="h-2 bg-destructive rounded-full" 
                  style={{ width: `${(stats.templates.failed / (stats.templates.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière d'information */}
      <div className="bg-card rounded-lg p-4 mt-6 border border-amber-500/30">
        <div className="flex items-start">
          <div className="bg-amber-500/20 p-2 rounded-full mr-4">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-amber-400 font-medium mb-1">Information importante</h3>
            <p className="text-foreground text-sm">
              Ce tableau de bord affiche les données récupérées depuis l'API de Croisieres.fr.
              Si certaines données n'apparaissent pas, vérifiez que l'API est bien accessible.
            </p>
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default Dashboard;

