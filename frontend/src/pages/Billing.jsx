import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Edit2,
  Trash2,
  AlertCircle,
  FileCheck,
  Receipt
} from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    total_amount: '',
    payment_status: 'Pending'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/billing/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load billing summary:', err);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [patRes, aptRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments')
      ]);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (aptRes.data.success) setAppointments(aptRes.data.data);
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.payment_status = statusFilter;

      const res = await api.get('/billing', { params });
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingBill(null);
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      appointment_id: '',
      total_amount: '200.00',
      payment_status: 'Pending'
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      patient_id: bill.patient_id,
      appointment_id: bill.appointment_id || '',
      total_amount: bill.total_amount.toString(),
      payment_status: bill.payment_status
    });
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenInvoice = (bill) => {
    setActiveInvoice(bill);
    setShowInvoiceModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.patient_id || !formData.total_amount) {
      setFormError('Please select a patient and provide total billing amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id, 10) : null,
        total_amount: parseFloat(formData.total_amount) || 0,
        payment_status: formData.payment_status
      };

      if (editingBill) {
        await api.put(`/billing/${editingBill.bill_id}`, payload);
      } else {
        await api.post('/billing', payload);
      }
      setShowAddEditModal(false);
      fetchBills();
      fetchSummary();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Check input.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await api.put(`/billing/${billId}`, { payment_status: 'Paid' });
      fetchBills();
      fetchSummary();
    } catch (err) {
      console.error('Failed to mark bill as paid:', err);
    }
  };

  const handleDelete = async () => {
    if (!billToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/billing/${billToDelete.bill_id}`);
      setShowDeleteModal(false);
      setBillToDelete(null);
      fetchBills();
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete billing record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Revenue Ledger</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Generate patient medical invoices, collect payments, and track hospital financial transactions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Bill</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected Revenue"
          value={formatCurrency(summary?.total_revenue)}
          icon={DollarSign}
          color="emerald"
          changeText={`${summary?.paid_count ?? 0} Invoices Settled`}
        />
        <StatCard
          title="Pending Receivables"
          value={formatCurrency(summary?.pending_amount)}
          icon={Clock}
          color="amber"
          changeText={`${summary?.pending_count ?? 0} Invoices Awaiting`}
        />
        <StatCard
          title="Paid Invoices"
          value={summary?.paid_count ?? 0}
          icon={CheckCircle2}
          color="blue"
          changeText="Fully Cleared"
        />
        <StatCard
          title="Total Invoices"
          value={summary?.total_count ?? 0}
          icon={Receipt}
          color="cyan"
          changeText="All-Time Ledger Records"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-medicare-500"
          >
            <option value="">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Showing {bills.length} Bill{bills.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice ID & Date</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Linked Consultation</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Payment Status</th>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Calculating financial records...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No billing records found matching selection.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.bill_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">#INV-{bill.bill_id}</div>
                      <div className="text-[11px] text-slate-400">{bill.created_at?.slice(0, 10)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{bill.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{bill.patient_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {bill.appointment_id ? (
                        <div>
                          <div className="font-semibold text-slate-900">{bill.doctor_name || 'Specialist Consult'}</div>
                          <div className="text-[11px] text-slate-400">Apt #{bill.appointment_id} &bull; {bill.appointment_date}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct Facility Fee</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(bill.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={bill.payment_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {bill.payment_date || <span className="text-slate-400 italic">Unpaid</span>}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {bill.payment_status === 'Pending' && (
                          <button
                            onClick={() => handleMarkAsPaid(bill.bill_id)}
                            title="Mark as Paid"
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenInvoice(bill)}
                          title="View Printable Receipt"
                          className="p-1.5 text-slate-500 hover:text-medicare-600 hover:bg-medicare-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(bill)}
                          title="Edit Bill Details"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setBillToDelete(bill);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Bill"
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

      {/* Add / Edit Bill Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingBill ? 'Edit Invoice' : 'Generate Patient Bill'}
        subtitle="Invoices are reconciled in the Medicare PostgreSQL database."
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
              Select Patient *
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            >
              <option value="">Select Patient...</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{p.patient_name} ({p.phone})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Link to Existing Appointment (Optional)
            </label>
            <select
              value={formData.appointment_id}
              onChange={(e) => {
                const aptId = e.target.value;
                setFormData({ ...formData, appointment_id: aptId });
                if (aptId) {
                  const matched = appointments.find((a) => a.appointment_id === parseInt(aptId, 10));
                  if (matched && matched.consultation_fee) {
                    setFormData((prev) => ({ ...prev, total_amount: matched.consultation_fee.toString() }));
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
            >
              <option value="">No appointment linked (Direct hospital charge)</option>
              {appointments
                .filter((a) => !formData.patient_id || a.patient_id === parseInt(formData.patient_id, 10))
                .map((a) => (
                  <option key={a.appointment_id} value={a.appointment_id}>
                    #{a.appointment_id} - {a.patient_name} with {a.doctor_name} ({a.appointment_date})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Total Bill Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                placeholder="e.g. 250.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Payment Status *
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              >
                <option value="Pending">Pending (Unpaid)</option>
                <option value="Paid">Paid (Stamp Current Time)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
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
              {submitting ? 'Generating...' : editingBill ? 'Update Invoice' : 'Generate Bill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setActiveInvoice(null);
        }}
        title="Hospital Invoice Receipt"
        maxWidth="max-w-xl"
      >
        {activeInvoice && (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  MEDI<span className="text-medicare-600">CARE</span> HOSPITAL
                </h2>
                <p className="text-[11px] text-slate-500">Official Billing & Accounting Services</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-900">INVOICE #{activeInvoice.bill_id}</p>
                <p className="text-slate-400">Date: {activeInvoice.created_at?.slice(0, 10)}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Billed To</p>
              <p className="font-bold text-slate-900 text-sm">{activeInvoice.patient_name}</p>
              <p className="text-slate-600">Patient Contact: {activeInvoice.patient_phone || 'N/A'}</p>
              {activeInvoice.patient_email && <p className="text-slate-500">{activeInvoice.patient_email}</p>}
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 p-3 font-bold text-slate-600 flex justify-between border-b border-slate-100">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 flex justify-between items-center text-slate-800 border-b border-slate-100">
                <div>
                  <p className="font-bold">
                    {activeInvoice.appointment_id
                      ? `Medical Consultation - Dr. ${activeInvoice.doctor_name || 'Specialist'}`
                      : 'Hospital Clinical Services Fee'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {activeInvoice.appointment_date ? `Session on ${activeInvoice.appointment_date}` : 'General Patient Billing'}
                  </p>
                </div>
                <span className="font-bold text-sm text-slate-900">{formatCurrency(activeInvoice.total_amount)}</span>
              </div>
              <div className="p-3 bg-slate-50/60 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Due</span>
                <span className="font-black text-lg text-medicare-700">{formatCurrency(activeInvoice.total_amount)}</span>
              </div>
            </div>

            {/* Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Settlement Status:</span>
                <StatusBadge status={activeInvoice.payment_status} />
              </div>
              <span className="text-slate-500 font-medium">
                {activeInvoice.payment_date ? `Paid on ${activeInvoice.payment_date}` : 'Payment Pending'}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
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
        title="Delete Billing Record"
        message={`Are you sure you want to permanently delete Invoice #INV-${billToDelete?.bill_id} for ${billToDelete?.patient_name}?`}
        loading={submitting}
      />
    </div>
  );
};

export default Billing;

