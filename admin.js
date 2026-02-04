// ==========================================
// TRADEMASTER PRO - ADMIN PANEL
// Complete Backend Simulation with LocalStorage
// ==========================================

// Global State
let currentAdmin = null;
let courses = [];
let students = [];
let settings = {};
let currentEditingId = null;
let currentCourseId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupEventListeners();
});

// Check Admin Auth
function checkAdminAuth() {
    const admin = localStorage.getItem('tm_admin');
    const isLoggedIn = localStorage.getItem('tm_admin_loggedin');
    
    if (admin && isLoggedIn === 'true') {
        currentAdmin = JSON.parse(admin);
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update admin info
    document.getElementById('adminNameDisplay').textContent = currentAdmin.name;
    
    // Load all data
    loadAllData();
    updateStats();
    renderCourses();
    renderRecentData();
}

// Login Tab Switch
function switchLoginTab(tab) {
    document.querySelectorAll('.login-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('adminLoginForm').classList.remove('hidden');
        document.getElementById('adminSignupForm').classList.add('hidden');
    } else {
        document.getElementById('adminLoginForm').classList.add('hidden');
        document.getElementById('adminSignupForm').classList.remove('hidden');
    }
}

// Admin Login
function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    
    const admins = JSON.parse(localStorage.getItem('tm_admins') || '[]');
    const admin = admins.find(a => a.email === email && a.password === password);
    
    if (admin) {
        currentAdmin = admin;
        localStorage.setItem('tm_admin', JSON.stringify(admin));
        localStorage.setItem('tm_admin_loggedin', 'true');
        showDashboard();
    } else {
        alert('Invalid credentials!');
    }
}

