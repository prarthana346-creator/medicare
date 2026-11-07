import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  CreditCard,
  Droplet
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusBadge from '../components/common/StatusBadge';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPatientDetails, setViewPatientDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    blood_group: 'A+'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (bloodGroupFilter) params.blood_group = bloodGroupFilter;

      const res = await api.get('/patients', { params });
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, bloodGroupFilter]);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({
      patient_name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      blood_group: 'A+'
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      patient_name: patient.patient_name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address || '',
      blood_group: patient.blood_group
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenView = async (patient) => {
    try {
      setShowViewModal(true);
      setViewLoading(true);
      const res = await api.get(`/patients/${patient.patient_id}`);
      if (res.data.success) {
        setViewPatientDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.patient_name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.age) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.patient_id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setShowAddEditModal(false);
      fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/patients/${patientToDelete.patient_id}`);
      setShowDeleteModal(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage patient registrations, medical histories, and personal profiles.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-medicare-500 focus:bg-white transition-all text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold">Blood Group:</span>
          </div>
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Age & Gender</th>
                <th className="px-6 py-3.5">Blood Group</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">Address</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading patient database...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No patient records found matching your filters.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{p.patient_name}</div>
                      <div className="text-[11px] text-slate-400">ID: #MED-PT-{p.patient_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.age} yrs</div>
                      <div className="text-[11px] text-slate-400">{p.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {p.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                      {p.address || <span className="text-slate-400 italic">No address provided</span>}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(p)}
                          title="View Medical History"
                          className="p-1.5 text-slate-500 hover:text-medicare-600 hover:bg-medicare-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Details"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPatientToDelete(p);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Record"
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

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingPatient ? 'Edit Patient Information' : 'Register New Patient'}
        subtitle="Patient records are securely stored in the Medicare PostgreSQL database."
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSavePatient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              placeholder="e.g. Johnathan Doe"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Age *
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Blood Group *
              </label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
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
                placeholder="e.g. +1 (555) 019-2834"
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
                placeholder="e.g. patient@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
            />
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
              {submitting ? 'Saving...' : editingPatient ? 'Update Patient' : 'Save Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewPatientDetails(null);
        }}
        title="Comprehensive Patient History"
        maxWidth="max-w-3xl"
      >
        {viewLoading || !viewPatientDetails ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading patient file...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-medicare-50/60 p-4 rounded-2xl border border-medicare-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewPatientDetails.patient_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: #MED-PT-{viewPatientDetails.patient_id} &bull; Registered: {viewPatientDetails.registration_date?.slice(0, 10)}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-700 font-medium">
                  <span>Age: <strong>{viewPatientDetails.age}</strong></span>
                  <span>Gender: <strong>{viewPatientDetails.gender}</strong></span>
                  <span>Blood: <strong className="text-rose-600">{viewPatientDetails.blood_group}</strong></span>
                  <span>Phone: <strong>{viewPatientDetails.phone}</strong></span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-semibold text-slate-400">Address</span>
                <p className="text-xs font-medium text-slate-700 max-w-xs">{viewPatientDetails.address || 'None recorded'}</p>
              </div>
            </div>

            {/* Medical Records Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-medicare-600" />
                <span>Clinical Diagnoses & Prescriptions</span>
              </h4>
              {viewPatientDetails.medical_records?.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No medical records on file for this patient.
                </div>
              ) : (
                <div className="space-y-2">
                  {viewPatientDetails.medical_records.map((mr) => (
                    <div key={mr.record_id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Treated by: {mr.doctor_name}</span>
                        <span className="text-slate-400 font-semibold">{mr.treatment_date}</span>
                      </div>
                      <p className="text-slate-700"><strong>Diagnosis:</strong> {mr.diagnosis}</p>
                      <p className="text-medicare-700"><strong>Prescription:</strong> {mr.prescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointment History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-medicare-600" />
                <span>Appointment History ({viewPatientDetails.appointments?.length || 0})</span>
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {viewPatientDetails.appointments?.map((apt) => (
                  <div key={apt.appointment_id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{apt.doctor_name}</span>
                      <span className="text-slate-400 ml-2">{apt.appointment_date} at {apt.appointment_time}</span>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently remove "${patientToDelete?.patient_name}"? All associated appointments, clinical notes, and billing history will also be removed.`}
        loading={submitting}
      />
    </div>
  );
};

export default Patients;

