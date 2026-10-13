import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';
import { Calendar, CheckCircle2, XCircle, Save, AlertTriangle, Users } from 'lucide-react';

const AttendanceManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Students list with current attendance state for the date
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadClassAttendance();
    }
  }, [selectedSubjectId, attendanceDate]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data?.success && res.data.data.length > 0) {
        setSubjects(res.data.data);
        setSelectedSubjectId(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadClassAttendance = async () => {
    if (!selectedSubjectId) return;
    try {
      setLoading(true);
      // 1. Get all students
      const studentsRes = await api.get('/students/all');
      const allStudents = studentsRes.data?.data || [];

      // 2. Get existing attendance records for this subject and date
      const attRes = await api.get(`/attendance/subject/${selectedSubjectId}?date=${attendanceDate}`);
      const existingRecords = attRes.data?.data || [];

      // 3. Map existing attendance or default to Present
      const recordMap = new Map();
      existingRecords.forEach((r) => {
        recordMap.set(r.studentId, r.isPresent);
      });

      // 4. Combine with student percentage summary
      const studentRows = await Promise.all(
        allStudents.map(async (st) => {
          let summary = null;
          try {
            const sumRes = await api.get(`/attendance/student/${st.id}/summary`);
            if (sumRes.data?.success) {
              summary = sumRes.data.data.find((s) => s.subjectId === Number(selectedSubjectId));
            }
          } catch (e) {
            // ignore
          }

          const isPresent = recordMap.has(st.id) ? recordMap.get(st.id) : true;
          return {
            studentId: st.id,
            rollNumber: st.rollNumber,
            fullName: st.fullName,
            departmentCode: st.departmentCode,
            isPresent,
            remarks: '',
            attendancePercentage: summary ? summary.attendancePercentage : 100.0,
            belowThreshold: summary ? summary.belowThreshold : false
          };
        })
      );

      setClassStudents(studentRows);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error loading class attendance roster', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (studentId) => {
    setClassStudents((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, isPresent: !item.isPresent } : item
      )
    );
  };

  const markAll = (status) => {
    setClassStudents((prev) =>
      prev.map((item) => ({ ...item, isPresent: status }))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || classStudents.length === 0) return;
    try {
      setSaving(true);
      const payload = {
        subjectId: Number(selectedSubjectId),
        attendanceDate: attendanceDate,
        records: classStudents.map((st) => ({
          studentId: st.studentId,
          isPresent: st.isPresent,
          remarks: st.isPresent ? 'Present' : 'Absent'
        }))
      };

      const res = await api.post('/attendance/bulk', payload);
      if (res.data?.success) {
        setToast({ message: 'Class attendance recorded and percentage updated successfully!', type: 'success' });
        loadClassAttendance();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error saving attendance', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = classStudents.filter((s) => s.isPresent).length;
  const absentCount = classStudents.length - presentCount;

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
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Record daily attendance, evaluate percentage, and track minimum 75% thresholds</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSaveAttendance}
          disabled={saving || classStudents.length === 0}
        >
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Subject:</label>
          <select
            className="form-control"
            style={{ width: '280px' }}
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name} (Sem {sub.semester})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Date:</label>
          <input
            type="date"
            className="form-control"
            style={{ width: '160px' }}
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => markAll(true)}>
            Mark All Present
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => markAll(false)}>
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Roster Overview Bar */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'white', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.9rem' }}>
          Total Enrolled: <strong>{classStudents.length}</strong>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#10b981' }}>
          Present Today: <strong>{presentCount}</strong>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>
          Absent Today: <strong>{absentCount}</strong>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Overall Subject Attendance %</th>
              <th>Alert Status</th>
              <th style={{ textAlign: 'center' }}>Mark Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  Loading class roster...
                </td>
              </tr>
            ) : classStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No students available for this class.
                </td>
              </tr>
            ) : (
              classStudents.map((st) => (
                <tr key={st.studentId}>
                  <td style={{ fontWeight: 600, color: '#1e40af' }}>{st.rollNumber}</td>
                  <td style={{ fontWeight: 500 }}>{st.fullName}</td>
                  <td>
                    <span className="badge badge-info">{st.departmentCode}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(st.attendancePercentage, 100)}%`,
                            backgroundColor: st.belowThreshold ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 600 }}>{st.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td>
                    {st.belowThreshold ? (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '4px' }}>
                        <AlertTriangle size={12} />
                        Low (&lt;75%)
                      </span>
                    ) : (
                      <span className="badge badge-success">Good</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${st.isPresent ? 'btn-primary' : 'btn-danger'}`}
                      onClick={() => handleToggle(st.studentId)}
                      style={{ minWidth: '100px' }}
                    >
                      {st.isPresent ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Present</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={15} />
                          <span>Absent</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;
