import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  User,
  UserCheck,
  Calendar,
  FileText,
  Printer,
  Edit2,
  Trash2,
  AlertCircle,
  Pill,
  Stethoscope
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activePrintRecord, setActivePrintRecord] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    prescription: '',
    treatment_date: ''
  });
  const [formError, setFormError] = useState('');
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

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedPatient) params.patient_id = selectedPatient;
      if (selectedDoctor) params.doctor_id = selectedDoctor;

      const res = await api.get('/medical-records', { params });
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedPatient, selectedDoctor]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      doctor_id: doctors[0]?.doctor_id || '',
      diagnosis: '',
      prescription: '',
      treatment_date: today
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      patient_id: rec.patient_id,
      doctor_id: rec.doctor_id,
      diagnosis: rec.diagnosis,
      prescription: rec.prescription,
      treatment_date: rec.treatment_date
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenPrint = (rec) => {
    setActivePrintRecord(rec);
    setShowPrintModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.patient_id || !formData.doctor_id || !formData.diagnosis.trim() || !formData.prescription.trim() || !formData.treatment_date) {
      setFormError('Please fill in all clinical record fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10),
        diagnosis: formData.diagnosis.trim(),
        prescription: formData.prescription.trim(),
        treatment_date: formData.treatment_date
      };

      if (editingRecord) {
        await api.put(`/medical-records/${editingRecord.record_id}`, payload);
      } else {
        await api.post('/medical-records', payload);
      }
      setShowAddEditModal(false);
      fetchRecords();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/medical-records/${recordToDelete.record_id}`);
      setShowDeleteModal(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (err) {
      console.error('Failed to delete medical record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Medical Records & Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Clinical history, diagnostic reports, and physician prescriptions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Clinical Record</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Patient Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-medicare-600" />
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500 max-w-xs"
            >
              <option value="">All Patients</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500 max-w-xs"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          {records.length} Clinical Record{records.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Record ID & Date</th>
                <th className="px-6 py-3.5">Patient</th>
                <th className="px-6 py-3.5">Attending Doctor</th>
                <th className="px-6 py-3.5">Clinical Diagnosis</th>
                <th className="px-6 py-3.5">Prescription / Treatment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading medical records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No clinical records found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.record_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">#REC-{rec.record_id}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-medicare-500" />
                        <span>{rec.treatment_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{rec.patient_name}</div>
                      <div className="text-[11px] text-slate-400">Patient #{rec.patient_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{rec.doctor_name}</div>
                      <div className="text-[11px] text-medicare-600">{rec.specialization}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-800 line-clamp-2 leading-relaxed font-semibold">
                        {rec.diagnosis}
                      </p>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-start gap-1.5 text-slate-600 line-clamp-2">
                        <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">{rec.prescription}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPrint(rec)}
                          title="Print / View Rx Slip"
                          className="p-1.5 text-slate-500 hover:text-medicare-600 hover:bg-medicare-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit Clinical Record"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRecordToDelete(rec);
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

      {/* Add / Edit Medical Record Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingRecord ? 'Update Clinical Record' : 'Create Medical Record & Prescription'}
        subtitle="Clinical diagnostic entries are stamped into the patient history."
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-rose-700">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Patient *
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                <option value="">Select Patient...</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Attending Doctor *
              </label>
              <select
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              >
                <option value="">Select Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name} ({d.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Treatment / Consultation Date *
            </label>
            <input
              type="date"
              value={formData.treatment_date}
              onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Clinical Diagnosis & Symptoms *
            </label>
            <textarea
              rows="3"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Detailed clinical evaluation, symptoms presented, test findings..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Prescription & Treatment Protocol *
            </label>
            <textarea
              rows="3"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Medications, dosage instructions, dietary cautions, follow-up timeline..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
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
              {submitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Clinical Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Prescription Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setActivePrintRecord(null);
        }}
        title="Official Medical Prescription Sheet"
        maxWidth="max-w-2xl"
      >
        {activePrintRecord && (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6 print:border-none print:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  MEDI<span className="text-medicare-600">CARE</span> HOSPITAL
                </h2>
                <p className="text-[11px] text-slate-500">Department of Clinical Medicine &bull; General Hospital</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-800">Rx Document: #{activePrintRecord.record_id}</p>
                <p className="text-slate-400">Date: {activePrintRecord.treatment_date}</p>
              </div>
            </div>

            {/* Patient & Doctor Banner */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Patient Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activePrintRecord.patient_name}</p>
                <p className="text-slate-500">Patient ID: #MED-PT-{activePrintRecord.patient_id}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Physician</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{activePrintRecord.doctor_name}</p>
                <p className="text-medicare-600 font-semibold">{activePrintRecord.specialization}</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Clinical Diagnosis
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/60 leading-relaxed">
                {activePrintRecord.diagnosis}
              </div>
            </div>

            {/* Prescription (Rx) */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>Medication & Dosage Protocol (Rx)</span>
              </p>
              <div className="p-4 bg-emerald-50/50 rounded-xl text-xs font-medium text-slate-800 border border-emerald-100 leading-relaxed whitespace-pre-line">
                {activePrintRecord.prescription}
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-8 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
              <p>Generated by Medicare Hospital Management System</p>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <p className="font-semibold text-slate-700">Doctor's Digital Signature</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Medical Record"
        message={`Are you sure you want to permanently delete clinical record #${recordToDelete?.record_id} for ${recordToDelete?.patient_name}?`}
        loading={submitting}
      />
    </div>
  );
};

export default MedicalRecords;

