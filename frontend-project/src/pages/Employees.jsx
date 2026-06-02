import { useEffect, useState } from 'react'
import { Users, Plus, Search, Pencil, Trash2, X, Check } from 'lucide-react'
import API from '../utils/api'
import toast from 'react-hot-toast'

const emptyForm = {
  employeeNumber: '', firstName: '', lastName: '', address: '',
  position: '', telephone: '', gender: 'Male', hiredDate: '', department: ''
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([API.get('/employees'), API.get('/departments')])
      setEmployees(empRes.data.data)
      setDepartments(deptRes.data.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['employeeNumber', 'firstName', 'lastName', 'address', 'position', 'telephone', 'gender', 'hiredDate', 'department']
    for (const f of required) if (!form[f]) return toast.error(`Please fill: ${f}`)
    setSubmitting(true)
    try {
      if (editId) {
        await API.put(`/employees/${editId}`, form)
        toast.success('Employee updated!')
      } else {
        await API.post('/employees', form)
        toast.success('Employee added!')
      }
      setForm(emptyForm); setEditId(null); setShowForm(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSubmitting(false) }
  }

  const handleEdit = (emp) => {
    setForm({
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName, lastName: emp.lastName,
      address: emp.address, position: emp.position,
      telephone: emp.telephone, gender: emp.gender,
      hiredDate: emp.hiredDate?.split('T')[0],
      department: emp.department?._id || ''
    })
    setEditId(emp._id); setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    try {
      await API.delete(`/employees/${id}`)
      toast.success('Employee deleted')
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.employeeNumber} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-primary-600" /> Employees
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{employees.length} employees on record</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">{editId ? 'Edit Employee' : 'New Employee'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'employeeNumber', label: 'Employee Number', placeholder: 'EMP001' },
              { key: 'firstName', label: 'First Name', placeholder: 'Jean' },
              { key: 'lastName', label: 'Last Name', placeholder: 'Doe' },
              { key: 'position', label: 'Position', placeholder: 'Transport Officer' },
              { key: 'telephone', label: 'Telephone', placeholder: '+250 7XX XXX XXX' },
              { key: 'address', label: 'Address', placeholder: 'Rubavu District' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input-field" placeholder={placeholder} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Hired Date</label>
              <input type="date" className="input-field" value={form.hiredDate}
                onChange={e => setForm({ ...form, hiredDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName} ({d.departmentCode})</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                <Check size={16} /> {submitting ? 'Saving...' : editId ? 'Update Employee' : 'Save Employee'}
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
            <input className="input-field pl-9 py-2 text-sm" placeholder="Search employees..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                {['#', 'Emp No.', 'Name', 'Position', 'Department', 'Gender', 'Telephone', 'Hired', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">No employees found</td></tr>
              ) : filtered.map((e, i) => (
                <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="table-cell text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="table-cell font-mono text-xs text-gray-500">{e.employeeNumber}</td>
                  <td className="table-cell">
                    <div className="font-semibold text-gray-900 dark:text-white">{e.firstName} {e.lastName}</div>
                    <div className="text-xs text-gray-400">{e.address}</div>
                  </td>
                  <td className="table-cell">{e.position}</td>
                  <td className="table-cell">
                    <span className="badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                      {e.department?.departmentName || '—'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${e.gender === 'Male' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'}`}>
                      {e.gender}
                    </span>
                  </td>
                  <td className="table-cell text-sm font-mono">{e.telephone}</td>
                  <td className="table-cell text-xs text-gray-400 font-mono">{new Date(e.hiredDate).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(e._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
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
