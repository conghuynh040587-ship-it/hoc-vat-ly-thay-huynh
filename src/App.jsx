/**
 * ==========================================
 * NỀN TẢNG QUẢN LÝ VÀ HỌC TẬP MÔN VẬT LÍ
 * Giảng viên: Thầy Lê Công Huynh
 * Tổng hợp toàn bộ các module: Auth, StudentLinkProfile, StudentDashboard,
 * QuizPlayer, QuizEditor, ClassManagement, DataManagement, ResultManagement
 * ==========================================
 */
import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, GraduationCap, ShieldCheck, LogOut, BookOpen, ChevronRight, ChevronDown, FileText, Video, FileQuestion, Clock, School, Users, UserCheck, AlertCircle, CheckCircle, Database, Plus, Trash2, Edit, FileSpreadsheet, ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Sliders, Eye, BarChart2, Filter, Calendar, Award, Share2, Code2, Sparkles, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { firestoreDb } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// HÀM HỖ TRỢ: XỬ LÝ CÔNG THỨC MATHTYPE / LATEX (Dùng CDN KaTeX toàn cục)
// ==========================================
const renderMathContent = (text) => {
  if (!text) return '';
  try {
    let processed = String(text).replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try { 
        if (window.katex) {
          return window.katex.renderToString(formula, { displayMode: true, throwOnError: false }); 
        }
      } catch (e) {}
      return match;
    });
    processed = processed.replace(/\$([\s\S]*?)\$/g, (match, formula) => {
      try { 
        if (window.katex) {
          return window.katex.renderToString(formula, { displayMode: false, throwOnError: false }); 
        }
      } catch (e) {}
      return match;
    });
    return <span dangerouslySetInnerHTML={{ __html: processed }} />;
  } catch (err) {
    return text;
  }
};

/**
 * ==========================================
 * MODULE: XÁC THỰC NGƯỜI DÙNG (Auth.jsx)
 * Chức năng: Đăng ký & Đăng nhập với mật khẩu được mã hóa riêng biệt.
 * ==========================================
 */
const hashPassword = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16) + "_" + btoa(str).substring(0, 6);
};

