import { useEffect, useState } from 'react'
import { BarChart3, Calendar, TrendingUp, Download } from 'lucide-react'
import API from '../utils/api'
import toast from 'react-hot-toast'

const fmt = (n) => new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n)

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [monthFilter, setMonthFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })

  const fetchReport = async (type) => {
    setLoading(true)
    try {
      let url = `/reports/${type}`
      if (type === 'monthly') url += `?month=${monthFilter.month}&year=${monthFilter.year}`
      const res = await API.get(url)
      setData(res.data)
    } catch (err) {
      toast.error('Failed to fetch report')
      setData(null)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReport(activeTab) }, [activeTab])

  const tabs = [
    { key: 'daily', label: 'Daily', icon: Calendar },
    { key: 'weekly', label: 'Weekly (7 days)', icon: TrendingUp },
    { key: 'monthly', label: 'Monthly', icon: BarChart3 },
  ]

  const salaries = data?.data?.salaries || []
  const employees = data?.data?.employees || []
  const totalNet = salaries.reduce((s, r) => s + r.netSalary, 0)
  const totalGross = salaries.reduce((s, r) => s + r.grossSalary, 0)
  const totalDed = salaries.reduce((s, r) => s + r.totalDeduction, 0)

  const handlePrint = () => window.print()

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-primary-600" /> Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Payroll and employee reports</p>
        </div>
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Print / Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setActiveTab(key); setData(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeTab === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Monthly filters */}
      {activeTab === 'monthly' && (
        <div className="card p-4 flex items-center gap-4 flex-wrap">
          <div>
            <label className="label text-xs">Month</label>
            <select className="input-field py-2 text-sm" value={monthFilter.month}
              onChange={e => setMonthFilter({ ...monthFilter, month: parseInt(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Year</label>
            <input type="number" className="input-field py-2 text-sm w-28" value={monthFilter.year}
              onChange={e => setMonthFilter({ ...monthFilter, year: parseInt(e.target.value) })} />
          </div>
          <div className="mt-5">
            <button onClick={() => fetchReport('monthly')} className="btn-primary py-2 text-sm">
              Generate Report
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center text-gray-400 animate-pulse">
          Loading report...
        </div>
      )}

      {!loading && data && (
        <div className="space-y-4 print:space-y-3">
          {/* Report header */}
          <div className="card p-5 bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0 print:bg-gray-50 print:text-gray-900">
            <h2 className="font-bold text-lg">
              PayMaster Ltd — {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
            </h2>
            <p className="text-sm opacity-80 mt-0.5">
              {activeTab === 'daily' && `Date: ${new Date().toLocaleDateString()}`}
              {activeTab === 'weekly' && `Last 7 days ending ${new Date().toLocaleDateString()}`}
              {activeTab === 'monthly' && `${MONTHS[monthFilter.month - 1]} ${monthFilter.year}`}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Salary Records', value: salaries.length, color: 'text-gray-900 dark:text-white' },
              { label: 'Total Gross', value: `${fmt(totalGross)} RWF`, color: 'text-gray-700 dark:text-gray-200' },
              { label: 'Total Deductions', value: `${fmt(totalDed)} RWF`, color: 'text-red-600 dark:text-red-400' },
              { label: 'Total Net Paid', value: `${fmt(totalNet)} RWF`, color: 'text-green-600 dark:text-green-400' },
            ].map(c => (
              <div key={c.label} className="card p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{c.label}</p>
                <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Salary records table */}
          {salaries.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Payroll Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      {['#', 'Employee', 'Position', 'Department', 'Gross', 'Deduction', 'Net', 'Month'].map(h => (
                        <th key={h} className="table-header text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {salaries.map((s, i) => (
                      <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="table-cell text-xs text-gray-400">{i + 1}</td>
                        <td className="table-cell font-semibold text-gray-900 dark:text-white text-sm">
                          {s.employee?.firstName} {s.employee?.lastName}
                          <div className="text-xs text-gray-400 font-mono">{s.employee?.employeeNumber}</div>
                        </td>
                        <td className="table-cell text-sm">{s.employee?.position}</td>
                        <td className="table-cell">
                          <span className="badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs">
                            {s.employee?.department?.departmentName || '—'}
                          </span>
                        </td>
                        <td className="table-cell text-sm">{fmt(s.grossSalary)}</td>
                        <td className="table-cell text-sm text-red-500">-{fmt(s.totalDeduction)}</td>
                        <td className="table-cell text-sm font-bold text-green-600 dark:text-green-400">{fmt(s.netSalary)}</td>
                        <td className="table-cell text-xs text-gray-400 font-mono">
                          {new Date(s.monthOfPayment).toLocaleDateString('en-RW', { year: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <td colSpan={4} className="table-cell font-bold text-gray-700 dark:text-gray-300">TOTAL</td>
                      <td className="table-cell font-bold">{fmt(totalGross)}</td>
                      <td className="table-cell font-bold text-red-500">-{fmt(totalDed)}</td>
                      <td className="table-cell font-bold text-green-600 dark:text-green-400">{fmt(totalNet)}</td>
                      <td className="table-cell" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* New employees this period */}
          {employees.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Employees This Period ({employees.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['#', 'Emp No.', 'Name', 'Position', 'Department', 'Hired Date'].map(h => (
                        <th key={h} className="table-header text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {employees.map((e, i) => (
                      <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="table-cell text-xs text-gray-400">{i + 1}</td>
                        <td className="table-cell font-mono text-xs text-gray-500">{e.employeeNumber}</td>
                        <td className="table-cell font-semibold text-sm text-gray-900 dark:text-white">{e.firstName} {e.lastName}</td>
                        <td className="table-cell text-sm">{e.position}</td>
                        <td className="table-cell text-sm">{e.department?.departmentName || '—'}</td>
                        <td className="table-cell text-xs text-gray-400 font-mono">{new Date(e.hiredDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {salaries.length === 0 && employees.length === 0 && (
            <div className="card p-12 text-center text-gray-400">
              No data found for this period.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
