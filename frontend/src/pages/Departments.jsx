import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  // Form State
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDepartmentName('');
    setDescription('');
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDepartmentName(dept.department_name);
    setDescription(dept.description || '');
    setFormError('');
    setShowAddEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!departmentName.trim()) {
      setFormError('Department name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department_name: departmentName.trim(),
        description: description.trim()
      };

      if (editingDept) {
        await api.put(`/departments/${editingDept.department_id}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      setShowAddEditModal(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Department may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/departments/${deptToDelete.department_id}`);
      setShowDeleteModal(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      console.error('Failed to delete department:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Departments</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure clinical units, surgical wings, and specialized medical departments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-medicare-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No departments registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.department_id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-medicare-50 text-medicare-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeptToDelete(dept);
                        setShowDeleteModal(true);
                      }}
                      title="Delete Department"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{dept.department_name}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                  {dept.description || 'No detailed description available.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Medical Staff:</span>
                </span>
                <span className="font-bold text-medicare-700 bg-medicare-50 px-2.5 py-0.5 rounded-full border border-medicare-100">
                  {dept.doctor_count} Doctor{dept.doctor_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        subtitle="Organize hospital resources and medical specialists."
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
              Department Name *
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. Oncology, Radiology, Pathology"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medicare-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description & Clinical Scope
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe department operations, special equipment, and services provided..."
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
              {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Save Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.department_name}"? Doctors assigned to this department and their appointments may also be affected.`}
        loading={submitting}
      />
    </div>
  );
};

export default Departments;

