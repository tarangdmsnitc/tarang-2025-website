// DOM Elements
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const typingText = document.getElementById('typing-text');
const particlesContainer = document.getElementById('particles');

// Global state
let isInitialized = false;

//Particle Manager
function initParticleSystem() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.currentOpacity = this.opacity;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      // Wrap
      if(this.x > canvas.width) this.x = 0;
      if(this.x < 0) this.x = canvas.width;
      if(this.y > canvas.height) this.y = 0;
      if(this.y < 0) this.y = canvas.height;
      this.pulsePhase += this.pulseSpeed;
      this.currentOpacity = Math.max(0.1, this.opacity + Math.sin(this.pulsePhase) * 0.3);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      gradient.addColorStop(0, '#32b8c5');
      gradient.addColorStop(0.5, 'rgba(50,184,197,1)');
      gradient.addColorStop(1, 'rgba(50,184,197,0.5)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = '#32b8c5';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Responsive # of particles!
  function getCount() {
    return Math.min(80, Math.floor(canvas.width * canvas.height / 12000));
  }

  let particles = [];
  function createParticles() {
    let n = getCount();
    particles = [];
    for(let i=0;i<n;i++) particles.push(new Particle());
  }
  createParticles();
  window.addEventListener('resize', createParticles);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p=>{ p.update(); p.draw(); });
    // Connect nearby particles
    for(let i=0;i<particles.length;i++) {
      for(let j=i+1;j<particles.length;j++) {
        let a = particles[i], b = particles[j];
        let d = Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
        if(d < 120) {
          ctx.save();
          ctx.globalAlpha = (120-d)/120*0.6;
          ctx.strokeStyle = '#32b8c5';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}


// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update theme icon
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-moon';
            } else {
                themeIcon.className = 'fas fa-sun';
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Navigation Management
class NavigationManager {
    constructor() {
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleLinkClick(e);
                if (this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav && !nav.contains(e.target) && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle scroll events
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
        if (navToggle) {
            navToggle.classList.toggle('active');
        }
        console.log('Menu toggled:', this.isMenuOpen);
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (navToggle) {
            navToggle.classList.remove('active');
        }
    }

    handleLinkClick(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href') || e.target.closest('a').getAttribute('href');
        const targetId = href;
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    handleScroll() {
        // Add/remove nav background on scroll
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        // Update active navigation link
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }
}

// Typing Animation
class TypingAnimation {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
        this.isDeleting = false;
        this.currentText = '';
        this.init();
    }

    init() {
        if (!this.element) return;
        this.element.textContent = '';
        this.type();
    }

    type() {
        if (!this.element) return;

        if (!this.isDeleting) {
            this.currentText = this.text.substring(0, this.index + 1);
            this.index++;
        } else {
            this.currentText = this.text.substring(0, this.index - 1);
            this.index--;
        }

        this.element.textContent = this.currentText;

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed = this.speed / 2;
        }

        if (!this.isDeleting && this.index === this.text.length) {
            // Finished typing - pause before deleting
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.index === 0) {
            // Finished deleting - pause before typing again
            this.isDeleting = false;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Particle System
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.particleCount = this.getParticleCount();
        this.init();
    }

    getParticleCount() {
        if (window.innerWidth < 768) return 15;
        if (window.innerWidth < 1024) return 25;
        return 40;
    }

    init() {
        if (!this.container) return;
        this.createParticles();
        window.addEventListener('resize', () => this.handleResize());
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    handleResize() {
        const newParticleCount = this.getParticleCount();
        
        if (newParticleCount < this.particles.length) {
            const excess = this.particles.length - newParticleCount;
            for (let i = 0; i < excess; i++) {
                const particle = this.particles.pop();
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }
        } else if (newParticleCount > this.particles.length) {
            const needed = newParticleCount - this.particles.length;
            for (let i = 0; i < needed; i++) {
                this.createParticle();
            }
        }
    }
}

// Counter Animation
class CounterAnimation {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = parseInt(target);
        this.duration = duration;
        this.startTime = null;
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated || !this.element) return;
        this.hasAnimated = true;
        this.startTime = performance.now();
        this.updateCounter();
    }

    updateCounter() {
        if (!this.element) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const easedProgress = this.easeOutCubic(progress);
        const currentValue = Math.floor(this.target * easedProgress);
        
        this.element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(() => this.updateCounter());
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Statistics Manager
class StatisticsManager {
    constructor() {
        this.counters = [];
        this.hasTriggered = false;
        this.init();
    }

    init() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            if (target && !isNaN(target)) {
                element.textContent = '0'; // Start at 0
                const counter = new CounterAnimation(element, target);
                this.counters.push(counter);
            }
        });

        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.3,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasTriggered) {
                    this.hasTriggered = true;
                    setTimeout(() => {
                        this.counters.forEach(counter => counter.animate());
                    }, 500);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('[data-aos]').forEach(element => {
            this.observer.observe(element);
        });
    }

    animateElement(element) {
        const animationType = element.getAttribute('data-aos');
        const delay = element.getAttribute('data-aos-delay') || 0;
        
        setTimeout(() => {
            element.classList.add('aos-animate');
            
            switch (animationType) {
                case 'fade-up':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-down':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-left':
                case 'slide-right':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'fade-right':
                case 'slide-left':
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    break;
                case 'slide-up':
                    element.style.transform = 'translateY(0)';
                    element.style.opacity = '1';
                    break;
                case 'zoom-in':
                case 'flip-left':
                case 'flip-right':
                case 'flip-up':
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                    break;
                default:
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
            }
        }, parseInt(delay));
    }
}

// Button Manager
class ButtonManager {
    constructor() {
        this.init();
    }

    init() {
        // Handle all button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonClick(e, button);
            }
        });
    }

    handleButtonClick(e, button) {
        // Create ripple effect
        this.createRipple(e, button);
        
        // Handle specific button actions
        const buttonText = button.textContent.toLowerCase();
        
        if (buttonText.includes('register')) {
            this.handleRegistration();
        } else if (buttonText.includes('watch') || buttonText.includes('promo')) {
            this.handleVideoPlay();
        } else if (buttonText.includes('learn more')) {
            this.handleLearnMore(button);
        } else if (buttonText.includes('book workshop')) {
            this.handleWorkshopBooking(button);
        }
    }

    createRipple(e, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    handleRegistration() {
        this.showNotification('Registration form will open soon!', 'success');
    }

    handleVideoPlay() {
        this.showNotification('Promo video will be available soon!', 'info');
    }

    handleLearnMore(button) {
        const card = button.closest('.event-card');
        const title = card ? card.querySelector('h3').textContent : 'Event';
        this.showNotification(`More details about "${title}" coming soon!`, 'info');
    }

    handleWorkshopBooking(button) {
        const card = button.closest('.workshop-card');
        const title = card ? card.querySelector('h3').textContent : 'Workshop';
        this.showNotification(`will open soon!`, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Manual close
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'warning': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    }
}

// Initialize everything when DOM is ready
function initializeApp() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('Initializing TARANG 2025 application...');

    // Initialize all managers
    const themeManager = new ThemeManager();
    const navigationManager = new NavigationManager();
    const scrollAnimations = new ScrollAnimations();
    const statisticsManager = new StatisticsManager();
    const buttonManager = new ButtonManager();

    // Initialize particle system
    if (particlesContainer) {
        const particleSystem = new ParticleSystem(particlesContainer);
    }
    // Initialize canvas particle system
    initParticleSystem();

    // Initialize typing animation
    if (typingText) {
        new TypingAnimation(typingText, 'Navigate the Future of Management', 150);
    }

    // Set up initial animation states
    document.querySelectorAll('[data-aos]').forEach(element => {
        const animationType = element.getAttribute('data-aos');
        element.style.opacity = '0';
        element.style.transition = 'all 0.8s ease';
        
        switch (animationType) {
            case 'fade-up':
                element.style.transform = 'translateY(30px)';
                break;
            case 'fade-down':
                element.style.transform = 'translateY(-30px)';
                break;
            case 'fade-left':
            case 'slide-right':
                element.style.transform = 'translateX(-30px)';
                break;
            case 'fade-right':
            case 'slide-left':
                element.style.transform = 'translateX(30px)';
                break;
            case 'slide-up':
                element.style.transform = 'translateY(50px)';
                break;
            case 'zoom-in':
            case 'flip-left':
            case 'flip-right':
            case 'flip-up':
                element.style.transform = 'scale(0.8)';
                break;
            default:
                element.style.transform = 'translateY(30px)';
        }
    });
    console.log('TARANG 2025 application initialized successfully!');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Add notification styles
const notificationCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    max-width: 400px;
    transform: translateX(100%);
    opacity: 0;
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification--success {
    border-left: 4px solid var(--primary-color);
}

.notification--info {
    border-left: 4px solid #3b82f6;
}

.notification--warning {
    border-left: 4px solid var(--accent-color);
}

.notification--error {
    border-left: 4px solid #ef4444;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex: 1;
}

.notification-content i {
    color: var(--primary-color);
    font-size: 1.25rem;
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 1rem;
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.notification-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

@media (max-width: 768px) {
    .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

// Add styles to document
const styleElement = document.createElement('style');
styleElement.textContent = notificationCSS;
document.head.appendChild(styleElement);