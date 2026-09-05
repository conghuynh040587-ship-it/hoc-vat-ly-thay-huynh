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
import 'katex/dist/katex.min.css';
import katex from 'katex';
// ==========================================
// 1. MOCK DATABASE & STATE MANAGEMENT
// ==========================================
const INITIAL_DATA = {
  grades: [
    { id: 'g10', name: 'Khối 10' },
    { id: 'g11', name: 'Khối 11' },
    { id: 'g12', name: 'Khối 12' },
  ],
  classes: [{ id: 'c1', gradeId: 'g12', name: '12A1' }],
  studentsList: [
    { id: 'sl1', classId: 'c1', name: 'Nguyễn Văn A', gender: 'Nam', phone: '0123456789', email: 'a@gmail.com', done: 0, total: 5 },
  ],
  studentUsers: [
    { id: 'u1', name: 'Nguyễn Văn A', phone: '0123456789', email: 'a@gmail.com', password: '123', linkedStudentId: null, needPasswordChange: false }
  ],
  chapters: [
    // --- KHỐI 10 ---
    { id: 'ch10_1', gradeId: 'g10', name: 'Chương I. Mở đầu' },
    { id: 'ch10_2', gradeId: 'g10', name: 'Chương II. Động học' },
    { id: 'ch10_3', gradeId: 'g10', name: 'Chương III. Động lực học' },
    { id: 'ch10_4', gradeId: 'g10', name: 'Chương IV. Năng lượng, công, công suất' },
    { id: 'ch10_5', gradeId: 'g10', name: 'Chương V. Động lượng' },
    { id: 'ch10_6', gradeId: 'g10', name: 'Chương VI. Chuyển động tròn' },
    { id: 'ch10_7', gradeId: 'g10', name: 'Chương VII. Biến dạng của vật rắn. Áp suất chất lỏng' },

    // --- KHỐI 11 ---
    { id: 'ch11_1', gradeId: 'g11', name: 'Chương 1. Dao động' },
    { id: 'ch11_2', gradeId: 'g11', name: 'Chương 2. Sóng' },
    { id: 'ch11_3', gradeId: 'g11', name: 'Chương 3. Điện trường' },
    { id: 'ch11_4', gradeId: 'g11', name: 'Chương 4. Dòng điện. Mạch điện' },

    // --- KHỐI 12 ---
    { id: 'ch12_1', gradeId: 'g12', name: 'Chương 1. Vật lí nhiệt' },
    { id: 'ch12_2', gradeId: 'g12', name: 'Chương 2. Khí lí tưởng' },
    { id: 'ch12_3', gradeId: 'g12', name: 'Chương 3. Từ trường' },
    { id: 'ch12_4', gradeId: 'g12', name: 'Chương 4. Vật lí hạt nhân' }
  ],
  lessons: [
    // ================= KHỐI 10 =================
    { id: 'l10_1', chapterId: 'ch10_1', name: 'Bài 1. Làm quen với Vật lí' },
    { id: 'l10_2', chapterId: 'ch10_1', name: 'Bài 2. Các quy tắc an toàn trong phòng thực hành Vật lí' },
    { id: 'l10_3', chapterId: 'ch10_1', name: 'Bài 3. Thực hành tính sai số trong phép đo. Ghi kết quả đo' },
    
    { id: 'l10_4', chapterId: 'ch10_2', name: 'Bài 4. Độ dịch chuyển và quãng đường đi được' },
    { id: 'l10_5', chapterId: 'ch10_2', name: 'Bài 5. Tốc độ và vận tốc' },
    { id: 'l10_6', chapterId: 'ch10_2', name: 'Bài 6. Thực hành: Đo tốc độ của vật chuyển động' },
    { id: 'l10_7', chapterId: 'ch10_2', name: 'Bài 7. Đồ thị độ dịch chuyển - thời gian' },
    { id: 'l10_8', chapterId: 'ch10_2', name: 'Bài 8. Chuyển động biến đổi. Gia tốc' },
    { id: 'l10_9', chapterId: 'ch10_2', name: 'Bài 9. Chuyển động thẳng biến đổi đều' },
    { id: 'l10_10', chapterId: 'ch10_2', name: 'Bài 10. Sự rơi tự do' },
    { id: 'l10_11', chapterId: 'ch10_2', name: 'Bài 11. Thực hành: Đo gia tốc rơi tự do' },
    { id: 'l10_12', chapterId: 'ch10_2', name: 'Bài 12. Chuyển động ném' },

    { id: 'l10_13', chapterId: 'ch10_3', name: 'Bài 13. Tổng hợp và phân tích lực. Cân bằng lực' },
    { id: 'l10_14', chapterId: 'ch10_3', name: 'Bài 14. Định luật 1 Newton' },
    { id: 'l10_15', chapterId: 'ch10_3', name: 'Bài 15. Định luật 2 Newton' },
    { id: 'l10_16', chapterId: 'ch10_3', name: 'Bài 16. Định luật 3 Newton' },
    { id: 'l10_17', chapterId: 'ch10_3', name: 'Bài 17. Trọng lực và lực căng' },
    { id: 'l10_18', chapterId: 'ch10_3', name: 'Bài 18. Lực ma sát' },
    { id: 'l10_19', chapterId: 'ch10_3', name: 'Bài 19. Lực cản và lực nâng' },
    { id: 'l10_20', chapterId: 'ch10_3', name: 'Bài 20. Một số ví dụ về cách giải các bài toán thuộc phần động lực học' },
    { id: 'l10_21', chapterId: 'ch10_3', name: 'Bài 21. Moment lực. Cân bằng của vật rắn' },
    { id: 'l10_22', chapterId: 'ch10_3', name: 'Bài 22. Thực hành: Tổng hợp lực' },

    { id: 'l10_23', chapterId: 'ch10_4', name: 'Bài 23. Năng lượng. Công cơ học' },
    { id: 'l10_24', chapterId: 'ch10_4', name: 'Bài 24. Công suất' },
    { id: 'l10_25', chapterId: 'ch10_4', name: 'Bài 25. Động năng, thế năng' },
    { id: 'l10_26', chapterId: 'ch10_4', name: 'Bài 26. Cơ năng và định luật bảo toàn cơ năng' },
    { id: 'l10_27', chapterId: 'ch10_4', name: 'Bài 27. Hiệu suất' },

    { id: 'l10_28', chapterId: 'ch10_5', name: 'Bài 28. Động lượng' },
    { id: 'l10_29', chapterId: 'ch10_5', name: 'Bài 29. Định luật bảo toàn động lượng' },
    { id: 'l10_30', chapterId: 'ch10_5', name: 'Bài 30. Thực hành: Xác định động lượng của vật trước và sau va chạm' },

    { id: 'l10_31', chapterId: 'ch10_6', name: 'Bài 31. Động học của chuyển động tròn đều' },
    { id: 'l10_32', chapterId: 'ch10_6', name: 'Bài 32. Lực hướng tâm và gia tốc hướng tâm' },

    { id: 'l10_33', chapterId: 'ch10_7', name: 'Bài 33. Biến dạng của vật rắn' },
    { id: 'l10_34', chapterId: 'ch10_7', name: 'Bài 34. Khối lượng riêng. Áp suất chất lỏng' },

    // ================= KHỐI 11 =================
    { id: 'l11_1', chapterId: 'ch11_1', name: 'Bài 1. Dao động điều hòa' },
    { id: 'l11_2', chapterId: 'ch11_1', name: 'Bài 2. Mô tả dao động điều hòa' },
    { id: 'l11_3', chapterId: 'ch11_1', name: 'Bài 3. Vận tốc, gia tốc trong dao động điều hòa' },
    { id: 'l11_4', chapterId: 'ch11_1', name: 'Bài 4. Bài tập về dao động điều hòa' },
    { id: 'l11_5', chapterId: 'ch11_1', name: 'Bài 5. Động năng. Thế năng. Sự chuyển hóa năng lượng trong dao động điều hòa' },
    { id: 'l11_6', chapterId: 'ch11_1', name: 'Bài 6. Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng' },
    { id: 'l11_7', chapterId: 'ch11_1', name: 'Bài 7. Bài tập về sự chuyển hóa năng lượng trong dao động điều hòa' },

    { id: 'l11_8', chapterId: 'ch11_2', name: 'Bài 8. Mô tả sóng' },
    { id: 'l11_9', chapterId: 'ch11_2', name: 'Bài 9. Sóng ngang. Sóng dọc. Sự truyền năng lượng của sóng cơ' },
    { id: 'l11_10', chapterId: 'ch11_2', name: 'Bài 10. Thực hành: Đo tần số của sóng âm' },
    { id: 'l11_11', chapterId: 'ch11_2', name: 'Bài 11. Sóng điện từ' },
    { id: 'l11_12', chapterId: 'ch11_2', name: 'Bài 12. Giao thoa sóng' },
    { id: 'l11_13', chapterId: 'ch11_2', name: 'Bài 13. Sóng dừng' },
    { id: 'l11_14', chapterId: 'ch11_2', name: 'Bài 14. Bài tập về sóng dừng' },
    { id: 'l11_15', chapterId: 'ch11_2', name: 'Bài 15. Thực hành: Đo tốc độ truyền âm' },

    { id: 'l11_16', chapterId: 'ch11_3', name: 'Bài 16. Lực tương tác giữa hai điện tích' },
    { id: 'l11_17', chapterId: 'ch11_3', name: 'Bài 17. Khái niệm điện trường' },
    { id: 'l11_18', chapterId: 'ch11_3', name: 'Bài 18. Điện trường đều' },
    { id: 'l11_19', chapterId: 'ch11_3', name: 'Bài 19. Thế năng điện' },
    { id: 'l11_20', chapterId: 'ch11_3', name: 'Bài 20. Điện thế' },
    { id: 'l11_21', chapterId: 'ch11_3', name: 'Bài 21. Tụ điện' },

    { id: 'l11_22', chapterId: 'ch11_4', name: 'Bài 22. Cường độ dòng điện' },
    { id: 'l11_23', chapterId: 'ch11_4', name: 'Bài 23. Điện trở. Định luật Ohm' },
    { id: 'l11_24', chapterId: 'ch11_4', name: 'Bài 24. Nguồn điện' },
    { id: 'l11_25', chapterId: 'ch11_4', name: 'Bài 25. Năng lượng và công suất điện' },
    { id: 'l11_26', chapterId: 'ch11_4', name: 'Bài 26. Thực hành: Đo suất điện động và điện trở trong của pin điện hóa' },

    // ================= KHỐI 12 =================
    { id: 'l12_1', chapterId: 'ch12_1', name: 'Bài 1. Cấu trúc của chất. Sự chuyển thể' },
    { id: 'l12_2', chapterId: 'ch12_1', name: 'Bài 2. Nội năng. Định luật I của nhiệt động lực học' },
    { id: 'l12_3', chapterId: 'ch12_1', name: 'Bài 3. Nhiệt độ, thang nhiệt độ, nhiệt kế' },
    { id: 'l12_4', chapterId: 'ch12_1', name: 'Bài 4. Nhiệt dung riêng' },
    { id: 'l12_5', chapterId: 'ch12_1', name: 'Bài 5. Nhiệt nóng chảy riêng' },
    { id: 'l12_6', chapterId: 'ch12_1', name: 'Bài 6. Nhiệt hóa hơi riêng' },
    { id: 'l12_7', chapterId: 'ch12_1', name: 'Bài 7. Bài tập vật lí nhiệt' },

    { id: 'l12_8', chapterId: 'ch12_2', name: 'Bài 8. Mô hình động học phân tử chất khí' },
    { id: 'l12_9', chapterId: 'ch12_2', name: 'Bài 9. Định luật Boyle' },
    { id: 'l12_10', chapterId: 'ch12_2', name: 'Bài 10. Định luật Charles' },
    { id: 'l12_11', chapterId: 'ch12_2', name: 'Bài 11. Phương trình trạng thái của khí lí tưởng' },
    { id: 'l12_12', chapterId: 'ch12_2', name: 'Bài 12. Bài tập về khí lí tưởng' },
    { id: 'l12_13', chapterId: 'ch12_2', name: 'Bài 13. Áp suất khí theo mô hình động học phân tử. Động năng phân tử và nhiệt độ' },

    { id: 'l12_14', chapterId: 'ch12_3', name: 'Bài 14. Từ trường' },
    { id: 'l12_15', chapterId: 'ch12_3', name: 'Bài 15. Lực từ tác dụng lên đoạn dây dẫn mang dòng điện. Cảm ứng từ' },
    { id: 'l12_16', chapterId: 'ch12_3', name: 'Bài 16. Từ thông. Hiện tượng cảm ứng điện từ' },
    { id: 'l12_17', chapterId: 'ch12_3', name: 'Bài 17. Đàn ghi ta điện. Máy biến áp' },
    { id: 'l12_18', chapterId: 'ch12_3', name: 'Bài 18. Máy phát điện xoay chiều' },
    { id: 'l12_19', chapterId: 'ch12_3', name: 'Bài 19. Điện từ trường. Mô hình sóng điện từ' },

    { id: 'l12_20', chapterId: 'ch12_4', name: 'Bài 20. Cấu trúc hạt nhân' },
    { id: 'l12_21', chapterId: 'ch12_4', name: 'Bài 21. Phản ứng hạt nhân và năng lượng liên kết' },
    { id: 'l12_22', chapterId: 'ch12_4', name: 'Bài 22. Hiện tượng phóng xạ' },
    { id: 'l12_23', chapterId: 'ch12_4', name: 'Bài 23. Công nghiệp hạt nhân' }
  ],
  materials: [
    { id: 'm1', lessonId: 'l12_1', name: 'Lý thuyết cơ bản', type: 'theory', link: 'https://example.com' },
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
        
        // --- THÊM DÒNG NÀY ĐỂ GHI ĐÈ DỮ LIỆU MỚI LÊN FIREBASE ---
        await setDoc(docRef, INITIAL_DATA);
        setDb(INITIAL_DATA);
        
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
// 7. STUDENT DASHBOARD (THU NHỎ SIZE CHỮ HEADER)
// ==========================================
// 7. STUDENT DASHBOARD (GIAO DIỆN HỌC SINH TÍCH HỢP THỐNG KÊ & XẾP LOẠI)
// ==========================================
function StudentDashboard({ currentUser, db, setDb, showToast, onLogout }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('theory');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapId) => {
    setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const chapters = db.chapters || [];
  const materialsForLesson = db.materials?.filter(m => m.lessonId === selectedLesson) || [];

  if (activeQuiz) {
    return (
      <QuizPlayer 
        quiz={activeQuiz} 
        currentUser={currentUser} 
        db={db} 
        setDb={setDb} 
        showToast={showToast} 
        onFinish={() => setActiveQuiz(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER HỌC SINH */}
      <header className="bg-purple-700 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-base sm:text-lg font-bold">HỌC VẬT LÝ CÙNG THẦY LÊ CÔNG HUYNH</h1>
          <p className="text-xs text-purple-200">Vật lý không khó. Đã có thầy Huynh lo!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{currentUser?.name}</p>
            <p className="text-xs text-purple-200">Lớp: {currentUser?.className}</p>
          </div>
          <button onClick={onLogout} className="bg-purple-600 hover:bg-purple-800 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-medium border border-purple-500 transition-colors flex items-center gap-1">
            <LogOut size={16}/> Đăng xuất
          </button>
        </div>
      </header>

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
        {/* THANH MỤC LỤC BÊN TRÁI */}
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
                            setShowMobileMenu(false);
                          }}
                          className={`w-full text-left p-2 pl-6 rounded text-sm transition-colors ${selectedLesson === les.id ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
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

        {/* NỘI DUNG CHÍNH BÊN PHẢI */}
        <div className="w-full md:w-2/3 bg-white p-4 sm:p-6 overflow-y-auto flex flex-col">
          {!selectedLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 w-full max-w-xl mx-auto space-y-6">
              
              {/* LỜI CHÀO MỪNG */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md w-full text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Xin chào, {currentUser?.name || 'Học sinh'}! 👋</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Chúc em có một buổi học tập môn Vật lý thật hiệu quả.</p>
              </div>

             {/* BẢNG THỐNG KÊ, XẾP LOẠI VÀ KHÍCH LỆ */}
              {(() => {
                const studentAttempts = db.quizAttempts?.filter(a => a.studentId === currentUser?.linkedStudentId) || [];
                const totalDone = studentAttempts.length;
                const avgScore = totalDone > 0 
                  ? (studentAttempts.reduce((sum, a) => sum + parseFloat(a.score || 0), 0) / totalDone).toFixed(2) 
                  : 0;

                let rankName = 'Chưa xếp loại';
                let rankColor = 'bg-gray-100 text-gray-700 border-gray-300';
                let encourageText = 'Em hãy chọn bài học và hoàn thành bài kiểm tra đầu tiên để ghi nhận kết quả nhé!';

                if (totalDone > 0) {
                  const scoreNum = parseFloat(avgScore);
                  if (scoreNum >= 8.5) {
                    rankName = '🌟 Học lực: GIỎI';
                    rankColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    encourageText = 'Tuyệt vời! Em đang duy trì phong độ rất xuất sắc. Hãy tiếp tục phát huy nhé!';
                  } else if (scoreNum >= 6.5) {
                    rankName = '👍 Học lực: KHÁ';
                    rankColor = 'bg-blue-50 text-blue-800 border-blue-200';
                    encourageText = 'Kết quả rất tốt! Cố gắng thêm một chút nữa ở các bài tập nâng cao để đạt điểm tuyệt đối nha.';
                  } else if (scoreNum >= 5.0) {
                    rankName = '✍️ Học lực: ĐẠT';
                    rankColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    encourageText = 'Em đã nắm được kiến thức cơ bản. Hãy chịu khó luyện tập thêm để nâng cao điểm số nhé!';
                  } else {
                    rankName = '🎯 Cần cố gắng nhiều hơn';
                    rankColor = 'bg-rose-50 text-rose-800 border-rose-200';
                    encourageText = 'Đừng nản chí em nhé! Hãy xem lại lý thuyết, trao đổi thêm với thầy cô và làm lại bài để tiến bộ hơn.';
                  }
                }

                return (
                  <div className="w-full space-y-4">
                    {/* Thống kê nhanh */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bài đã hoàn thành</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{totalDone} bài</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Điểm trung bình</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{avgScore} / 10</p>
                      </div>
                    </div>

                    {/* Thông báo Xếp loại */}
                    <div className={`p-3.5 rounded-xl border shadow-sm font-bold text-center text-sm ${rankColor}`}>
                      {rankName}
                    </div>

                    {/* Thông báo Khích lệ */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm flex gap-3 items-start text-left">
                      <div className="text-amber-600 text-xl mt-0.5">💡</div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Lời nhắn khích lệ từ thầy</h4>
                        <p className="text-sm text-amber-900 leading-relaxed font-medium">
                          {encourageText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            <>
              <h2 className="text-base sm:text-2xl font-bold text-gray-800 mb-4 leading-snug">
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
// ==========================================
// ==========================================
// 7b. Quiz Player Sub-component (Đã tối ưu giao diện & hiển thị đáp án)
// ==========================================
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

     // --- TÍNH THỜI GIAN THỰC TẾ HỌC SINH LÀM BÀI ---
     const totalTimeAllowed = (quiz.quizConfig?.time || 45) * 60;
     const secondsSpent = totalTimeAllowed - timeLeft;
     const minutesDone = Math.floor(secondsSpent / 60);
     const secondsDone = secondsSpent % 60;
     const durationText = minutesDone > 0 ? `${minutesDone} phút ${secondsDone} giây` : `${secondsDone} giây`;

     const existingAttempts = db.quizAttempts?.filter(a => a.studentId === currentUser.linkedStudentId && a.quizId === quiz.id) || [];
     const newAttempt = {
        id: `att${Date.now()}`,
        studentId: currentUser.linkedStudentId,
        quizId: quiz.id,
        score: calculatedScore,
        attemptNum: existingAttempts.length + 1,
        date: new Date().toLocaleString('vi-VN'),
        duration: durationText // Lưu thời gian làm bài thực tế
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
      {/* HEADER 2 DÒNG TỐI ƯU KHÔNG GIAN */}
      <div className="bg-white border-b px-4 py-3 space-y-2 sticky top-0 z-20 shadow-sm">
        {/* Dòng 1: Tên đề thi và tên học sinh */}
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-bold text-gray-800 truncate flex-1 pr-2">{quiz.name}</h1>
          <span className="text-xs text-gray-500 shrink-0">HS: <strong className="text-gray-700">{currentUser?.name || 'Học sinh'}</strong></span>
        </div>

        {/* Dòng 2: Thời gian đếm ngược và nút Nộp bài */}
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <div className={`flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded border ${timeLeft <= 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
            <Clock size={14}/>
            <span>Thời gian: {formatTime(timeLeft)}</span>
          </div>
          
          <button 
            onClick={() => setShowConfirmModal(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-medium text-xs shadow-sm transition-colors"
          >
            Nộp bài
          </button>
        </div>
      </div>

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

                     {/* HIỂN THỊ ĐÁP ÁN TRẮC NGHIỆM LẤY ĐÚNG NỘI DUNG ĐÃ SOẠN */}
                     {(q.type === 'multi' || !q.type) && (
                        <div className="space-y-3 mt-4">
                           {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                              const optionText = q.options && q.options[optIdx] ? q.options[optIdx] : `Đáp án ${opt}`;
                              const isSelected = answers[q.id] === opt;
                              return (
                                 <label 
                                    key={opt} 
                                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                                       isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                 >
                                    <input 
                                       type="radio" 
                                       name={`ans_${q.id}`} 
                                       checked={isSelected} 
                                       onChange={() => handleAnswerChange(q.id, opt)}
                                       className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1 flex gap-2">
                                       <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{opt}.</span>
                                       <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-800'}`}>
                                          {optionText}
                                       </span>
                                    </div>
                                 </label>
                              );
                           })}
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
                           <input type="text" placeholder="Nhập câu trả lời của bạn..." className="w-full p-4 border rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800" value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} />
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
        
        {/* CÂY THƯ MỤC ĐÃ CANH ĐỀU LỀ TRÁI VÀ CỐ ĐỊNH ICON THAO TÁC BÊN PHẢI */}
        <div className="p-4 space-y-2 text-left">
          {db.grades.map(grade => (
            <div key={grade.id} className="mb-2">
              <div className={`font-bold p-2 rounded cursor-pointer text-left ${selectedGrade === grade.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`} onClick={() => {setSelectedGrade(grade.id); setSelectedChapter(null); setSelectedLesson(null)}}>
                {grade.name}
              </div>
              {selectedGrade === grade.id && (
                <div className="ml-4 mt-2 space-y-1.5 border-l-2 border-gray-200 pl-2">
                  {db.chapters.filter(c => c.gradeId === grade.id).map(chap => (
                     <div key={chap.id} className="mb-2">
                        {/* Hàng tên Chương */}
                        <div className={`p-2.5 rounded text-sm font-bold cursor-pointer flex justify-between items-start gap-2 text-left ${selectedChapter === chap.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => {setSelectedChapter(chap.id); setSelectedLesson(null)}}>
                          <span className="flex-1 text-left">{chap.name}</span>
                          <div className="flex gap-2 text-gray-400 items-center shrink-0 pt-0.5">
                            <Edit size={14} className="hover:text-blue-600 cursor-pointer" title="Sửa tên chương" onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt('Nhập tên chương mới:', chap.name);
                              if (newName && newName.trim()) {
                                const updatedChapters = db.chapters.map(c => c.id === chap.id ? { ...c, name: newName.trim() } : c);
                                setDb({ ...db, chapters: updatedChapters });
                                showToast('Đã cập nhật tên chương');
                              }
                            }}/>
                            <Trash2 size={14} className="hover:text-red-500 cursor-pointer" title="Xóa chương" onClick={(e) => { 
                              e.stopPropagation(); 
                              if(confirm('Xóa chương này sẽ mất các bài học bên trong?')) {
                                setDb({...db, chapters: db.chapters.filter(c => c.id !== chap.id), lessons: db.lessons.filter(l => l.chapterId !== chap.id)});
                                showToast('Đã xóa chương'); 
                              }
                            }}/>
                          </div>
                        </div>

                        {/* Danh sách Bài học */}
                        {selectedChapter === chap.id && (
                          <div className="ml-4 mt-1 space-y-1.5 border-l-2 border-gray-100 pl-2">
                            {db.lessons.filter(l => l.chapterId === chap.id).map(les => (
                              <div key={les.id} className={`p-2 text-sm cursor-pointer rounded flex justify-between items-start gap-2 text-left ${selectedLesson === les.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setSelectedLesson(les.id)}>
                                <span className="flex-1 text-left">- {les.name}</span>
                                <div className="flex gap-2 text-gray-400 items-center shrink-0 pt-0.5">
                                  <Edit size={14} className="hover:text-blue-600 cursor-pointer" title="Sửa tên bài" onClick={(e) => {
                                    e.stopPropagation();
                                    const newLessonName = prompt('Nhập tên bài học mới:', les.name);
                                    if (newLessonName && newLessonName.trim()) {
                                      const updatedLessons = db.lessons.map(l => l.id === les.id ? { ...l, name: newLessonName.trim() } : l);
                                      setDb({ ...db, lessons: updatedLessons });
                                      showToast('Đã cập nhật tên bài học');
                                    }
                                  }}/>
                                  <Trash2 size={14} className="hover:text-red-500 cursor-pointer" title="Xóa bài học" onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(confirm('Bạn có chắc chắn muốn xóa bài học này không?')) {
                                      setDb({...db, lessons: db.lessons.filter(l => l.id !== les.id), materials: db.materials.filter(m => m.lessonId !== les.id)});
                                      showToast('Đã xóa bài học'); 
                                    }
                                  }}/>
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

      <div className="w-full md:w-2/3 bg-gray-50 p-6 overflow-y-auto relative text-left">
         {!selectedLesson ? (
          <div className="h-full flex items-center justify-center text-gray-400">Chọn một Bài học ở cột trái để quản lý học liệu</div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 text-left">{db.lessons.find(l=>l.id===selectedLesson)?.name}</h2>
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
                  <div key={type} className="bg-white border rounded-lg shadow-sm p-4 text-left">
                    <h3 className="font-bold border-b pb-2 mb-3 text-blue-800 text-left">{typeName}</h3>
                    <ul className="space-y-2">
                      {mats.map(m => (
                        <li key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border text-left">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-left">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-left">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-left">
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
// ==========================================
// 8c. QUIZ EDITOR (TRẮC NGHIỆM NHIỀU LỰA CHỌN THEO DẠNG DÒNG DỌC)
// ==========================================
function QuizEditor({ db, setDb, quizId, onClose, showToast }) {
  const quiz = db.materials.find(m => m.id === quizId);
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [answerLink, setAnswerLink] = useState(quiz.quizConfig?.answerLink || '');

  const handleSave = () => {
    const updatedMaterials = db.materials.map(m => {
      if (m.id === quizId) {
        return {
          ...m,
          questions: questions,
          quizConfig: { ...m.quizConfig, answerLink }
        };
      }
      return m;
    });
    setDb({ ...db, materials: updatedMaterials });
    showToast('Đã lưu đề thi thành công!', 'success');
    onClose();
  };

  const addQuestion = (type) => {
    const newQ = {
      id: Date.now().toString(),
      type: type, // 'multi', 'truefalse', 'short', 'number'
      content: '',
      image: '',
      answerMCQ: 'A',
      // Thêm các option text riêng cho multi nếu thầy muốn nhập chữ cho A, B, C, D (nếu cấu trúc cũ lưu string thuần, em hỗ trợ cả 2 dạng)
      options: ['', '', '', ''],
      tfStatements: [
        { text: '', isTrue: true },
        { text: '', isTrue: false },
        { text: '', isTrue: true },
        { text: '', isTrue: false },
      ],
      answerShort: '',
      answerNumDot: ''
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
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
    if (confirm('Thầy có chắc chắn muốn xóa câu hỏi này không?')) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* HEADER */}
      <div className="bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100">
            <ArrowLeft size={22}/>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Soạn câu hỏi: {quiz.name}</h2>
            <p className="text-xs text-gray-500">Tổng số câu hỏi: <span className="font-bold text-blue-600">{questions.length}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm shadow flex items-center gap-1.5">
            <Save size={16}/> Lưu thay đổi
          </button>
        </div>
      </div>

      {/* DANH SÁCH CÂU HỎI */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* LINK ĐÁP ÁN CHUNG */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-1">Link xem đáp án chi tiết / Video chữa (Google Drive / YouTube)</label>
          <input 
            type="text" 
            value={answerLink} 
            onChange={(e) => setAnswerLink(e.target.value)} 
            placeholder="Dán link giải chi tiết vào đây..." 
            className="w-full p-2.5 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 p-8">
            <p className="text-gray-500 mb-4 text-sm">Chưa có câu hỏi nào trong đề này.</p>
            <p className="text-xs text-gray-400">Thầy hãy chọn thêm câu hỏi mới ở thanh bên dưới nhé.</p>
          </div>
        ) : (
          questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5 relative transition-all">
              
              {/* STT VÀ NÚT XÓA CÂU HỎI */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <span className="font-bold text-blue-700 text-base">Câu {qIndex + 1}</span>
                <div className="flex items-center gap-3">
                  <select 
                    value={q.type} 
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="text-xs sm:text-sm font-medium bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none"
                  >
                    <option value="multi">Trắc nghiệm nhiều lựa chọn</option>
                    <option value="truefalse">Trắc nghiệm Đúng / Sai</option>
                    <option value="short">Trả lời ngắn</option>
                    <option value="number">Điền số / Đáp án số</option>
                  </select>
                  <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Xóa câu hỏi">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              {/* Ô NHẬP PHẦN ĐỀ (NỀN TRẮNG) */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Phần đề bài</label>
                <textarea 
                  rows={3}
                  value={q.content}
                  onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
                  placeholder="Nhập nội dung câu hỏi vật lý..."
                  className="w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                />
              </div>

              {/* Ô NHẬP LINK HÌNH ẢNH (NỀN TRẮNG) */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Link hình ảnh minh họa (Google Drive)</label>
                <input 
                  type="text"
                  value={q.image || ''}
                  onChange={(e) => updateQuestion(qIndex, 'image', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2.5 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* PHẦN ĐÁP ÁN */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                
                {/* 1. TRẮC NGHIỆM NHIỀU LỰA CHỌN (DẠNG DÒNG DỌC GIỐNG ĐÚNG/SAI) */}
                {q.type === 'multi' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="block text-xs font-bold text-blue-900 uppercase tracking-wider">Phần các phương án A, B, C, D</span>
                      <span className="text-xs text-gray-500 italic">Chọn nút tròn tương ứng với đáp án đúng</span>
                    </div>
                    {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                      <div key={opt} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <span className="font-bold text-blue-700 w-6 text-sm">
                          {opt}.
                        </span>
                        <textarea 
                          rows={2}
                          value={q.options ? q.options[optIdx] : ''}
                          onChange={(e) => updateOption(qIndex, optIdx, e.target.value)}
                          placeholder={`Nhập nội dung phương án ${opt}...`}
                          className="flex-1 w-full p-2.5 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-bold cursor-pointer transition-colors ${q.answerMCQ === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                            <input 
                              type="radio" 
                              name={`mcq-${q.id}`} 
                              checked={q.answerMCQ === opt} 
                              onChange={() => updateQuestion(qIndex, 'answerMCQ', opt)}
                              className="hidden"
                            />
                            {q.answerMCQ === opt ? '✓ Đáp án đúng' : 'Chọn đúng'}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. ĐÚNG / SAI */}
                {q.type === 'truefalse' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Phần đáp án các ý a, b, c, d</span>
                    {q.tfStatements?.map((stmt, sIdx) => (
                      <div key={sIdx} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <span className="font-bold text-blue-700 w-6 text-sm">
                          {['a', 'b', 'c', 'd'][sIdx]}.
                        </span>
                        <textarea 
                          rows={2}
                          value={stmt.text}
                          onChange={(e) => updateTfStatement(qIndex, sIdx, 'text', e.target.value)}
                          placeholder={`Nhập nội dung ý ${['a', 'b', 'c', 'd'][sIdx]}...`}
                          className="flex-1 w-full p-2.5 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${stmt.isTrue ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300'}`}>
                            <input 
                              type="radio" 
                              name={`tf-${q.id}-${sIdx}`} 
                              checked={stmt.isTrue} 
                              onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', true)}
                              className="hidden"
                            />
                            Đúng
                          </label>
                          <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${!stmt.isTrue ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300'}`}>
                            <input 
                              type="radio" 
                              name={`tf-${q.id}-${sIdx}`} 
                              checked={!stmt.isTrue} 
                              onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', false)}
                              className="hidden"
                            />
                            Sai
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. TRẢ LỜI NGẮN */}
                {q.type === 'short' && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Đáp án trả lời ngắn chính xác</label>
                    <input 
                      type="text" 
                      value={q.answerShort || ''}
                      onChange={(e) => updateQuestion(qIndex, 'answerShort', e.target.value)}
                      placeholder="Nhập đáp án (ví dụ: 2,5 hoặc gia tốc)..."
                      className="w-full sm:w-1/2 p-2.5 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}

                {/* 4. ĐIỀN SỐ / ĐÁP ÁN SỐ */}
                {q.type === 'number' && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Đáp án số (Dạng điền kết quả)</label>
                    <input 
                      type="text" 
                      value={q.answerNumDot || ''}
                      onChange={(e) => updateQuestion(qIndex, 'answerNumDot', e.target.value)}
                      placeholder="Nhập số kết quả (ví dụ: 15.5)..."
                      className="w-full sm:w-1/2 p-2.5 rounded bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}

              </div>

            </div>
          ))
        )}

        {/* NÚT THÊM CÂU HỎI MỚI */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thêm câu hỏi mới vào đề</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => addQuestion('multi')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium shadow-sm">
              + Trắc nghiệm nhiều lựa chọn
            </button>
            <button onClick={() => addQuestion('truefalse')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-medium shadow-sm">
              + Trắc nghiệm Đúng / Sai
            </button>
            <button onClick={() => addQuestion('short')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-xs font-medium shadow-sm">
              + Trả lời ngắn
            </button>
            <button onClick={() => addQuestion('number')} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded text-xs font-medium shadow-sm">
              + Điền số
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
// --- 8d. Result Management Sub-component ---
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
                                              <td key={num} className="p-3 text-center min-w-[150px]">
                                                 {attempt ? (
                                                    <div className="bg-blue-50/60 p-1.5 rounded border border-blue-100 shadow-2xs">
                                                       <span className="font-bold text-blue-700 text-base">{attempt.score}đ</span>
                                                       <div className="text-[11px] text-gray-600 mt-0.5 leading-tight font-medium space-y-0.5">
                                                          <p>🕒 {attempt.date}</p>
                                                          {attempt.duration && (
                                                             <p className="text-indigo-600 font-semibold">⏱️ Làm: {attempt.duration}</p>
                                                          )}
                                                       </div>
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