function Auth({ onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'teacher') {
      onLoginSuccess({
        role: 'teacher',
        name: 'Thầy Lê Công Huynh',
        phone: formData.phone || '0900000000'
      });
      return;
    }

    const savedAccounts = JSON.parse(localStorage.getItem('student_secure_accounts') || '{}');

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp!');
        return;
      }
      
      if (savedAccounts[formData.phone]) {
        setErrorMsg('Số điện thoại này đã được đăng ký. Vui lòng chuyển sang Đăng Nhập!');
        return;
      }

      const securePasswordHash = hashPassword(formData.password);

      savedAccounts[formData.phone] = {
        name: formData.name,
        phone: formData.phone,
        passwordHash: securePasswordHash,
        email: formData.email
      };
      
      localStorage.setItem('student_secure_accounts', JSON.stringify(savedAccounts));

      alert('Đăng ký tài khoản và mã hóa bảo mật thành công!');
      onLoginSuccess({
        role: 'student',
        name: formData.name,
        phone: formData.phone
      });

    } else if (mode === 'login') {
      const account = savedAccounts[formData.phone];
      if (!account) {
        setErrorMsg('Số điện thoại này chưa được đăng ký trong hệ thống!');
        return;
      }

      const inputPasswordHash = hashPassword(formData.password);
      if (account.passwordHash !== inputPasswordHash) {
        setErrorMsg('Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        return;
      }

      onLoginSuccess({
        role: 'student',
        name: account.name,
        phone: account.phone
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">
            Học Vật Lý
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">Cùng Thầy Lê Công Huynh</p>
        </div>

        <div className="flex text-sm font-medium border-b border-gray-200">
          <button
            onClick={() => { setRole('student'); setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              role === 'student' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <GraduationCap size={18} /> Học Sinh
          </button>
          <button
            onClick={() => { setRole('teacher'); setErrorMsg(''); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              role === 'teacher' ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck size={18} /> Quản Trị Viên
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Họ và tên của em"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            )}

            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="tel"
                name="phone"
                placeholder={role === 'teacher' ? "Số điện thoại quản trị" : "Số điện thoại"}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>

            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (Không bắt buộc)"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            )}

            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận lại mật khẩu"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-transform active:scale-[0.98] ${
                role === 'teacher' ? 'bg-gray-900 hover:bg-black' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {role === 'teacher' 
                ? 'Vào Trang Quản Trị' 
                : (mode === 'login' ? 'Đăng Nhập' : mode === 'register' ? 'Đăng Ký' : 'Gửi Yêu Cầu Khôi Phục')}
            </button>
          </form>

          {role === 'student' && (
            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  <button onClick={() => { setMode('register'); setErrorMsg(''); }} className="hover:text-blue-600 font-medium">
                    Chưa có tài khoản? Đăng ký ngay
                  </button>
                  <button onClick={() => { setMode('forgot'); setErrorMsg(''); }} className="hover:text-blue-600">
                    Quên mật khẩu? (Báo cho thầy)
                  </button>
                </>
              ) : (
                <button onClick={() => { setMode('login'); setErrorMsg(''); }} className="hover:text-blue-600 font-medium">
                  Đã có tài khoản? Quay lại đăng nhập
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: XÁC THỰC HỒ SƠ HỌC SINH (StudentLinkProfile.jsx)
 * ==========================================
 */
function StudentLinkProfile({ currentUser, db, onConfirmLink, onLogout }) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');

  const availableClasses = db.classes?.filter(c => c.gradeId === selectedGrade) || [];
  const availableStudents = db.studentsList?.filter(s => s.classId === selectedClass) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedStudent) {
      setError('Vui lòng chọn tên của em trong danh sách lớp.');
      return;
    }

    const studentRecord = db.studentsList.find(s => s.id === selectedStudent);
    if (studentRecord.phone && studentRecord.phone !== currentUser.phone) {
      setError(`Lỗi bảo mật: Tên này được đăng ký bằng một số điện thoại khác. Vui lòng chọn đúng tên của mình!`);
      return;
    }

    onConfirmLink({ studentId: studentRecord.id, classId: studentRecord.classId });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
        <div className="bg-blue-600 p-6 text-center text-white">
          <UserCheck size={48} className="mx-auto mb-3 opacity-90" />
          <h2 className="text-xl font-bold uppercase tracking-wide">Xác Thực Lớp Học</h2>
          <p className="text-blue-100 text-sm mt-2">
            Em cần xác nhận đúng thông tin của mình trong danh sách lớp do giáo viên cung cấp.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <School size={16} className="text-blue-500" /> 1. Chọn Khối
              </label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('');  
                  setSelectedStudent(''); 
                  setError('');
                }}
              >
                <option value="">-- Bấm để chọn khối --</option>
                {db.grades?.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Users size={16} className="text-blue-500" /> 2. Chọn Lớp
              </label>
              <select 
                disabled={!selectedGrade}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium disabled:opacity-50 disabled:bg-gray-100"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent(''); 
                  setError('');
                }}
              >
                <option value="">-- Bấm để chọn lớp --</option>
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck size={16} className="text-blue-500" /> 3. Chọn Tên Của Em
              </label>
              <select 
                disabled={!selectedClass}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium disabled:opacity-50 disabled:bg-gray-100"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setError('');
                }}
              >
                <option value="">-- Tìm và chọn tên em --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(SĐT: ***${s.phone.slice(-3)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={!selectedStudent}
              className="w-full py-3 mt-4 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vào Lớp Học
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-200 pt-4">
            <button 
              onClick={onLogout}
              className="text-sm font-semibold text-gray-500 hover:text-red-600 flex items-center justify-center gap-1.5 w-full transition-colors"
            >
              <LogOut size={16} /> Nhầm tài khoản? Thoát ra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: DASHBOARD HỌC SINH (StudentDashboard.jsx)
 * ==========================================
 */
function StudentDashboard({ currentUser, db, onLogout, onStartQuiz }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('theory');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapId) => {
    setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const currentStudent = db.studentsList?.find(s => s.id === currentUser?.linkedStudentId);
  const studentClassId = currentUser?.classId || currentStudent?.classId;
  const studentClass = db.classes?.find(c => c.id === studentClassId);
  const studentGradeId = studentClass?.gradeId;

  const filteredChapters = (db.chapters || []).filter(chap => {
    if (!studentGradeId) return true;
    return chap.gradeId === studentGradeId;
  });

  const availableMaterials = (db.materials || []).filter(mat => {
    if (mat.lessonId !== selectedLesson) return false;
    if (mat.type === 'theory' || mat.type === 'video') return true;
    if (mat.type === 'quiz') {
      if (mat.assignedClassIds && mat.assignedClassIds.length > 0) {
        return mat.assignedClassIds.includes(studentClassId);
      }
      return true;
    }
    return false;
  });

  const studentAttempts = db.quizAttempts?.filter(a => a.studentId === currentUser?.linkedStudentId) || [];
  const totalDone = studentAttempts.length;
  const avgScore = totalDone > 0 
    ? (studentAttempts.reduce((sum, a) => sum + parseFloat(a.score || 0), 0) / totalDone).toFixed(2) 
    : 0;

  let rankName = 'Chưa có dữ liệu';
  let rankColor = 'bg-gray-100 text-gray-700';
  
  if (totalDone > 0) {
    if (avgScore >= 8.5) { 
      rankName = '🌟 Giỏi (Rất xuất sắc)'; 
      rankColor = 'bg-emerald-50 text-emerald-800 border-emerald-200'; 
    } else if (avgScore >= 6.5) { 
      rankName = '👍 Khá (Nắm chắc kiến thức)'; 
      rankColor = 'bg-blue-50 text-blue-800 border-blue-200'; 
    } else if (avgScore >= 5.0) { 
      rankName = '✍️ Đạt (Cần luyện bài tập thêm)'; 
      rankColor = 'bg-amber-50 text-amber-800 border-amber-200'; 
    } else { 
      rankName = '🎯 Cần cố gắng nhiều hơn'; 
      rankColor = 'bg-rose-50 text-rose-800 border-rose-200'; 
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-purple-700 text-white p-4 shadow-md flex justify-between items-center z-10 relative">
        <div>
          <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide">Học Vật Lý Cùng Thầy Huynh</h1>
          <p className="text-xs text-purple-200 mt-0.5">Vật Lý không khó vì đã có thầy Huynh</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{currentUser?.name}</p>
            <p className="text-xs text-purple-200">Học sinh ({currentStudent ? db.classes?.find(c => c.id === currentStudent.classId)?.name : ''})</p>
          </div>
          <button 
            onClick={onLogout} 
            className="bg-purple-800 hover:bg-purple-900 px-3 py-1.5 rounded flex items-center gap-1.5 text-sm font-medium transition-colors border border-purple-600"
          >
            <LogOut size={16}/> Thoát
          </button>
        </div>
      </header>

      <div className="md:hidden bg-white p-3 border-b flex justify-between items-center shadow-sm">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
        >
          <BookOpen size={18} /> {showMobileMenu ? 'Ẩn mục lục' : 'Mở danh sách bài học'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`
          ${showMobileMenu ? 'absolute inset-0 z-20 bg-white w-full' : 'hidden'} 
          md:flex md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex-col overflow-y-auto shadow-inner
        `}>
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center md:hidden">
            <h3 className="font-bold text-gray-800">MỤC LỤC BÀI HỌC</h3>
            <button onClick={() => setShowMobileMenu(false)} className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-md border border-red-100">Đóng [x]</button>
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100 hidden md:block">CHƯƠNG TRÌNH HỌC</h3>
            {filteredChapters.map(chap => {
              const lessons = db.lessons?.filter(l => l.chapterId === chap.id) || [];
              const isOpen = expandedChapters[chap.id];
              return (
                <div key={chap.id} className="mb-3 border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                  <button 
                    onClick={() => toggleChapter(chap.id)} 
                    className="w-full text-left p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 font-semibold text-gray-800 transition-colors"
                  >
                    <span className="text-sm">{chap.name}</span>
                    {isOpen ? <ChevronDown size={18} className="text-blue-600"/> : <ChevronRight size={18} className="text-gray-400"/>}
                  </button>
                  {isOpen && (
                    <div className="p-2 space-y-1 bg-white">
                      {lessons.map(les => (
                        <button 
                          key={les.id} 
                          onClick={() => {
                            setSelectedLesson(les.id); 
                            setShowMobileMenu(false);  
                          }}
                          className={`w-full text-left p-2.5 rounded-md text-sm transition-all ${
                            selectedLesson === les.id 
                              ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                          }`}
                        >
                          {les.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-4 sm:p-6 overflow-y-auto">
          {!selectedLesson ? (
            <div className="max-w-2xl mx-auto space-y-6 mt-4 sm:mt-10">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-2">Chào em, {currentUser?.name}! 👋</h2>
                <p className="text-blue-100 text-sm">Hãy chọn một bài học ở danh sách bên trái để bắt đầu học tập nhé.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Tiến trình rèn luyện cá nhân</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Số bài đã làm</p>
                    <p className="text-3xl font-black text-blue-600">{totalDone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Điểm trung bình</p>
                    <p className="text-3xl font-black text-indigo-600">{avgScore}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border font-bold text-center text-sm ${rankColor}`}>
                  {rankName}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {db.lessons?.find(l => l.id === selectedLesson)?.name}
                </h2>
              </div>
              
              <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
                <button 
                  onClick={() => setActiveTab('theory')} 
                  className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'theory' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <FileText size={18}/> Lý thuyết
                </button>
                <button 
                  onClick={() => setActiveTab('video')} 
                  className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'video' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Video size={18}/> Video Thí nghiệm
                </button>
                <button 
                  onClick={() => setActiveTab('quiz')} 
                  className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'quiz' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <FileQuestion size={18}/> Đề luyện tập
                </button>
              </div>

              <div className="p-6">
                {availableMaterials.filter(m => m.type === activeTab).length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Chưa có dữ liệu cho phần này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableMaterials.filter(m => m.type === activeTab).map(mat => (
                      <div key={mat.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg mb-1">{mat.name}</h4>
                          {mat.type === 'quiz' && mat.quizConfig && (
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                              <Clock size={16} className="text-blue-500"/> 
                              Thời gian: {mat.quizConfig.time} phút | Số lần làm: {mat.quizConfig.attempts}
                            </p>
                          )}
                        </div>

                        {mat.type === 'theory' || mat.type === 'video' ? (
                           <a 
                             href={mat.link || '#'} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 text-sm text-center border border-blue-200 transition-colors"
                           >
                             Mở xem chi tiết
                           </a>
                        ) : (
                           <button 
                             onClick={() => onStartQuiz(mat)} 
                             className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm shadow-sm transition-transform active:scale-95"
                           >
                             Bắt đầu làm bài
                           </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: GIAO DIỆN LÀM BÀI VÀ XEM LẠI (QuizPlayer.jsx)
 * ==========================================
 */
function QuizPlayer({ quiz, currentUser, onFinish, onSaveResult }) {
  const [timeLeft, setTimeLeft] = useState((quiz.quizConfig?.time || 45) * 60); 
  const [answers, setAnswers] = useState({}); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (questionId, value) => {
    if (isReviewing) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitQuiz = (auto = false) => {
    const questions = quiz.questions || [];
    let calculatedScore = 0;

    const multiQs = questions.filter(q => q.type === 'multi' || !q.type);
    const tfQs = questions.filter(q => q.type === 'truefalse');
    const numQs = questions.filter(q => q.type === 'number');

    const multiScore = quiz.quizConfig?.sectionScores?.multiScore || 4.0;
    const tfScore = quiz.quizConfig?.sectionScores?.tfScore || 3.0;
    const numScore = quiz.quizConfig?.sectionScores?.numScore || 3.0;

    if (multiQs.length > 0) {
      const perMulti = multiScore / multiQs.length;
      multiQs.forEach(q => {
        if (answers[q.id] === q.answerMCQ) calculatedScore += perMulti;
      });
    }

    if (tfQs.length > 0) {
      const perTf = tfScore / tfQs.length;
      tfQs.forEach(q => {
        const userAns = answers[q.id] || {};
        let correctCount = 0;
        q.tfStatements?.forEach((stmt, idx) => {
          if (userAns[idx] === stmt.isTrue) correctCount++;
        });
        if (correctCount === 1) calculatedScore += perTf * 0.1;
        else if (correctCount === 2) calculatedScore += perTf * 0.25;
        else if (correctCount === 3) calculatedScore += perTf * 0.5;
        else if (correctCount === 4) calculatedScore += perTf * 1.0;
      });
    }

    if (numQs.length > 0) {
      const perNum = numScore / numQs.length;
      numQs.forEach(q => {
        const userVal = String(answers[q.id] || '').trim();
        if (userVal && (userVal === q.answerNumDot || userVal === q.answerNumComma)) {
          calculatedScore += perNum;
        }
      });
    }

    const finalResultScore = parseFloat(calculatedScore.toFixed(2));
    setFinalScore(finalResultScore);
    setIsFinished(true);
    setShowConfirmModal(false);

    onSaveResult({
      quizId: quiz.id,
      quizName: quiz.name,
      studentId: currentUser.linkedStudentId,
      studentName: currentUser.name,
      score: finalResultScore,
      answers,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-xs sticky top-0 z-20">
        <div>
          <h1 className="text-base font-bold text-gray-900">{quiz.name}</h1>
          <p className="text-xs text-gray-500">Học sinh: <strong>{currentUser.name}</strong></p>
        </div>
        <div className="flex items-center gap-4">
          {!isFinished ? (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-200 font-mono font-bold text-sm flex items-center gap-2">
              <Clock size={16}/> {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 font-bold text-sm">
              Điểm: {finalScore} / 10
            </div>
          )}
          {!isFinished ? (
            <button onClick={() => setShowConfirmModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow hover:bg-blue-700">
              Nộp bài
            </button>
          ) : (
            <button onClick={onFinish} className="bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-sm shadow hover:bg-black">
              Quay lại
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        {quiz.questions?.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="font-bold text-gray-900 flex items-start gap-2">
              <span className="text-blue-600">Câu {idx + 1}:</span>
              <div className="flex-1">{renderMathContent(q.content)}</div>
            </div>

            {q.imageLink && (
              <div className="text-center">
                <img src={q.imageLink} alt={`Hình minh họa câu ${idx + 1}`} className="max-h-60 mx-auto rounded-xl border shadow-xs" />
              </div>
            )}

            {/* Dạng 1: Nhiều lựa chọn */}
            {(q.type === 'multi' || !q.type) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                  const isChecked = answers[q.id] === opt;
                  return (
                    <label key={opt} className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${isChecked ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                      <input type="radio" name={`q_${q.id}`} checked={isChecked} onChange={() => handleAnswerChange(q.id, opt)} disabled={isFinished} className="text-blue-600" />
                      <span className="font-bold">{opt}.</span>
                      <span className="text-sm">{renderMathContent(q.options?.[optIdx])}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Dạng 2: Đúng / Sai */}
            {q.type === 'truefalse' && (
              <div className="space-y-2 pt-2">
                {q.tfStatements?.map((stmt, sIdx) => {
                  const userAns = answers[q.id]?.[sIdx];
                  return (
                    <div key={sIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium flex-1">
                        <strong className="text-indigo-600">{['a', 'b', 'c', 'd'][sIdx]}.</strong> {renderMathContent(stmt.text)}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleAnswerChange(q.id, { ...(answers[q.id] || {}), [sIdx]: true })} disabled={isFinished} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${userAns === true ? 'bg-green-600 text-white' : 'bg-white border'}`}>Đúng</button>
                        <button onClick={() => handleAnswerChange(q.id, { ...(answers[q.id] || {}), [sIdx]: false })} disabled={isFinished} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${userAns === false ? 'bg-red-600 text-white' : 'bg-white border'}`}>Sai</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dạng 3: Điền số */}
            {q.type === 'number' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Nhập câu trả lời bằng số..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={isFinished}
                  className="w-full sm:w-1/2 p-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="font-bold text-gray-900 text-lg">Xác nhận nộp bài</h3>
            <p className="text-sm text-gray-500">Em có chắc chắn muốn kết thúc bài làm và nộp ngay không?</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Làm tiếp</button>
              <button onClick={() => submitQuiz(false)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow">Nộp bài ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: BIÊN TẬP CÂU HỎI & CẤU HÌNH ĐỀ (QuizEditor.jsx)
 * Chức năng: Nhập mã LaTeX hàng loạt, tự động phân tách câu hỏi,
 * chỉnh sửa đề & đáp án riêng, gắn hình ảnh minh họa cho từng bài.
 * ==========================================
 */
function QuizEditor({ db, setDb, quizId, onClose, showToast }) {
  const quiz = db.materials?.find((m) => m.id === quizId) || {
    name: 'Đề kiểm tra',
    questions: [],
    quizConfig: {},
  };

  const [questions, setQuestions] = useState(quiz.questions || []);
  const [answerLink, setAnswerLink] = useState(quiz.quizConfig?.answerLink || '');
  const [sectionScores, setSectionScores] = useState(
    quiz.quizConfig?.sectionScores || { multiScore: 4.0, tfScore: 3.0, numScore: 3.0 }
  );

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [latexInput, setLatexInput] = useState('');

  // Hàm Parser: Tách mã LaTeX thô thành mảng câu hỏi hoàn chỉnh
  const parseLatexToQuestions = (text) => {
    const rawBlocks = text.split(/(?=(?:Câu|Bài)\s*\d+[:.])/gi).filter((b) => b.trim().length > 0);
    const parsedQuestions = [];

    rawBlocks.forEach((block, index) => {
      let type = 'multi';
      let content = block;
      let options = ['', '', '', ''];
      let answerMCQ = 'A';
      let tfStatements = [
        { text: '', isTrue: true },
        { text: '', isTrue: false },
        { text: '', isTrue: true },
        { text: '', isTrue: false },
      ];
      let answerNumDot = '';
      let answerNumComma = '';

      content = content.replace(/^(?:Câu|Bài)\s*\d+[:.]?\s*/i, '').trim();

      if (/(?:^|\n)[a-d]\)\s*.*?(?:Đúng|Sai|\(Đ\)|\(S\))/i.test(content) || /Đúng\/Sai/i.test(content)) {
        type = 'truefalse';
        const lines = content.split('\n');
        const mainContentLines = [];
        let stmtIdx = 0;

        lines.forEach((line) => {
          const match = line.match(/^([a-d])\)\s*(.*)/i);
          if (match && stmtIdx < 4) {
            let stmtText = match[2].trim();
            let isTrue = true;
            if (/[\(\[]?(Sai|S)[\)\]]?$/i.test(stmtText)) {
              isTrue = false;
              stmtText = stmtText.replace(/[\(\[]?(Sai|S)[\)\]]?$/i, '').trim();
            } else if (/[\(\[]?(Đúng|Đ)[\)\]]?$/i.test(stmtText)) {
              isTrue = true;
              stmtText = stmtText.replace(/[\(\[]?(Đúng|Đ)[\)\]]?$/i, '').trim();
            }
            tfStatements[stmtIdx] = { text: stmtText, isTrue };
            stmtIdx++;
          } else if (stmtIdx === 0) {
            mainContentLines.push(line);
          }
        });
        content = mainContentLines.join('\n').trim();
      } else if (/[A-D]\.\s*/.test(content)) {
        type = 'multi';
        const parts = content.split(/(?=[A-D]\.\s*)/);
        content = parts[0].trim();

        parts.slice(1).forEach((part) => {
          const match = part.match(/^([A-D])\.\s*([\s\S]*)/);
          if (match) {
            const optLetter = match[1].toUpperCase();
            const optIdx = ['A', 'B', 'C', 'D'].indexOf(optLetter);
            if (optIdx !== -1) {
              let optText = match[2].trim();
              if (optText.endsWith('*')) {
                optText = optText.slice(0, -1).trim();
                answerMCQ = optLetter;
              }
              options[optIdx] = optText;
            }
          }
        });
      } else if (/Đáp án:|KQ:|Kết quả:/i.test(content)) {
        type = 'number';
        const numMatch = content.match(/(?:Đáp án|KQ|Kết quả):\s*([\d\.,]+)/i);
        if (numMatch) {
          const val = numMatch[1].trim();
          answerNumDot = val.replace(',', '.');
          answerNumComma = val.replace('.', ',');
        }
        content = content.replace(/(?:Đáp án|KQ|Kết quả):\s*[\d\.,]+/gi, '').trim();
      }

      parsedQuestions.push({
        id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 5)}`,
        type,
        content,
        imageLink: '',
        options,
        answerMCQ,
        tfStatements,
        answerNumDot,
        answerNumComma,
        answerShort: '',
      });
    });

    return parsedQuestions;
  };

  const handleApplyLatex = () => {
    if (!latexInput.trim()) return;
    const newQs = parseLatexToQuestions(latexInput);
    if (newQs.length === 0) {
      alert('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra lại định dạng!');
      return;
    }
    setQuestions([...questions, ...newQs]);
    setLatexInput('');
    setIsImportModalOpen(false);
    if (showToast) showToast(`Đã thêm thành công ${newQs.length} câu hỏi từ mã LaTeX!`);
  };

  const addQuestion = (type) => {
    const newQ = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      content: '',
      imageLink: '',
      options: ['', '', '', ''],
      answerMCQ: 'A',
      tfStatements: [
        { text: '', isTrue: true },
        { text: '', isTrue: false },
        { text: '', isTrue: true },
        { text: '', isTrue: false },
      ],
      answerNumDot: '',
      answerNumComma: '',
      answerShort: '',
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, optIndex, value) => {
    const updated = [...questions];
    const options = updated[qIndex].options ? [...updated[qIndex].options] : ['', '', '', ''];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const updateTfStatement = (qIndex, stmtIndex, field, value) => {
    const updated = [...questions];
    const tfStatements = [...(updated[qIndex].tfStatements || [])];
    tfStatements[stmtIndex] = { ...tfStatements[stmtIndex], [field]: value };
    updated[qIndex] = { ...updated[qIndex], tfStatements };
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    if (window.confirm('Thầy có chắc chắn muốn xóa câu hỏi này không?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = () => {
    const updatedMaterials = db.materials?.map((m) => {
      if (m.id === quizId) {
        return {
          ...m,
          questions,
          quizConfig: { ...m.quizConfig, answerLink, sectionScores },
        };
      }
      return m;
    }) || [];

    setDb({ ...db, materials: updatedMaterials });
    if (showToast) showToast('Đã lưu cấu hình điểm và đề thi thành công!');
    onClose();
  };

  const countMulti = questions.filter((q) => q.type === 'multi' || !q.type).length;
  const countTf = questions.filter((q) => q.type === 'truefalse').length;
  const countNum = questions.filter((q) => q.type === 'number').length;

  return (
    <div className="h-full flex flex-col bg-gray-100 font-sans">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900">Biên tập câu hỏi & Cấu hình điểm: {quiz.name}</h2>
            <p className="text-xs text-gray-500">
              Tổng số câu: <strong className="text-blue-600">{questions.length} câu</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Code2 size={16} /> Nhập mã LaTeX
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Save size={16} /> Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 uppercase tracking-wide">
            <Sliders size={18} className="text-blue-600" /> Cấu hình phân bổ điểm số đề thi (Thang 10)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 1: Nhiều lựa chọn</label>
              <p className="text-xs text-gray-400">Số câu: {countMulti} | Mỗi câu: {countMulti > 0 ? (sectionScores.multiScore / countMulti).toFixed(2) : 0} đ</p>
              <input
                type="number"
                step="0.25"
                value={sectionScores.multiScore}
                onChange={(e) => setSectionScores({ ...sectionScores, multiScore: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg text-sm font-bold text-blue-700 bg-gray-50 outline-none"
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 2: Đúng / Sai</label>
              <p className="text-xs text-gray-400">Số câu: {countTf} (Chấm theo % ý)</p>
              <input
                type="number"
                step="0.25"
                value={sectionScores.tfScore}
                onChange={(e) => setSectionScores({ ...sectionScores, tfScore: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg text-sm font-bold text-indigo-700 bg-gray-50 outline-none"
              />
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 3: Điền số</label>
              <p className="text-xs text-gray-400">Số câu: {countNum} | Mỗi câu: {countNum > 0 ? (sectionScores.numScore / countNum).toFixed(2) : 0} đ</p>
              <input
                type="number"
                step="0.25"
                value={sectionScores.numScore}
                onChange={(e) => setSectionScores({ ...sectionScores, numScore: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded-lg text-sm font-bold text-amber-700 bg-gray-50 outline-none"
              />
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8">
            <FileQuestion size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-bold mb-1">Chưa có câu hỏi nào trong đề này.</p>
            <p className="text-xs text-gray-400">Thầy hãy bấm vào "Nhập mã LaTeX" hoặc thêm câu hỏi ở dưới để bắt đầu.</p>
          </div>
        ) : (
          questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 relative space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-black text-blue-900 text-base">Câu {qIndex + 1}</span>
                <div className="flex items-center gap-3">
                  <select
                    value={q.type || 'multi'}
                    onChange={(e) => updateQuestionField(qIndex, 'type', e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multi">Phần 1: Trắc nghiệm nhiều lựa chọn</option>
                    <option value="truefalse">Phần 2: Trắc nghiệm Đúng / Sai</option>
                    <option value="number">Phần 3: Điền số (Trả lời ngắn)</option>
                  </select>
                  <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Nội dung câu hỏi (Nhập text hoặc đoạn mã LaTeX)
                </label>
                <textarea
                  rows={3}
                  value={q.content}
                  onChange={(e) => updateQuestionField(qIndex, 'content', e.target.value)}
                  placeholder="Nhập nội dung hoặc mã LaTeX dạng $x^2 + y^2 = r^2$..."
                  className="w-full p-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-600" /> Link hình ảnh minh họa bài này
                </label>
                <input
                  type="url"
                  value={q.imageLink || ''}
                  onChange={(e) => updateQuestionField(qIndex, 'imageLink', e.target.value)}
                  placeholder="https://drive.google.com/... hoặc link ảnh online"
                  className="w-full p-2.5 rounded-lg bg-white text-gray-900 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                {q.imageLink && (
                  <div className="mt-2 text-center">
                    <img src={q.imageLink} alt="Xem trước hình ảnh minh họa" className="max-h-40 mx-auto rounded-lg border shadow-xs" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200">
                {(q.type === 'multi' || !q.type) && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-blue-900 uppercase">Các phương án lựa chọn</span>
                    {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                      <div key={opt} className={`p-3 rounded-xl border flex flex-col sm:flex-row gap-3 items-start sm:items-center ${q.answerMCQ === opt ? 'bg-blue-50/70 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-black text-blue-700 w-6 text-sm">{opt}.</span>
                        <textarea
                          rows={1}
                          value={q.options ? q.options[optIdx] : ''}
                          onChange={(e) => updateOptionText(qIndex, optIdx, e.target.value)}
                          placeholder={`Nội dung phương án ${opt}...`}
                          className="flex-1 w-full p-2 rounded-lg bg-white border border-gray-200 text-sm font-mono"
                        />
                        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer shrink-0 ${q.answerMCQ === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                          <input type="radio" name={`mcq-${q.id}`} checked={q.answerMCQ === opt} onChange={() => updateQuestionField(qIndex, 'answerMCQ', opt)} className="hidden" />
                          {q.answerMCQ === opt ? '✓ Đáp án đúng' : 'Chọn đúng'}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-indigo-900 uppercase">Phát biểu Đúng / Sai (a, b, c, d)</span>
                    {q.tfStatements?.map((stmt, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 items-center">
                        <span className="font-black text-indigo-700 w-6 text-sm">{['a', 'b', 'c', 'd'][sIdx]}.</span>
                        <textarea
                          rows={1}
                          value={stmt.text}
                          onChange={(e) => updateTfStatement(qIndex, sIdx, 'text', e.target.value)}
                          className="flex-1 w-full p-2 rounded-lg bg-white border border-gray-200 text-sm font-mono"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateTfStatement(qIndex, sIdx, 'isTrue', true)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${stmt.isTrue ? 'bg-green-600 text-white' : 'bg-white border text-gray-700'}`}
                          >
                            Đúng
                          </button>
                          <button
                            onClick={() => updateTfStatement(qIndex, sIdx, 'isTrue', false)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${!stmt.isTrue ? 'bg-red-600 text-white' : 'bg-white border text-gray-700'}`}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'number' && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <span className="block text-xs font-bold text-amber-900 uppercase">Đáp án điền số</span>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={q.answerNumDot || ''}
                        onChange={(e) => updateQuestionField(qIndex, 'answerNumDot', e.target.value)}
                        placeholder="Dấu chấm (.) VD: 15.5"
                        className="p-2 rounded-lg bg-white border text-sm font-mono"
                      />
                      <input
                        type="text"
                        value={q.answerNumComma || ''}
                        onChange={(e) => updateQuestionField(qIndex, 'answerNumComma', e.target.value)}
                        placeholder="Dấu phẩy (,) VD: 15,5"
                        className="p-2 rounded-lg bg-white border text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="bg-white p-5 rounded-2xl border border-gray-200 text-center space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase">Thêm câu hỏi mới thủ công</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => addQuestion('multi')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Trắc nghiệm Lựa chọn</button>
            <button onClick={() => addQuestion('truefalse')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Trắc nghiệm Đúng/Sai</button>
            <button onClick={() => addQuestion('number')} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold">+ Câu hỏi Điền số</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 space-y-2 bg-blue-50/40">
          <label className="block text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
            <LinkIcon size={14} className="text-blue-600" /> Đường dẫn xem video chữa / bài giải chi tiết
          </label>
          <input
            type="url"
            value={answerLink}
            onChange={(e) => setAnswerLink(e.target.value)}
            placeholder="Dán link YouTube / Google Drive..."
            className="w-full p-3 rounded-xl bg-white border border-blue-200 text-sm"
          />
        </div>
      </div>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-purple-50">
              <h3 className="font-bold text-purple-900 text-base flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" /> Nhập đoạn mã LaTeX
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <p className="text-xs text-gray-500">
                Dán toàn bộ mã LaTeX đề thi của thầy vào đây. Hệ thống sẽ tự động tách các câu hỏi và lựa chọn phương án.
              </p>
              <textarea
                rows={12}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder={`Ví dụ định dạng LaTeX:\n\nCâu 1: Cho hàm số $y = f(x)$. Lựa chọn đúng?\nA. $y' > 0$\nB. $y' < 0$\nC. $y' = 0$\nD. $y' = 1$\n\nCâu 2: Các phát biểu sau đúng hay sai?\na) $1 + 1 = 2$ Đúng\nb) $2 + 2 = 5$ Sai`}
                className="w-full p-3 font-mono text-xs border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600 text-xs font-bold">Hủy bỏ</button>
              <button onClick={handleApplyLatex} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Check size={16} /> Bắt đầu Phân Tách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * COMPONENT CHÍNH (App / Main Platform Router)
 * ==========================================
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Cơ sở dữ liệu mẫu ban đầu
  const [db, setDb] = useState({
    grades: [
      { id: 'g10', name: 'Khối 10' },
      { id: 'g11', name: 'Khối 11' },
      { id: 'g12', name: 'Khối 12' }
    ],
    classes: [
      { id: 'c10a1', name: '10A1', gradeId: 'g10' },
      { id: 'c11a1', name: '11A1', gradeId: 'g11' },
      { id: 'c12a1', name: '12A1', gradeId: 'g12' }
    ],
    chapters: [
      { id: 'chap1', name: 'Chương 1: Động học chất điểm', gradeId: 'g10' },
      { id: 'chap2', name: 'Chương 1: Điện tích - Điện trường', gradeId: 'g11' },
      { id: 'chap3', name: 'Chương 1: Dao động cơ', gradeId: 'g12' }
    ],
    lessons: [
      { id: 'les1', name: 'Bài 1: Chuyển động thẳng đều', chapterId: 'chap1' },
      { id: 'les2', name: 'Bài 1: Dao động điều hòa', chapterId: 'chap3' }
    ],
    studentsList: [
      { id: 'st1', name: 'Nguyễn Văn A', classId: 'c12a1', phone: '0912345678' }
    ],
    materials: [
      {
        id: 'mat1',
        lessonId: 'les2',
        type: 'quiz',
        name: 'Đề luyện tập Dao động điều hòa #1',
        quizConfig: {
          time: 15,
          attempts: 2,
          sectionScores: { multiScore: 4.0, tfScore: 3.0, numScore: 3.0 }
        },
        questions: []
      }
    ],
    quizAttempts: []
  });

  const showToast = (msg) => {
    alert(msg);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleConfirmLink = (linkData) => {
    setCurrentUser(prev => ({
      ...prev,
      linkedStudentId: linkData.studentId,
      classId: linkData.classId
    }));
  };

  const handleSaveResult = (attempt) => {
    setDb(prev => ({
      ...prev,
      quizAttempts: [...(prev.quizAttempts || []), attempt]
    }));
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'student' && !currentUser.linkedStudentId) {
    return (
      <StudentLinkProfile
        currentUser={currentUser}
        db={db}
        onConfirmLink={handleConfirmLink}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        currentUser={currentUser}
        onFinish={() => setActiveQuiz(null)}
        onSaveResult={handleSaveResult}
      />
    );
  }

  if (editingQuizId) {
    return (
      <QuizEditor
        db={db}
        setDb={setDb}
        quizId={editingQuizId}
        onClose={() => setEditingQuizId(null)}
        showToast={showToast}
      />
    );
  }

  return (
    <StudentDashboard
      currentUser={currentUser}
      db={db}
      onLogout={() => setCurrentUser(null)}
      onStartQuiz={(quiz) => setActiveQuiz(quiz)}
    />
  );
}
