import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Printer, GraduationCap, Award, ShieldCheck } from 'lucide-react';

const AcademicTranscript = () => {
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscript();
  }, []);

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/student/transcript');
      if (res.data?.success) setTranscript(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading official transcript...</p>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="page-container">
        <p>No academic transcript records found.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Official Academic Transcript</h1>
          <p className="page-subtitle">Institutionally verified cumulative academic grade report</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Transcript Document Sheet */}
      <div
        className="card"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* University Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2d59', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '50%', color: '#1e40af' }}>
              <GraduationCap size={44} />
            </div>
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#0f2d59', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            Smart Campus University
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
            Office of Academic Records & Controller of Examinations
          </p>
          <div style={{ display: 'inline-block', marginTop: '12px', padding: '4px 16px', background: '#0f2d59', color: '#ffffff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Official Grade Transcript
          </div>
        </div>

        {/* Student Identification Information */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#f8fafc', padding: '18px 22px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '28px', fontSize: '0.9rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</div>
            <div style={{ fontWeight: 700, color: '#0f2d59', fontSize: '1.05rem', marginTop: '2px' }}>{transcript.fullName}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Roll / Registration Number</div>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '1.05rem', marginTop: '2px' }}>{transcript.rollNumber}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Department / Program</div>
            <div style={{ fontWeight: 600, color: '#334155', marginTop: '2px' }}>{transcript.departmentName}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Curriculum Level</div>
            <div style={{ fontWeight: 600, color: '#334155', marginTop: '2px' }}>Year {transcript.academicYear} • Semester {transcript.currentSemester}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Institutional Email</div>
            <div style={{ color: '#334155', marginTop: '2px' }}>{transcript.email}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Cumulative Attendance</div>
            <div style={{ fontWeight: 700, color: transcript.attendancePercentage < 75.0 ? '#dc2626' : '#15803d', marginTop: '2px' }}>
              {transcript.attendancePercentage}%
            </div>
          </div>
        </div>

        {/* Semester-wise Course Tables */}
        {transcript.semesterTranscripts && transcript.semesterTranscripts.length > 0 ? (
          transcript.semesterTranscripts.map((semDto) => (
            <div key={semDto.semester} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#0f2d59', fontWeight: 700 }}>
                  Semester {semDto.semester} Examination Record
                </h3>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                  Semester GPA: {semDto.semesterGpa.toFixed(2)}
                </span>
              </div>

              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {semDto.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#1e40af' }}>{sub.subjectCode}</td>
                      <td>{sub.subjectName}</td>
                      <td>{sub.credits}</td>
                      <td>{sub.marksObtained} / {sub.maxMarks}</td>
                      <td>{sub.percentage}%</td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 700 }}>
                          {sub.grade}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{sub.gradePoint.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            No semester courses or examination marks currently recorded.
          </div>
        )}

        {/* Cumulative Summary Card */}
        <div style={{ marginTop: '24px', padding: '18px 24px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL CREDITS EARNED</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2d59' }}>{transcript.totalCredits}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>OVERALL PERCENTAGE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2d59' }}>{transcript.overallPercentage}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CUMULATIVE CGPA</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e40af' }}>{transcript.cgpa ? transcript.cgpa.toFixed(2) : '0.00'} / 10.0</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>OVERALL RESULT GRADE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{transcript.overallGrade || 'N/A'}</div>
          </div>
        </div>

        {/* Official Signature Footer */}
        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <ShieldCheck size={20} color="#10b981" style={{ marginBottom: '4px' }} />
            <div>Document digitally verified & encrypted.</div>
            <div>Generated Date: {new Date().toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #334155', width: '200px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2d59' }}>Controller of Examinations</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Smart Campus University</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicTranscript;
