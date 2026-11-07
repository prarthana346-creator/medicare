import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Building2,
  AlertCircle,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusBadge from '../components/common/StatusBadge';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    doctor_name: '',
    specialization: '',
    department_id: '',
    phone: '',
    email: '',
    consultation_fee: '',
    availability: 'Mon - Fri, 09:00 AM - 05:00 PM'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [deptRes, specRes] = await Promise.all([
        api.get('/departments'),
        api.get('/doctors/specializations')
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (specRes.data.success) setSpecializations(specRes.data.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept) params.department_id = selectedDept;
      if (selectedSpec) params.specialization = selectedSpec;

      const res = await api.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedSpec]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      doctor_name: '',
      specialization: '',
      department_id: departments[0]?.department_id || '',
      phone: '',
      email: '',
      consultation_fee: '200',
      availability: 'Mon - Fri, 09:00 AM - 05:00 PM'
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      doctor_name: doctor.doctor_name,
      specialization: doctor.specialization,
      department_id: doctor.department_id,
      phone: doctor.phone,
      email: doctor.email,
      consultation_fee: doctor.consultation_fee.toString(),
      availability: doctor.availability
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.doctor_name.trim() || !formData.specialization.trim() || !formData.department_id || !formData.phone.trim() || !formData.email.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        consultation_fee: parseFloat(formData.consultation_fee) || 0
      };

      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.doctor_id}`, payload);
      } else {
        await api.post('/doctors', payload);
      }
      setShowAddEditModal(false);
      fetchDoctors();
      fetchDropdownData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Check input.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/doctors/${doctorToDelete.doctor_id}`);
      setShowDeleteModal(false);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete doctor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage hospital medical staff, specialties, consultation rates, and working schedules.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medical Specialist</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors by name or contact..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-medicare-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-medicare-600" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
              ))}
            </select>
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Doctor & Specialization</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Consultation Fee</th>
                <th className="px-6 py-3.5">Working Hours</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading medical staff directory...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No doctors found matching criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.doctor_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-medicare-100 text-medicare-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {doc.doctor_name?.replace('Dr. ', '').slice(0, 2).toUpperCase() || 'DR'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{doc.doctor_name}</div>
                          <div className="text-[11px] text-medicare-600 font-semibold">{doc.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {doc.department_name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-emerald-700">
                        ${doc.consultation_fee.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">per session</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.availability}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{doc.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{doc.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          title="Edit Details"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDoctorToDelete(doc);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Doctor"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingDoctor ? 'Edit Doctor Information' : 'Add Medical Specialist'}
        subtitle="Manage credentialed specialists on the Medicare medical register."
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Doctor Full Name *
            </label>
            <input
              type="text"
              value={formData.doctor_name}
              onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              placeholder="e.g. Dr. Robert Vance, MD"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Department *
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Clinical Specialization *
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Interventional Cardiology"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 (555) 456-7890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. dr.vance@medicare.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                placeholder="e.g. 250.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Availability Schedule
              </label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g. Mon - Fri, 09:00 AM - 05:00 PM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddEditModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {submitting ? 'Saving...' : editingDoctor ? 'Update Specialist' : 'Add Specialist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Remove Specialist"
        message={`Are you sure you want to remove "${doctorToDelete?.doctor_name}" from the system? Their existing appointments and medical notes will also be removed.`}
        loading={submitting}
      />
    </div>
  );
};

export default Doctors;

