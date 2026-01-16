/**
 * ADMIN A/B EXPERIMENTS PAGE
 * Route: /admin/experiments
 * DB: experiments table + metrics
 * UI: Experiment variants + metrics + toggle
 * 
 * Security: RLS ensures only admins can manage experiments
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase-production';

type Experiment = {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  target_metric: string;
  variants: {
    id: string;
    name: string;
    description: string;
    traffic_percentage: number;
    is_control: boolean;
  }[];
  created_at: string;
  updated_at: string;
};

type ExperimentMetrics = {
  experiment_id: string;
  variant_id: string;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  statistical_significance: number;
  updated_at: string;
};

export default function AdminExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [metrics, setMetrics] = useState<ExperimentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    target_metric: 'conversion_rate',
    variants: [
      { name: 'Control', description: 'Original design', traffic_percentage: 50, is_control: true },
      { name: 'Variant A', description: 'New design', traffic_percentage: 50, is_control: false }
    ]
  });

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiments(data as Experiment[] || []);

    } catch (err: any) {
      console.error('Error loading experiments:', err);
      alert('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  const loadExperimentMetrics = async (experimentId: string) => {
    try {
      const { data, error } = await supabase
        .from('experiment_metrics')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMetrics(data as ExperimentMetrics[] || []);

    } catch (err: any) {
      console.error('Error loading metrics:', err);
    }
  };

  const handleSelectExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    loadExperimentMetrics(experiment.id);
  };

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          ...newExperiment,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      alert('Experiment created successfully!');
      setShowCreateModal(false);
      loadExperiments();

    } catch (err: any) {
      console.error('Error creating experiment:', err);
      alert('Failed to create experiment');
    }
  };

  const handleStartExperiment = async (experimentId: string) => {
    try {
      const { error } = await supabase
        .from('experiments')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', experimentId);

      if (error) throw error;
      alert('Experiment started successfully!');
      loadExperiments();

    } catch (err: any) {
      console.error('Error starting experiment:', err);
      alert('Failed to start experiment');
    }
  };

  const handlePauseExperiment = async (experimentId: string) => {
    try {
      const { error } = await supabase
        .from('experiments')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', experimentId);

      if (error) throw error;
      alert('Experiment paused successfully!');
      loadExperiments();

    } catch (err: any) {
      console.error('Error pausing experiment:', err);
      alert('Failed to pause experiment');
    }
  };

  const handleCompleteExperiment = async (experimentId: string) => {
    if (!confirm('Are you sure you want to complete this experiment?')) return;

    try {
      const { error } = await supabase
        .from('experiments')
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', experimentId);

      if (error) throw error;
      alert('Experiment completed successfully!');
      loadExperiments();

    } catch (err: any) {
      console.error('Error completing experiment:', err);
      alert('Failed to complete experiment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSignificanceLevel = (significance: number) => {
    if (significance >= 95) return { text: 'Significant', color: 'bg-green-100 text-green-800' };
    if (significance >= 80) return { text: 'Promising', color: 'bg-blue-100 text-blue-800' };
    if (significance >= 60) return { text: 'Unclear', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Not Significant', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">A/B Experiments</h1>
              <p className="text-gray-600 mt-1">
                Create and manage A/B testing experiments
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create New Experiment
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedExperiment ? (
          // Experiments List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                onClick={() => handleSelectExperiment(experiment)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{experiment.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(experiment.status)}`}>
                    {experiment.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {experiment.description || 'No description provided'}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Target Metric:</span>
                    <span className="text-sm font-medium text-gray-900">{experiment.target_metric}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Variants:</span>
                    <span className="text-sm font-medium text-gray-900">{experiment.variants.length}</span>
                  </div>

                  {experiment.start_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Started:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(experiment.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {experiment.status === 'active' && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseExperiment(experiment.id);
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
                      >
                        Pause
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteExperiment(experiment.id);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Experiment Detail View
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedExperiment(null)}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Experiments
            </button>

            {/* Experiment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedExperiment.name}</h2>
                  <p className="text-gray-600">{selectedExperiment.description}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(selectedExperiment.status)}`}>
                  {selectedExperiment.status.toUpperCase()}
                </span>
              </div>

              {/* Experiment Status Actions */}
              <div className="flex gap-3 mb-8">
                {selectedExperiment.status === 'draft' && (
                  <button
                    onClick={() => handleStartExperiment(selectedExperiment.id)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Start Experiment
                  </button>
                )}
                {selectedExperiment.status === 'active' && (
                  <button
                    onClick={() => handlePauseExperiment(selectedExperiment.id)}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
                  >
                    Pause Experiment
                  </button>
                )}
                {selectedExperiment.status === 'paused' && (
                  <button
                    onClick={() => handleStartExperiment(selectedExperiment.id)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Resume Experiment
                  </button>
                )}
                {selectedExperiment.status !== 'completed' && (
                  <button
                    onClick={() => handleCompleteExperiment(selectedExperiment.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Complete Experiment
                  </button>
                )}
              </div>

              {/* Variants */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Experiment Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedExperiment.variants.map((variant) => (
                    <div key={variant.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-gray-900">{variant.name}</h4>
                            {variant.is_control && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">CONTROL</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{variant.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{variant.traffic_percentage}%</div>
                          <p className="text-xs text-gray-500">Traffic</p>
                        </div>
                      </div>

                      {/* Variant Metrics */}
                      {metrics.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {metrics.filter(m => m.variant_id === variant.id).map((metric, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white rounded p-3">
                              <div>
                                <div className="text-sm text-gray-500">Impressions</div>
                                <div className="text-lg font-bold text-gray-900">{metric.impressions.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Conversions</div>
                                <div className="text-lg font-bold text-gray-900">{metric.conversions.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Rate</div>
                                <div className="text-lg font-bold text-blue-600">{metric.conversion_rate.toFixed(2)}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Revenue</div>
                                <div className="text-lg font-bold text-green-600">₹{metric.revenue.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistical Significance */}
            {metrics.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistical Significance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedExperiment.variants.map((variant) => {
                    const variantMetrics = metrics.filter(m => m.variant_id === variant.id);
                    const avgSignificance = variantMetrics.length > 0
                      ? variantMetrics.reduce((sum, m) => sum + m.statistical_significance, 0) / variantMetrics.length
                      : 0;
                    const significanceLevel = getSignificanceLevel(avgSignificance);
                    
                    return (
                      <div key={variant.id} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{variant.name}</h4>
                        <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${significanceLevel.color}`}>
                          {significanceLevel.text}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {avgSignificance > 0 ? `${avgSignificance.toFixed(1)}% confidence` : 'Insufficient data'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Experiment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  placeholder="e.g., Homepage Layout Test"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                  placeholder="Describe your experiment hypothesis..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Metric *
                </label>
                <select
                  value={newExperiment.target_metric}
                  onChange={(e) => setNewExperiment({ ...newExperiment, target_metric: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="conversion_rate">Conversion Rate</option>
                  <option value="revenue_per_visitor">Revenue per Visitor</option>
                  <option value="booking_completion">Booking Completion Rate</option>
                  <option value="provider_acceptance">Provider Acceptance Rate</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variants *</h3>
                <div className="space-y-4">
                  {newExperiment.variants.map((variant, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variant {idx + 1} Name *
                          </label>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => {
                              const updatedVariants = [...newExperiment.variants];
                              updatedVariants[idx].name = e.target.value;
                              setNewExperiment({ ...newExperiment, variants: updatedVariants });
                            }}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={variant.is_control}
                              onChange={(e) => {
                                const updatedVariants = newExperiment.variants.map((v, i) => 
                                  i === idx ? { ...v, is_control: e.target.checked, traffic_percentage: v.is_control ? 50 : v.traffic_percentage } : v
                                );
                                setNewExperiment({ ...newExperiment, variants: updatedVariants });
                              }}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Control Group</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variant.description}
                          onChange={(e) => {
                            const updatedVariants = [...newExperiment.variants];
                            updatedVariants[idx].description = e.target.value;
                            setNewExperiment({ ...newExperiment, variants: updatedVariants });
                          }}
                          placeholder="Describe this variant..."
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