// Admin Signup
function handleAdminSignup(e) {
    e.preventDefault();
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPass').value;
    const confirm = document.getElementById('adminPassConfirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    let admins = JSON.parse(localStorage.getItem('tm_admins') || '[]');
    
    if (admins.find(a => a.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    const newAdmin = {
        id: Date.now(),
        name,
        email,
        password,
        created: new Date().toISOString()
    };
    
    admins.push(newAdmin);
    localStorage.setItem('tm_admins', JSON.stringify(admins));
    
    currentAdmin = newAdmin;
    localStorage.setItem('tm_admin', JSON.stringify(newAdmin));
    localStorage.setItem('tm_admin_loggedin', 'true');
    
    alert('Admin account created successfully!');
    showDashboard();
}

// Logout
function logout() {
    localStorage.removeItem('tm_admin_loggedin');
    currentAdmin = null;
    showLogin();
}

// Load All Data
function loadAllData() {
    // Courses
    const storedCourses = localStorage.getItem('tm_courses');
    if (storedCourses) {
        courses = JSON.parse(storedCourses);
    } else {
        // Default courses
        courses = [
            {
                id: 1,
                title: "Stock Market Fundamentals",
                category: "Stock Market",
                description: "Complete guide to stock market basics",
                price: 1999,
                originalPrice: 3999,
                duration: "12 Hours",
                level: "Beginner",
                thumbnail: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600&q=80",
                status: "published",
                students: 1250,
                videos: []
            }
        ];
        saveCourses();
    }
    
    // Students
    const storedStudents = localStorage.getItem('tm_students');
    students = storedStudents ? JSON.parse(storedStudents) : [];
    
    // Settings
    const storedSettings = localStorage.getItem('tm_settings');
    settings = storedSettings ? JSON.parse(storedSettings) : {
        upiId: "trademaster@upi",
        merchantName: "TradeMaster Academy",
        contactPhone: "+91 98765 43210",
        contactEmail: "support@trademasterpro.com",
        siteTitle: "TradeMaster Pro"
    };
}

// Save Data
function saveCourses() {
    localStorage.setItem('tm_courses', JSON.stringify(courses));
    // Trigger update in main website
    window.dispatchEvent(new StorageEvent('storage', { key: 'tm_courses' }));
}

function saveSettings() {
    localStorage.setItem('tm_settings', JSON.stringify(settings));
    window.dispatchEvent(new StorageEvent('storage', { key: 'tm_settings' }));
}

// Update Stats
function updateStats() {
    const totalCourses = courses.length;
    const totalVideos = courses.reduce((sum, c) => sum + (c.videos ? c.videos.length : 0), 0);
    const totalStudents = students.length;
    const totalRevenue = students.reduce((sum, s) => sum + (s.totalSpent || 0), 0);
    
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('totalVideos').textContent = totalVideos;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString();
}

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.sidebar-nav a').forEach(link => link.classList.remove('active'));
    
    // Show selected
    document.getElementById(section + 'Section').classList.remove('hidden');
    event.target.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'courses': 'Manage Courses',
        'videos': 'Manage Videos',
        'students': 'Students',
        'payments': 'Payment Settings',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    // Load section data
    if (section === 'courses') renderCourses();
    if (section === 'videos') initVideosSection();
    if (section === 'students') renderStudents();
    if (section === 'payments') loadPaymentSettings();
    if (section === 'settings') loadSettings();
}

// COURSES MANAGEMENT
function renderCourses() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';
    
    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="course-cell">
                    <img src="${course.thumbnail}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/60x40'">
                    <div>
                        <div style="font-weight: 600;">${course.title}</div>
                        <div style="font-size: 0.85rem; color: var(--gray);">${course.level} • ${course.duration}</div>
                    </div>
                </div>
            </td>
            <td>${course.category}</td>
            <td>
                <div style="font-weight: 700; color: var(--primary);">₹${course.price.toLocaleString()}</div>
                <div style="font-size: 0.85rem; text-decoration: line-through; color: var(--gray);">₹${course.originalPrice.toLocaleString()}</div>
            </td>
            <td>${course.videos ? course.videos.length : 0} videos</td>
            <td>
                <span class="status-badge ${course.status === 'published' ? 'status-published' : 'status-draft'}">
                    ${course.status === 'published' ? 'Published' : 'Draft'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editCourse(${course.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCourse(${course.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openCourseModal() {
    currentEditingId = null;
    document.getElementById('courseModalTitle').textContent = 'Add New Course';
    document.getElementById('courseForm').reset();
    document.getElementById('thumbnailPreview').innerHTML = '';
    document.getElementById('courseModal').classList.add('active');
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('active');
}

function editCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    currentEditingId = id;
    document.getElementById('courseModalTitle').textContent = 'Edit Course';
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseCategory').value = course.category;
    document.getElementById('courseDesc').value = course.description;
    document.getElementById('coursePrice').value = course.price;
    document.getElementById('courseOriginalPrice').value = course.originalPrice;
    document.getElementById('courseDuration').value = course.duration;
    document.getElementById('courseLevel').value = course.level;
    document.getElementById('courseThumbnailUrl').value = course.thumbnail;
    
    if (course.thumbnail) {
        document.getElementById('thumbnailPreview').innerHTML = `<img src="${course.thumbnail}" alt="Preview">`;
    }
    
    document.getElementById('courseModal').classList.add('active');
}

function saveCourse(e) {
    e.preventDefault();
    
    const thumbnailFile = document.getElementById('courseThumbnailFile').files[0];
    const thumbnailUrl = document.getElementById('courseThumbnailUrl').value;
    
    const courseData = {
        id: currentEditingId || Date.now(),
        title: document.getElementById('courseTitle').value,
        category: document.getElementById('courseCategory').value,
        description: document.getElementById('courseDesc').value,
        price: parseInt(document.getElementById('coursePrice').value),
        originalPrice: parseInt(document.getElementById('courseOriginalPrice').value),
        duration: document.getElementById('courseDuration').value,
        level: document.getElementById('courseLevel').value,
        status: 'published',
        students: currentEditingId ? (courses.find(c => c.id === currentEditingId)?.students || 0) : 0,
        videos: currentEditingId ? (courses.find(c => c.id === currentEditingId)?.videos || []) : []
    };
    
    // Handle thumbnail
    if (thumbnailFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            courseData.thumbnail = e.target.result;
            finalizeSave(courseData);
        };
        reader.readAsDataURL(thumbnailFile);
    } else {
        courseData.thumbnail = thumbnailUrl || 'https://via.placeholder.com/600x400';
        finalizeSave(courseData);
    }
}

function finalizeSave(courseData) {
    if (currentEditingId) {
        const index = courses.findIndex(c => c.id === currentEditingId);
        courses[index] = courseData;
    } else {
        courses.push(courseData);
    }
    
    saveCourses();
    closeCourseModal();
    renderCourses();
    updateStats();
    alert('Course saved successfully!');
}

function deleteCourse(id) {
    if (!confirm('Are you sure? This will delete the course and all its videos!')) return;
    
    courses = courses.filter(c => c.id !== id);
    saveCourses();
    renderCourses();
    updateStats();
}

function searchCourses() {
    const term = document.getElementById('courseSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#coursesTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// VIDEOS MANAGEMENT
function initVideosSection() {
    const select = document.getElementById('courseFilter');
    select.innerHTML = '<option value="">Select Course to Manage Videos</option>';
    
    courses.forEach(course => {
        select.innerHTML += `<option value="${course.id}">${course.title}</option>`;
    });
    
    // Reset view
    document.getElementById('videosManagement').innerHTML = `
        <div class="video-upload-area">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Select a course to manage videos</h3>
            <p>Choose a course from the dropdown above</p>
        </div>
    `;
}

function loadCourseVideos() {
    const courseId = parseInt(document.getElementById('courseFilter').value);
    currentCourseId = courseId;
    
    if (!courseId) {
        initVideosSection();
        return;
    }
    
    const course = courses.find(c => c.id === courseId);
    const container = document.getElementById('videosManagement');
    
    let videosHtml = '<div class="video-list">';
    
    if (course.videos && course.videos.length > 0) {
        course.videos.forEach((video, index) => {
            videosHtml += `
                <div class="video-item">
                    <div class="video-thumb">
                        ${video.thumbnail ? `<img src="${video.thumbnail}" alt="">` : '<i class="fas fa-play-circle"></i>'}
                        ${video.url ? `<video src="${video.url}" preload="metadata"></video>` : ''}
                    </div>
                    <div class="video-info">
                        <h4>${video.title}</h4>
                        <div class="video-meta">
                            <span><i class="fas fa-clock"></i> ${video.duration}</span>
                            <span class="badge ${video.type === 'demo' ? 'free' : 'paid'}">${video.type === 'demo' ? 'Free Demo' : 'Paid'}</span>
                        </div>
                    </div>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="previewVideo(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteVideo(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        videosHtml += '<p style="text-align: center; color: var(--gray); padding: 40px;">No videos uploaded yet</p>';
    }
    
    videosHtml += '</div>';
    container.innerHTML = videosHtml;
}

function openVideoModal() {
    if (!currentCourseId) {
        alert('Please select a course first!');
        return;
    }
    document.getElementById('videoModal').classList.add('active');
    setupDragDrop();
}

function closeVideoModal() {
    document.getElementById('videoModal').classList.remove('active');
    document.getElementById('videoForm').reset();
    document.getElementById('uploadProgress').classList.add('hidden');
    document.getElementById('videoPreview').classList.add('hidden');
    document.getElementById('progressFill').style.width = '0%';
}

function setupDragDrop() {
    const dropZone = document.getElementById('videoDropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        document.getElementById('videoFile').files = files;
        handleVideoSelect(files[0]);
    }
    
    document.getElementById('videoFile').addEventListener('change', function() {
        if (this.files[0]) handleVideoSelect(this.files[0]);
    });
}

function handleVideoSelect(file) {
    // Validate
    if (file.size > 100 * 1024 * 1024) {
        alert('File too large! Max 100MB allowed.');
        return;
    }
    
    // Show preview
    const url = URL.createObjectURL(file);
    const preview = document.getElementById('videoPreview');
    preview.innerHTML = `<video src="${url}" controls></video>`;
    preview.classList.remove('hidden');
    
    // Auto detect duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const duration = formatDuration(video.duration);
        document.getElementById('videoDuration').value = duration;
    };
    video.src = url;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function saveVideo(e) {
    e.preventDefault();
    
    const file = document.getElementById('videoFile').files[0];
    const title = document.getElementById('videoTitle').value;
    const type = document.getElementById('videoType').value;
    const duration = document.getElementById('videoDuration').value;
    const description = document.getElementById('videoDesc').value;
    
    if (!file) {
        alert('Please select a video file!');
        return;
    }
    
    // Show progress
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    progressDiv.classList.remove('hidden');
    
    // Read file as base64
    const reader = new FileReader();
    
    reader.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = percent + '%';
        }
    };
    
    reader.onload = function(e) {
        const videoData = {
            id: Date.now(),
            title,
            type,
            duration,
            description,
            url: e.target.result, // Base64 encoded video
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploaded: new Date().toISOString()
        };
        
        // Add to course
        const course = courses.find(c => c.id === currentCourseId);
        if (!course.videos) course.videos = [];
        course.videos.push(videoData);
        
        saveCourses();
        
        setTimeout(() => {
            closeVideoModal();
            loadCourseVideos();
            updateStats();
            alert('Video uploaded successfully!');
        }, 500);
    };
    
    reader.readAsDataURL(file);
}

function previewVideo(index) {
    const course = courses.find(c => c.id === currentCourseId);
    const video = course.videos[index];
    
    if (video.url) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>${video.title}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 0;">
                    <video src="${video.url}" controls style="width: 100%; display: block;"></video>
                </div>
                <div style="padding: 20px;">
                    <p>${video.description || 'No description'}</p>
                    <p style="color: var(--gray); font-size: 0.9rem; margin-top: 10px;">
                        Duration: ${video.duration} | Type: ${video.type} | Size: ${video.size}
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

function deleteVideo(index) {
    if (!confirm('Delete this video?')) return;
    
    const course = courses.find(c => c.id === currentCourseId);
    course.videos.splice(index, 1);
    saveCourses();
    loadCourseVideos();
    updateStats();
}

// STUDENTS MANAGEMENT
function renderStudents() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--gray);">No students registered yet</td></tr>';
        return;
    }
    
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${student.name}</div>
                        <div style="font-size: 0.85rem; color: var(--gray);">${student.phone || 'No phone'}</div>
                    </div>
                </div>
            </td>
            <td>${student.email}</td>
            <td>${student.courses ? student.courses.length : 0} courses</td>
            <td>${new Date(student.joined).toLocaleDateString()}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="viewStudent(${student.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewStudent(id) {
    const student = students.find(s => s.id === id);
    alert(`Student: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone || 'N/A'}\nJoined: ${new Date(student.joined).toLocaleDateString()}`);
}

// PAYMENT SETTINGS
function loadPaymentSettings() {
    document.getElementById('upiId').value = settings.upiId || '';
    document.getElementById('merchantName').value = settings.merchantName || '';
    document.getElementById('bankHolder').value = settings.bankHolder || '';
    document.getElementById('bankAccount').value = settings.bankAccount || '';
    document.getElementById('bankIfsc').value = settings.bankIfsc || '';
    document.getElementById('bankName').value = settings.bankName || '';
    
    if (settings.upiQr) {
        document.getElementById('upiQrPreview').innerHTML = `<img src="${settings.upiQr}" alt="QR Code">`;
    }
}

function savePaymentSettings() {
    settings.upiId = document.getElementById('upiId').value;
    settings.merchantName = document.getElementById('merchantName').value;
    
    const qrFile = document.getElementById('upiQrFile').files[0];
    if (qrFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            settings.upiQr = e.target.result;
            finalizePaymentSave();
        };
        reader.readAsDataURL(qrFile);
    } else {
        finalizePaymentSave();
    }
}

function finalizePaymentSave() {
    saveSettings();
    alert('Payment settings saved!');
}

function saveBankSettings() {
    settings.bankHolder = document.getElementById('bankHolder').value;
    settings.bankAccount = document.getElementById('bankAccount').value;
    settings.bankIfsc = document.getElementById('bankIfsc').value;
    settings.bankName = document.getElementById('bankName').value;
    saveSettings();
    alert('Bank details saved!');
}

// WEBSITE SETTINGS
function loadSettings() {
    document.getElementById('siteTitle').value = settings.siteTitle || '';
    document.getElementById('siteEmail').value = settings.contactEmail || '';
    document.getElementById('sitePhone').value = settings.contactPhone || '';
    document.getElementById('siteAddress').value = settings.siteAddress || '';
}

function saveSiteSettings() {
    settings.siteTitle = document.getElementById('siteTitle').value;
    settings.contactEmail = document.getElementById('siteEmail').value;
    settings.contactPhone = document.getElementById('sitePhone').value;
    settings.siteAddress = document.getElementById('siteAddress').value;
    saveSettings();
    alert('Site settings saved!');
}

function saveAppearance() {
    alert('Appearance settings would be applied!');
}

// REFRESH DATA
function refreshData() {
    loadAllData();
    updateStats();
    renderCourses();
    alert('Data refreshed!');
}

// RECENT DATA
function renderRecentData() {
    // Recent courses
    const recentCourses = document.getElementById('recentCoursesList');
    recentCourses.innerHTML = '';
    courses.slice(-3).reverse().forEach(course => {
        recentCourses.innerHTML += `
            <div class="course-item">
                <img src="${course.thumbnail}" alt="">
                <div>
                    <h4>${course.title}</h4>
                    <span>₹${course.price.toLocaleString()} • ${course.students} students</span>
                </div>
            </div>
        `;
    });
    
    // Recent students
    const recentStudents = document.getElementById('recentStudentsList');
    recentStudents.innerHTML = '';
    students.slice(-3).reverse().forEach(student => {
        recentStudents.innerHTML += `
            <div class="student-item">
                <div style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                    ${student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4>${student.name}</h4>
                    <span>${student.email}</span>
                </div>
            </div>
        `;
    });
}

// Setup listeners
function setupEventListeners() {
    // Enter key on login
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.getElementById('loginScreen').classList.contains('hidden')) {
            if (!document.getElementById('adminLoginForm').classList.contains('hidden')) {
                handleAdminLogin(e);
            }
        }
    });
}

// Storage event for real-time sync
window.addEventListener('storage', function(e) {
    if (e.key === 'tm_courses') {
        courses = JSON.parse(e.newValue);
        renderCourses();
        updateStats();
    }
});
