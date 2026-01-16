/**
 * ADMIN FRAUD SIGNALS PAGE
 * Route: /admin/security/fraud
 * DB: risk_events table
 * UI: Risk scoring dashboard + actions
 * 
 * Security: RLS ensures only admins can view
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';

type RiskEvent = {
  id: string;
  user_id: string;
  user_email?: string;
  event_type: 'price_tampering' | 'cancellation_velocity' | 'identity_theft' | 'anomalous_booking' | 'payment_suspicious';
  risk_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: any;
  is_dismissed: boolean;
  created_at: string;
};

export default function AdminFraudSignals() {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'dismissed' | 'active'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  useEffect(() => {
    loadEvents();
    subscribeToEvents();
  }, [filter, severityFilter]);

  const loadEvents = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('risk_events')
        .select('*, user:users(email)')
        .order('created_at', { ascending: false })
        .order('risk_score', { ascending: false });

      if (filter === 'dismissed') {
        query = query.eq('is_dismissed', true);
      } else if (filter === 'active') {
        query = query.eq('is_dismissed', false);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setEvents(data as RiskEvent[] || []);

    } catch (err) {
      console.error('Error loading risk events:', err);
      alert('Failed to load risk events');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const subscription = supabase
      .channel('risk-events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'risk_events'
      }, () => loadEvents())
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const handleDismiss = async (eventId: string) => {
    if (!confirm('Are you sure you want to dismiss this risk event?')) return;

    const { error } = await supabase
      .from('risk_events')
      .update({ is_dismissed: true })
      .eq('id', eventId);

    if (error) {
      alert('Failed to dismiss event');
    } else {
      loadEvents();
    }
  };

  const handleAction = async (eventId: string, action: string) => {
    try {
      // Log admin action
      await supabase.from('audit_logs').insert({
        actor_id: (await supabase.auth.getUser()).data.user?.id || '',
        action: `RISK_EVENT_${action}`,
        entity: 'risk_events',
        entity_id: eventId,
        metadata: { severity: severityFilter }
      });

      alert(`${action} action logged successfully`);
    } catch (err) {
      console.error('Error logging action:', err);
      alert('Failed to log action');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'price_tampering': return '💰';
      case 'cancellation_velocity': return '⚡';
      case 'identity_theft': return '👤';
      case 'anomalous_booking': return '🔍';
      case 'payment_suspicious': return '💳';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage security risks and suspicious activities
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 py-3">
            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'dismissed', 'active'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    severityFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Risk Events Found</h2>
            <p className="text-gray-600">
              {filter === 'dismissed' ? 'No dismissed risk events' :
               filter === 'active' ? 'No active risk events' :
               'No risk events match your filters'}
            }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className={`bg-white rounded-lg shadow-sm border-2 ${
                  event.is_dismissed ? 'border-gray-200 opacity-60' : 'border-gray-300'
                }`}
              >
                {/* Header */}
                <div className={`p-4 rounded-t-lg ${getSeverityColor(event.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                        <h3 className="text-xl font-bold text-gray-900">{event.event_type.split('_').join(' ').toUpperCase()}</h3>
                      </div>
                      {event.user_email && (
                        <p className="text-sm text-gray-600">User: {event.user_email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="mb-1">
                        <span className="text-sm text-gray-600">Risk Score</span>
                        <div className="text-3xl font-bold">{event.risk_score}/100</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.severity === 'critical' ? 'bg-red-600 text-white' :
                        event.severity === 'high' ? 'bg-orange-500 text-white' :
                        event.severity === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-blue-500 text-white'
                      }`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h4>
                    <p className="text-gray-900">{event.description}</p>
                  </div>

                  {event.metadata && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Details</h4>
                      <pre className="text-xs text-gray-700 overflow-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Detected: {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {!event.is_dismissed && (
                      <>
                        <button
                          onClick={() => handleDismiss(event.id)}
                          className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'SUSPEND_USER')}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Suspend User
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'FLAG_PROVIDER')}
                          className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                        >
                          Flag Provider
                        </button>
                      </>
                    )}
                    {event.is_dismissed && (
                      <span className="text-sm text-gray-500 italic">Dismissed by admin</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Risk Event Details</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Type</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedEvent.event_type.split('_').join(' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Risk Score</h4>
                  <p className={`text-3xl font-bold ${
                    selectedEvent.risk_score >= 80 ? 'text-red-600' :
                    selectedEvent.risk_score >= 60 ? 'text-orange-500' :
                    selectedEvent.risk_score >= 40 ? 'text-yellow-500' :
                    'text-blue-600'
                  }`}>
                    {selectedEvent.risk_score}/100
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h4>
                <p className="text-gray-900">{selectedEvent.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Severity</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedEvent.severity)}`}>
                  {selectedEvent.severity.toUpperCase()}
                </span>
              </div>

              {selectedEvent.metadata && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Metadata</h4>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleAction(selectedEvent.id, 'INVESTIGATE');
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Investigate User
                </button>
                <button
                  onClick={() => {
                    handleAction(selectedEvent.id, 'BAN_USER');
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Ban User
                </button>
                <button
                  onClick={() => {
                    handleDismiss(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
