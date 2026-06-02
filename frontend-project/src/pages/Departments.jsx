import { useEffect, useState } from 'react'
import { Building2, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react'
import API from '../utils/api'
import toast from 'react-hot-toast'

const emptyForm = { departmentCode: '', departmentName: '' }

export default function Departments() {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchDepts = async () => {
    try {
      const res = await API.get('/departments')
      setDepts(res.data.data)
    } catch { toast.error('Failed to fetch departments') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDepts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.departmentCode || !form.departmentName) return toast.error('All fields required')
    setSubmitting(true)
    try {
      if (editId) {
        await API.put(`/departments/${editId}`, form)
        toast.success('Department updated!')
      } else {
        await API.post('/departments', form)
        toast.success('Department added!')
      }
      setForm(emptyForm); setEditId(null); setShowForm(false)
      fetchDepts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSubmitting(false) }
  }

  const handleEdit = (d) => {
    setForm({ departmentCode: d.departmentCode, departmentName: d.departmentName })
    setEditId(d._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return
    try {
      await API.delete(`/departments/${id}`)
      toast.success('Department deleted')
      fetchDepts()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = depts.filter(d =>
    d.departmentName.toLowerCase().includes(search.toLowerCase()) ||
    d.departmentCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 size={24} className="text-primary-600" /> Departments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{depts.length} departments registered</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Department
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{editId ? 'Edit Department' : 'New Department'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Department Code</label>
              <input className="input-field" placeholder="e.g. HR01" value={form.departmentCode}
                onChange={e => setForm({ ...form, departmentCode: e.target.value })} required />
            </div>
            <div>
              <label className="label">Department Name</label>
              <input className="input-field" placeholder="e.g. Human Resources" value={form.departmentName}
                onChange={e => setForm({ ...form, departmentName: e.target.value })} required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                <Check size={16} /> {submitting ? 'Saving...' : editId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search departments..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">#</th>
                <th className="table-header text-left">Code</th>
                <th className="table-header text-left">Department Name</th>
                <th className="table-header text-left">Created</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No departments found</td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="table-cell text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="table-cell"><span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-mono">{d.departmentCode}</span></td>
                  <td className="table-cell font-semibold text-gray-900 dark:text-white">{d.departmentName}</td>
                  <td className="table-cell text-gray-400 text-xs font-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
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
