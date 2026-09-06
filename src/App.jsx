/**
 * ==========================================
 * NỀN TẢNG QUẢN LÝ VÀ HỌC TẬP MÔN VẬT LÍ
 * Giảng viên: Thầy Lê Công Huynh
 * Tổng hợp toàn bộ các module: Auth, StudentLinkProfile, StudentDashboard,
 * QuizPlayer, QuizEditor, ClassManagement, DataManagement, ResultManagement
 * ==========================================
 */
import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, GraduationCap, ShieldCheck, LogOut, BookOpen, ChevronRight, ChevronDown, FileText, Video, FileQuestion, Clock, School, Users, UserCheck, AlertCircle, CheckCircle, Database, Plus, Trash2, Edit, FileSpreadsheet, ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Sliders, Eye, BarChart2, Filter, Calendar, Award, Share2 } from 'lucide-react';
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
 * Chức năng: Đăng nhập/Đăng ký dành cho Học sinh và Quản trị viên.
 * ==========================================
 */
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'student') {
        onLoginSuccess({
            role: 'student',
            name: formData.name || 'Học sinh Demo',
            phone: formData.phone || '0901234567'
        });
    } else {
        onLoginSuccess({
            role: 'teacher',
            name: 'Thầy Lê Công Huynh',
            phone: formData.phone || '0900000000'
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
            onClick={() => { setRole('student'); setMode('login'); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              role === 'student' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <GraduationCap size={18} /> Học Sinh
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              role === 'teacher' ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck size={18} /> Quản Trị Viên
          </button>
        </div>

        <div className="p-6 sm:p-8">
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
                  <button onClick={() => setMode('register')} className="hover:text-blue-600 font-medium">
                    Chưa có tài khoản? Đăng ký ngay
                  </button>
                  <button onClick={() => setMode('forgot')} className="hover:text-blue-600">
                    Quên mật khẩu? (Báo cho thầy)
                  </button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="hover:text-blue-600 font-medium">
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
 * Chức năng: Ép buộc học sinh chọn Khối -> Lớp -> Tên đúng với danh sách gốc.
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
/**
 * ==========================================
 * MODULE: DASHBOARD HỌC SINH (StudentDashboard.jsx)
 * Chức năng: Hiển thị giao diện học tập chính, mục lục bài học và lọc học liệu theo lớp được phân công.
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
  
  // === (1) TỰ ĐỘNG XÁC ĐỊNH KHỐI CỦA HỌC SINH ĐANG ĐĂNG NHẬP ===
  const studentClass = db.classes?.find(c => c.id === studentClassId);
  const studentGradeId = studentClass?.gradeId; // Lấy ra id khối (VD: 'g10', 'g11', 'g12')

  // === (2) LỌC CHỈ LẤY CÁC CHƯƠNG THUỘC ĐÚNG KHỐI ĐÓ ===
  const filteredChapters = (db.chapters || []).filter(chap => {
    if (!studentGradeId) return true; // Phòng hờ nếu chưa rõ lớp thì hiện tất cả
    return chap.gradeId === studentGradeId;
  });

  // Lọc học liệu: Đề kiểm tra (quiz) phải thuộc diện được giao chung HOẶC giao riêng cho lớp của học sinh
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
          <p className="text-xs text-purple-200 mt-0.5">Nền tảng học tập & rèn luyện tư duy</p>
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
 * Chức năng: Phòng làm bài trắc nghiệm, đếm ngược, render KaTeX và thuật toán chấm điểm chuẩn Đại học.
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

  const handleTFChange = (questionId, statementIndex, value) => {
    if (isReviewing) return;
    setAnswers(prev => {
      const currentQ = prev[questionId] || {};
      return { ...prev, [questionId]: { ...currentQ, [statementIndex]: value } };
    });
  };

  const submitQuiz = (isAuto = false) => {
    const questions = quiz.questions || [];
    if (questions.length === 0) {
      setFinalScore(0);
      setIsFinished(true);
      return;
    }

    const scoresConfig = quiz.quizConfig?.sectionScores || { multiScore: 4.0, tfScore: 3.0, numScore: 3.0 };
    
    const multiQuestions = questions.filter(q => q.type === 'multi' || !q.type);
    const tfQuestions = questions.filter(q => q.type === 'truefalse');
    const numQuestions = questions.filter(q => q.type === 'number');

    const pointPerMulti = multiQuestions.length > 0 ? scoresConfig.multiScore / multiQuestions.length : 0;
    const pointPerNum = numQuestions.length > 0 ? scoresConfig.numScore / numQuestions.length : 0;
    const pointPerTfQuestion = tfQuestions.length > 0 ? scoresConfig.tfScore / tfQuestions.length : 0;

    let totalEarnedScore = 0;

    questions.forEach(q => {
      const qType = q.type || 'multi';

      if (qType === 'multi') {
        if (answers[q.id] === q.answerMCQ) {
          totalEarnedScore += pointPerMulti;
        }
      } 
      else if (qType === 'truefalse') {
        const studentAns = answers[q.id] || {};
        let correctCount = 0;
        (q.tfStatements || []).forEach((stmt, idx) => {
          if (studentAns[idx] === stmt.isTrue) {
            correctCount++;
          }
        });

        let ratio = 0;
        if (correctCount === 1) ratio = 0.10;
        else if (correctCount === 2) ratio = 0.25;
        else if (correctCount === 3) ratio = 0.50;
        else if (correctCount === 4) ratio = 1.00;

        totalEarnedScore += (pointPerTfQuestion * ratio);
      } 
      else if (qType === 'number') {
        const rawAns = String(answers[q.id] || '').trim().toLowerCase();
        const dotAns = String(q.answerNumDot || '').trim().toLowerCase();
        const commaAns = String(q.answerNumComma || '').trim().toLowerCase();

        if (rawAns && (rawAns === dotAns || rawAns === commaAns)) {
          totalEarnedScore += pointPerNum;
        }
      }
    });

    const calculatedScore = Math.min(10, Math.max(0, totalEarnedScore)).toFixed(2);
    setFinalScore(calculatedScore);

    const totalTimeAllowed = (quiz.quizConfig?.time || 45) * 60;
    const secondsSpent = totalTimeAllowed - timeLeft;
    const minutesDone = Math.floor(secondsSpent / 60);
    const secondsDone = secondsSpent % 60;
    const durationText = minutesDone > 0 ? `${minutesDone} phút ${secondsDone} giây` : `${secondsDone} giây`;

    if (onSaveResult) {
      onSaveResult({
        quizId: quiz.id,
        score: calculatedScore,
        duration: durationText
      });
    }

    setShowConfirmModal(false);
    setIsFinished(true); 
  };

  if (isFinished && !isReviewing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 space-y-6">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Đã nộp bài thành công!</h2>
            <p className="text-gray-600 text-sm">Kết quả của em đã được ghi nhận vào hệ thống lớp học.</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
             <p className="text-5xl font-black text-green-700 mb-1">{finalScore}</p>
             <p className="text-sm font-bold text-green-600 uppercase tracking-widest">Điểm số tổng kết</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setIsReviewing(true)} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow flex items-center justify-center gap-2 text-sm"
            >
              <Eye size={18}/> Xem lại chi tiết bài làm
            </button>

            {quiz.quizConfig?.answerLink && (
              <a 
                href={quiz.quizConfig.answerLink} 
                target="_blank" 
                rel="noreferrer" 
                className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-bold transition-colors text-sm border border-gray-200"
              >
                Mở tài liệu / Video giải chi tiết
              </a>
            )}
            
            <button 
              onClick={onFinish} 
              className="w-full py-2.5 text-gray-500 hover:text-gray-800 font-semibold text-sm"
            >
              Quay lại danh sách bài học
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <div className="bg-white border-b px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isReviewing && (
            <button onClick={() => setIsReviewing(false)} className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={20}/>
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-gray-800 line-clamp-1">{quiz.name} {isReviewing && <span className="text-blue-600 font-black">(CHẾ ĐỘ XEM LẠI)</span>}</h1>
            <span className="text-xs text-gray-500 font-medium">Học sinh: {currentUser?.name}</span>
          </div>
        </div>

        {!isReviewing ? (
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0">
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-md border shadow-2xs ${timeLeft <= 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
              <Clock size={16}/>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setShowConfirmModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-md font-bold text-sm shadow-sm transition-transform active:scale-95">
              Nộp bài
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-200 text-blue-800 font-bold text-sm">
            Điểm đạt được: {finalScore} điểm
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-3xl mx-auto space-y-6">
            {!quiz.questions || quiz.questions.length === 0 ? (
               <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
                  <p className="text-gray-500 font-medium">Đề thi chưa có câu hỏi nào.</p>
               </div>
            ) : (
               quiz.questions.map((q, index) => {
                  const qType = q.type || 'multi';

                  return (
                     <div key={q.id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-4">
                        <h4 className="font-black text-lg text-blue-900 flex gap-2 border-b border-gray-100 pb-3">
                           <span className="shrink-0">Câu {index + 1}:</span>
                           <div className="font-medium text-gray-800">{renderMathContent(q.content)}</div>
                        </h4>
                        
                        {q.imageLink && (
                           <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                               <img src={q.imageLink} alt={`Minh họa câu ${index+1}`} className="w-full object-contain max-h-96 rounded-lg" />
                           </div>
                        )}

                        {qType === 'multi' && (
                           <div className="space-y-3">
                              {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                                 const optionText = q.options && q.options[optIdx] ? q.options[optIdx] : `Đáp án ${opt}`;
                                 const isSelected = answers[q.id] === opt;
                                 const isCorrect = isReviewing && q.answerMCQ === opt;
                                 const isWrongSelected = isReviewing && isSelected && !isCorrect;

                                 let badgeStyle = "bg-white border-gray-200 hover:bg-gray-50";
                                 if (isReviewing) {
                                   if (isCorrect) badgeStyle = "bg-green-50 border-green-500 ring-1 ring-green-500";
                                   else if (isWrongSelected) badgeStyle = "bg-red-50 border-red-500 ring-1 ring-red-500";
                                 } else if (isSelected) {
                                   badgeStyle = "bg-blue-50 border-blue-500 ring-1 ring-blue-500";
                                 }

                                 return (
                                    <label key={opt} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${badgeStyle}`}>
                                       <input 
                                          type="radio" 
                                          name={`ans_${q.id}`} 
                                          checked={isSelected} 
                                          disabled={isReviewing}
                                          onChange={() => handleAnswerChange(q.id, opt)}
                                          className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                                       />
                                       <div className="flex-1 flex gap-2 leading-relaxed">
                                          <span className="font-black text-gray-700">{opt}.</span>
                                          <span className="text-gray-800 font-medium">{renderMathContent(optionText)}</span>
                                       </div>
                                       {isReviewing && isCorrect && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Đáp án đúng</span>}
                                       {isReviewing && isWrongSelected && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">Em chọn sai</span>}
                                    </label>
                                 );
                              })}
                           </div>
                        )}

                        {qType === 'truefalse' && (
                           <div className="space-y-3">
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Các phát biểu Đúng / Sai:</p>
                              {(q.tfStatements || []).map((stmt, sIdx) => {
                                 const studentVal = answers[q.id]?.[sIdx];
                                 const correctVal = stmt.isTrue;

                                 return (
                                    <div key={sIdx} className="p-4 border rounded-xl bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                       <div className="font-medium text-gray-800 flex-1 flex gap-2">
                                          <span className="font-bold text-gray-900 shrink-0">{['a', 'b', 'c', 'd'][sIdx]}.</span> 
                                          {renderMathContent(stmt.text)}
                                       </div>
                                       <div className="flex gap-3 shrink-0 items-center">
                                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border font-bold text-sm transition-colors ${studentVal === true ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}>
                                             <input type="radio" disabled={isReviewing} className="hidden" checked={studentVal === true} onChange={() => handleTFChange(q.id, sIdx, true)} />
                                             Đúng
                                          </label>
                                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border font-bold text-sm transition-colors ${studentVal === false ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}>
                                             <input type="radio" disabled={isReviewing} className="hidden" checked={studentVal === false} onChange={() => handleTFChange(q.id, sIdx, false)} />
                                             Sai
                                          </label>
                                          {isReviewing && (
                                             <span className={`text-xs font-bold px-2 py-1 rounded ${studentVal === correctVal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                Thực tế: {correctVal ? 'Đúng' : 'Sai'}
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}

                        {qType === 'number' && (
                           <div className="space-y-2">
                              <input 
                                 type="text" 
                                 disabled={isReviewing}
                                 placeholder="Nhập câu trả lời của em..." 
                                 className="w-full p-4 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-900" 
                                 value={answers[q.id] || ''} 
                                 onChange={(e) => handleAnswerChange(q.id, e.target.value)} 
                              />
                              {isReviewing && (
                                 <p className="text-xs font-bold text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    Đáp án chuẩn của giáo viên: <span className="text-blue-700 font-black">{q.answerNumDot || q.answerNumComma || '-'}</span>
                                 </p>
                              )}
                           </div>
                        )}
                     </div>
                  );
               })
            )}
         </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl space-y-4">
            <h3 className="font-bold text-xl text-gray-800">Xác nhận nộp bài</h3>
            <p className="text-gray-600 text-sm">Hệ thống sẽ tiến hành chấm điểm tự động. Em có chắc chắn muốn nộp không?</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 w-full text-sm">Tiếp tục làm</button>
              <button onClick={() => submitQuiz(false)} className="px-4 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 w-full text-sm shadow">Nộp bài ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: SOẠN CÂU HỎI & CẤU HÌNH ĐIỂM (QuizEditor.jsx)
 * Chức năng: Giáo viên biên tập câu hỏi trắc nghiệm và cấu hình phân bổ điểm.
 * ==========================================
 */
function QuizEditor({ db, setDb, quizId, onClose, showToast }) {
  const quiz = db.materials?.find(m => m.id === quizId) || { name: 'Đề kiểm tra', questions: [], quizConfig: {} };
  
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [answerLink, setAnswerLink] = useState(quiz.quizConfig?.answerLink || '');

  const [sectionScores, setSectionScores] = useState(quiz.quizConfig?.sectionScores || {
    multiScore: 4.0, 
    tfScore: 3.0,     
    numScore: 3.0     
  });

  const addQuestion = (type) => {
    const newQ = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: type, 
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
      answerShort: ''
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, optIndex, value) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = ['', '', '', ''];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const updateTfStatement = (qIndex, stmtIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].tfStatements[stmtIndex][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    if (window.confirm('Thầy có chắc chắn muốn xóa câu hỏi này không?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = () => {
    const updatedMaterials = db.materials.map(m => {
      if (m.id === quizId) {
        return {
          ...m,
          questions: questions,
          quizConfig: { 
            ...m.quizConfig, 
            answerLink,
            sectionScores 
          }
        };
      }
      return m;
    });

    setDb({ ...db, materials: updatedMaterials });
    showToast('Đã lưu cấu hình điểm và đề thi thành công!');
    onClose();
  };

  const countMulti = questions.filter(q => q.type === 'multi' || !q.type).length;
  const countTf = questions.filter(q => q.type === 'truefalse').length;
  const countNum = questions.filter(q => q.type === 'number').length;

  return (
    <div className="h-full flex flex-col bg-gray-100 font-sans">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900">Biên tập câu hỏi & Cấu hình điểm: {quiz.name}</h2>
            <p className="text-xs text-gray-500">Tổng số câu: <strong className="text-blue-600">{questions.length} câu</strong></p>
          </div>
        </div>
        <button 
          onClick={handleSaveAll} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 transition-transform active:scale-95"
        >
          <Save size={16}/> Lưu thay đổi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h3 className="font-bold text-sm text-blue-900 flex items-center gap-2 uppercase tracking-wide">
            <Sliders size={18} className="text-blue-600"/> Cấu hình phân bổ điểm số đề thi (Thang 10)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 1: Nhiều lựa chọn</label>
              <p className="text-xs text-gray-400">Số câu: {countMulti} | Mỗi câu: {countMulti > 0 ? (sectionScores.multiScore / countMulti).toFixed(2) : 0} đ</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.multiScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, multiScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border rounded-lg text-sm font-bold text-blue-700 bg-gray-50 outline-none"
                />
                <span className="text-xs font-bold text-gray-500">điểm</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 2: Đúng / Sai</label>
              <p className="text-xs text-gray-400">Số câu: {countTf} (Chấm theo % ý)</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.tfScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, tfScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border rounded-lg text-sm font-bold text-indigo-700 bg-gray-50 outline-none"
                />
                <span className="text-xs font-bold text-gray-500">điểm</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
              <label className="block text-xs font-bold text-gray-700">Phần 3: Điền số</label>
              <p className="text-xs text-gray-400">Số câu: {countNum} | Mỗi câu: {countNum > 0 ? (sectionScores.numScore / countNum).toFixed(2) : 0} đ</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.numScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, numScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border rounded-lg text-sm font-bold text-amber-700 bg-gray-50 outline-none"
                />
                <span className="text-xs font-bold text-gray-500">điểm</span>
              </div>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8">
            <FileQuestion size={48} className="mx-auto text-gray-300 mb-3"/>
            <p className="text-gray-600 font-bold mb-1">Chưa có câu hỏi nào trong đề này.</p>
            <p className="text-xs text-gray-400">Thầy hãy bấm vào các nút thêm câu hỏi ở phía dưới để bắt đầu soạn đề nhé.</p>
          </div>
        ) : (
          questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-black text-blue-900 text-base">Câu {qIndex + 1}</span>
                <div className="flex items-center gap-3">
                  <select 
                    value={q.type} 
                    onChange={(e) => updateQuestionField(qIndex, 'type', e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multi">Phần 1: Trắc nghiệm nhiều lựa chọn</option>
                    <option value="truefalse">Phần 2: Trắc nghiệm Đúng / Sai</option>
                    <option value="number">Phần 3: Điền số (Trả lời ngắn)</option>
                  </select>
                  <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Xóa câu hỏi">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Nội dung đề bài</label>
                <textarea 
                  rows={3}
                  value={q.content}
                  onChange={(e) => updateQuestionField(qIndex, 'content', e.target.value)}
                  placeholder="Nhập nội dung câu hỏi vật lý..."
                  className="w-full p-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-500"/> Link hình ảnh minh họa (Google Drive / Ảnh online)
                </label>
                <input 
                  type="url"
                  value={q.imageLink || ''}
                  onChange={(e) => updateQuestionField(qIndex, 'imageLink', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200">
                {q.type === 'multi' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-blue-900 uppercase tracking-wider">Các phương án trả lời (Chọn 1 đáp án đúng)</span>
                    {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                      <div key={opt} className={`p-3 rounded-xl border flex flex-col sm:flex-row gap-3 items-start sm:items-center transition-colors ${q.answerMCQ === opt ? 'bg-blue-50/70 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-black text-blue-700 w-6 text-sm">{opt}.</span>
                        <textarea 
                          rows={2}
                          value={q.options ? q.options[optIdx] : ''}
                          onChange={(e) => updateOptionText(qIndex, optIdx, e.target.value)}
                          placeholder={`Nhập nội dung phương án ${opt}...`}
                          className="flex-1 w-full p-2.5 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium"
                        />
                        <label className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer shrink-0 transition-colors ${q.answerMCQ === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                          <input type="radio" name={`mcq-${q.id}`} checked={q.answerMCQ === opt} onChange={() => updateQuestionField(qIndex, 'answerMCQ', opt)} className="hidden" />
                          {q.answerMCQ === opt ? '✓ Đáp án đúng' : 'Chọn là đúng'}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">Phát biểu Đúng / Sai (4 ý a, b, c, d)</span>
                    {q.tfStatements?.map((stmt, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <span className="font-black text-indigo-700 w-6 text-sm">{['a', 'b', 'c', 'd'][sIdx]}.</span>
                        <textarea 
                          rows={2}
                          value={stmt.text}
                          onChange={(e) => updateTfStatement(qIndex, sIdx, 'text', e.target.value)}
                          placeholder={`Nhập nội dung ý ${['a', 'b', 'c', 'd'][sIdx]}...`}
                          className="flex-1 w-full p-2.5 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <label className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${stmt.isTrue ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300'}`}>
                            <input type="radio" name={`tf-${q.id}-${sIdx}`} checked={stmt.isTrue} onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', true)} className="hidden" />
                            Đúng
                          </label>
                          <label className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors {!stmt.isTrue ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300'}`}>
                            <input type="radio" name={`tf-${q.id}-${sIdx}`} checked={!stmt.isTrue} onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', false)} className="hidden" />
                            Sai
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'number' && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <span className="block text-xs font-bold text-amber-900 uppercase tracking-wider">Đáp án điền số (Hỗ trợ cả 2 dạng dấu thập phân)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1 font-medium">Dạng dùng dấu chấm (.)</label>
                        <input type="text" value={q.answerNumDot || ''} onChange={(e) => updateQuestionField(qIndex, 'answerNumDot', e.target.value)} placeholder="VD: 15.5" className="w-full p-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1 font-medium">Dạng dùng dấu phẩy (,)</label>
                        <input type="text" value={q.answerNumComma || ''} onChange={(e) => updateQuestionField(qIndex, 'answerNumComma', e.target.value)} placeholder="VD: 15,5" className="w-full p-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thêm câu hỏi mới vào đề thi</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => addQuestion('multi')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95">+ Trắc nghiệm nhiều lựa chọn</button>
            <button onClick={() => addQuestion('truefalse')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95">+ Trắc nghiệm Đúng / Sai</button>
            <button onClick={() => addQuestion('number')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95">+ Câu hỏi Điền số</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-2 bg-blue-50/40">
          <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon size={14} className="text-blue-600"/> Đường dẫn xem bài giải chi tiết / Video chữa (Dành cho học sinh sau khi nộp bài)
          </label>
          <input 
            type="url" 
            value={answerLink} 
            onChange={(e) => setAnswerLink(e.target.value)} 
            placeholder="Dán link Google Drive hoặc YouTube vào đây..." 
            className="w-full p-3 rounded-xl bg-white text-gray-900 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: QUẢN LÝ LỚP & HỌC SINH (ClassManagement.jsx)
 * Chức năng: Thêm/Sửa/Xóa lớp, Thêm học sinh thủ công hoặc Import Excel.
 * ==========================================
 */
function ClassManagement({ db, setDb, showToast }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showManualAddStudent, setShowManualAddStudent] = useState(false);
  
  const [newClass, setNewClass] = useState({ gradeId: '', name: '' });
  const [editingClass, setEditingClass] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null); 
  
  const [manualStudent, setManualStudent] = useState({
    name: '',
    gender: 'Nam',
    phone: '',
    email: ''
  });

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.gradeId || !newClass.name) return;
    const createdClass = { id: `c${Date.now()}`, gradeId: newClass.gradeId, name: newClass.name.trim() };
    setDb({ ...db, classes: [...db.classes, createdClass] });
    setShowAddClass(false);
    setNewClass({ gradeId: '', name: '' });
    showToast('Thêm lớp học thành công!');
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();
    if (!editingClass || !editingClass.name.trim()) return;
    const updatedClasses = db.classes.map(c => c.id === editingClass.id ? { ...c, name: editingClass.name.trim() } : c);
    setDb({ ...db, classes: updatedClasses });
    setEditingClass(null);
    showToast('Cập nhật tên lớp thành công!');
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.name.trim()) return;
    const updatedStudents = db.studentsList.map(s => s.id === editingStudent.id ? editingStudent : s);
    setDb({ ...db, studentsList: updatedStudents });
    setEditingStudent(null);
    showToast('Cập nhật thông tin học sinh thành công!');
  };

  const handleManualAddStudent = (e) => {
    e.preventDefault();
    if (!selectedClass || !manualStudent.name.trim()) return;
    
    const newStu = {
      id: `sl_man_${Date.now()}`,
      classId: selectedClass,
      name: manualStudent.name.trim(),
      gender: manualStudent.gender,
      phone: manualStudent.phone.trim(),
      email: manualStudent.email.trim(),
      done: 0,
      total: 0
    };

    setDb({
      ...db,
      studentsList: [...db.studentsList, newStu]
    });

    setShowManualAddStudent(false);
    setManualStudent({ name: '', gender: 'Nam', phone: '', email: '' });
    showToast('Thêm học sinh thủ công thành công!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedClass) {
      showToast('Vui lòng chọn lớp ở cột trái trước khi import!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showToast('File Excel không chứa dữ liệu!', 'error');
          return;
        }

        const newStudentsParsed = data.map((row, idx) => ({
          id: `sl_excel_${Date.now()}_${idx}`,
          classId: selectedClass,
          name: row['Họ và tên'] || row['Ho va ten'] || 'Học sinh',
          gender: row['Giới tính'] || row['Gioi tinh'] || 'Nam',
          phone: String(row['Số điện thoại'] || row['So dien thoai'] || '').trim(),
          email: row['Email'] || '',
          done: 0,
          total: 0
        }));

        setDb({
          ...db, 
          studentsList: [...db.studentsList, ...newStudentsParsed]
        });
        
        setShowAddStudent(false);
        showToast(`Đã import thành công ${newStudentsParsed.length} học sinh vào lớp!`);
      } catch (err) {
        showToast('Lỗi đọc file Excel. Vui lòng kiểm tra lại cấu trúc cột!', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      { "Họ và tên": "Nguyễn Văn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Email": "a@gmail.com" },
      { "Họ và tên": "Trần Thị B", "Giới tính": "Nữ", "Số điện thoại": "0907654321", "Email": "b@gmail.com" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh.xlsx");
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b space-y-2 bg-gray-50">
          <button 
            onClick={() => setShowAddClass(true)} 
            className="w-full py-2 bg-white hover:bg-gray-100 rounded-lg flex justify-center items-center gap-2 text-sm font-bold border border-gray-300 shadow-2xs transition-colors"
          >
            <Plus size={16}/> Thêm lớp mới
          </button>
          <button 
            onClick={() => {
              if (!selectedClass) showToast('Vui lòng chọn lớp trước!', 'error');
              else setShowAddStudent(true);
            }} 
            className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex justify-center items-center gap-2 text-sm font-bold shadow-2xs transition-colors"
          >
            <Users size={16}/> Import Danh Sách (Excel/CSV)
          </button>
          <button 
            onClick={() => {
              if (!selectedClass) showToast('Vui lòng chọn lớp trước!', 'error');
              else setShowManualAddStudent(true);
            }} 
            className="w-full py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex justify-center items-center gap-2 text-sm font-bold shadow-2xs transition-colors"
          >
            <Plus size={16}/> Thêm học sinh thủ công
          </button>
        </div>

        <div className="p-4 space-y-4">
          {db.grades?.map(grade => (
            <div key={grade.id}>
              <h3 className="font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md text-xs uppercase tracking-wider">{grade.name}</h3>
              <div className="ml-2 mt-2 space-y-1">
                {db.classes?.filter(c => c.gradeId === grade.id).map(cls => (
                  <div 
                    key={cls.id} 
                    className={`flex justify-between items-center p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedClass === cls.id ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200' : 'hover:bg-gray-50 text-gray-700'
                    }`} 
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <span>{cls.name}</span>
                    <div className="flex gap-2 items-center text-gray-400">
                      <Edit 
                        size={16} 
                        className="hover:text-blue-600 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingClass({ id: cls.id, name: cls.name });
                        }}
                        title="Sửa tên lớp"
                      />
                      <Trash2 
                        size={16} 
                        className="hover:text-red-600 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (window.confirm(`Xóa lớp ${cls.name}?`)) {
                            setDb({ ...db, classes: db.classes.filter(c => c.id !== cls.id) }); 
                            showToast('Đã xóa lớp học'); 
                          }
                        }}
                        title="Xóa lớp"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-gray-50 p-6 overflow-y-auto">
        {!selectedClass ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Hãy chọn một lớp học ở cột bên trái để quản lý danh sách học sinh.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-gray-800 flex justify-between items-center">
              <span>Danh sách lớp: {db.classes?.find(c => c.id === selectedClass)?.name}</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                Sĩ số: {db.studentsList?.filter(s => s.classId === selectedClass).length} học sinh
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3.5 text-center">STT</th>
                    <th className="p-3.5">Họ và tên</th>
                    <th className="p-3.5">Giới tính</th>
                    <th className="p-3.5">Số điện thoại</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 text-center">Tiến độ bài tập</th>
                    <th className="p-3.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {db.studentsList?.filter(s => s.classId === selectedClass).length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-400 italic">Lớp này chưa có học sinh nào. Hãy bấm "Thêm học sinh thủ công" hoặc "Import".</td></tr>
                  ) : (
                    db.studentsList?.filter(s => s.classId === selectedClass).map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-gray-900">{s.name}</td>
                        <td className="p-3.5 text-gray-600">{s.gender}</td>
                        <td className="p-3.5 text-gray-600">{s.phone}</td>
                        <td className="p-3.5 text-gray-600">{s.email || '-'}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100">
                            {s.done || 0} bài hoàn thành
                          </span>
                        </td>
                        <td className="p-3.5 text-center flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingStudent({ ...s })}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Xóa học sinh ${s.name}?`)) {
                                setDb({ ...db, studentsList: db.studentsList.filter(stu => stu.id !== s.id) });
                                showToast('Đã xóa học sinh khỏi danh sách');
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddClass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Thêm lớp học mới</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Chọn Khối</label>
                <select 
                  required 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={newClass.gradeId} 
                  onChange={e => setNewClass({ ...newClass, gradeId: e.target.value })}
                >
                  <option value="">-- Chọn khối --</option>
                  {db.grades?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tên lớp</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: 12A1" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={newClass.name} 
                  onChange={e => setNewClass({ ...newClass, name: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddClass(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingClass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Chỉnh sửa tên lớp</h3>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tên lớp mới</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={editingClass.name} 
                  onChange={e => setEditingClass({ ...editingClass, name: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingClass(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Chỉnh sửa thông tin học sinh</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Họ và tên</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={editingStudent.name} 
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Giới tính</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={editingStudent.gender} 
                  onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={editingStudent.phone} 
                  onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={editingStudent.email} 
                  onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualAddStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Thêm học sinh thủ công</h3>
            <form onSubmit={handleManualAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Họ và tên</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: Nguyễn Văn A" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={manualStudent.name} 
                  onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Giới tính</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={manualStudent.gender} 
                  onChange={e => setManualStudent({ ...manualStudent, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  placeholder="VD: 0901234567" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={manualStudent.phone} 
                  onChange={e => setManualStudent({ ...manualStudent, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="VD: email@gmail.com" 
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-sm font-medium outline-none" 
                  value={manualStudent.email} 
                  onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowManualAddStudent(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-sm shadow-sm">Thêm học sinh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-lg mb-2 text-gray-900">Import Danh Sách Học Sinh</h3>
            <p className="text-xs text-gray-500 mb-4">Thêm học sinh cho lớp đang chọn bằng tệp Excel.</p>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm mb-4 space-y-2">
              <p className="font-bold text-blue-900 text-xs uppercase tracking-wider">Cấu trúc file Excel yêu cầu:</p>
              <p className="text-blue-800 text-xs">Các cột trong file cần đặt tên chính xác: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">Họ và tên</code> | <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">Giới tính</code> | <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">Số điện thoại</code> | <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold">Email</code></p>
              <button 
                type="button" 
                onClick={downloadTemplate}
                className="text-blue-600 font-bold underline hover:text-blue-800 text-xs flex items-center gap-1.5 pt-1"
              >
                <FileSpreadsheet size={14} /> Tải file Excel mẫu chuẩn tại đây
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 p-8 rounded-xl text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                id="excelInput" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <label htmlFor="excelInput" className="cursor-pointer flex flex-col items-center">
                <Database size={36} className="text-gray-400 mb-2" />
                <span className="font-bold text-gray-700 text-sm">Click để tải lên file Excel</span>
                <span className="text-xs text-gray-400 mt-0.5">Hỗ trợ định dạng .xlsx, .xls</span>
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowAddStudent(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: QUẢN LÝ HỌC LIỆU & ĐỀ THI (DataManagement.jsx)
 * Chức năng: Quản lý thư mục Chương/Bài, Gắn học liệu và Phân quyền giao bài cho lớp.
 * ==========================================
 */
function DataManagement({ db, setDb, showToast }) {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [assigningQuizId, setAssigningQuizId] = useState(null);

  const [newChapterName, setNewChapterName] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  
  const [matForm, setMatForm] = useState({ name: '', type: 'theory', link: '' });
  const [quizConfig, setQuizConfig] = useState({ type: 'multi', time: 45, attempts: 1, answerLink: '' });
  const [editingQuizId, setEditingQuizId] = useState(null);

  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!selectedGrade || !newChapterName.trim()) return;

    const newChap = { id: `ch${Date.now()}`, gradeId: selectedGrade, name: newChapterName.trim() };
    setDb({ ...db, chapters: [...db.chapters, newChap] });
    setShowAddChapter(false);
    setNewChapterName('');
    showToast('Thêm chương học thành công!');
  };

  const handleEditChapter = (chap) => {
    const newName = prompt('Nhập tên chương mới:', chap.name);
    if (newName && newName.trim()) {
      const updatedChapters = db.chapters.map(c => c.id === chap.id ? { ...c, name: newName.trim() } : c);
      setDb({ ...db, chapters: updatedChapters });
      showToast('Đã cập nhật tên chương!');
    }
  };

  const handleDeleteChapter = (chapId) => {
    if (window.confirm('Xóa chương này sẽ đồng thời xóa toàn bộ các bài học bên trong. Thầy có chắc chắn muốn xóa?')) {
      const updatedChapters = db.chapters.filter(c => c.id !== chapId);
      const updatedLessons = db.lessons.filter(l => l.chapterId !== chapId);
      setDb({ ...db, chapters: updatedChapters, lessons: updatedLessons });
      showToast('Đã xóa chương học!');
    }
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!selectedChapter || !newLessonName.trim()) return;

    const newLes = { id: `l${Date.now()}`, chapterId: selectedChapter, name: newLessonName.trim() };
    setDb({ ...db, lessons: [...db.lessons, newLes] });
    setShowAddLesson(false);
    setNewLessonName('');
    showToast('Thêm bài học thành công!');
  };

  const handleEditLesson = (les) => {
    const newName = prompt('Nhập tên bài học mới:', les.name);
    if (newName && newName.trim()) {
      const updatedLessons = db.lessons.map(l => l.id === les.id ? { ...l, name: newName.trim() } : l);
      setDb({ ...db, lessons: updatedLessons });
      showToast('Đã cập nhật tên bài học!');
    }
  };

  const handleDeleteLesson = (lesId) => {
    if (window.confirm('Thầy có chắc chắn muốn xóa bài học này không?')) {
      const updatedLessons = db.lessons.filter(l => l.id !== lesId);
      const updatedMaterials = db.materials.filter(m => m.lessonId !== lesId);
      setDb({ ...db, lessons: updatedLessons, materials: updatedMaterials });
      showToast('Đã xóa bài học!');
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!selectedLesson) return showToast('Vui lòng chọn bài học ở cột trái trước!', 'error');
    if (!matForm.name.trim()) return showToast('Vui lòng nhập tên học liệu', 'error');

    const newMatId = `m${Date.now()}`;
    const newMat = {
      id: newMatId,
      lessonId: selectedLesson,
      ...matForm,
      quizConfig: matForm.type === 'quiz' ? quizConfig : null,
      questions: [],
      assignedClassIds: []
    };

    setDb({ ...db, materials: [...db.materials, newMat] });
    setShowAddMaterial(false);
    setMatForm({ name: '', type: 'theory', link: '' });
    showToast('Gắn học liệu thành công!');

    if (matForm.type === 'quiz') {
      setEditingQuizId(newMatId);
    }
  };

  const handleSaveAssignment = (quizId, selectedClassIds) => {
    const updatedMaterials = db.materials.map(m => {
      if (m.id === quizId) {
        return { ...m, assignedClassIds: selectedClassIds };
      }
      return m;
    });
    setDb({ ...db, materials: updatedMaterials });
    if (showToast) showToast('Đã cập nhật phân quyền giao bài cho lớp thành công!');
  };

  if (editingQuizId) {
    return <QuizEditor db={db} setDb={setDb} quizId={editingQuizId} onClose={() => setEditingQuizId(null)} showToast={showToast} />;
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-white">
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-3 border-b bg-gray-50 grid grid-cols-2 gap-2">
          <button 
            onClick={() => selectedGrade ? setShowAddChapter(true) : showToast('Vui lòng chọn Khối trước!', 'error')} 
            className="py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 shadow-2xs"
          >
            <Plus size={14}/> Thêm Chương
          </button>
          <button 
            onClick={() => selectedChapter ? setShowAddLesson(true) : showToast('Vui lòng chọn Chương trước!', 'error')} 
            className="py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 shadow-2xs"
          >
            <Plus size={14}/> Thêm Bài
          </button>
        </div>

        <div className="p-4 space-y-3">
          {db.grades?.map(grade => (
            <div key={grade.id} className="space-y-1">
              <div 
                className={`font-bold p-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                  selectedGrade === grade.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`} 
                onClick={() => { setSelectedGrade(grade.id); setSelectedChapter(null); setSelectedLesson(null); }}
              >
                {grade.name}
              </div>

              {selectedGrade === grade.id && (
                <div className="ml-3 pl-3 border-l-2 border-blue-100 space-y-2 pt-1">
                  {db.chapters?.filter(c => c.gradeId === grade.id).map(chap => (
                    <div key={chap.id} className="space-y-1">
                      <div 
                        className={`p-2 rounded-lg text-xs font-bold cursor-pointer flex justify-between items-center transition-colors ${
                          selectedChapter === chap.id ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
                        }`} 
                        onClick={() => { setSelectedChapter(chap.id); setSelectedLesson(null); }}
                      >
                        <span className="truncate pr-2">{chap.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Edit size={13} className="text-gray-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEditChapter(chap); }} title="Sửa tên chương" />
                          <Trash2 size={13} className="text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chap.id); }} title="Xóa chương" />
                        </div>
                      </div>

                      {selectedChapter === chap.id && (
                        <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-1">
                          {db.lessons?.filter(l => l.chapterId === chap.id).map(les => (
                            <div 
                              key={les.id} 
                              className={`p-2 rounded-lg text-xs cursor-pointer flex justify-between items-center transition-colors ${
                                selectedLesson === les.id ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-gray-600 hover:bg-gray-50'
                              }`} 
                              onClick={() => setSelectedLesson(les.id)}
                            >
                              <span className="truncate pr-2">• {les.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <Edit size={13} className="text-gray-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEditLesson(les); }} title="Sửa tên bài" />
                                <Trash2 size={13} className="text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(les.id); }} title="Xóa bài học" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-gray-50 p-6 overflow-y-auto">
        {!selectedLesson ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Hãy chọn một Bài học ở cột bên trái để quản lý học liệu và đề thi.
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border shadow-2xs">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Bài học đang chọn:</span>
                <h2 className="text-lg font-bold text-gray-900">{db.lessons?.find(l => l.id === selectedLesson)?.name}</h2>
              </div>
              <button 
                onClick={() => setShowAddMaterial(true)} 
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-black shadow-sm transition-transform active:scale-95"
              >
                <Plus size={16}/> Gắn học liệu / Đề thi
              </button>
            </div>

            <div className="space-y-4">
              {['theory', 'video', 'quiz'].map(type => {
                const mats = db.materials?.filter(m => m.lessonId === selectedLesson && m.type === type) || [];
                if (mats.length === 0) return null;
                
                const typeName = type === 'theory' ? 'Tài liệu Lý thuyết' : type === 'video' ? 'Video Thí nghiệm - Hiện tượng' : 'Đề ôn tập - Kiểm tra trắc nghiệm';
                
                return (
                  <div key={type} className="bg-white border border-gray-200 rounded-xl shadow-2xs p-4">
                    <h3 className="font-bold text-sm text-blue-900 border-b pb-2 mb-3 uppercase tracking-wide flex items-center gap-2">
                      {type === 'theory' && <FileText size={16}/>}
                      {type === 'video' && <Video size={16}/>}
                      {type === 'quiz' && <FileQuestion size={16}/>}
                      {typeName}
                    </h3>
                    <ul className="space-y-2">
                      {mats.map(m => (
                        <li key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div>
                            <span className="font-bold text-gray-800 text-sm">{m.name}</span>
                            {m.type === 'quiz' && m.quizConfig && (
                              <div className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-2">
                                <span>⏱️ {m.quizConfig.time} phút</span>
                                <span>🔄 Tối đa {m.quizConfig.attempts} lần</span>
                                <span className="text-blue-600 font-bold">({m.assignedClassIds?.length > 0 ? `Đã giao ${m.assignedClassIds.length} lớp` : 'Giao tất cả các lớp'})</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {m.type === 'quiz' && (
                              <>
                                <button 
                                  onClick={() => setAssigningQuizId(m.id)} 
                                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Giao lớp
                                </button>
                                <button 
                                  onClick={() => setEditingQuizId(m.id)} 
                                  className="text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Soạn câu hỏi
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                if (window.confirm('Xóa học liệu này?')) {
                                  setDb({ ...db, materials: db.materials.filter(x => x.id !== m.id) });
                                  showToast('Đã xóa học liệu');
                                }
                              }} 
                              className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddChapter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Thêm Chương mới</h3>
            <form onSubmit={handleAddChapter}>
              <input 
                required 
                type="text" 
                placeholder="VD: Chương 1. Dao động cơ" 
                className="w-full p-3 border rounded-xl text-sm font-medium outline-none mb-4 bg-gray-50" 
                value={newChapterName} 
                onChange={e => setNewChapterName(e.target.value)} 
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddChapter(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddLesson && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Thêm Bài học mới</h3>
            <form onSubmit={handleAddLesson}>
              <input 
                required 
                type="text" 
                placeholder="VD: Bài 1. Dao động điều hòa" 
                className="w-full p-3 border rounded-xl text-sm font-medium outline-none mb-4 bg-gray-50" 
                value={newLessonName} 
                onChange={e => setNewLessonName(e.target.value)} 
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddLesson(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMaterial && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b text-gray-900">Gắn học liệu / Tạo đề thi</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Loại học liệu</label>
                  <select 
                    className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm font-medium outline-none" 
                    value={matForm.type} 
                    onChange={e => setMatForm({ ...matForm, type: e.target.value })}
                  >
                    <option value="theory">Tài liệu Lý thuyết</option>
                    <option value="video">Video Thí nghiệm</option>
                    <option value="quiz">Đề kiểm tra trắc nghiệm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tên học liệu</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="VD: Đề kiểm tra 15 phút" 
                    className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm font-medium outline-none" 
                    value={matForm.name} 
                    onChange={e => setMatForm({ ...matForm, name: e.target.value })} 
                  />
                </div>
              </div>

              {matForm.type !== 'quiz' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Đường dẫn URL (Link Drive / Youtube)</label>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://..." 
                    className="w-full p-2.5 border rounded-xl bg-gray-50 text-sm font-medium outline-none" 
                    value={matForm.link} 
                    onChange={e => setMatForm({ ...matForm, link: e.target.value })} 
                  />
                </div>
              )}

              {matForm.type === 'quiz' && (
                <div className="border-t pt-4 bg-gray-50 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-gray-700 uppercase">Cấu hình đề thi</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Thời gian (phút)</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full p-2 border rounded-lg text-sm bg-white" 
                        value={quizConfig.time} 
                        onChange={e => setQuizConfig({ ...quizConfig, time: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Số lần làm tối đa</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full p-2 border rounded-lg text-sm bg-white" 
                        value={quizConfig.attempts} 
                        onChange={e => setQuizConfig({ ...quizConfig, attempts: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 font-medium">Link giải chi tiết / Đáp án (Tùy chọn)</label>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..." 
                      className="w-full p-2 border rounded-lg text-sm bg-white" 
                      value={quizConfig.answerLink} 
                      onChange={e => setQuizConfig({ ...quizConfig, answerLink: e.target.value })} 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddMaterial(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningQuizId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Phân công giao bài cho các lớp</h3>
            <p className="text-xs text-gray-500">Chọn những lớp được phép làm bài kiểm tra này (Nếu bỏ chọn tất cả, bài sẽ hiển thị cho mọi lớp):</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-xl bg-gray-50">
              {db.classes?.map(c => {
                const currentQuiz = db.materials.find(m => m.id === assigningQuizId);
                const isChecked = currentQuiz?.assignedClassIds?.includes(c.id) || false;

                return (
                  <label key={c.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input 
                      type="checkbox" 
                      defaultChecked={isChecked}
                      onChange={(e) => {
                        const currentList = currentQuiz?.assignedClassIds || [];
                        let newList = [];
                        if (e.target.checked) {
                          newList = [...currentList, c.id];
                        } else {
                          newList = currentList.filter(id => id !== c.id);
                        }
                        handleSaveAssignment(assigningQuizId, newList);
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-sm text-gray-800">{c.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setAssigningQuizId(null)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200"
              >
                Đóng
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
 * MODULE: THỐNG KÊ KẾT QUẢ & ĐIỂM SỐ (ResultManagement.jsx)
 * Chức năng: Thống kê điểm số học sinh, lọc theo lớp và đề thi, xuất file Excel bảng điểm.
 * ==========================================
 */
function ResultManagement({ db, showToast }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');

  const studentsInClass = db.studentsList?.filter(s => s.classId === selectedClassId) || [];

  const exportToExcel = () => {
    if (!selectedClassId) {
      showToast('Vui lòng chọn lớp cần xuất file Excel!', 'error');
      return;
    }

    const className = db.classes?.find(c => c.id === selectedClassId)?.name || 'Lop';
    
    const excelData = studentsInClass.map((student, idx) => {
      const attempts = db.quizAttempts?.filter(a => {
        const matchStudent = a.studentId === student.id;
        const matchQuiz = selectedQuizId ? a.quizId === selectedQuizId : true;
        return matchStudent && matchQuiz;
      }) || [];

      const scoreHistory = attempts.map((att, i) => `Lần ${i+1}: ${att.score}đ (${att.duration || 'N/A'})`).join(' | ');
      const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => parseFloat(a.score || 0))) : 0;

      return {
        "STT": idx + 1,
        "Họ và tên": student.name,
        "Số điện thoại": student.phone,
        "Số lần làm bài": attempts.length,
        "Điểm cao nhất": attempts.length > 0 ? maxScore : 'Chưa làm',
        "Chi tiết lịch sử": scoreHistory || 'Chưa làm bài'
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BangDiem");
    XLSX.writeFile(wb, `BangDiem_${className}.xlsx`);
    
    if (showToast) showToast('Đã xuất file Excel bảng điểm thành công!');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 font-sans p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="text-blue-600" size={22}/> Thống Kê Kết Quả Học Tập
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Theo dõi lịch sử làm bài, điểm số và xuất báo cáo điểm của lớp.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0"/>
            <select 
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setSelectedQuizId(''); }}
              className="p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn lớp học --</option>
              {db.classes?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <select 
            disabled={!selectedClassId}
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">-- Tất cả các bài kiểm tra --</option>
            {db.materials?.filter(m => m.type === 'quiz').map(q => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>

          <button 
            onClick={exportToExcel}
            disabled={!selectedClassId}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-2xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet size={16}/> Xuất Excel
          </button>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center my-auto">
          <Users size={48} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-gray-600 font-bold mb-1">Chưa chọn lớp học</p>
          <p className="text-xs text-gray-400">Thầy hãy chọn một lớp ở khung phía trên để hiển thị bảng điểm chi tiết.</p>
        </div>
      ) : studentsInClass.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 italic">
          Lớp này chưa có danh sách học sinh.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-800 text-sm flex justify-between items-center">
            <span>Danh sách kết quả lớp: {db.classes?.find(c => c.id === selectedClassId)?.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
              Sĩ số: {studentsInClass.length} học sinh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-3.5 text-center">STT</th>
                  <th className="p-3.5">Họ và tên học sinh</th>
                  <th className="p-3.5">Số điện thoại</th>
                  <th className="p-3.5">Lịch sử làm bài {selectedQuizId ? '(Đã lọc bài)' : '(Tất cả bài)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentsInClass.map((student, idx) => {
                  const attempts = db.quizAttempts?.filter(a => {
                    const matchStudent = a.studentId === student.id;
                    const matchQuiz = selectedQuizId ? a.quizId === selectedQuizId : true;
                    return matchStudent && matchQuiz;
                  }) || [];

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-gray-900">{student.name}</td>
                      <td className="p-3.5 text-gray-600">{student.phone}</td>
                      <td className="p-3.5">
                        {attempts.length === 0 ? (
                          <span className="text-xs text-gray-400 italic bg-gray-100 px-2.5 py-1 rounded-md">Chưa làm bài</span>
                        ) : (
                          <div className="space-y-1.5 py-1">
                            {attempts.map((att, aIdx) => {
                              const quizMat = db.materials?.find(m => m.id === att.quizId);
                              return (
                                <div key={aIdx} className="flex flex-wrap items-center gap-2 bg-blue-50/60 border border-blue-100 px-3 py-1.5 rounded-lg text-xs">
                                  <span className="font-bold text-blue-900">Lần {aIdx + 1}:</span>
                                  {quizMat && <span className="text-gray-600 font-medium truncate max-w-[180px]">[{quizMat.name}]</span>}
                                  
                                  <span className="bg-green-600 text-white font-black px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                                    <Award size={12}/> {att.score} đ
                                  </span>
                                  
                                  <span className="text-gray-600 flex items-center gap-1 font-medium">
                                    <Clock size={12} className="text-blue-500"/> {att.duration || 'N/A'}
                                  </span>

                                  <span className="text-gray-500 flex items-center gap-1">
                                    <Calendar size={12} className="text-indigo-500"/> {att.timestamp || 'Mới đây'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MAIN COMPONENT & STATE MANAGEMENT (App.jsx)
 * ==========================================
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

 // Dữ liệu mẫu mặc định ban đầu nếu trên đám mây chưa có gì
  const defaultDbData = {
    grades: [
      { id: 'g10', name: 'Khối 10' },
      { id: 'g11', name: 'Khối 11' },
      { id: 'g12', name: 'Khối 12' },
    ],
    classes: [
      { id: 'c1', gradeId: 'g12', name: '12A1' },
      { id: 'c2', gradeId: 'g12', name: '12A2' },
      { id: 'c3', gradeId: 'g11', name: '11A1' },
    ],
    studentsList: [
      { id: 's1', classId: 'c1', name: 'Nguyễn Văn An', gender: 'Nam', phone: '0901234567', email: 'an@gmail.com', done: 2 },
      { id: 's2', classId: 'c1', name: 'Trần Thị Bình', gender: 'Nữ', phone: '0907654321', email: 'binh@gmail.com', done: 1 },
    ],
    chapters: [
      { id: 'ch12_1', gradeId: 'g12', name: 'Chương I. Vật lí nhiệt' },
      { id: 'ch12_2', gradeId: 'g12', name: 'Chương II. Khí lí tưởng' },
    ],
    lessons: [
      { id: 'l12_1', chapterId: 'ch12_1', name: 'Bài 1. Cấu trúc của chất. Sự chuyển thể' },
      { id: 'l12_2', chapterId: 'ch12_1', name: 'Bài 2. Nội năng. Định luật I của nhiệt động lực học' },
    ],
    materials: [
      {
        id: 'm1',
        lessonId: 'l12_1',
        type: 'theory',
        name: 'Tài liệu SGK Vật lí 12 - Bài 1',
        link: 'https://vietjack.com'
      },
      {
        id: 'm2',
        lessonId: 'l12_1',
        type: 'quiz',
        name: 'Đề kiểm tra 15 phút - Bài 1',
        quizConfig: { time: 15, attempts: 2, answerLink: 'https://youtube.com', sectionScores: { multiScore: 4, tfScore: 3, numScore: 3 } },
        assignedClassIds: [],
        questions: [
          {
            id: 'q1',
            type: 'multi',
            content: 'Công thức tính độ dịch chuyển trong dao động điều hòa là $x = A \\cos(\\omega t + \\varphi)$. Biên độ $A$ có đơn vị là:',
            options: ['mét (m)', 'giây (s)', 'hertz (Hz)', 'radian (rad)'],
            answerMCQ: 'A'
          }
        ]
      }
    ],
    quizAttempts: []
  };

  const [db, setDb] = useState(defaultDbData);

  // Lắng nghe dữ liệu thời gian thực từ Firebase Firestore (Đồng bộ đa thiết bị)
  useEffect(() => {
    const docRef = doc(firestoreDb, 'schoolData', 'mainDatabase');

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setDb(docSnap.data());
      } else {
        await setDoc(docRef, defaultDbData);
        setDb(defaultDbData);
      }
    }, (error) => {
      console.error("Lỗi đọc dữ liệu từ Firebase: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Hàm cập nhật dữ liệu đẩy lên đám mây
  const updateDatabase = async (newDbOrUpdater) => {
    let updatedData;
    if (typeof newDbOrUpdater === 'function') {
      updatedData = newDbOrUpdater(db);
    } else {
      updatedData = newDbOrUpdater;
    }

    setDb(updatedData); // Cập nhật giao diện ngay lập tức
    
    try {
      const docRef = doc(firestoreDb, 'schoolData', 'mainDatabase');
      await setDoc(docRef, updatedData); // Lưu lên Firebase
    } catch (error) {
      console.error("Lỗi lưu dữ liệu lên Firebase: ", error);
      showToast("Lỗi đồng bộ dữ liệu lên máy chủ!");
    }
  };
  // Tự động ghi lại vào localStorage mỗi khi db thay đổi
  useEffect(() => {
    if (db) {
      localStorage.setItem('vat_ly_thay_huynh_db', JSON.stringify(db));
    }
  }, [db]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleConfirmLink = ({ studentId, classId }) => {
    setCurrentUser({
      ...currentUser,
      linkedStudentId: studentId,
      classId: classId
    });
    showToast('Xác thực tài khoản thành công!');
  };

  const handleSaveResult = (result) => {
    const newAttempt = {
      studentId: currentUser.linkedStudentId,
      ...result,
      timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString()
    };

    setDb(prev => ({
      ...prev,
      quizAttempts: [...(prev.quizAttempts || []), newAttempt]
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

  if (currentUser.role === 'student') {
    return (
      <StudentDashboard 
        currentUser={currentUser} 
        db={db} 
        onLogout={() => setCurrentUser(null)} 
        onStartQuiz={(quizMat) => setActiveQuiz(quizMat)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={26} />
          <div>
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider">Hệ Thống Quản Trị - Thầy Lê Công Huynh</h1>
            <p className="text-xs text-gray-400">Quản lý lớp học, học liệu và thống kê điểm số</p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentUser(null)} 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors border border-gray-700"
        >
          <LogOut size={16}/> Đăng xuất
        </button>
      </header>

      <div className="flex border-b border-gray-200 bg-white shadow-xs">
        <button 
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'classes' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
        >
          <Users size={18}/> Quản Lý Lớp & Học Sinh
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'data' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
        >
          <Database size={18}/> Quản Lý Học Liệu & Đề Thi
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'results' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
        >
          <BarChart2 size={18}/> Thống Kê Kết Quả & Điểm
        </button>
      </div>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'classes' && <ClassManagement db={db} setDb={setDb} showToast={showToast} />}
        {activeTab === 'data' && <DataManagement db={db} setDb={setDb} showToast={showToast} />}
        {activeTab === 'results' && <ResultManagement db={db} showToast={showToast} />}
      </main>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-gray-700">
          <CheckCircle size={20} className="text-green-400 shrink-0" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
