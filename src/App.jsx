import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Lock, Phone, Mail, BookOpen, Users, Database, 
  ChevronRight, ChevronDown, Plus, Trash2, Edit, FileText, 
  Video, FileQuestion, LogOut, CheckCircle, AlertCircle, Clock,
  ArrowLeft, Save, BarChart
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db as firestore } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
// ==========================================
// 1. MOCK DATABASE & STATE MANAGEMENT
// ==========================================
const INITIAL_DATA = {
  grades: [
    { id: 'g10', name: 'Khối 10' },
    { id: 'g11', name: 'Khối 11' },
    { id: 'g12', name: 'Khối 12' },
  ],
  classes: [{ id: 'c1', gradeId: 'g10', name: '10A1' }],
  studentsList: [
    // Danh sách giáo viên nhập
    { id: 'sl1', classId: 'c1', name: 'Nguyễn Văn A', gender: 'Nam', phone: '0123456789', email: 'a@gmail.com', done: 0, total: 5 },
  ],
  studentUsers: [
    // Tài khoản học sinh tự tạo
    { id: 'u1', name: 'Nguyễn Văn A', phone: '0123456789', email: 'a@gmail.com', password: '123', linkedStudentId: null, needPasswordChange: false }
  ],
  chapters: [{ id: 'ch1', gradeId: 'g10', name: 'Chương 1: Động học chất điểm' }],
  lessons: [{ id: 'l1', chapterId: 'ch1', name: 'Bài 1: Chuyển động cơ' }],
  materials: [
    { id: 'm1', lessonId: 'l1', name: 'Lý thuyết cơ bản', type: 'theory', link: 'https://example.com' },
  ],
  resetRequests: [],
  quizAttempts: []
};

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [route, setRoute] = useState('landing'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState(INITIAL_DATA);
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(firestore, "appData", "mainDB");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDb(docSnap.data());
        } else {
          await setDoc(docRef, INITIAL_DATA);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu từ Firebase:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return; 
    async function saveData() {
      try {
        const docRef = doc(firestore, "appData", "mainDB");
        await setDoc(docRef, db);
      } catch (err) {
        console.error("Lỗi lưu dữ liệu lên Firebase:", err);
      }
    }
    saveData();
  }, [db, isLoaded]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 text-lg">Đang kết nối cơ sở dữ liệu Firebase...</div>;
  }

  // --- RENDERING ROUTER ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ROUTES */}
      {route === 'landing' && <LandingPage setRoute={setRoute} />}
      {route === 'student-auth' && <StudentAuth setRoute={setRoute} db={db} setDb={setDb} setCurrentUser={setCurrentUser} showToast={showToast} />}
      {route === 'teacher-auth' && <TeacherAuth setRoute={setRoute} setCurrentUser={setCurrentUser} showToast={showToast} />}
      {route === 'student-link' && <StudentLinkProfile setRoute={setRoute} currentUser={currentUser} setCurrentUser={setCurrentUser} db={db} setDb={setDb} showToast={showToast} />}
      {route === 'student-dashboard' && <StudentDashboard setRoute={setRoute} currentUser={currentUser} setCurrentUser={setCurrentUser} db={db} setDb={setDb} showToast={showToast} />}
      {route === 'teacher-dashboard' && <TeacherDashboard setRoute={setRoute} currentUser={currentUser} db={db} setDb={setDb} showToast={showToast} />}
    </div>
  );
}

