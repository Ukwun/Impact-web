import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Bell, Clock } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedUsers?: number;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

interface AdminAlertsModalProps {
  isOpen: boolean;
  alerts: Alert[];
  onClose: () => void;
  onResolveAlert?: (alertId: string, resolution: string) => Promise<void>;
}

const AdminAlertsModal: React.FC<AdminAlertsModalProps> = ({
  isOpen,
  alerts,
  onClose,
  onResolveAlert,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolveAlert = async () => {
    if (!selectedAlert || !onResolveAlert || !resolutionText.trim()) return;
    
    setResolving(true);
    try {
      await onResolveAlert(selectedAlert.id, resolutionText);
      setResolutionText('');
      setSelectedAlert(null);
    } finally {
      setResolving(false);
    }
  };

  const alertIcon = {
    critical: <AlertTriangle className="w-6 h-6 text-red-600" />,
    warning: <Bell className="w-6 h-6 text-yellow-600" />,
    info: <CheckCircle className="w-6 h-6 text-blue-600" />,
  };

  const alertColor = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const alertBadgeColor = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  if (!isOpen) return null;

  const unresolved = alerts.filter(a => !a.resolved);
  const resolved = alerts.filter(a => a.resolved);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
            {unresolved.length > 0 && (
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {unresolved.length} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {selectedAlert ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Alerts
              </button>

              <div className={`border-2 rounded-lg p-8 ${alertColor[selectedAlert.type]}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="mt-1">{alertIcon[selectedAlert.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {selectedAlert.title}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${alertBadgeColor[selectedAlert.type]}`}>
                        {selectedAlert.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{selectedAlert.description}</p>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedAlert.timestamp).toLocaleString()}
                      </span>
                      {selectedAlert.affectedUsers && (
                        <span>
                          Affected Users: {selectedAlert.affectedUsers}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedAlert.resolved && selectedAlert.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-bold text-green-900 mb-2">✓ Resolved</p>
                    <p className="text-green-700">{selectedAlert.resolution}</p>
                  </div>
                )}

                {!selectedAlert.resolved && onResolveAlert && (
                  <div className="bg-white rounded-lg p-6">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Resolution
                    </label>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Document how this alert was resolved..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                    />
                    <button
                      onClick={handleResolveAlert}
                      disabled={resolving || !resolutionText.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {resolving ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {unresolved.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Active Alerts</h3>
                  <div className="space-y-3">
                    {unresolved.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${alertColor[alert.type]}`}
                      >
                        <div className="flex items-start gap-3">
                          {alertIcon[alert.type]}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900">{alert.title}</h4>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${alertBadgeColor[alert.type]}`}>
                                {alert.type}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{alert.description}</p>
                            <div className="flex gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(alert.timestamp).toLocaleDateString()}
                              </span>
                              {alert.affectedUsers && (
                                <span>Affected: {alert.affectedUsers}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resolved.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Resolved Alerts</h3>
                  <div className="space-y-3">
                    {resolved.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 line-through">{alert.title}</h4>
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                                RESOLVED
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{alert.resolution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alerts.length === 0 && (
                <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-700 font-bold">All systems operational</p>
                  <p className="text-green-600 text-sm">No active alerts</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAlertsModal;
