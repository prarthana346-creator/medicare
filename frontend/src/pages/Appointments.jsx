import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Building2,
  DollarSign
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusBadge from '../components/common/StatusBadge';

const TIME_SLOTS = [
  '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:15 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '09:00 AM',
    status: 'Scheduled',
    reason: ''
  });
  const [formError, setFormError] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors')
      ]);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (doctorFilter) params.doctor_id = doctorFilter;

      const res = await api.get('/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter, doctorFilter]);

  const handleOpenBook = () => {
    setEditingAppointment(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      doctor_id: doctors[0]?.doctor_id || '',
      appointment_date: today,
      appointment_time: '09:00 AM',
      status: 'Scheduled',
      reason: ''
    });
    setFormError('');
    setConflictWarning('');
    setShowBookModal(true);
  };

  const handleOpenEdit = (apt) => {
    setEditingAppointment(apt);
    setFormData({
      patient_id: apt.patient_id,
      doctor_id: apt.doctor_id,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      status: apt.status,
      reason: apt.reason || ''
    });
    setFormError('');
    setConflictWarning('');
    setShowBookModal(true);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setConflictWarning('');

    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
      setFormError('Please select patient, doctor, date, and appointment time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: formData.status,
        reason: formData.reason.trim()
      };

      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.appointment_id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      setShowBookModal(false);
      fetchAppointments();
    } catch (err) {
      if (err.response?.status === 409) {
        // Double booking conflict prevention!
        setConflictWarning(err.response?.data?.message || 'Conflict detected: Doctor is already booked for this slot.');
      } else {
        setFormError(err.response?.data?.message || 'Failed to process booking.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to change appointment status:', err);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/appointments/${appointmentToDelete.appointment_id}`);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorInfo = doctors.find((d) => d.doctor_id === parseInt(formData.doctor_id, 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Schedule medical consultations, manage slots, prevent double-bookings, and track statuses.
          </p>
        </div>
        <button
          onClick={handleOpenBook}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="w-3.5 h-3.5 text-medicare-600" />
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Showing {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Assigned Specialist</th>
                <th className="px-6 py-3.5">Schedule</th>
                <th className="px-6 py-3.5">Reason for Visit</th>
                <th className="px-6 py-3.5">Fee</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Retrieving schedule...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No appointments found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{apt.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{apt.patient_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{apt.doctor_name}</div>
                      <div className="text-[11px] text-medicare-600 font-medium">
                        {apt.department_name || apt.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-medicare-600" />
                        <span>{apt.appointment_date}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.appointment_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                      {apt.reason || <span className="text-slate-400 italic">General clinical checkup</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-700">${apt.consultation_fee?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => handleQuickStatus(apt.appointment_id, 'Completed')}
                              title="Mark as Completed"
                              className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleQuickStatus(apt.appointment_id, 'Cancelled')}
                              title="Cancel Appointment"
                              className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenEdit(apt)}
                          title="Reschedule / Edit"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAppointmentToDelete(apt);
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

      {/* Book / Reschedule Appointment Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={editingAppointment ? 'Reschedule / Update Appointment' : 'Book Medical Appointment'}
        subtitle="Automatic doctor conflict detection prevents overlapping bookings."
      >
        {/* Conflict Warning Banner */}
        {conflictWarning && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Doctor Scheduling Conflict</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{conflictWarning}</p>
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSaveAppointment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Select Patient *
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Select Doctor *
              </label>
              <select
                value={formData.doctor_id}
                onChange={(e) => {
                  setFormData({ ...formData, doctor_id: e.target.value });
                  setConflictWarning('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    {d.doctor_name} - {d.specialization} (${d.consultation_fee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor Info Pill */}
          {selectedDoctorInfo && (
            <div className="p-3 bg-medicare-50/60 rounded-xl border border-medicare-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                <strong>Schedule:</strong> {selectedDoctorInfo.availability}
              </span>
              <span className="font-bold text-medicare-800">
                Fee: ${selectedDoctorInfo.consultation_fee.toFixed(2)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => {
                  setFormData({ ...formData, appointment_date: e.target.value });
                  setConflictWarning('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Time Slot *
              </label>
              <select
                value={formData.appointment_time}
                onChange={(e) => {
                  setFormData({ ...formData, appointment_time: e.target.value });
                  setConflictWarning('');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Reason for Visit
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Follow-up consultation, ECG check"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {submitting ? 'Checking slots & booking...' : editingAppointment ? 'Update Booking' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Cancel & Delete Appointment"
        message={`Are you sure you want to permanently remove this appointment for ${appointmentToDelete?.patient_name} with ${appointmentToDelete?.doctor_name}?`}
        loading={submitting}
      />
    </div>
  );
};

export default Appointments;

