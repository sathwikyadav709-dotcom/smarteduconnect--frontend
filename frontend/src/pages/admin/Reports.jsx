import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Printer, Download, Search, FileText, CheckCircle, BarChart } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance'); // 'attendance', 'marks', 'department'
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report Data
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    loadReport();
  }, [reportType, selectedDept, selectedSubject, startDate, endDate]);

  const fetchMetadata = async () => {
    try {
      const [deptRes, subRes] = await Promise.all([
        api.get('/departments'),
        api.get('/subjects')
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (subRes.data?.success) setSubjects(subRes.data.data);
    } catch (e) { console.error(e); }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      if (reportType === 'attendance') {
        const res = await api.get('/reports/attendance', {
          params: {
            departmentId: selectedDept || undefined,
            subjectId: selectedSubject || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined
          }
        });
        if (res.data?.success) setReportData(res.data.data);
      } else if (reportType === 'marks') {
        const res = await api.get('/reports/marks', {
          params: {
            departmentId: selectedDept || undefined,
            subjectId: selectedSubject || undefined
          }
        });
        if (res.data?.success) setReportData(res.data.data);
      } else if (reportType === 'department') {
        const res = await api.get('/reports/departments');
        if (res.data?.success) setReportData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!reportData || reportData.length === 0) return;

    let headers = [];
    let rows = [];

    if (reportType === 'attendance') {
      headers = ['Date', 'Roll Number', 'Student Name', 'Subject Code', 'Status'];
      rows = reportData.map((r) => [
        r.attendanceDate,
        r.rollNumber,
        `"${r.studentName}"`,
        r.subjectCode,
        r.isPresent ? 'Present' : 'Absent'
      ]);
    } else if (reportType === 'marks') {
      headers = ['Roll Number', 'Student Name', 'Subject Code', 'Exam Type', 'Marks', 'Max Marks', 'Percentage', 'Grade'];
      rows = reportData.map((m) => [
        m.rollNumber,
        `"${m.studentName}"`,
        m.subjectCode,
        m.examType,
        m.marksObtained,
        m.maxMarks,
        m.percentage,
        m.grade
      ]);
    } else {
      headers = ['Department Code', 'Department Name', 'Enrolled Students'];
      rows = reportData.map((d) => [d.code, `"${d.name}"`, d.studentCount]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartCampus_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Campus Reports & Analytics</h1>
          <p className="page-subtitle">Generate official academic, attendance, and departmental reports</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${reportType === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('attendance')}
        >
          Attendance Report
        </button>
        <button
          className={`btn ${reportType === 'marks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('marks')}
        >
          Subject Marks Report
        </button>
        <button
          className={`btn ${reportType === 'department' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setReportType('department')}
        >
          Department Summary
        </button>
      </div>

      {/* Filter Bar */}
      {reportType !== 'department' && (
        <div className="filter-bar no-print">
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
            style={{ width: '240px' }}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.code} — {sub.name}</option>
            ))}
          </select>

          {reportType === 'attendance' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>From:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '150px' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>To:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '150px' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Printable Report Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#0f2d59', textTransform: 'capitalize' }}>
          Official {reportType} Report
        </h2>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Smart Campus University • Generated on {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Report Tables */}
      <div className="table-responsive">
        {reportType === 'attendance' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Generating attendance report...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No attendance data found.</td></tr>
              ) : (
                reportData.map((r, i) => (
                  <tr key={i}>
                    <td>{r.attendanceDate}</td>
                    <td style={{ fontWeight: 600, color: '#1e40af' }}>{r.rollNumber}</td>
                    <td>{r.studentName}</td>
                    <td>{r.subjectCode}</td>
                    <td>{r.subjectName}</td>
                    <td>
                      <span className={`badge ${r.isPresent ? 'badge-success' : 'badge-danger'}`}>
                        {r.isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {reportType === 'marks' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Exam</th>
                <th>Marks</th>
                <th>Max</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Generating marks report...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No marks data found.</td></tr>
              ) : (
                reportData.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#1e40af' }}>{m.rollNumber}</td>
                    <td>{m.studentName}</td>
                    <td>{m.subjectCode} - {m.subjectName}</td>
                    <td>{m.examType}</td>
                    <td><strong>{m.marksObtained}</strong></td>
                    <td>{m.maxMarks}</td>
                    <td>{m.percentage}%</td>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: 700 }}>
                        {m.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {reportType === 'department' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Code</th>
                <th>Department Name</th>
                <th>Enrolled Student Count</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>Generating department report...</td></tr>
              ) : (
                reportData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{d.code}</td>
                    <td>{d.name}</td>
                    <td><strong>{d.studentCount}</strong> students</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
