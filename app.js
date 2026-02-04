// ==========================================
// TRADEMASTER PRO - MAIN APPLICATION
// LocalStorage Backend Simulation
// ==========================================

// Global State
let currentUser = null;
let cart = [];
let courses = [];
let settings = {};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Hide loader
    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
    }, 1000);
    
    // Load data from localStorage
    loadData();
    
    // Render courses
    renderCourses();
    renderDemoVideos();
    updateTicker();
    
    // Check login status
    checkAuthStatus();
    
    // Event listeners
    setupEventListeners();
    
    // Scroll animations
    initScrollAnimations();
}

// Data Management
function loadData() {
    // Load courses from localStorage (admin panel se aayega)
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
                description: "Complete guide to stock market basics, technical analysis, and fundamental analysis for beginners.",
                price: 1999,
                originalPrice: 3999,
                duration: "12 Hours",
                level: "Beginner",
                thumbnail: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=600&q=80",
                status: "published",
                students: 1250,
                videos: [
                    { id: 1, title: "Introduction to Markets", duration: "15:30", type: "demo", url: "" },
                    { id: 2, title: "Types of Orders", duration: "20:00", type: "paid", url: "" },
                    { id: 3, title: "Technical Analysis Basics", duration: "45:00", type: "paid", url: "" }
                ]
            },
            {
                id: 2,
                title: "Advanced Options Trading",
                category: "Options",
                description: "Master options strategies, greeks, and advanced hedging techniques used by professionals.",
                price: 4999,
                originalPrice: 9999,
                duration: "20 Hours",
                level: "Advanced",
                thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80",
                status: "published",
                students: 850,
                videos: [
                    { id: 1, title: "Options Basics", duration: "25:00", type: "demo", url: "" },
                    { id: 2, title: "Call & Put Strategies", duration: "40:00", type: "paid", url: "" }
                ]
            },
            {
                id: 3,
                title: "Forex Trading Mastery",
                category: "Forex",
                description: "Complete forex trading course with currency pair analysis and risk management.",
                price: 3499,
                originalPrice: 6999,
                duration: "15 Hours",
                level: "Intermediate",
                thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80",
                status: "published",
                students: 620,
                videos: [
                    { id: 1, title: "Forex Market Structure", duration: "18:00", type: "demo", url: "" }
                ]
            },
            {
                id: 4,
                title: "Crypto Trading Pro",
                category: "Crypto",
                description: "Learn cryptocurrency trading, blockchain fundamentals, and DeFi strategies.",
                price: 2999,
                originalPrice: 5999,
                duration: "10 Hours",
                level: "Beginner",
                thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80",
                status: "published",
                students: 980,
                videos: [
                    { id: 1, title: "Crypto Fundamentals", duration: "22:00", type: "demo", url: "" }
                ]
            }
        ];
        localStorage.setItem('tm_courses', JSON.stringify(courses));
    }
    
    // Load settings
    const storedSettings = localStorage.getItem('tm_settings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
        // Apply settings to UI
        if (settings.contactPhone) document.getElementById('contactPhone').textContent = settings.contactPhone;
        if (settings.contactEmail) document.getElementById('contactEmail').textContent = settings.contactEmail;
        if (settings.upiId) document.getElementById('upiIdDisplay').textContent = settings.upiId;
    } else {
        settings = {
            upiId: "trademaster@upi",
            merchantName: "TradeMaster Academy",
            contactPhone: "+91 98765 43210",
            contactEmail: "support@trademasterpro.com"
        };
        localStorage.setItem('tm_settings', JSON.stringify(settings));
    }
    
    // Load cart
    const storedCart = localStorage.getItem('tm_cart');
    if (storedCart) cart = JSON.parse(storedCart);
    updateCartUI();
}