// ==========================================
// 3. LANDING PAGE
// ==========================================
function LandingPage({ setRoute }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 uppercase tracking-wide">Học Vật Lý</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">Cùng Thầy Huynh</h2>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => setRoute('student-auth')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <User size={20} /> Đăng nhập / Đăng ký Học sinh
          </button>
          
          <button 
            onClick={() => setRoute('teacher-auth')}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-gray-300"
          >
            <Lock size={20} /> Đăng nhập Quản trị viên
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. STUDENT AUTH (LOGIN/REGISTER/FORGOT)
// ==========================================
function StudentAuth({ setRoute, db, setDb, setCurrentUser, showToast }) {
  const [mode, setMode] = useState('login'); // login, register, forgot
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });

  const handleAuth = (e) => {
    e.preventDefault();
    if (mode === 'register') {
      if (formData.password !== formData.confirm) return showToast('Mật khẩu xác nhận không khớp', 'error');
      if (db.studentUsers.find(u => u.phone === formData.phone)) return showToast('Số điện thoại đã được đăng ký', 'error');
      
      const newUser = { id: `u${Date.now()}`, name: formData.name, phone: formData.phone, email: formData.email, password: formData.password, linkedStudentId: null, needPasswordChange: false };
      setDb({ ...db, studentUsers: [...db.studentUsers, newUser] });
      setCurrentUser({ ...newUser, role: 'student' });
      showToast('Đăng ký thành công! Vui lòng liên kết hồ sơ.');
      setRoute('student-link');
    } else if (mode === 'login') {
      const user = db.studentUsers.find(u => u.phone === formData.phone && u.password === formData.password);
      if (user) {
        setCurrentUser({ ...user, role: 'student' });
        if (user.needPasswordChange) {
          showToast('Giáo viên đã reset mật khẩu. Bạn bắt buộc phải đổi mật khẩu mới!', 'error');
        }
        if (!user.linkedStudentId) setRoute('student-link');
        else setRoute('student-dashboard');
      } else {
        showToast('Sai số điện thoại hoặc mật khẩu', 'error');
      }
    } else if (mode === 'forgot') {
      const user = db.studentUsers.find(u => u.phone === formData.phone);
      if (!user) return showToast('Không tìm thấy tài khoản với số điện thoại này', 'error');
      setDb({ ...db, resetRequests: [...db.resetRequests, { id: Date.now(), studentPhone: formData.phone, studentName: user.name, status: 'pending' }] });
      showToast('Đã gửi yêu cầu Báo giáo viên reset mật khẩu!');
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
        <button onClick={() => setRoute('landing')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">Quay lại</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600 mt-4">
          {mode === 'login' ? 'Học Sinh Đăng Nhập' : mode === 'register' ? 'Học Sinh Đăng Ký' : 'Quên Mật Khẩu'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <input required type="text" placeholder="Họ và tên" className="w-full p-3 border rounded-md" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          )}
          <input required type="tel" placeholder="Số điện thoại" className="w-full p-3 border rounded-md" 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          
          {mode === 'register' && (
            <input required type="email" placeholder="Email" className="w-full p-3 border rounded-md" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          )}
          
          {mode !== 'forgot' && (
             <input required type="password" placeholder="Mật khẩu" className="w-full p-3 border rounded-md" 
             value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          )}

          {mode === 'register' && (
             <input required type="password" placeholder="Xác nhận mật khẩu" className="w-full p-3 border rounded-md" 
             value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
          )}

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700">
            {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Gửi yêu cầu reset'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 flex flex-col gap-2">
          {mode === 'login' ? (
            <>
              <span className="cursor-pointer hover:text-blue-600 underline" onClick={() => setMode('register')}>Chưa có tài khoản? Đăng ký ngay</span>
              <span className="cursor-pointer hover:text-blue-600 underline" onClick={() => setMode('forgot')}>Quên mật khẩu? (Báo giáo viên)</span>
            </>
          ) : (
            <span className="cursor-pointer hover:text-blue-600 underline" onClick={() => setMode('login')}>Đã có tài khoản? Đăng nhập</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. TEACHER AUTH
// ==========================================
function TeacherAuth({ setRoute, setCurrentUser, showToast }) {
  const [data, setData] = useState({ name: '', phone: '', email: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (data.phone === '0971807980') {
      setCurrentUser({ name: data.name, role: 'teacher' });
      setRoute('teacher-dashboard');
      showToast('Đăng nhập quản trị thành công!');
    } else {
      showToast('Số điện thoại quản trị viên không chính xác!', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <button onClick={() => setRoute('landing')} className="mb-4 text-gray-500 hover:text-gray-800">Quay lại</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng Nhập Giáo Viên</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="text" placeholder="Họ và tên giáo viên" className="w-full p-3 border rounded-md bg-gray-50" 
            value={data.name} onChange={e => setData({...data, name: e.target.value})} />
          <input required type="password" placeholder="Số điện thoại bảo mật" className="w-full p-3 border rounded-md bg-gray-50" 
            value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
          <input required type="email" placeholder="Email" className="w-full p-3 border rounded-md bg-gray-50" 
            value={data.email} onChange={e => setData({...data, email: e.target.value})} />
          <button type="submit" className="w-full bg-gray-800 text-white p-3 rounded-md font-bold hover:bg-black">Vào trang quản trị</button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 6. STUDENT LINK PROFILE
// ==========================================
function StudentLinkProfile({ setRoute, currentUser, setCurrentUser, db, setDb, showToast }) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const classesInGrade = db.classes.filter(c => c.gradeId === selectedGrade);
  const studentsInClass = db.studentsList.filter(s => s.classId === selectedClass);

  const handleLink = () => {
    if (!selectedStudent) return showToast('Vui lòng chọn tên học sinh', 'error');
    const studentRecord = db.studentsList.find(s => s.id === selectedStudent);
    
    if (studentRecord.phone !== currentUser.phone) {
      showToast('Lỗi: Số điện thoại của bạn không khớp với dữ liệu giáo viên nhập cho học sinh này!', 'error');
      return;
    }

    const updatedUsers = db.studentUsers.map(u => 
      u.id === currentUser.id ? { ...u, linkedStudentId: studentRecord.id } : u
    );
    setDb({ ...db, studentUsers: updatedUsers });
    setCurrentUser({ ...currentUser, linkedStudentId: studentRecord.id });
    showToast('Liên kết hồ sơ thành công!');
    setRoute('student-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-700">Xác Thực Hồ Sơ Học Sinh</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Lần đầu đăng nhập, bạn cần liên kết với danh sách lớp của giáo viên.</p>
        
        <div className="space-y-4">
          <select className="w-full p-3 border rounded-md" value={selectedGrade} onChange={e => {setSelectedGrade(e.target.value); setSelectedClass(''); setSelectedStudent('');}}>
            <option value="">-- Chọn Khối --</option>
            {db.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select className="w-full p-3 border rounded-md" value={selectedClass} onChange={e => {setSelectedClass(e.target.value); setSelectedStudent('');}} disabled={!selectedGrade}>
            <option value="">-- Chọn Lớp --</option>
            {classesInGrade.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select className="w-full p-3 border rounded-md" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} disabled={!selectedClass}>
            <option value="">-- Chọn Tên Học Sinh --</option>
            {studentsInClass.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone.slice(-4).padStart(s.phone.length, '*')})</option>)}
          </select>

          <button onClick={handleLink} className="w-full bg-green-600 text-white p-3 rounded-md font-bold hover:bg-green-700">
            Xác nhận liên kết
          </button>
          
          <button onClick={() => setRoute('landing')} className="w-full text-gray-500 p-2 text-sm">Đăng xuất</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. STUDENT DASHBOARD
// ==========================================
// ==========================================
// 7. STUDENT DASHBOARD (ĐÃ TỐI ƯU MOBILE)
// ==========================================
function StudentDashboard({ setRoute, currentUser, db, setDb, showToast }) {
  const studentInfo = db.studentsList.find(s => s.id === currentUser.linkedStudentId);
  const classInfo = db.classes.find(c => c.id === studentInfo?.classId);
  const gradeInfo = db.grades.find(g => g.id === classInfo?.gradeId);

  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('theory'); 
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Trạng thái ẩn/hiện mục lục trên mobile

  const toggleChapter = (chapId) => setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));

  const chapters = db.chapters.filter(c => c.gradeId === gradeInfo?.id);
  const materialsForLesson = selectedLesson ? db.materials.filter(m => m.lessonId === selectedLesson) : [];

  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} currentUser={currentUser} db={db} setDb={setDb} showToast={showToast} onFinish={() => setActiveQuiz(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER: Thu nhỏ chữ và ép trên 1 hàng ngang */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="px-3 py-2 flex justify-between items-center">
          <h1 className="text-xs sm:text-lg md:text-xl font-bold uppercase tracking-wider truncate mr-2">
            HỌC VẬT LÝ CÙNG THẦY LÊ CÔNG HUYNH
          </h1>
          <button onClick={() => setRoute('landing')} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded text-xs sm:text-sm whitespace-nowrap">
            <LogOut size={14}/> Đăng xuất
          </button>
        </div>
        <div className="bg-blue-800 text-blue-100 text-xs sm:text-sm py-1 overflow-hidden">
          <marquee scrollamount="5">Vật lý không khó - Đã có thầy Huynh lo! Chúc các em học tập thật tốt và đạt kết quả cao trong các kỳ thi sắp tới.</marquee>
        </div>
      </header>

      {/* THÔNG TIN HỌC SINH: Dạng 1 dòng ngang trên mobile */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex flex-row justify-between items-center text-xs sm:text-sm">
        <div className="font-semibold text-blue-900 flex items-center gap-1.5 truncate">
          <User size={16} className="text-blue-700 shrink-0"/> 
          <span className="truncate">{studentInfo?.name}</span>
        </div>
        <div className="text-blue-800 shrink-0 font-medium">
          Lớp: <span className="font-bold">{classInfo?.name}</span> | Đã làm: <span className="font-bold text-green-700">{studentInfo?.done}/{studentInfo?.total}</span>
        </div>
      </div>

      {/* NÚT BẬT/TẮT MỤC LỤC TRÊN ĐIỆN THOẠI */}
      <div className="md:hidden bg-gray-100 p-2 border-b flex justify-between items-center">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="w-full bg-blue-600 text-white py-2 px-3 rounded font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <BookOpen size={16} /> {showMobileMenu ? 'Ẩn mục lục bài học' : '📚 Mở mục lục bài học'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MỤC LỤC BÀI HỌC: Ẩn/Hiện linh hoạt trên mobile, giữ nguyên trên PC */}
        <div className={`
          ${showMobileMenu ? 'absolute inset-0 z-20 bg-white w-full h-full' : 'hidden'} 
          md:flex md:w-1/3 bg-gray-50 border-r border-gray-200 flex-col overflow-y-auto
        `}>
          <div className="p-4 bg-gray-100 border-b flex justify-between items-center md:hidden">
            <h3 className="font-bold text-gray-700">MỤC LỤC BÀI HỌC</h3>
            <button onClick={() => setShowMobileMenu(false)} className="text-red-600 font-bold px-2 py-1 bg-red-50 rounded">Đóng [X]</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 hidden md:block">MỤC LỤC BÀI HỌC</h3>
            {chapters.map(chap => {
              const lessons = db.lessons.filter(l => l.chapterId === chap.id);
              const isOpen = expandedChapters[chap.id];
              return (
                <div key={chap.id} className="border border-gray-200 rounded-md bg-white">
                  <button onClick={() => toggleChapter(chap.id)} className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 font-medium text-sm sm:text-base">
                    {chap.name}
                    {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-1">
                      {lessons.map(les => (
                        <button 
                          key={les.id} 
                          onClick={() => {
                            setSelectedLesson(les.id);
                            setShowMobileMenu(false); // Chọn bài xong tự động ẩn mục lục trên mobile
                          }}
                          className={`w-full text-left p-2 pl-6 rounded text-sm transition-colors truncate ${selectedLesson === les.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          • {les.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH: Tên bài ép trên 1 dòng */}
        <div className="w-full md:w-2/3 bg-white p-4 sm:p-6 overflow-y-auto flex flex-col">
          {!selectedLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
              <BookOpen size={54} className="mb-4 opacity-50" />
              <p className="text-center text-sm sm:text-base">Chọn một bài học ở danh sách bên trái để bắt đầu</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 truncate w-full">
                {db.lessons.find(l=>l.id===selectedLesson)?.name}
              </h2>
              
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('theory')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${activeTab === 'theory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FileText size={16}/> Lý thuyết
                </button>
                <button onClick={() => setActiveTab('video')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${activeTab === 'video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <Video size={16}/> Video thí nghiệm
                </button>
                <button onClick={() => setActiveTab('quiz')} className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap ${activeTab === 'quiz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FileQuestion size={16}/> Đề ôn tập - Kiểm tra
                </button>
              </div>

              <div className="flex-1">
                {materialsForLesson.filter(m => m.type === activeTab).length === 0 ? (
                  <p className="text-gray-500 italic text-sm">Chưa có dữ liệu cho mục này.</p>
                ) : (
                  <div className="space-y-4">
                    {materialsForLesson.filter(m => m.type === activeTab).map(mat => (
                      <div key={mat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-base sm:text-lg mb-2">{mat.name}</h4>
                        {mat.type === 'theory' || mat.type === 'video' ? (
                           <a href={mat.link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm inline-block font-medium">Xem chi tiết (Mở link)</a>
                        ) : (
                           <div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3"><Clock size={14} className="inline mr-1"/> Thời gian: {mat.quizConfig?.time} phút | Số lần làm: {mat.quizConfig?.attempts}</p>
                              <button onClick={() => setActiveQuiz(mat)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium">Bắt đầu làm bài</button>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

        <div className="w-full md:w-2/3 bg-white p-6 overflow-y-auto flex flex-col">
          {!selectedLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <BookOpen size={64} className="mb-4 opacity-50" />
              <p>Chọn một bài học ở danh sách bên trái để bắt đầu</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{db.lessons.find(l=>l.id===selectedLesson)?.name}</h2>
              
              <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('theory')} className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'theory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FileText size={18}/> Lý thuyết
                </button>
                <button onClick={() => setActiveTab('video')} className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <Video size={18}/> Video thí nghiệm
                </button>
                <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'quiz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <FileQuestion size={18}/> Đề ôn tập - Kiểm tra
                </button>
              </div>

              <div className="flex-1">
                {materialsForLesson.filter(m => m.type === activeTab).length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có dữ liệu cho mục này.</p>
                ) : (
                  <div className="space-y-4">
                    {materialsForLesson.filter(m => m.type === activeTab).map(mat => (
                      <div key={mat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-lg mb-2">{mat.name}</h4>
                        {mat.type === 'theory' || mat.type === 'video' ? (
                           <a href={mat.link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Xem chi tiết (Mở link)</a>
                        ) : (
                           <div>
                              <p className="text-sm text-gray-600 mb-3"><Clock size={14} className="inline mr-1"/> Thời gian: {mat.quizConfig?.time} phút | Số lần làm: {mat.quizConfig?.attempts}</p>
                              <button onClick={() => setActiveQuiz(mat)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium">Bắt đầu làm bài</button>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
      
        </div>
      </div>
    </div>
  );
}

// --- 7b. Quiz Player Sub-component ---
function QuizPlayer({ quiz, currentUser, db, setDb, showToast, onFinish }) {
  const [timeLeft, setTimeLeft] = useState((quiz.quizConfig?.time || 45) * 60);
  const [answers, setAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 300) { 
          showToast('Cảnh báo: Bạn còn 5 phút để làm bài!', 'error');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = () => {
     showToast('Đã hết giờ! Hệ thống tự động nộp bài.', 'error');
     submitQuiz();
  };

  const submitQuiz = () => {
     let earned = 0;
     const total = quiz.questions?.length || 1;
     
     if (quiz.questions) {
        quiz.questions.forEach(q => {
           if (q.type === 'multi' || !q.type) {
              if (answers[q.id] === q.answerMCQ) earned++;
           } else if (q.type === 'truefalse') {
              let correctParts = 0;
              (q.tfStatements || []).forEach((stmt, idx) => {
                 if (answers[q.id]?.[idx] === stmt.isTrue) correctParts++;
              });
              earned += (correctParts / 4); 
           } else if (q.type === 'short') {
              if (String(answers[q.id] || '').trim().toLowerCase() === String(q.answerShort || '').trim().toLowerCase()) earned++;
           } else if (q.type === 'number') {
              const ans = String(answers[q.id] || '').trim();
              if (ans === String(q.answerNumDot || '').trim() || ans === String(q.answerNumComma || '').trim()) earned++;
           }
        });
     }
     
     const calculatedScore = ((earned / total) * 10).toFixed(2);
     setFinalScore(calculatedScore);

     const existingAttempts = db.quizAttempts?.filter(a => a.studentId === currentUser.linkedStudentId && a.quizId === quiz.id) || [];
     const newAttempt = {
        id: `att${Date.now()}`,
        studentId: currentUser.linkedStudentId,
        quizId: quiz.id,
        score: calculatedScore,
        attemptNum: existingAttempts.length + 1,
        date: new Date().toLocaleString('vi-VN')
     };

     const updatedStudents = db.studentsList.map(s =>
        s.id === currentUser.linkedStudentId ? { ...s, done: (s.done || 0) + 1 } : s
     );
     
     setDb({ 
        ...db, 
        studentsList: updatedStudents,
        quizAttempts: [...(db.quizAttempts || []), newAttempt]
     });
     
     showToast('Nộp bài thành công!');
     setIsFinished(true); 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (qId, val) => {
     setAnswers({ ...answers, [qId]: val });
  };

  const handleTFChange = (qId, sIdx, val) => {
     const current = answers[qId] || {};
     current[sIdx] = val;
     setAnswers({ ...answers, [qId]: current });
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
          <CheckCircle size={64} className="mx-auto text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">Nộp bài thành công!</h2>
          <p className="text-gray-600">Hệ thống đã ghi nhận kết quả bài làm của bạn.</p>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
             <p className="text-4xl font-bold text-green-700">{finalScore} / 10</p>
             <p className="text-sm text-green-600 font-medium mt-1">Điểm số tự động chấm</p>
          </div>

          {quiz.quizConfig?.answerLink && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-800 mb-3">Xem lời giải / đáp án chi tiết:</p>
              <a href={quiz.quizConfig.answerLink} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 shadow-sm w-full">
                Mở file đáp án
              </a>
            </div>
          )}
          
          <button onClick={onFinish} className="w-full py-3 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center">
         <div>
            <h2 className="text-xl font-bold text-gray-800">{quiz.name}</h2>
            <p className="text-sm text-gray-500">Học sinh: {currentUser.name}</p>
         </div>
         <div className="flex items-center gap-6">
            <div className={`font-bold text-xl flex items-center gap-2 ${timeLeft <= 300 ? 'text-red-600 animate-pulse' : 'text-blue-700'}`}>
               <Clock size={24}/> {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowConfirmModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow">
               Nộp bài
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-4xl mx-auto">
            {!quiz.questions || quiz.questions.length === 0 ? (
               <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                  Đề chưa có câu hỏi nào.
               </div>
            ) : (
               quiz.questions.map((q, index) => (
                  <div key={q.id} className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                     <h4 className="font-bold text-lg mb-4 text-blue-900 border-b pb-2">Câu {index + 1}:</h4>
                     <div className="mb-4 text-gray-800 whitespace-pre-wrap">{q.content}</div>
                     {q.imageLink && (
                        <a href={q.imageLink} target="_blank" rel="noreferrer" className="text-blue-500 underline mb-4 inline-block font-medium">
                           Click để xem hình ảnh đính kèm
                        </a>
                     )}

                     {(q.type === 'multi' || !q.type) && (
                        <div className="space-y-3 mt-4">
                           {['A', 'B', 'C', 'D'].map(opt => (
                              <label key={opt} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${answers[q.id] === opt ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'}`}>
                                 <input type="radio" name={`ans_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} className="w-5 h-5 text-blue-600"/>
                                 <span className="font-semibold text-gray-700">Đáp án {opt}</span>
                              </label>
                           ))}
                        </div>
                     )}

                     {q.type === 'truefalse' && (
                        <div className="space-y-4 mt-4">
                           <p className="text-sm text-gray-500 mb-2 italic">Chọn Đúng hoặc Sai cho mỗi phát biểu dưới đây:</p>
                           {(q.tfStatements || []).map((stmt, sIdx) => (
                              <div key={sIdx} className="p-4 border rounded bg-gray-50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                                 <div className="font-medium text-gray-800 flex-1">
                                    <span className="font-bold mr-2">{['a', 'b', 'c', 'd'][sIdx]}.</span> {stmt.text}
                                 </div>
                                 <div className="flex gap-4 min-w-[140px]">
                                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded border ${answers[q.id]?.[sIdx] === true ? 'bg-green-100 border-green-500' : 'bg-white'}`}>
                                       <input type="radio" name={`tf_${q.id}_${sIdx}`} checked={answers[q.id]?.[sIdx] === true} onChange={() => handleTFChange(q.id, sIdx, true)} className="accent-green-600" />
                                       <span className="text-sm font-bold text-green-700">Đúng</span>
                                    </label>
                                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded border ${answers[q.id]?.[sIdx] === false ? 'bg-red-100 border-red-500' : 'bg-white'}`}>
                                       <input type="radio" name={`tf_${q.id}_${sIdx}`} checked={answers[q.id]?.[sIdx] === false} onChange={() => handleTFChange(q.id, sIdx, false)} className="accent-red-600" />
                                       <span className="text-sm font-bold text-red-700">Sai</span>
                                    </label>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {(q.type === 'short' || q.type === 'number') && (
                        <div className="mt-4">
                           <input type="text" placeholder="Nhập câu trả lời của bạn..." className="w-full p-4 border rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} />
                        </div>
                     )}
                  </div>
               ))
            )}
         </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-6 text-sm">Bạn có chắc chắn muốn nộp bài lúc này không? Hệ thống sẽ ghi nhận kết quả ngay lập tức.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 w-full transition-colors">Tiếp tục làm</button>
              <button onClick={() => { setShowConfirmModal(false); submitQuiz(); }} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 w-full transition-colors">Nộp bài ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. TEACHER DASHBOARD
// ==========================================
function TeacherDashboard({ setRoute, currentUser, db, setDb, showToast }) {
  const [activeMainTab, setActiveMainTab] = useState('classMgmt'); 

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white shadow-md px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">TRANG QUẢN TRỊ GIÁO VIÊN</h1>
          <p className="text-sm text-gray-400">Xin chào, {currentUser.name}</p>
        </div>
        <button onClick={() => setRoute('landing')} className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded text-red-400 hover:text-red-300">
          <LogOut size={18}/> Đăng xuất
        </button>
      </header>

      <div className="bg-white border-b border-gray-200 px-6 flex gap-4">
        <button onClick={() => setActiveMainTab('classMgmt')} className={`py-4 font-semibold flex items-center gap-2 border-b-2 ${activeMainTab === 'classMgmt' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Users size={18}/> Quản lý Lớp & Học sinh
        </button>
        <button onClick={() => setActiveMainTab('dataMgmt')} className={`py-4 font-semibold flex items-center gap-2 border-b-2 ${activeMainTab === 'dataMgmt' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Database size={18}/> Quản lý Dữ liệu (Học liệu)
        </button>
        <button onClick={() => setActiveMainTab('resultMgmt')} className={`py-4 font-semibold flex items-center gap-2 border-b-2 ${activeMainTab === 'resultMgmt' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <BarChart size={18}/> Thống kê Kết quả
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeMainTab === 'classMgmt' && <ClassManagement db={db} setDb={setDb} showToast={showToast} />}
        {activeMainTab === 'dataMgmt' && <DataManagement db={db} setDb={setDb} showToast={showToast} />}
        {activeMainTab === 'resultMgmt' && <ResultManagement db={db} />}
      </div>
    </div>
  );
}

// --- 8a. Class Management Sub-component ---
function ClassManagement({ db, setDb, showToast }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const [newClass, setNewClass] = useState({ gradeId: '', name: '' });
  const [newStudent, setNewStudent] = useState({ name: '', gender: 'Nam', phone: '', email: '' });

  const handleAddClass = (e) => {
    e.preventDefault();
    if(!newClass.gradeId || !newClass.name) return;
    setDb({...db, classes: [...db.classes, { id: `c${Date.now()}`, ...newClass }]});
    setShowAddClass(false); showToast('Thêm lớp thành công');
  };

  const handleAddStudentManual = (e) => {
    e.preventDefault();
    if(!selectedClass) return showToast('Vui lòng chọn lớp trước', 'error');
    if(!newStudent.name || !newStudent.phone) return;
    setDb({...db, studentsList: [...db.studentsList, { id: `sl${Date.now()}`, classId: selectedClass, ...newStudent, done: 0, total: 0 }]});
    setShowAddStudent(false); showToast('Thêm học sinh thành công');
    setNewStudent({ name: '', gender: 'Nam', phone: '', email: '' });
  };

  const handleResetPasswordReq = (reqId, phone) => {
    const tempPass = '123456';
    const updatedUsers = db.studentUsers.map(u => u.phone === phone ? { ...u, password: tempPass, needPasswordChange: true } : u);
    const updatedReqs = db.resetRequests.filter(r => r.id !== reqId);
    setDb({ ...db, studentUsers: updatedUsers, resetRequests: updatedReqs });
    showToast(`Đã reset mật khẩu thành ${tempPass}. Học sinh cần đổi MK ở lần đăng nhập tiếp theo.`);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b space-y-2">
          <button onClick={() => setShowAddClass(true)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center items-center gap-2 text-sm font-medium border"><Plus size={16}/> Thêm lớp mới</button>
          <button onClick={() => selectedClass ? setShowAddStudent(true) : showToast('Vui lòng chọn lớp trước', 'error')} className="w-full py-2 bg-gray-800 text-white hover:bg-black rounded flex justify-center items-center gap-2 text-sm font-medium"><Plus size={16}/> Thêm học sinh</button>
        </div>
        <div className="p-4 space-y-4">
          {db.grades.map(grade => (
            <div key={grade.id}>
              <h3 className="font-bold text-gray-700 bg-gray-100 p-2 rounded">{grade.name}</h3>
              <div className="ml-2 mt-2 space-y-1">
                {db.classes.filter(c => c.gradeId === grade.id).map(cls => (
                  <div key={cls.id} className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedClass === cls.id ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-50'}`} onClick={() => setSelectedClass(cls.id)}>
                    <span>{cls.name}</span>
                    <div className="flex gap-1 text-gray-400">
                      <Edit size={14} className="hover:text-blue-500"/>
                      <Trash2 size={14} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); setDb({...db, classes: db.classes.filter(c => c.id !== cls.id)}); showToast('Đã xóa lớp'); }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-gray-50 p-6 overflow-y-auto">
        {db.resetRequests.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><AlertCircle size={18}/> Yêu cầu Reset Mật Khẩu</h3>
            <div className="space-y-2">
              {db.resetRequests.map(req => (
                <div key={req.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                  <span>Học sinh: <b>{req.studentName}</b> - SĐT: {req.studentPhone}</span>
                  <button onClick={() => handleResetPasswordReq(req.id, req.studentPhone)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Xác nhận Reset</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedClass ? (
          <div className="h-full flex items-center justify-center text-gray-400">Chọn một lớp để xem danh sách học sinh</div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
              <span>Danh sách học sinh lớp {db.classes.find(c=>c.id===selectedClass)?.name}</span>
              <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">Sĩ số: {db.studentsList.filter(s=>s.classId===selectedClass).length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3">STT</th>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Giới tính</th>
                    <th className="p-3">SĐT</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Đề (Làm/Tổng)</th>
                    <th className="p-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.studentsList.filter(s => s.classId === selectedClass).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 text-center">{idx + 1}</td>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">{s.gender}</td>
                      <td className="p-3">{s.phone}</td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{s.done}/{s.total}</span>
                      </td>
                      <td className="p-3 flex gap-2 text-gray-400">
                        <button className="hover:text-blue-500"><Edit size={16}/></button>
                        <button onClick={() => setDb({...db, studentsList: db.studentsList.filter(stu => stu.id !== s.id)})} className="hover:text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Thêm lớp mới</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <select required className="w-full p-2 border rounded" value={newClass.gradeId} onChange={e=>setNewClass({...newClass, gradeId: e.target.value})}>
                <option value="">Chọn khối</option>
                {db.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input required type="text" placeholder="Tên lớp" className="w-full p-2 border rounded" value={newClass.name} onChange={e=>setNewClass({...newClass, name: e.target.value})} />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowAddClass(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Thêm danh sách học sinh</h3>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm mb-4">
              <p className="font-semibold text-blue-800 mb-1">Hướng dẫn Import từ Excel:</p>
              <p className="text-gray-600 mb-2">File Excel cần có các cột: <b>Họ và tên | Giới tính | Số điện thoại | Email</b></p>
              <button 
                type="button" 
                onClick={() => {
                  const templateData = [
                    { "Họ và tên": "Nguyễn Văn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Email": "a@gmail.com" },
                    { "Họ và tên": "Trần Thị B", "Giới tính": "Nữ", "Số điện thoại": "0907654321", "Email": "b@gmail.com" }
                  ];
                  const ws = XLSX.utils.json_to_sheet(templateData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
                  XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh.xlsx");
                }} 
                className="text-blue-600 font-semibold underline hover:text-blue-800 text-xs flex items-center gap-1"
              >
                📥 Tải file Excel mẫu tại đây
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                id="excelFileUpload"
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const bstr = evt.target.result;
                      const wb = XLSX.read(bstr, { type: 'binary' });
                      const wsname = wb.SheetNames[0];
                      const ws = wb.Sheets[wsname];
                      const data = XLSX.utils.sheet_to_json(ws);

                      if (data.length === 0) {
                        showToast('File Excel không có dữ liệu!', 'error');
                        return;
                      }

                      const newStudentsParsed = data.map((row, idx) => ({
                        id: `sl_excel_${Date.now()}_${idx}`,
                        classId: selectedClass,
                        name: row['Họ và tên'] || row['Ho va ten'] || 'Học sinh mới',
                        gender: row['Giới tính'] || row['Gioi tinh'] || 'Nam',
                        phone: String(row['Số điện thoại'] || row['So dien thoai'] || ''),
                        email: row['Email'] || '',
                        done: 0,
                        total: 0
                      }));

                      setDb({
                        ...db, 
                        studentsList: [...db.studentsList, ...newStudentsParsed]
                      });
                      
                      setShowAddStudent(false);
                      showToast(`Đã import thành công ${newStudentsParsed.length} học sinh!`);
                    } catch (err) {
                      showToast('Lỗi đọc file Excel. Kiểm tra lại định dạng!', 'error');
                    }
                  };
                  reader.readAsBinaryString(file);
                }}
              />
              <label htmlFor="excelFileUpload" className="cursor-pointer flex flex-col items-center">
                <Database size={36} className="text-gray-400 mb-2" />
                <span className="font-medium text-gray-700">Click để chọn file Excel danh sách học sinh</span>
                <span className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng .xlsx, .xls</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAddStudent(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 8b. Data Management Sub-component ---
function DataManagement({ db, setDb, showToast }) {
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  const [newChapterName, setNewChapterName] = useState('');
  const [newLessonName, setNewLessonName] = useState('');

  const [matForm, setMatForm] = useState({ name: '', type: 'theory', link: '' });
  const [quizConfig, setQuizConfig] = useState({ type: 'multi', time: 45, attempts: 1, answerLink: '' });

  const handleAddChapter = (e) => {
    e.preventDefault(); if(!selectedGrade || !newChapterName) return;
    setDb({...db, chapters: [...db.chapters, { id: `ch${Date.now()}`, gradeId: selectedGrade, name: newChapterName }]});
    setShowAddChapter(false); setNewChapterName(''); showToast('Thêm chương thành công');
  };

  const handleAddLesson = (e) => {
    e.preventDefault(); if(!selectedChapter || !newLessonName) return;
    setDb({...db, lessons: [...db.lessons, { id: `l${Date.now()}`, chapterId: selectedChapter, name: newLessonName }]});
    setShowAddLesson(false); setNewLessonName(''); showToast('Thêm bài thành công');
  };

  const handleAddMaterial = (e) => {
    e.preventDefault(); 
    if(!selectedLesson) return showToast('Vui lòng chọn bài học trước', 'error');
    if(!matForm.name) return showToast('Vui lòng nhập tên học liệu', 'error');
    if(matForm.type !== 'quiz' && !matForm.link) return showToast('Vui lòng nhập đường link', 'error');

    const newMatId = `m${Date.now()}`;
    const newMat = {
      id: newMatId, lessonId: selectedLesson, ...matForm,
      quizConfig: matForm.type === 'quiz' ? quizConfig : null,
      questions: []
    };
    setDb({...db, materials: [...db.materials, newMat]});
    setShowAddMaterial(false);
    const type = matForm.type;
    setMatForm({ name: '', type: 'theory', link: '' }); 
    showToast('Gắn học liệu thành công');
    
    if (type === 'quiz') {
      setEditingQuizId(newMatId);
    }
  };

  if (editingQuizId) {
    return <QuizEditor db={db} setDb={setDb} quizId={editingQuizId} onClose={() => setEditingQuizId(null)} showToast={showToast} />;
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
         <div className="p-4 border-b space-y-2 grid grid-cols-2 gap-2">
          <button onClick={() => selectedGrade ? setShowAddChapter(true) : showToast('Chọn khối trước', 'error')} className="col-span-1 py-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center items-center gap-1 text-xs font-medium border"><Plus size={14}/> Thêm Chương</button>
          <button onClick={() => selectedChapter ? setShowAddLesson(true) : showToast('Chọn chương trước', 'error')} className="col-span-1 py-2 bg-gray-100 hover:bg-gray-200 rounded flex justify-center items-center gap-1 text-xs font-medium border"><Plus size={14}/> Thêm Bài</button>
        </div>
        <div className="p-4 space-y-2">
          {db.grades.map(grade => (
            <div key={grade.id} className="mb-2">
              <div className={`font-bold p-2 rounded cursor-pointer ${selectedGrade === grade.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`} onClick={() => {setSelectedGrade(grade.id); setSelectedChapter(null); setSelectedLesson(null)}}>
                {grade.name}
              </div>
              {selectedGrade === grade.id && (
                <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-2">
                  {db.chapters.filter(c => c.gradeId === grade.id).map(chap => (
                     <div key={chap.id}>
                        <div className={`p-2 rounded text-sm font-medium cursor-pointer flex justify-between ${selectedChapter === chap.id ? 'text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => {setSelectedChapter(chap.id); setSelectedLesson(null)}}>
                          <span>{chap.name}</span>
                          <Trash2 size={14} className="text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setDb({...db, chapters: db.chapters.filter(c => c.id !== chap.id)});}}/>
                        </div>
                        {selectedChapter === chap.id && (
                          <div className="ml-4 space-y-1">
                            {db.lessons.filter(l => l.chapterId === chap.id).map(les => (
                              <div key={les.id} className={`p-1 text-sm cursor-pointer rounded flex justify-between ${selectedLesson === les.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`} onClick={() => setSelectedLesson(les.id)}>
                                <span>- {les.name}</span>
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

      <div className="w-full md:w-2/3 bg-gray-50 p-6 overflow-y-auto relative">
         {!selectedLesson ? (
          <div className="h-full flex items-center justify-center text-gray-400">Chọn một Bài học ở cột trái để quản lý học liệu</div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{db.lessons.find(l=>l.id===selectedLesson)?.name}</h2>
              <button onClick={() => setShowAddMaterial(true)} className="bg-gray-900 text-white px-4 py-2 rounded font-medium flex items-center gap-2 hover:bg-black shadow-sm">
                <Plus size={18}/> Gắn học liệu
              </button>
            </div>

            <div className="space-y-4">
              {['theory', 'video', 'quiz'].map(type => {
                const mats = db.materials.filter(m => m.lessonId === selectedLesson && m.type === type);
                if (mats.length === 0) return null;
                const typeName = type === 'theory' ? 'Lý thuyết' : type === 'video' ? 'Video TN-HT' : 'Đề ôn tập - Kiểm tra';
                return (
                  <div key={type} className="bg-white border rounded-lg shadow-sm p-4">
                    <h3 className="font-bold border-b pb-2 mb-3 text-blue-800">{typeName}</h3>
                    <ul className="space-y-2">
                      {mats.map(m => (
                        <li key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                          <div>
                            <span className="font-medium text-gray-800">{m.name}</span>
                            {m.type === 'quiz' && <div className="text-xs text-gray-500 mt-1">🕒 {m.quizConfig.time} phút | 🔄 {m.quizConfig.attempts} lần</div>}
                          </div>
                          <div className="flex gap-2">
                             {m.type === 'quiz' && (
                               <button onClick={() => setEditingQuizId(m.id)} className="text-green-600 text-sm bg-green-50 px-2 py-1 rounded hover:bg-green-100 border border-green-200">Soạn câu hỏi</button>
                             )}
                             <button className="text-blue-500 text-sm bg-blue-50 px-2 py-1 rounded">Sửa</button>
                             <button onClick={() => setDb({...db, materials: db.materials.filter(x => x.id !== m.id)})} className="text-red-500 text-sm bg-red-50 px-2 py-1 rounded">Xóa</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showAddChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold mb-4">Thêm Chương mới</h3>
            <form onSubmit={handleAddChapter}>
              <input required type="text" placeholder="Tên chương (VD: Chương 1: ...)" className="w-full p-2 border rounded mb-4" value={newChapterName} onChange={e=>setNewChapterName(e.target.value)} />
              <div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowAddChapter(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button><button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold mb-4">Thêm Bài mới</h3>
            <form onSubmit={handleAddLesson}>
              <input required type="text" placeholder="Tên bài (VD: Bài 1: ...)" className="w-full p-2 border rounded mb-4" value={newLessonName} onChange={e=>setNewLessonName(e.target.value)} />
              <div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowAddLesson(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button><button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl mb-4 border-b pb-2">Gắn học liệu / Tạo đề</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại học liệu</label>
                  <select className="w-full p-2 border rounded bg-gray-50" value={matForm.type} onChange={e=>setMatForm({...matForm, type: e.target.value})}>
                    <option value="theory">Lý thuyết</option>
                    <option value="video">Video thí nghiệm - Hiện tượng</option>
                    <option value="quiz">Đề ôn tập - Kiểm tra</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Tên học liệu</label>
                   <input required type="text" placeholder="VD: Lý thuyết bài 1" className="w-full p-2 border rounded" value={matForm.name} onChange={e=>setMatForm({...matForm, name: e.target.value})} />
                </div>
              </div>

              {matForm.type !== 'quiz' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Đường link URL</label>
                  <input required type="text" placeholder="VD: https://youtube.com/..." className="w-full p-2 border rounded" value={matForm.link} onChange={e=>setMatForm({...matForm, link: e.target.value})} />
                </div>
              )}

              {matForm.type === 'quiz' && (
                <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><FileQuestion size={18}/> Cấu hình đề</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Loại đề</label>
                      <select className="w-full p-2 text-sm border rounded" value={quizConfig.type} onChange={e=>setQuizConfig({...quizConfig, type: e.target.value})}>
                        <option value="multi">Trắc nghiệm nhiều lựa chọn</option>
                        <option value="3part">Cấu trúc 2025 (3 phần)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Thời gian (phút)</label>
                      <input type="number" min="1" className="w-full p-2 text-sm border rounded" value={quizConfig.time} onChange={e=>setQuizConfig({...quizConfig, time: parseInt(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Số lần làm tối đa</label>
                      <input type="number" min="1" className="w-full p-2 text-sm border rounded" value={quizConfig.attempts} onChange={e=>setQuizConfig({...quizConfig, attempts: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="mb-4">
                     <label className="block text-xs text-gray-500 mb-1">Link file đáp án / lời giải chi tiết (Tùy chọn)</label>
                     <input type="url" placeholder="https://drive.google.com/..." className="w-full p-2 text-sm border rounded" value={quizConfig.answerLink || ''} onChange={e=>setQuizConfig({...quizConfig, answerLink: e.target.value})} />
                  </div>
                  <p className="text-sm font-medium text-blue-600 mt-2">* Chú ý: Sau khi lưu, hệ thống sẽ chuyển đến trang soạn câu hỏi riêng.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={()=>setShowAddMaterial(false)} className="px-6 py-2 bg-gray-200 font-medium rounded hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">Lưu dữ liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 8c. Quiz Editor Sub-component ---
function QuizEditor({ db, setDb, quizId, onClose, showToast }) {
  const quiz = db.materials.find(m => m.id === quizId);
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [answerLink, setAnswerLink] = useState(quiz.quizConfig?.answerLink || '');

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: `q${Date.now()}`,
      type: quiz.quizConfig?.type === '3part' ? 'multi' : 'multi', 
      content: '',
      imageLink: '',
      answerMCQ: 'A',
      tfStatements: [
        { id: 'a', text: '', isTrue: true },
        { id: 'b', text: '', isTrue: true },
        { id: 'c', text: '', isTrue: true },
        { id: 'd', text: '', isTrue: true }
      ],
      answerShort: '',
      answerNumDot: '',
      answerNumComma: ''
    }]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateTFStatement = (qId, statementIndex, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newTf = q.tfStatements ? [...q.tfStatements] : [
          { id: 'a', text: '', isTrue: true },
          { id: 'b', text: '', isTrue: true },
          { id: 'c', text: '', isTrue: true },
          { id: 'd', text: '', isTrue: true }
        ];
        newTf[statementIndex] = { ...newTf[statementIndex], [field]: value };
        return { ...q, tfStatements: newTf };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    setDb({...db, materials: db.materials.map(m => m.id === quizId ? {...m, questions, quizConfig: {...m.quizConfig, answerLink}} : m)});
    showToast('Lưu danh sách câu hỏi thành công!');
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><ArrowLeft size={20}/></button>
            <div>
               <h2 className="text-lg font-bold text-gray-800">Soạn câu hỏi: {quiz.name}</h2>
               <div className="text-sm text-gray-500 flex gap-4 items-center">
                 <span>Loại: {quiz.quizConfig?.type === 'multi' ? 'Trắc nghiệm nhiều lựa chọn' : 'Cấu trúc 2025 (3 phần)'}</span>
                 <span>| Thời gian: {quiz.quizConfig?.time} phút</span>
                 <span>| Lần làm: {quiz.quizConfig?.attempts}</span>
               </div>
            </div>
         </div>
         <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 font-medium">
            <Save size={18}/> Lưu bộ câu hỏi
         </button>
      </div>

      <div className="bg-blue-50 px-6 py-3 border-b flex items-center gap-4">
         <label className="text-sm font-semibold text-blue-800 whitespace-nowrap">Link file đáp án:</label>
         <input type="url" placeholder="https://... (Link Google Drive, PDF, trang web giải chi tiết)" className="flex-1 p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-blue-400" value={answerLink} onChange={(e) => setAnswerLink(e.target.value)} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         {questions.length === 0 && (
           <div className="text-center py-10 text-gray-400">
              <FileQuestion size={48} className="mx-auto mb-3 opacity-50" />
              <p>Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi" để bắt đầu.</p>
           </div>
         )}

         {questions.map((q, index) => (
            <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative">
               <button onClick={() => removeQuestion(q.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500" title="Xóa câu hỏi"><Trash2 size={18}/></button>
               <h4 className="font-bold text-blue-800 mb-4">Câu {index + 1}</h4>

               {quiz.quizConfig?.type === '3part' && (
                 <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Loại câu hỏi (Cấu trúc 2025)</label>
                    <select className="w-full md:w-1/2 p-2 border rounded text-sm bg-gray-50" value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}>
                       <option value="multi">Phần I: Trắc nghiệm nhiều lựa chọn</option>
                       <option value="truefalse">Phần II: Trắc nghiệm Đúng/Sai</option>
                       <option value="short">Phần III: Trả lời ngắn</option>
                       <option value="number">Phần III: Điền đáp án (Số)</option>
                    </select>
                 </div>
               )}

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Phần đề</label>
                     <textarea className="w-full p-3 border rounded text-sm min-h-[80px]" placeholder="Nhập nội dung câu hỏi..." value={q.content} onChange={(e) => updateQuestion(q.id, 'content', e.target.value)}></textarea>
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Link hình ảnh (Google Drive)</label>
                     <input type="url" className="w-full p-2 border rounded text-sm" placeholder="https://drive.google.com/..." value={q.imageLink} onChange={(e) => updateQuestion(q.id, 'imageLink', e.target.value)}/>
                  </div>

                  <div className="pt-4 border-t border-dashed">
                     <label className="block text-sm font-bold text-gray-700 mb-3">Phần đáp án</label>

                     {(q.type === 'multi' || quiz.quizConfig?.type === 'multi') && (
                        <div className="flex items-center gap-4">
                           <span className="text-sm text-gray-600">Chọn đáp án đúng:</span>
                           {['A', 'B', 'C', 'D'].map(opt => (
                              <label key={opt} className="flex items-center gap-1 cursor-pointer bg-gray-50 px-3 py-1 border rounded hover:bg-gray-100">
                                 <input type="radio" name={`ans_${q.id}`} value={opt} checked={q.answerMCQ === opt} onChange={(e) => updateQuestion(q.id, 'answerMCQ', e.target.value)} />
                                 <span className="font-bold text-blue-700">{opt}</span>
                              </label>
                           ))}
                        </div>
                     )}

                     {q.type === 'truefalse' && quiz.quizConfig?.type === '3part' && (
                        <div className="space-y-3">
                           <p className="text-xs text-gray-500 mb-2">Nhập 4 ý a, b, c, d và chọn Đúng hoặc Sai cho mỗi ý.</p>
                           {(q.tfStatements || [
                              { id: 'a', text: '', isTrue: true },
                              { id: 'b', text: '', isTrue: true },
                              { id: 'c', text: '', isTrue: true },
                              { id: 'd', text: '', isTrue: true }
                           ]).map((stmt, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-3 bg-gray-50 p-3 rounded border">
                                 <span className="font-bold text-blue-700 mt-2">{['a', 'b', 'c', 'd'][sIdx]}.</span>
                                 <textarea className="flex-1 p-2 border rounded text-sm min-h-[40px]" placeholder={`Nội dung ý ${['a', 'b', 'c', 'd'][sIdx]}...`} value={stmt.text} onChange={(e) => updateTFStatement(q.id, sIdx, 'text', e.target.value)}></textarea>
                                 <div className="flex flex-col gap-2 min-w-[100px]">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="radio" name={`tf_${q.id}_${sIdx}`} checked={stmt.isTrue === true} onChange={() => updateTFStatement(q.id, sIdx, 'isTrue', true)} />
                                       <span className="text-sm text-green-700 font-medium">Đúng</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                       <input type="radio" name={`tf_${q.id}_${sIdx}`} checked={stmt.isTrue === false} onChange={() => updateTFStatement(q.id, sIdx, 'isTrue', false)} />
                                       <span className="text-sm text-red-700 font-medium">Sai</span>
                                    </label>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {q.type === 'short' && quiz.quizConfig?.type === '3part' && (
                        <div>
                           <p className="text-xs text-gray-500 mb-1">Học sinh sẽ nhập câu trả lời ngắn (hệ thống bắt đầu bằng "Câu X: ")</p>
                           <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 whitespace-nowrap">Câu {index + 1}:</span>
                              <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Nhập đáp án..." value={q.answerShort} onChange={(e) => updateQuestion(q.id, 'answerShort', e.target.value)}/>
                           </div>
                        </div>
                     )}

                     {q.type === 'number' && quiz.quizConfig?.type === '3part' && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                           <p className="text-sm font-medium text-blue-800 mb-2">Điền đáp án số (Định dạng thập phân)</p>
                           <p className="text-xs text-gray-600 mb-3">* Nếu đáp án là số nguyên, chỉ cần nhập vào ô "Dấu chấm".</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-medium mb-1">Định dạng dấu chấm (.)</label>
                                 <input type="text" className="w-full p-2 border rounded text-sm" placeholder="VD: 3.14" value={q.answerNumDot} onChange={(e) => updateQuestion(q.id, 'answerNumDot', e.target.value)}/>
                              </div>
                              <div>
                                 <label className="block text-xs font-medium mb-1">Định dạng dấu phẩy (,)</label>
                                 <input type="text" className="w-full p-2 border rounded text-sm" placeholder="VD: 3,14" value={q.answerNumComma} onChange={(e) => updateQuestion(q.id, 'answerNumComma', e.target.value)}/>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ))}

         <button onClick={handleAddQuestion} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex justify-center items-center gap-2">
            <Plus size={20}/> Thêm câu hỏi
         </button>
      </div>
    </div>
  );
}

// --- 8d. Result Management Sub-component ---
function ResultManagement({ db }) {
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [expanded, setExpanded] = useState({});

  const toggleNode = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const quizzes = db.materials.filter(m => m.type === 'quiz');
  const activeQuiz = quizzes.find(q => q.id === selectedQuizId);

  let students = db.studentsList;
  if (selectedClassId) {
     students = students.filter(s => s.classId === selectedClassId);
  }

  const tableData = students.map(student => {
     const attempts = (db.quizAttempts || []).filter(a => a.quizId === selectedQuizId && a.studentId === student.id).sort((a, b) => a.attemptNum - b.attemptNum);
     return { ...student, attempts };
  });

  const maxAttemptsFound = Math.max(1, ...tableData.map(r => r.attempts.length));
  const attemptColumns = Array.from({ length: maxAttemptsFound }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col md:flex-row bg-white">
       <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b bg-gray-50">
             <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileQuestion size={18}/> Danh mục Đề thi</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
             {db.grades.map(grade => {
                const isGradeOpen = expanded[grade.id];
                return (
                   <div key={grade.id} className="mb-2">
                      <div 
                         className="font-bold p-2 bg-gray-100 text-gray-700 rounded cursor-pointer flex justify-between items-center hover:bg-gray-200" 
                         onClick={() => toggleNode(grade.id)}
                      >
                         {grade.name}
                         {isGradeOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                      </div>
                      
                      {isGradeOpen && (
                         <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                            {db.chapters.filter(c => c.gradeId === grade.id).map(chap => {
                               const isChapOpen = expanded[chap.id];
                               return (
                                  <div key={chap.id}>
                                     <div 
                                        className="p-2 text-sm font-semibold text-gray-700 cursor-pointer flex justify-between items-center hover:bg-gray-50 rounded"
                                        onClick={() => toggleNode(chap.id)}
                                     >
                                        {chap.name}
                                        {isChapOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                     </div>

                                     {isChapOpen && (
                                        <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                                           {db.lessons.filter(l => l.chapterId === chap.id).map(les => {
                                              const isLesOpen = expanded[les.id];
                                              const lessonQuizzes = quizzes.filter(q => q.lessonId === les.id);
                                              
                                              return (
                                                 <div key={les.id}>
                                                    <div 
                                                       className="p-2 text-sm text-gray-600 cursor-pointer flex justify-between items-center hover:bg-gray-50 rounded"
                                                       onClick={() => toggleNode(les.id)}
                                                    >
                                                       {les.name}
                                                       {isLesOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                                    </div>

                                                    {isLesOpen && (
                                                       <div className="ml-4 space-y-1">
                                                          {lessonQuizzes.length === 0 ? (
                                                             <div className="p-2 text-xs text-gray-400 italic">Chưa có đề thi nào</div>
                                                          ) : (
                                                             lessonQuizzes.map(quiz => (
                                                                <div 
                                                                   key={quiz.id}
                                                                   onClick={() => setSelectedQuizId(quiz.id)}
                                                                   className={`p-2 text-xs rounded cursor-pointer transition-colors ${selectedQuizId === quiz.id ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent'}`}
                                                                >
                                                                   • {quiz.name}
                                                                </div>
                                                             ))
                                                          )}
                                                       </div>
                                                    )}
                                                 </div>
                                              )
                                           })}
                                        </div>
                                     )}
                                  </div>
                               )
                            })}
                         </div>
                      )}
                   </div>
                )
             })}
          </div>
       </div>

       <div className="w-full md:w-2/3 bg-gray-50 p-6 flex flex-col overflow-y-auto">
          {!selectedQuizId ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <BarChart size={48} className="mb-4 opacity-50"/>
                <p>Hãy chọn một Đề ở cột trái để xem điểm số học sinh</p>
             </div>
          ) : (
             <>
                <div className="flex justify-between items-end mb-6">
                   <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">Thống kê: {activeQuiz?.name}</h2>
                      <p className="text-sm text-gray-600">Thời gian quy định: {activeQuiz?.quizConfig?.time} phút</p>
                   </div>
                   <div>
                      <select className="p-2.5 border rounded-md shadow-sm bg-white font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                         <option value="">-- Tất cả các Lớp --</option>
                         {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                </div>

                <div className="flex-1 bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="bg-gray-100 text-gray-700">
                            <tr>
                               <th className="p-3 border-b">STT</th>
                               <th className="p-3 border-b">Họ và tên</th>
                               <th className="p-3 border-b">Lớp</th>
                               <th className="p-3 border-b text-center">Đã làm</th>
                               {attemptColumns.map(num => (
                                  <th key={num} className="p-3 border-b text-center">Điểm lần {num}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200">
                            {tableData.length === 0 ? (
                               <tr><td colSpan={4 + attemptColumns.length} className="p-4 text-center text-gray-500">Không có dữ liệu học sinh trong lớp này.</td></tr>
                            ) : (
                               tableData.map((row, idx) => {
                                  const cls = db.classes.find(c => c.id === row.classId);
                                  return (
                                     <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                        <td className="p-3 font-medium text-gray-800">{row.name}</td>
                                        <td className="p-3 text-gray-600">{cls?.name}</td>
                                        <td className="p-3 text-center">
                                           <span className={`px-2 py-1 rounded text-xs font-bold ${row.attempts.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                              {row.attempts.length} lần
                                           </span>
                                        </td>
                                        {attemptColumns.map((num, i) => {
                                           const attempt = row.attempts[i];
                                           return (
                                              <td key={num} className="p-3 text-center min-w-[100px]">
                                                 {attempt ? (
                                                    <div>
                                                       <span className="font-bold text-blue-700 text-base">{attempt.score}</span>
                                                       <div className="text-[10px] text-gray-400 mt-0.5">{attempt.date.split(' ')[1]}</div>
                                                    </div>
                                                 ) : (
                                                    <span className="text-gray-300">-</span>
                                                 )}
                                              </td>
                                           );
                                        })}
                                     </tr>
                                  );
                               })
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
             </>
          )}
       </div>
    </div>
  );
}
