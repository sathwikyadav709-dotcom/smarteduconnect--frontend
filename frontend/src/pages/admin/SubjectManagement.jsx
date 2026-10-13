import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Toast from '../../components/Toast';
import { Plus, BookOpen, UserPlus, Edit2, Trash2 } from 'lucide-react';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    semester: 1,
    credits: 3,
    maxMarks: 100.0
  });

  // Assign Student to Subject State
  const [assignStudentId, setAssignStudentId] = useState('');

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedDept, selectedSem]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/all');
      if (res.data?.success) setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      let url = '/subjects';
      if (selectedDept && selectedSem) {
        url = `/subjects/department/${selectedDept}/semester/${selectedSem}`;
      } else if (selectedDept) {
        url = `/subjects/department/${selectedDept}`;
      }
      const res = await api.get(url);
      if (res.data?.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      departmentId: departments[0]?.id || '',
      semester: 1,
      credits: 3,
      maxMarks: 100.0
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingId(subject.id);
    setFormData({
      code: subject.code,
      name: subject.name,
      departmentId: subject.departmentId,
      semester: subject.semester,
      credits: subject.credits,
      maxMarks: subject.maxMarks
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenAssign = (subject) => {
    setSelectedSubject(subject);
    setAssignStudentId(students[0]?.id || '');
    setIsAssignOpen(true);
  };

  const handleOpenDelete = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
        setToast({ message: 'Subject updated successfully!', type: 'success' });
      } else {
        await api.post('/subjects', formData);
        setToast({ message: 'Subject created successfully!', type: 'success' });
      }
      setIsFormOpen(false);
      fetchSubjects();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.data && typeof resp.data === 'object') {
        setFormErrors(resp.data);
      } else {
        setToast({ message: resp?.message || 'Error saving subject', type: 'error' });
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !assignStudentId) return;

    try {
      await api.post(`/subjects/${selectedSubject.id}/students/${assignStudentId}`);
      setToast({ message: 'Student enrolled in subject successfully!', type: 'success' });
      setIsAssignOpen(false);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error enrolling student', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubject) return;
    try {
      await api.delete(`/subjects/${selectedSubject.id}`);
      setToast({ message: `Subject ${selectedSubject.code} deleted successfully`, type: 'success' });
      fetchSubjects();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting subject', type: 'error' });
    }
  };

  return (
    <div className="page-container">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Subject Management</h1>
          <p className="page-subtitle">Configure campus courses, credits, syllabus modules, and student enrollments</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="filter-bar">
        <select
          className="form-control"
          style={{ width: '220px' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Max Marks</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading subjects...
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No subjects found.
                </td>
              </tr>
            ) : (
              subjects.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1e40af' }}>{s.code}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>
                    <span className="badge badge-info">{s.departmentCode}</span>
                  </td>
                  <td>Semester {s.semester}</td>
                  <td>{s.credits} Credits</td>
                  <td>{s.maxMarks}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Enroll Student"
                        onClick={() => handleOpenAssign(s)}
                      >
                        <UserPlus size={15} />
                        <span>Enroll</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Edit Subject"
                        onClick={() => handleOpenEdit(s)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Delete Subject"
                        onClick={() => handleOpenDelete(s)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS501"
              />
              {formErrors.code && <div className="form-error">{formErrors.code}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Database Management Systems"
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select
                className="form-control"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Credits *</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-control"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Maximum Marks *</label>
            <input
              type="number"
              step="0.5"
              min="1"
              className="form-control"
              required
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: parseFloat(e.target.value) })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '-24px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Enroll Student in ${selectedSubject?.code}`}
        maxWidth="500px"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Student to Enroll</label>
            <select
              className="form-control"
              required
              value={assignStudentId}
              onChange={(e) => setAssignStudentId(e.target.value)}
            >
              <option value="">Choose a student</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.rollNumber} — {st.fullName} ({st.departmentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '-24px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        message={`Are you sure you want to delete subject "${selectedSubject?.name}" (${selectedSubject?.code})? This will also remove associated enrollments, marks, and attendance records.`}
      />
    </div>
  );
};

export default SubjectManagement;