// Render Courses
function renderCourses(filter = 'all') {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';
    
    let filteredCourses = courses.filter(c => c.status === 'published');
    if (filter !== 'all') {
        filteredCourses = filteredCourses.filter(c => c.category === filter);
    }
    
    filteredCourses.forEach(course => {
        const demoVideo = course.videos.find(v => v.type === 'demo');
        
        const card = document.createElement('div');
        card.className = 'course-card';
        card.onclick = () => openCourseDetail(course.id);
        card.innerHTML = `
            <div class="course-image">
                <img src="${course.thumbnail}" alt="${course.title}" loading="lazy">
                ${course.students > 1000 ? '<span class="course-badge hot">Bestseller</span>' : ''}
                ${demoVideo ? `
                    <div class="demo-play-btn" onclick="event.stopPropagation(); playDemoVideo(${course.id})">
                        <i class="fas fa-play"></i>
                    </div>
                ` : ''}
            </div>
            <div class="course-content">
                <div class="course-meta">
                    <span><i class="fas fa-signal"></i> ${course.level}</span>
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                </div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-footer">
                    <div class="price-wrap">
                        <span class="current-price">₹${course.price.toLocaleString()}</span>
                        <span class="original-price">₹${course.originalPrice.toLocaleString()}</span>
                    </div>
                    <button class="btn-primary" onclick="event.stopPropagation(); addToCart(${course.id})">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Courses
function filterCourses(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderCourses(category);
}

// Render Demo Videos
function renderDemoVideos() {
    const playlist = document.getElementById('demoPlaylist');
    playlist.innerHTML = '';
    
    courses.forEach(course => {
        const demoVideo = course.videos.find(v => v.type === 'demo');
        if (demoVideo) {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.onclick = () => playDemoVideo(course.id);
            item.innerHTML = `
                <div class="playlist-thumb">
                    <img src="${course.thumbnail}" alt="${course.title}">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="playlist-info">
                    <h4>${demoVideo.title}</h4>
                    <span>${course.title} • ${demoVideo.duration}</span>
                </div>
            `;
            playlist.appendChild(item);
        }
    });
}

// Course Detail Modal
function openCourseDetail(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    document.getElementById('modalCourseImage').src = course.thumbnail;
    document.getElementById('modalCourseBadge').textContent = course.students > 1000 ? 'Bestseller' : 'Popular';
    document.getElementById('modalCourseTitle').textContent = course.title;
    document.getElementById('modalCourseDesc').textContent = course.description;
    document.getElementById('modalCourseLevel').textContent = course.level;
    document.getElementById('modalCourseDuration').textContent = course.duration;
    document.getElementById('modalCourseStudents').textContent = course.students.toLocaleString() + '+ students';
    document.getElementById('modalCoursePrice').textContent = '₹' + course.price.toLocaleString();
    document.getElementById('modalCourseOriginal').textContent = '₹' + course.originalPrice.toLocaleString();
    
    // Render curriculum
    const curriculumList = document.getElementById('curriculumList');
    curriculumList.innerHTML = '';
    course.videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = `curriculum-item ${video.type === 'paid' ? 'locked' : ''}`;
        item.innerHTML = `
            <div>
                <i class="fas ${video.type === 'demo' ? 'fa-play-circle' : 'fa-lock'}"></i>
                <span>${index + 1}. ${video.title}</span>
            </div>
            <span>${video.duration}</span>
        `;
        curriculumList.appendChild(item);
    });
    
    // Set enroll button action
    document.getElementById('enrollBtn').onclick = () => {
        closeCourseModal();
        addToCart(course.id);
    };
    
    document.getElementById('courseModal').classList.add('active');
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('active');
}

// Video Player
function playDemoVideo(courseId) {
    let videoUrl = '';
    let title = '';
    let desc = '';
    
    if (courseId) {
        const course = courses.find(c => c.id === courseId);
        const demoVideo = course.videos.find(v => v.type === 'demo');
        videoUrl = demoVideo.url || '';
        title = demoVideo.title;
        desc = course.description;
    } else {
        // Default demo
        title = "Introduction to Stock Market";
        desc = "Learn the basics of how stock market works";
    }
    
    document.getElementById('videoPlayerTitle').textContent = title;
    document.getElementById('videoPlayerDesc').textContent = desc;
    
    const player = document.getElementById('mainVideoPlayer');
    if (videoUrl) {
        player.src = videoUrl;
        player.load();
    }
    
    document.getElementById('videoModal').classList.add('active');
    
    // Auto play
    setTimeout(() => player.play(), 300);
}

function closeVideoModal() {
    const player = document.getElementById('mainVideoPlayer');
    player.pause();
    player.currentTime = 0;
    document.getElementById('videoModal').classList.remove('active');
}

// Cart Functions
function addToCart(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    if (cart.find(item => item.id === courseId)) {
        alert('Course already in cart!');
        return;
    }
    
    cart.push(course);
    localStorage.setItem('tm_cart', JSON.stringify(cart));
    updateCartUI();
    
    // Show cart sidebar
    document.getElementById('cartSidebar').classList.add('active');
    
    // Animation
    const cartCount = document.querySelector('.cart-count');
    cartCount.style.transform = 'scale(1.5)';
    setTimeout(() => cartCount.style.transform = 'scale(1)', 200);
}

function removeFromCart(courseId) {
    cart = cart.filter(item => item.id !== courseId);
    localStorage.setItem('tm_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = document.getElementById('cartCount');
    const itemsContainer = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    count.textContent = cart.length;
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalEl.textContent = '₹0';
        return;
    }
    
    itemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <div class="price">₹${item.price.toLocaleString()}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        itemsContainer.appendChild(cartItem);
    });
    
    totalEl.textContent = '₹' + total.toLocaleString();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const course = cart[0]; // First item for now
    
    document.getElementById('paymentCourseImage').src = course.thumbnail;
    document.getElementById('paymentCourseName').textContent = course.title;
    document.getElementById('paymentCoursePrice').textContent = '₹' + course.price.toLocaleString();
    document.getElementById('payButtonAmount').textContent = '₹' + course.price.toLocaleString();
    
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function showPaymentDetails(method) {
    document.getElementById('upiDetails').classList.toggle('hidden', method !== 'upi');
    document.getElementById('cardDetails').classList.toggle('hidden', method !== 'card');
}

function copyUpi() {
    const upiId = settings.upiId || 'trademaster@upi';
    navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID copied: ' + upiId);
    });
}

function confirmPayment() {
    alert('In demo mode: Payment would be processed here. In production, integrate Razorpay/Stripe.');
    closePaymentModal();
    cart = [];
    localStorage.setItem('tm_cart', JSON.stringify(cart));
    updateCartUI();
}

// Auth Functions
function showLogin() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLogin() {
    document.getElementById('loginModal').classList.remove('active');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('loginTab').classList.remove('hidden');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('signupTab').classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    
    const users = JSON.parse(localStorage.getItem('tm_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('tm_currentUser', JSON.stringify(user));
        updateAuthUI();
        closeLogin();
        alert('Welcome back, ' + user.name + '!');
    } else {
        alert('Invalid email or password!');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPass').value;
    
    const users = JSON.parse(localStorage.getItem('tm_users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        joined: new Date().toISOString(),
        courses: []
    };
    
    users.push(newUser);
    localStorage.setItem('tm_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('tm_currentUser', JSON.stringify(newUser));
    
    updateAuthUI();
    closeLogin();
    alert('Account created successfully!');
}

function checkAuthStatus() {
    const stored = localStorage.getItem('tm_currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('userName').textContent = currentUser.name;
    } else {
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('tm_currentUser');
    updateAuthUI();
    alert('Logged out successfully!');
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    alert('Message sent! We will contact you soon.');
    e.target.reset();
}

// Utility Functions
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function updateTicker() {
    const ticker = document.getElementById('tickerContent');
    const items = [
        '🔥 Flash Sale: 50% OFF on all courses',
        '⭐ New Course: Algorithmic Trading Masterclass',
        '📈 Join 50,000+ successful traders',
        '🎓 Get certified and boost your career',
        '💬 24/7 Expert support available'
    ];
    
    // Duplicate for seamless loop
    const content = [...items, ...items].map(item => 
        `<div class="ticker-item"><i class="fas fa-bolt"></i> ${item}</div>`
    ).join('');
    
    ticker.innerHTML = content;
}

// Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe elements
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function setupEventListeners() {
    // Close modals on outside click
    window.onclick = function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            if (e.target.id === 'videoModal') closeVideoModal();
        }
    };
}

// Real-time updates from admin
window.addEventListener('storage', function(e) {
    if (e.key === 'tm_courses') {
        courses = JSON.parse(e.newValue);
        renderCourses();
        renderDemoVideos();
    }
    if (e.key === 'tm_settings') {
        settings = JSON.parse(e.newValue);
        if (settings.contactPhone) document.getElementById('contactPhone').textContent = settings.contactPhone;
        if (settings.contactEmail) document.getElementById('contactEmail').textContent = settings.contactEmail;
    }
});
