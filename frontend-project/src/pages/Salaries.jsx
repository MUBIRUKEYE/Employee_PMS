import { useEffect, useState } from 'react'
import { CreditCard, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react'
import API from '../utils/api'
import toast from 'react-hot-toast'

const emptyForm = { employee: '', grossSalary: '', totalDeduction: '', monthOfPayment: '' }
const fmt = (n) => new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(n)

export default function Salaries() {
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    try {
      const [salRes, empRes] = await Promise.all([API.get('/salaries'), API.get('/employees')])
      setSalaries(salRes.data.data)
      setEmployees(empRes.data.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const netPreview = form.grossSalary && form.totalDeduction
    ? parseFloat(form.grossSalary) - parseFloat(form.totalDeduction)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee || !form.grossSalary || !form.monthOfPayment) return toast.error('Fill all required fields')
    if (netPreview < 0) return toast.error('Net salary cannot be negative')
    setSubmitting(true)
    try {
      const payload = { ...form, totalDeduction: form.totalDeduction || 0 }
      if (editId) {
        await API.put(`/salaries/${editId}`, payload)
        toast.success('Salary record updated!')
      } else {
        await API.post('/salaries', payload)
        toast.success('Salary record added!')
      }
      setForm(emptyForm); setEditId(null); setShowForm(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSubmitting(false) }
  }

  const handleEdit = (s) => {
    setForm({
      employee: s.employee?._id || '',
      grossSalary: s.grossSalary,
      totalDeduction: s.totalDeduction,
      monthOfPayment: s.monthOfPayment?.split('T')[0] || ''
    })
    setEditId(s._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this salary record?')) return
    try {
      await API.delete(`/salaries/${id}`)
      toast.success('Record deleted')
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = salaries.filter(s => {
    const emp = s.employee
    if (!emp) return false
    return `${emp.firstName} ${emp.lastName} ${emp.employeeNumber}`.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={24} className="text-primary-600" /> Salary Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{salaries.length} payroll records</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Record
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{editId ? 'Edit Salary Record' : 'New Salary Record'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Employee</label>
              <select className="input-field" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map(e => (
                  <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.employeeNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gross Salary (RWF)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 500000"
                value={form.grossSalary} onChange={e => setForm({ ...form, grossSalary: e.target.value })} required />
            </div>
            <div>
              <label className="label">Total Deduction (RWF)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 50000"
                value={form.totalDeduction} onChange={e => setForm({ ...form, totalDeduction: e.target.value })} />
            </div>
            <div>
              <label className="label">Month of Payment</label>
              <input type="date" className="input-field" value={form.monthOfPayment}
                onChange={e => setForm({ ...form, monthOfPayment: e.target.value })} required />
            </div>
            {netPreview !== null && (
              <div className="flex items-center">
                <div className={`p-3 rounded-xl text-sm font-semibold flex-1 ${netPreview >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                  Net Salary: <span className="text-base">{fmt(netPreview)} RWF</span>
                </div>
              </div>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                <Check size={16} /> {submitting ? 'Saving...' : editId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search by employee..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr>
                {['#', 'Employee', 'Department', 'Gross Salary', 'Deductions', 'Net Salary', 'Month', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No salary records found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="table-cell text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="table-cell">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {s.employee?.firstName} {s.employee?.lastName}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{s.employee?.employeeNumber}</div>
                  </td>
                  <td className="table-cell">
                    <span className="badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs">
                      {s.employee?.department?.departmentName || '—'}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-gray-900 dark:text-white">{fmt(s.grossSalary)}</td>
                  <td className="table-cell text-red-500">-{fmt(s.totalDeduction)}</td>
                  <td className="table-cell font-bold text-green-600 dark:text-green-400">{fmt(s.netSalary)}</td>
                  <td className="table-cell text-xs text-gray-400 font-mono">{new Date(s.monthOfPayment).toLocaleDateString('en-RW', { year: 'numeric', month: 'short' })}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
