import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import RoleBadge from './RoleBadge';
import {
  X,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Send,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Lock,
  User,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { INCIDENT_CATEGORIES, INCIDENT_PRIORITIES } from '../../utils/constants';

export default function IncidentDetailModal({
  incident,
  onClose,
  onVouch,
  onAddComment,
  currentUser,
}) {
  const [commentText, setCommentText] = useState('');
  const [activePhoto, setActivePhoto] = useState(
    incident?.media && incident.media.length > 0 ? incident.media[0].file_url : null
  );

  if (!incident) return null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(incident.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              {incident.incident_number}
            </span>
            <StatusBadge status={incident.status} />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Ward {incident.ward_id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Title & Priority */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{INCIDENT_CATEGORIES[incident.category]?.label || incident.category}</span>
              <span>•</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${
                incident.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                incident.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                {incident.priority} Priority
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{incident.title}</h2>
          </div>

          {/* Photo Gallery if Available */}
          {incident.media && incident.media.length > 0 && (
            <div className="space-y-2">
              <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
                <img
                  src={activePhoto || incident.media[0].file_url}
                  alt="Incident Photo"
                  className="w-full h-full object-contain"
                />
              </div>

              {incident.media.length > 1 && (
                <div className="flex gap-2">
                  {incident.media.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActivePhoto(m.file_url)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activePhoto === m.file_url ? 'border-blue-600 scale-95' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={m.file_url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hazard Description</h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {incident.description}
            </p>
          </div>

          {/* Location & Ward Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 block font-medium">Landmark & Address</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {incident.landmark_address}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 block font-medium">GPS Geolocation (SRID 4326)</span>
              <span className="font-mono font-semibold text-slate-800">
                {incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}
              </span>
              <span className="text-[10px] text-teal-700 block">
                🛡️ Blurred by ~100m for domestic privacy
              </span>
            </div>
          </div>

          {/* Resolution Proof Photo (if marked resolved) */}
          {incident.resolution_proof_photo && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Work Completion Proof
              </span>
              <div className="rounded-xl overflow-hidden aspect-video bg-black/10 max-h-48">
                <img
                  src={incident.resolution_proof_photo}
                  alt="Resolution proof"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* AI Advisory Callout */}
          {incident.ai_advisory && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Automated Triage Recommendation</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Suggested Department: <strong>{incident.ai_advisory.suggestedDepartment}</strong> • 
                Confidence: {Math.round(incident.ai_advisory.confidenceScore * 100)}%
              </p>
              <p className="text-[10px] text-blue-600 italic">
                {incident.ai_advisory.disclaimer}
              </p>
            </div>
          )}

          {/* Status Timeline History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verification & Resolution Progression
            </h4>
            <div className="space-y-2">
              {(incident.status_history || [
                {
                  status: incident.status,
                  actor: 'Municipal Desk',
                  remarks: 'Incident recorded in Davanagere Portal',
                  timestamp: incident.created_at,
                },
              ]).map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{log.remarks}</p>
                    <span className="text-[10px] text-slate-400 font-medium">By: {log.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Discussion & Notes */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Community Updates & Discussion ({incident.comments?.length || 0})
            </h4>

            <div className="space-y-2">
              {(incident.comments || []).map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{c.authorName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Post comment box */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a community vouch comment or observation..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-between">
          <button
            onClick={() => onVouch && onVouch(incident.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Vouch For This Issue ({incident.upvotes_count || 1})
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

