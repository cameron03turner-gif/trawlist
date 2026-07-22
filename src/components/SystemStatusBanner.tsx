'use client'

import { CheckCircle2, AlertTriangle, Activity, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface SystemService {
  name: string
  status: 'operational' | 'degraded' | 'maintenance'
  message: string
}

export function SystemStatusBanner() {
  const [lastChecked] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  const services: SystemService[] = [
    { name: 'Web Application', status: 'operational', message: 'All systems normal' },
    { name: 'Chrome Extension', status: 'operational', message: 'v1.4.2 active' },
    { name: 'Database & API', status: 'operational', message: '100% uptime' },
    { name: 'YouTube Data Sync', status: 'operational', message: 'Synced' },
  ]

  return (
    <div className="bg-surface border border-amber rounded-2xl p-4 shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber/20 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber animate-pulse" />
          <h2 className="font-display font-bold text-base text-ink tracking-tight">System Operational Status</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>All Core Services Operational</span>
          <span>•</span>
          <span>Updated {lastChecked}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-surface-alt border border-amber/30 rounded-xl p-3 flex flex-col justify-between hover:border-amber transition-colors"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-semibold text-ink truncate">{service.name}</span>
              {service.status === 'operational' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-muted truncate">{service.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
