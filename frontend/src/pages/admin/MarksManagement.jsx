import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Toast from '../../components/Toast';
import { Plus, Edit2, Trash2, Award, Calculator, Info } from 'lucide-react';

const MarksManagement = () => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    studentId: '',
    subjectId: '',
    examType: 'FINAL',
    semester: 1,
    marksObtained: '',
    maxMarks: 100.0,
    examDate: new Date().toISOString().split('T')[0]
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [selectedDept, selectedSem, selectedSubjectId]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/all');
      if (res.data?.success) setStudents(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data?.success) setSubjects(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const params = {
        departmentId: selectedDept || undefined,
        semester: selectedSem || undefined,
        subjectId: selectedSubjectId || undefined
      };
      const res = await api.get('/marks/filter', { params });
      if (res.data?.success) {
        setMarks(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    const firstSub = subjects[0];
    setFormData({
      id: null,
      studentId: students[0]?.id || '',
      subjectId: firstSub?.id || '',
      examType: 'FINAL',
      semester: firstSub?.semester || 1,
      marksObtained: '',
      maxMarks: firstSub?.maxMarks || 100.0,
      examDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setFormData({
      id: m.id,
      studentId: m.studentId,
      subjectId: m.subjectId,
      examType: m.examType,
      semester: m.semester,
      marksObtained: m.marksObtained,
      maxMarks: m.maxMarks,
      examDate: m.examDate || new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubjectChange = (subId) => {
    const sub = subjects.find((s) => s.id === Number(subId));
    setFormData((prev) => ({
      ...prev,
      subjectId: subId,
      semester: sub ? sub.semester : prev.semester,
      maxMarks: sub ? sub.maxMarks : 100.0
    }));
  };

  // Preview grade computation
  const previewPercentage =
    formData.marksObtained !== '' && formData.maxMarks > 0
      ? Math.round((parseFloat(formData.marksObtained) / parseFloat(formData.maxMarks)) * 10000) / 100
      : 0;

  const computeGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    if (pct >= 40) return 'E';
    return 'F';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const marksVal = parseFloat(formData.marksObtained);
    const maxVal = parseFloat(formData.maxMarks);

    if (marksVal < 0) {
      setFormError('Marks obtained cannot be negative.');
      return;
    }
    if (marksVal > maxVal) {
      setFormError(`Marks obtained (${marksVal}) cannot exceed maximum marks (${maxVal}).`);
      return;
    }

    try {
      const payload = {
        ...formData,
        studentId: Number(formData.studentId),
        subjectId: Number(formData.subjectId),
        marksObtained: marksVal,
        maxMarks: maxVal
      };
      await api.post('/marks', payload);
      setToast({ message: 'Mark recorded and grade assigned successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchMarks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error recording marks');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMark) return;
    try {
      await api.delete(`/marks/${selectedMark.id}`);
      setToast({ message: 'Mark record deleted successfully', type: 'success' });
      fetchMarks();
    } catch (err) {
      setToast({ message: 'Error deleting mark', type: 'error' });
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
          <h1 className="page-title">Marks & Academic Grading</h1>
          <p className="page-subtitle">Record exam marks, validate thresholds, and assign official letter grades</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Enter Student Marks</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="form-control"
          style={{ width: '200px' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: '150px' }}
          value={selectedSem}
          onChange={(e) => setSelectedSem(e.target.value)}
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: '260px' }}
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.code} — {sub.name}</option>
          ))}
        </select>
      </div>

      {/* Grading Legend Info Box */}
      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#475569' }}>
        <Info size={18} color="#2563eb" flexShrink={0} />
        <div>
          <strong>Standard Grading Policy:</strong> A+ (&ge;90%), A (&ge;80%), B (&ge;70%), C (&ge;60%), D (&ge;50%), E (&ge;40%), F (&lt;40% Fail).
        </div>
      </div>

      {/* Marks Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Subject</th>
              <th>Exam Type</th>
              <th>Semester</th>
              <th>Score / Max</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading marks records...
                </td>
              </tr>
            ) : marks.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No marks recorded for the selected filter.
                </td>
              </tr>
            ) : (
              marks.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600, color: '#1e40af' }}>{m.rollNumber}</td>
                  <td style={{ fontWeight: 500 }}>{m.studentName}</td>
                  <td>{m.subjectCode} - {m.subjectName}</td>
                  <td><span className="badge badge-info">{m.examType}</span></td>
                  <td>Sem {m.semester}</td>
                  <td><strong>{m.marksObtained}</strong> / {m.maxMarks}</td>
                  <td>{m.percentage}%</td>
                  <td>
                    <span
                      className={`badge ${
                        m.grade === 'A+' || m.grade === 'A'
                          ? 'badge-success'
                          : m.grade === 'F'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {m.grade}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(m)}>
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setSelectedMark(m);
                          setIsDeleteOpen(true);
                        }}
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

      {/* Add / Edit Marks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Student Mark' : 'Enter Student Marks'}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Student *</label>
            <select
              className="form-control"
              required
              disabled={!!formData.id}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              <option value="">Select Student</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.rollNumber} — {st.fullName} ({st.departmentCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select
                className="form-control"
                required
                disabled={!!formData.id}
                value={formData.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select
                className="form-control"
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
              >
                <option value="FINAL">Final Exam</option>
                <option value="MID_1">Mid Term 1</option>
                <option value="MID_2">Mid Term 2</option>
                <option value="LAB">Practical / Lab</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Marks Obtained *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="form-control"
                required
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                placeholder="e.g. 88.5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-control"
                readOnly
                value={formData.maxMarks}
                style={{ backgroundColor: '#f1f5f9' }}
              />
            </div>
          </div>

          {/* Live Grade Preview */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CALCULATED PERCENTAGE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e40af' }}>{previewPercentage}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>PREVIEW GRADE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af', textAlign: 'right' }}>
                {computeGrade(previewPercentage)}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '-24px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {formData.id ? 'Update Marks' : 'Save Marks & Grade'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Marks Entry"
        message={`Are you sure you want to delete this mark entry for "${selectedMark?.studentName}"?`}
      />
    </div>
  );
};

export default MarksManagement;
