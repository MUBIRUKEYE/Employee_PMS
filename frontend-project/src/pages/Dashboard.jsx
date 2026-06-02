import { useEffect, useState } from 'react'
import { Users, Building2, CreditCard, TrendingUp, ArrowUpRight, DollarSign, Minus } from 'lucide-react'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const fmt = (n) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/reports/summary')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Salary Records', value: stats.totalSalaries, icon: CreditCard, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Net Paid', value: fmt(stats.totalNet), icon: DollarSign, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  ] : []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good day, {user?.username} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here's your EPMS overview for today
          </p>
        </div>
        <div className="text-right text-xs text-gray-400 dark:text-gray-500 font-mono">
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="card p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{c.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${c.bg}`}>
                  <c.icon size={20} className={c.text} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Salary breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <ArrowUpRight size={16} className="text-green-500" />
              Total Gross Salary
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(stats.totalGross)}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <Minus size={16} className="text-red-500" />
              Total Deductions
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(stats.totalDeductions)}</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp size={16} className="text-blue-500" />
              Total Net Salary
            </div>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{fmt(stats.totalNet)}</p>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-accent-600 border-0 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">PayMaster Ltd — EPMS</h3>
            <p className="text-sm opacity-80">Transportation & Logistics · Rubavu District, Western Province, Rwanda</p>
          </div>
        </div>
      </div>
    </div>
  )
}
