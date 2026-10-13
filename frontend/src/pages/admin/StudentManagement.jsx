import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Pagination from '../../components/Pagination';
import Toast from '../../components/Toast';
import { Plus, Search, Edit2, Trash2, Eye, Filter } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    rollNumber: '',
    fullName: '',
    email: '',
    phone: '',
    departmentId: '',
    academicYear: 1,
    semester: 1,
    enrollmentDate: new Date().toISOString().split('T')[0],
    createLoginAccount: true,
    initialPassword: 'CampusStudent#2026'
  });

  // Feedback notifications
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, searchTerm, selectedDept, selectedYear]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        search: searchTerm || undefined,
        departmentId: selectedDept || undefined,
        academicYear: selectedYear || undefined
      };
      const res = await api.get('/students', { params });
      if (res.data?.success) {
        setStudents(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setFormData({
      rollNumber: '',
      fullName: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      academicYear: 1,
      semester: 1,
      enrollmentDate: new Date().toISOString().split('T')[0],
      createLoginAccount: true,
      initialPassword: 'CampusStudent#2026'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudentId(student.id);
    setFormData({
      rollNumber: student.rollNumber,
      fullName: student.fullName,
      email: student.email,
      phone: student.phone || '',
      departmentId: student.departmentId,
      academicYear: student.academicYear,
      semester: student.semester,
      enrollmentDate: student.enrollmentDate,
      createLoginAccount: false,
      initialPassword: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      if (editingStudentId) {
        await api.put(`/students/${editingStudentId}`, formData);
        setToast({ message: 'Student updated successfully!', type: 'success' });
      } else {
        await api.post('/students', formData);
        setToast({ message: 'Student registered successfully!', type: 'success' });
      }
      setIsFormOpen(false);
      fetchStudents();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.data && typeof resp.data === 'object') {
        setFormErrors(resp.data);
      } else {
        setToast({ message: resp?.message || 'Error saving student record', type: 'error' });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      setToast({ message: `Student ${selectedStudent.fullName} deleted successfully`, type: 'success' });
      fetchStudents();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error deleting student', type: 'error' });
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
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">Register, update, and manage student academic accounts</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setPage(0);
          }}
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
          style={{ width: '140px' }}
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Year / Sem</th>
              <th>Email</th>
              <th>Phone</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1e40af' }}>{student.rollNumber}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{student.fullName}</td>
                  <td>
                    <span className="badge badge-info">{student.departmentCode}</span>
                  </td>
                  <td>Year {student.academicYear} (Sem {student.semester})</td>
                  <td style={{ color: '#475569' }}>{student.email}</td>
                  <td style={{ color: '#475569' }}>{student.phone || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="View Profile"
                        onClick={() => handleOpenDetails(student)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Edit Student"
                        onClick={() => handleOpenEdit(student)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Delete Student"
                        onClick={() => handleOpenDelete(student)}
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStudentId ? 'Edit Student Details' : 'Register New Student'}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g. 21CS001"
              />
              {formErrors.rollNumber && <div className="form-error">{formErrors.rollNumber}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
              />
              {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@smartcampus.edu"
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9876543210"
              />
              {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
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
              <label className="form-label">Year *</label>
              <select
                className="form-control"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: parseInt(e.target.value) })}
              >
                <option value={1}>1st</option>
                <option value={2}>2nd</option>
                <option value={3}>3rd</option>
                <option value={4}>4th</option>
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
          </div>

          {!editingStudentId && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#1e40af', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.createLoginAccount}
                  onChange={(e) => setFormData({ ...formData, createLoginAccount: e.target.checked })}
                />
                Create Student Portal Login Account
              </label>
              {formData.createLoginAccount && (
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>
                  Default password will be set to: <code>CampusStudent#2026</code> (Student can sign in immediately).
                </div>
              )}
            </div>
          )}

          <div className="modal-footer" style={{ margin: '-24px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStudentId ? 'Update Student' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title="Student Academic Profile"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Roll Number</div>
              <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '1.05rem', marginTop: '2px' }}>{selectedStudent.rollNumber}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedStudent.fullName}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>
              <div style={{ marginTop: '2px' }}>{selectedStudent.departmentName} ({selectedStudent.departmentCode})</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Year & Semester</div>
              <div style={{ marginTop: '2px' }}>Year {selectedStudent.academicYear}, Semester {selectedStudent.semester}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
              <div style={{ marginTop: '2px' }}>{selectedStudent.email}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
              <div style={{ marginTop: '2px' }}>{selectedStudent.phone || 'Not provided'}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Enrollment Date</div>
              <div style={{ marginTop: '2px' }}>{selectedStudent.enrollmentDate}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Portal Account</div>
              <div style={{ marginTop: '2px' }}>
                <span className={`badge ${selectedStudent.hasLoginAccount ? 'badge-success' : 'badge-warning'}`}>
                  {selectedStudent.hasLoginAccount ? 'Active' : 'Unlinked'}
                </span>
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ margin: '-24px', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDetailsOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete student "${selectedStudent?.fullName}" (${selectedStudent?.rollNumber})? This will permanently delete their profile, grades, and attendance.`}
      />
    </div>
  );
};

export default StudentManagement;
