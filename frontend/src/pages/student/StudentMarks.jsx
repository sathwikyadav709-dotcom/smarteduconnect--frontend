import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, BookOpen, Layers } from 'lucide-react';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/student/marks');
      if (res.data?.success) setMarks(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading examination results...</p>
      </div>
    );
  }

  const filteredMarks =
    selectedSem === 'ALL'
      ? marks
      : marks.filter((m) => m.semester === parseInt(selectedSem));

  const uniqueSemesters = Array.from(new Set(marks.map((m) => m.semester))).sort((a, b) => a - b);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marks & Grades</h1>
          <p className="page-subtitle">Subject-wise marks, examination scores, and academic grades</p>
        </div>

        {uniqueSemesters.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Semester:</span>
            <select
              className="form-control"
              style={{ width: '150px' }}
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="ALL">All Semesters</option>
              {uniqueSemesters.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Exam Type</th>
              <th>Marks Scored</th>
              <th>Maximum</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarks.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No examination marks recorded for this semester.
                </td>
              </tr>
            ) : (
              filteredMarks.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="badge badge-info">Sem {m.semester}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{m.subjectCode}</td>
                  <td style={{ fontWeight: 500 }}>{m.subjectName}</td>
                  <td>{m.examType}</td>
                  <td><strong>{m.marksObtained}</strong></td>
                  <td>{m.maxMarks}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentMarks;
