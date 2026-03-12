/* ==========================================================================
   METHOD MEDIA — ENTERPRISE AGREEMENT PORTAL
   Frontend Application — Full Master Instruction Set Implementation
   ========================================================================== */

'use strict';

/* --- STATE ---------------------------------------------------------------- */
const state = {
    currentPage: 'landing',
    userName: '',
    userToken: '',
    waxSealImage: '',
    preferences: {},
    cloudHistory: [],
    currentStageIndex: 0,
    agreementData: {},
    registerSigPad: null,
    loginSigPad: null,
    agreementSigPad: null,
    usingPasswordBackup: false,
    premiereUsers: 5,
    premiereNeedsLogins: false
};

/* --- PARTICLE BACKGROUND -------------------------------------------------- */
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    let mouseX = W / 2, mouseY = H / 2;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2.0 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * Math.PI * 2,
        hue: Math.floor(Math.random() * 3),
        colors: ['rgba(245,200,66,', 'rgba(0,229,255,', 'rgba(168,85,247,']
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Mouse nebula glow
        const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
        grd.addColorStop(0, 'rgba(168,85,247,0.08)');
        grd.addColorStop(0.5, 'rgba(0,229,255,0.04)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        particles.forEach(p => {
            const dx = mouseX - p.x, dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                p.vx += dx * 0.00004;
                p.vy += dy * 0.00004;
            }
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 0.8) { p.vx *= 0.8 / speed; p.vy *= 0.8 / speed; }

            p.x += p.vx; p.y += p.vy;
            p.a += 0.006;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            const alpha = (Math.sin(p.a) * 0.4 + 0.5) * 0.75;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.colors[p.hue] + alpha + ')';
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });
})();

/* --- PARALLAX / PSYCHEDELIC HERO ----------------------------------------- */
(function initParallax() {
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    let hueShift = 0;

    document.addEventListener('mousemove', e => {
        targetX = (e.clientX / window.innerWidth  - 0.5) * 30;
        targetY = (e.clientY / window.innerHeight - 0.5) * 20;
        hueShift = (e.clientX / window.innerWidth) * 60;
    });

    function loop() {
        curX += (targetX - curX) * 0.06;
        curY += (targetY - curY) * 0.06;

        const hero = document.querySelector('.landing-hero');
        const rings = document.querySelectorAll('.outer-ring');
        const mascotWrap = document.querySelector('.mascot-seal-wrapper');

        if (hero) {
            hero.style.transform = `translate(${curX * 0.3}px, ${curY * 0.2}px)`;
        }
        if (mascotWrap) {
            mascotWrap.style.transform = `translate(${curX * 0.6}px, ${curY * 0.5}px)`;
        }

        rings.forEach((ring, i) => {
            const depth = (i + 1) * 0.25;
            ring.style.transform = `translate(-50%, -50%) translate(${curX * depth}px, ${curY * depth}px)`;
            const h = Math.round(hueShift + i * 20) % 360;
            ring.style.boxShadow = `0 0 ${18 + i * 8}px hsla(${h},90%,60%,0.4), inset 0 0 ${10 + i * 5}px hsla(${h},90%,60%,0.15)`;
        });

        requestAnimationFrame(loop);
    }
    loop();
})();

/* --- PAGE NAVIGATION ------------------------------------------------------ */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    state.currentPage = pageId;
}

/* ==========================================================================
   CLOUD CONFIGURATION TREE — Structured Pricing Engine
   All prices use: oneTimeMin, oneTimeMax, monthlyMin, monthlyMax,
                   hourly, perUserMonthly, percentOfOneTime
   ========================================================================== */

const cloudTree = [
    {
        id: 'project-type',
        title: 'What Are We Building?',
        icon: '🏗️',
        description: 'Select the primary type of solution you need. This determines your base package and pricing structure.',
        options: [
            {
                id: 'simple-website',
                icon: '🌐',
                title: 'Simple Website Build',
                price: '$1,800 – $6,500 CAD',
                nextStage: 'website-type',
                details: 'Professional website tailored for Alberta businesses. Includes design, content integration, mobile optimization, and launch.',
                oneTimeMin: 1800, oneTimeMax: 6500, monthlyMin: 0, monthlyMax: 0, basePrice: 3500, baseMonthly: 0
            },
            {
                id: 'web-app',
                icon: '💻',
                title: 'Web Application',
                price: '$9,500 – $22,000 CAD',
                nextStage: 'hosting',
                details: 'Responsive web app with backend API, database, authentication, and custom UI. Fully deployable on any browser.',
                oneTimeMin: 9500, oneTimeMax: 22000, monthlyMin: 0, monthlyMax: 0, basePrice: 15000, baseMonthly: 0
            },
            {
                id: 'server-it',
                icon: '🖥️',
                title: 'Server & IT Setup',
                price: '$2,500 – $12,000 CAD',
                nextStage: 'server-type',
                details: 'Complete server infrastructure, network configuration, and IT systems for your business operations.',
                oneTimeMin: 2500, oneTimeMax: 12000, monthlyMin: 0, monthlyMax: 0, basePrice: 6000, baseMonthly: 0
            },
            {
                id: 'startup-design',
                icon: '🚀',
                title: 'Startup Business Design',
                price: '$3,200 – $9,500 CAD',
                nextStage: 'startup-type',
                details: 'Complete brand identity package for new businesses: name, logo, slogan, and psychologically-engineered icon/symbol.',
                oneTimeMin: 3200, oneTimeMax: 9500, monthlyMin: 0, monthlyMax: 0, basePrice: 5500, baseMonthly: 0
            },
            {
                id: 'mobile-app',
                icon: '📱',
                title: 'Native Mobile App',
                price: '$18,500 – $34,000 CAD',
                nextStage: 'hosting',
                details: 'iOS & Android with full device access. Includes App Store & Play Store submission support.',
                oneTimeMin: 18500, oneTimeMax: 34000, monthlyMin: 0, monthlyMax: 0, basePrice: 26000, baseMonthly: 0
            },
            {
                id: 'ecommerce',
                icon: '🛒',
                title: 'E-Commerce Platform',
                price: '$12,500 – $28,000 CAD',
                nextStage: 'hosting',
                details: 'Full online store with payment processing, inventory management, shipping integration, and analytics.',
                oneTimeMin: 12500, oneTimeMax: 28000, monthlyMin: 0, monthlyMax: 0, basePrice: 20000, baseMonthly: 0
            },
            {
                id: 'enterprise',
                icon: '🏢',
                title: 'Enterprise Suite',
                price: '$28,000 – $65,000 CAD',
                nextStage: 'hosting',
                details: 'Multi-module enterprise system: CRM, ERP, HR portal, analytics dashboard. Fully custom-built.',
                oneTimeMin: 28000, oneTimeMax: 65000, monthlyMin: 0, monthlyMax: 0, basePrice: 45000, baseMonthly: 0
            }
        ]
    },

    /* —— WEBSITE BUILD PATH —— */
    {
        id: 'website-type',
        title: 'Website Type & Scope',
        icon: '🌐',
        description: 'Choose the scope and functionality of your website. All options include mobile-responsive design.',
        options: [
            {
                id: 'landing-page',
                icon: '📄',
                title: 'Landing Page / Single Page',
                price: '$1,800 – $2,800 CAD',
                nextStage: 'website-features',
                details: 'High-impact single-page site. Perfect for campaigns, promos, or simple business presence. Fast turnaround.',
                oneTimeMin: 1800, oneTimeMax: 2800, monthlyMin: 0, monthlyMax: 0, basePrice: 2200, baseMonthly: 0
            },
            {
                id: 'business-site',
                icon: '🏪',
                title: 'Business Website (5-10 pages)',
                price: '$2,800 – $4,500 CAD',
                nextStage: 'website-features',
                details: 'Full business site: Home, About, Services, Portfolio, Contact. SEO-optimized, analytics included.',
                oneTimeMin: 2800, oneTimeMax: 4500, monthlyMin: 0, monthlyMax: 0, basePrice: 3500, baseMonthly: 0
            },
            {
                id: 'portfolio-site',
                icon: '🎨',
                title: 'Portfolio / Creative Site',
                price: '$2,200 – $3,800 CAD',
                nextStage: 'website-features',
                details: 'Visually striking portfolio or creative showcase. Gallery, project detail pages, contact form.',
                oneTimeMin: 2200, oneTimeMax: 3800, monthlyMin: 0, monthlyMax: 0, basePrice: 3000, baseMonthly: 0
            },
            {
                id: 'restaurant-site',
                icon: '🍽️',
                title: 'Restaurant / Hospitality Site',
                price: '$2,500 – $4,200 CAD',
                nextStage: 'website-features',
                details: 'Menu display, online reservations, gallery, hours, location. Built for food & hospitality businesses.',
                oneTimeMin: 2500, oneTimeMax: 4200, monthlyMin: 0, monthlyMax: 0, basePrice: 3200, baseMonthly: 0
            },
            {
                id: 'blog-cms',
                icon: '✍️',
                title: 'Blog / CMS Website',
                price: '$3,200 – $5,500 CAD',
                nextStage: 'website-features',
                details: 'Content management system allowing you to add/edit posts. Categories, tags, author management.',
                oneTimeMin: 3200, oneTimeMax: 5500, monthlyMin: 0, monthlyMax: 0, basePrice: 4200, baseMonthly: 0
            },
            {
                id: 'booking-site',
                icon: '📅',
                title: 'Booking / Appointment Site',
                price: '$3,800 – $6,500 CAD',
                nextStage: 'website-features',
                details: 'Online booking system with calendar, service selection, client management, email confirmations.',
                oneTimeMin: 3800, oneTimeMax: 6500, monthlyMin: 0, monthlyMax: 0, basePrice: 5000, baseMonthly: 0
            }
        ]
    },
    {
        id: 'website-features',
        title: 'Website Add-On Features',
        icon: '⚡',
        description: 'Enhance your website with additional functionality. Select the most valuable add-on for your needs.',
        options: [
            {
                id: 'seo-package',
                icon: '🔍',
                title: 'SEO & Google Analytics Package',
                price: '+$450 CAD',
                nextStage: 'maintenance',
                details: 'Full on-page SEO optimization, Google Analytics setup, Google My Business integration, sitemap submission.',
                oneTimeMin: 450, oneTimeMax: 450, monthlyMin: 0, monthlyMax: 0, basePrice: 450, baseMonthly: 0
            },
            {
                id: 'live-chat',
                icon: '💬',
                title: 'Live Chat & Contact Forms',
                price: '+$380 CAD',
                nextStage: 'maintenance',
                details: 'Integrated live chat widget, custom contact forms, auto-response email setup, form-to-CRM routing.',
                oneTimeMin: 380, oneTimeMax: 380, monthlyMin: 0, monthlyMax: 0, basePrice: 380, baseMonthly: 0
            },
            {
                id: 'photo-video',
                icon: '📸',
                title: 'Photo/Video Integration',
                price: '+$320 CAD',
                nextStage: 'maintenance',
                details: 'Professional gallery, lightbox viewer, video embed optimization, lazy loading for performance.',
                oneTimeMin: 320, oneTimeMax: 320, monthlyMin: 0, monthlyMax: 0, basePrice: 320, baseMonthly: 0
            },
            {
                id: 'social-integration',
                icon: '📱',
                title: 'Social Media Integration',
                price: '+$280 CAD',
                nextStage: 'maintenance',
                details: 'Live Instagram/Facebook feed, social share buttons, Open Graph meta tags for rich link previews.',
                oneTimeMin: 280, oneTimeMax: 280, monthlyMin: 0, monthlyMax: 0, basePrice: 280, baseMonthly: 0
            },
            {
                id: 'no-addons-web',
                icon: '✅',
                title: 'No Additional Features',
                price: 'Included in base',
                nextStage: 'maintenance',
                details: 'Proceed with the standard package. Everything needed for a professional web presence.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            }
        ]
    },

    /* —— SERVER & IT PATH —— */
    {
        id: 'server-type',
        title: 'Server & IT Setup Type',
        icon: '🖥️',
        description: 'Select the type of server and IT infrastructure you need for your business.',
        options: [
            {
                id: 'dedicated-server',
                icon: '🗄️',
                title: 'Dedicated Business Server',
                price: '$2,500 – $5,500 CAD',
                nextStage: 'server-addons',
                details: 'On-premise or colocation dedicated server setup. Hardware provisioning, OS install, RAID config, remote access.',
                oneTimeMin: 2500, oneTimeMax: 5500, monthlyMin: 0, monthlyMax: 0, basePrice: 4000, baseMonthly: 0
            },
            {
                id: 'cloud-server',
                icon: '☁️',
                title: 'Cloud Server Setup (AWS/Azure)',
                price: '$1,800 – $4,200 CAD',
                nextStage: 'server-addons',
                details: 'Cloud infrastructure provisioning on AWS or Azure. Includes VPC, security groups, auto-scaling, monitoring.',
                oneTimeMin: 1800, oneTimeMax: 4200, monthlyMin: 0, monthlyMax: 0, basePrice: 3000, baseMonthly: 0
            },
            {
                id: 'network-setup',
                icon: '🔌',
                title: 'Office Network & IT Setup',
                price: '$3,200 – $8,500 CAD',
                nextStage: 'server-addons',
                details: 'Complete office network: routers, switches, WiFi access points, VPN, firewall, and workstation configuration.',
                oneTimeMin: 3200, oneTimeMax: 8500, monthlyMin: 0, monthlyMax: 0, basePrice: 5500, baseMonthly: 0
            },
            {
                id: 'pos-system',
                icon: '💳',
                title: 'POS & Payment System Setup',
                price: '$1,200 – $3,500 CAD',
                nextStage: 'server-addons',
                details: 'Point-of-sale system integration, payment terminal setup, inventory sync, receipt printing configuration.',
                oneTimeMin: 1200, oneTimeMax: 3500, monthlyMin: 0, monthlyMax: 0, basePrice: 2300, baseMonthly: 0
            },
            {
                id: 'security-system',
                icon: '🛡️',
                title: 'Cybersecurity & Backup System',
                price: '$2,800 – $7,500 CAD',
                nextStage: 'server-addons',
                details: 'Enterprise firewall, endpoint protection, automated backups, disaster recovery plan, security audit.',
                oneTimeMin: 2800, oneTimeMax: 7500, monthlyMin: 0, monthlyMax: 0, basePrice: 5000, baseMonthly: 0
            },
            {
                id: 'email-server',
                icon: '📧',
                title: 'Business Email & Communication',
                price: '$850 – $2,200 CAD',
                nextStage: 'server-addons',
                details: 'Professional email server setup, Microsoft 365 or Google Workspace deployment, spam filtering, archiving.',
                oneTimeMin: 850, oneTimeMax: 2200, monthlyMin: 0, monthlyMax: 0, basePrice: 1500, baseMonthly: 0
            }
        ]
    },
    {
        id: 'server-addons',
        title: 'IT Support & Add-Ons',
        icon: '🔧',
        description: 'Select ongoing support or additional IT services to keep your infrastructure running smoothly.',
        options: [
            {
                id: 'remote-support',
                icon: '🖥️',
                title: 'Remote IT Support Plan',
                price: '$299 – $599/month CAD',
                nextStage: 'maintenance',
                details: '24/7 remote monitoring, helpdesk support, patch management, and quarterly system health reviews.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 299, monthlyMax: 599, basePrice: 0, baseMonthly: 450
            },
            {
                id: 'onsite-support',
                icon: '🚗',
                title: 'On-Site Support (Alberta)',
                price: '$125/hour + mileage',
                nextStage: 'maintenance',
                details: 'On-site technician visits for hardware issues, installations, and hands-on configuration in the Alberta region.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, hourly: 125, basePrice: 0, baseMonthly: 0
            },
            {
                id: 'managed-backup',
                icon: '💾',
                title: 'Managed Backup & Recovery',
                price: '$149/month CAD',
                nextStage: 'maintenance',
                details: 'Daily automated backups, offsite storage, tested recovery procedures, 30-day retention.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 149, monthlyMax: 149, basePrice: 0, baseMonthly: 149
            },
            {
                id: 'no-addons-server',
                icon: '✅',
                title: 'Setup Only — No Ongoing Support',
                price: 'No recurring cost',
                nextStage: 'maintenance',
                details: 'One-time setup and configuration. You manage the system after handover with full documentation provided.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            }
        ]
    },

    /* —— STARTUP DESIGN PATH —— */
    {
        id: 'startup-type',
        title: 'Startup Brand Package',
        icon: '🚀',
        description: 'Choose your complete brand identity package. Each option includes psychologically-engineered design for maximum market impact.',
        options: [
            {
                id: 'brand-essentials',
                icon: '✨',
                title: 'Brand Essentials',
                price: '$3,200 – $4,800 CAD',
                nextStage: 'startup-addons',
                details: 'Business name generation (5 curated options), primary logo design (3 concepts, 2 revisions), brand colour palette.',
                oneTimeMin: 3200, oneTimeMax: 4800, monthlyMin: 0, monthlyMax: 0, basePrice: 4000, baseMonthly: 0
            },
            {
                id: 'brand-full',
                icon: '💎',
                title: 'Full Brand Identity',
                price: '$5,500 – $7,500 CAD',
                nextStage: 'startup-addons',
                details: 'Name generation, logo + icon design, slogan creation, colour/typography guide, letterhead & business card templates.',
                oneTimeMin: 5500, oneTimeMax: 7500, monthlyMin: 0, monthlyMax: 0, basePrice: 6500, baseMonthly: 0
            },
            {
                id: 'brand-premium',
                icon: '👑',
                title: 'Premium Brand Launch Package',
                price: '$7,500 – $9,500 CAD',
                nextStage: 'startup-addons',
                details: 'Everything in Full Identity + psychologically-engineered symbol (human-made, crafted for subconscious attention & recall), brand book, social media kit.',
                oneTimeMin: 7500, oneTimeMax: 9500, monthlyMin: 0, monthlyMax: 0, basePrice: 8500, baseMonthly: 0
            }
        ]
    },
    {
        id: 'startup-addons',
        title: 'Brand Enhancement Add-Ons',
        icon: '🎯',
        description: 'Amplify your brand with targeted add-ons. Select what best supports your launch strategy.',
        options: [
            {
                id: 'market-research',
                icon: '📊',
                title: 'Alberta Market Research & Positioning',
                price: '+$1,200 CAD',
                nextStage: 'hosting',
                details: 'Competitor analysis, local market positioning report, target demographic profile, pricing strategy recommendations.',
                oneTimeMin: 1200, oneTimeMax: 1200, monthlyMin: 0, monthlyMax: 0, basePrice: 1200, baseMonthly: 0
            },
            {
                id: 'social-launch',
                icon: '📣',
                title: 'Social Media Launch Package',
                price: '+$850 CAD',
                nextStage: 'hosting',
                details: 'Profile setup on 3 platforms, branded cover/profile images, 10 launch post templates, bio copy.',
                oneTimeMin: 850, oneTimeMax: 850, monthlyMin: 0, monthlyMax: 0, basePrice: 850, baseMonthly: 0
            },
            {
                id: 'pitch-deck',
                icon: '📋',
                title: 'Investor Pitch Deck',
                price: '+$1,500 CAD',
                nextStage: 'hosting',
                details: '12-slide branded pitch deck with market data, business model canvas, financial projections template.',
                oneTimeMin: 1500, oneTimeMax: 1500, monthlyMin: 0, monthlyMax: 0, basePrice: 1500, baseMonthly: 0
            },
            {
                id: 'no-addons-startup',
                icon: '✅',
                title: 'Brand Package Only',
                price: 'No additional cost',
                nextStage: 'hosting',
                details: 'Proceed with your selected brand package. Delivered digitally with all source files included.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            }
        ]
    },

    /* —— COMMON STAGES —— */
    {
        id: 'hosting',
        title: 'Choose Your Hosting',
        icon: '☁️',
        description: 'Where will your solution live? Your choice affects billing, control, and maintenance responsibilities.',
        options: [
            {
                id: 'method-hub',
                icon: '🔒',
                title: 'Method Hub (Managed)',
                price: 'Included in package',
                nextStage: 'ownership',
                details: 'Fully managed by Method Media. One bill, zero headaches. 99.9% uptime SLA, daily backups included.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            },
            {
                id: 'public-cloud',
                icon: '☁️',
                title: 'Public Cloud (AWS/Azure/GCP)',
                price: 'You pay cloud directly',
                nextStage: 'ownership',
                details: 'Full infrastructure control. Cloud charges are separate. Setup, migration, and documentation included.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            },
            {
                id: 'hybrid',
                icon: '⚡',
                title: 'Hybrid (On-Prem + Cloud)',
                price: '$950 setup + shared cost',
                nextStage: 'ownership',
                details: 'Sensitive data stored on-premise, scalable public workloads in the cloud. Best of both worlds.',
                oneTimeMin: 950, oneTimeMax: 950, monthlyMin: 0, monthlyMax: 0, basePrice: 950, baseMonthly: 0
            },
            {
                id: 'hosting-na',
                icon: '🚫',
                title: 'Not Applicable (Design/Brand Only)',
                price: 'No hosting required',
                nextStage: 'ownership',
                details: 'For branding, design, or offline IT projects where cloud hosting is not part of the deliverable.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            }
        ]
    },
    {
        id: 'ownership',
        title: 'Ownership Model',
        icon: '📝',
        description: 'How will you own and operate your solution long-term?',
        options: [
            {
                id: 'subscription',
                icon: '🔄',
                title: 'Subscription (SaaS)',
                price: '$350 – $1,800/month CAD',
                nextStage: 'ai',
                details: 'Always on the latest version. Includes hosting, support, and all updates. Cancel with 30 days notice.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 350, monthlyMax: 1800, basePrice: 0, baseMonthly: 875
            },
            {
                id: 'full-ownership',
                icon: '🏆',
                title: 'Full Ownership (Licence)',
                price: 'One-time + $195/mo support',
                nextStage: 'ai',
                details: 'You own the source code and IP outright. Optional support retainer. Future updates quoted separately.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 195, monthlyMax: 195, basePrice: 0, baseMonthly: 195
            }
        ]
    },
    {
        id: 'ai',
        title: 'AI Integration Level',
        icon: '🤖',
        description: 'Choose how AI-powered your solution should be.',
        options: [
            {
                id: 'ai-none',
                icon: '⬜',
                title: 'No AI Integration',
                price: 'No additional cost',
                nextStage: 'maintenance',
                details: 'Traditional solution without AI. Full focus on core functionality and performance.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            },
            {
                id: 'ai-basic',
                icon: '💡',
                title: 'Basic AI Assistant',
                price: '$29/employee/month',
                nextStage: 'maintenance',
                details: 'AI-powered chatbot for customer support, document search, FAQ automation, and ticket routing.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 29, monthlyMax: 29, perUserMonthly: 29, basePrice: 0, baseMonthly: 29
            },
            {
                id: 'ai-advanced',
                icon: '🧠',
                title: 'Advanced AI Suite',
                price: '$79/employee/month',
                nextStage: 'maintenance',
                details: 'Speech recognition, worker assistant, predictive analytics, automated form filling, decision support.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 79, monthlyMax: 79, perUserMonthly: 79, basePrice: 0, baseMonthly: 79
            }
        ]
    },
    {
        id: 'maintenance',
        title: 'Maintenance & Support Plan',
        icon: '🛠️',
        description: 'Select how ongoing support and updates will be handled after delivery.',
        options: [
            {
                id: 'self-maintained',
                icon: '🔧',
                title: 'Self-Maintained',
                price: 'No additional cost',
                nextStage: 'addons',
                details: 'Full documentation and handover. You manage all updates and maintenance internally.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            },
            {
                id: 'method-maintenance-basic',
                icon: '🛡️',
                title: 'Method Care — Basic',
                price: '$199/month CAD',
                nextStage: 'addons',
                details: 'Monthly updates, security patches, bug fixes, and email support. Response within 48 hours.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 199, monthlyMax: 199, basePrice: 0, baseMonthly: 199
            },
            {
                id: 'method-maintenance-pro',
                icon: '⭐',
                title: 'Method Care — Pro',
                price: '$399/month CAD',
                nextStage: 'addons',
                details: 'Everything in Basic + feature enhancements, performance monitoring, priority 24/7 support, quarterly reviews.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 399, monthlyMax: 399, basePrice: 0, baseMonthly: 399
            }
        ]
    },
    {
        id: 'addons',
        title: 'Additional Features',
        icon: '🧩',
        description: 'Select any additional features to round out your solution.',
        options: [
            {
                id: 'analytics',
                icon: '📊',
                title: 'Advanced Analytics Dashboard',
                price: '$500 one-time + $50/month',
                nextStage: 'eta-rush',
                details: 'Real-time metrics, custom reports, data export, user behaviour tracking.',
                oneTimeMin: 500, oneTimeMax: 500, monthlyMin: 50, monthlyMax: 50, basePrice: 500, baseMonthly: 50
            },
            {
                id: 'integrations',
                icon: '🔗',
                title: 'Third-Party Integrations',
                price: '$1,000 – $3,000 per integration',
                nextStage: 'eta-rush',
                details: 'CRM, accounting, scheduling, payment gateways, and other business system connections.',
                oneTimeMin: 1000, oneTimeMax: 3000, monthlyMin: 0, monthlyMax: 0, basePrice: 2000, baseMonthly: 0
            },
            {
                id: 'white-label',
                icon: '🏷️',
                title: 'White-Label Solution',
                price: '$5,000 one-time',
                nextStage: 'eta-rush',
                details: 'Full white-labelling: your branding, resell to your clients, custom domain and admin portal.',
                oneTimeMin: 5000, oneTimeMax: 5000, monthlyMin: 0, monthlyMax: 0, basePrice: 5000, baseMonthly: 0
            },
            {
                id: 'no-addons',
                icon: '✅',
                title: 'No Additional Features',
                price: 'No additional cost',
                nextStage: 'eta-rush',
                details: 'Your solution is complete with the features already selected.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0
            }
        ]
    },

    /* —— RUSH ETA STAGE —— */
    {
        id: 'eta-rush',
        title: 'Delivery Timeline (ETA)',
        icon: '⏱️',
        description: 'Choose your preferred timeline. Rush options carry a surcharge applied to your project total.',
        options: [
            {
                id: 'no-rush',
                icon: '🌿',
                title: 'No Rush — Standard Timeline',
                price: 'No surcharge',
                nextStage: 'review',
                details: 'We work at the optimal pace for quality. Timeline varies by project complexity — typically 2-6 months.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0,
                etaMultiplier: 0
            },
            {
                id: 'rush-level2',
                icon: '⚡',
                title: 'Rush Level 2 — 3 to 7 Months',
                price: '+18% of project total',
                nextStage: 'review',
                details: 'Accelerated delivery with priority scheduling. Dedicated team allocation ensures 3-7 month completion.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0,
                etaMultiplier: 0.18, percentOfOneTime: 18
            },
            {
                id: 'rush-level3',
                icon: '🔥',
                title: 'Rush Level 3 — 2 to 3 Months',
                price: '+35% of project total',
                nextStage: 'review',
                details: 'High-priority fast-track delivery. Extended hours, dedicated resources, weekly milestone reviews.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0,
                etaMultiplier: 0.35, percentOfOneTime: 35
            },
            {
                id: 'premiere-enterprise',
                icon: '👑',
                title: 'Première Enterprise — 1-Week Demo',
                price: '+65% upfront + $25/user/mo',
                nextStage: 'premiere-config',
                details: 'Demo version delivered within 1 week. Your company runs on the beta platform immediately while the full build continues. $25/user/month billing applies until build completion.',
                oneTimeMin: 0, oneTimeMax: 0, monthlyMin: 0, monthlyMax: 0, basePrice: 0, baseMonthly: 0,
                etaMultiplier: 0.65, percentOfOneTime: 65, perUserMonthly: 25
            }
        ]
    },

    /* —— PREMIÈRE ENTERPRISE CONFIG —— */
    {
        id: 'premiere-config',
        title: 'Première Enterprise Setup',
        icon: '👑',
        description: 'Configure your enterprise demo deployment. Tell us about your team and login requirements.',
        isConditional: true,
        options: []
    },

    /* —— REVIEW / CART STAGE —— */
    {
        id: 'review',
        title: 'Review Your Configuration',
        icon: '📋',
        description: 'Review all your selections before proceeding to the agreement. Click any item to edit.',
        isReview: true,
        options: []
    }
];

/* --- CLOUD STAGE RENDERING ----------------------------------------------- */
function showCloudStage(stageIndex) {
    const stage = cloudTree[stageIndex];
    if (!stage) return;

    state.currentStageIndex = stageIndex;

    const cloudStageEl = document.getElementById('cloud-stage');
    const backBtn = document.getElementById('back-btn');
    const nextPreview = document.getElementById('next-preview');
    const progressFill = document.getElementById('progress-fill');

    // Back button
    if (backBtn) backBtn.style.display = state.cloudHistory.length > 0 ? 'block' : 'none';

    // Progress bar
    if (progressFill) {
        const progress = Math.min(100, (stageIndex / (cloudTree.length - 1)) * 100);
        progressFill.style.width = progress + '%';
    }

    // Next stage preview
    if (nextPreview && stage.options && stage.options[0]) {
        const ns = stage.options[0].nextStage;
        if (ns === 'review') {
            nextPreview.textContent = 'Next: Review your configuration before agreement';
        } else {
            const found = cloudTree.find(s => s.id === ns);
            nextPreview.textContent = found ? 'Up next: ' + found.title : '';
        }
    } else if (nextPreview) {
        nextPreview.textContent = '';
    }

    // Update topbar username
    const configUser = document.getElementById('config-username');
    if (configUser && state.userName) configUser.textContent = state.userName + "'s Configuration";

    // Update topbar seal
    const topbarSeal = document.getElementById('topbar-seal');
    if (topbarSeal && state.waxSealImage) topbarSeal.src = state.waxSealImage;

    // Handle special stages
    if (stage.isConditional && stage.id === 'premiere-config') {
        renderPremiereConfig(cloudStageEl);
        return;
    }
    if (stage.isReview) {
        renderReviewStage(cloudStageEl);
        return;
    }

    // Render normal stage
    cloudStageEl.innerHTML = `
        <div class="cloud-stage-inner">
            <div class="stage-header">
                <div class="stage-icon">${stage.icon || ''}</div>
                <h2>${stage.title}</h2>
                <p class="stage-desc">${stage.description}</p>
            </div>
            <div class="cloud-options-grid">
                ${stage.options.map(opt => `
                    <div class="cloud-option" data-option-id="${opt.id}" data-stage-id="${stage.id}">
                        <div class="cloud-opt-icon">${opt.icon || '◆'}</div>
                        <h3>${opt.title}</h3>
                        <p class="cloud-opt-desc">${opt.details}</p>
                        <div class="cloud-opt-price">${opt.price}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Attach click handlers
    cloudStageEl.querySelectorAll('.cloud-option').forEach(el => {
        el.addEventListener('click', () => handleCloudOption(stage.id, el.dataset.optionId));
    });
}

/* --- PREMIÈRE ENTERPRISE CONFIG RENDERER --------------------------------- */
function renderPremiereConfig(container) {
    container.innerHTML = `
        <div class="cloud-stage-inner">
            <div class="stage-header">
                <div class="stage-icon">👑</div>
                <h2>Première Enterprise Setup</h2>
                <p class="stage-desc">Configure your enterprise demo deployment. This determines your per-user monthly billing.</p>
            </div>
            <div class="premiere-config-form">
                <div class="premiere-field">
                    <label class="premiere-label">Do your users need login accounts?</label>
                    <div class="premiere-toggle-group">
                        <button class="premiere-toggle ${state.premiereNeedsLogins ? 'active' : ''}" data-val="yes">
                            <span class="toggle-icon">🔐</span> Yes — User Logins Required
                        </button>
                        <button class="premiere-toggle ${!state.premiereNeedsLogins ? 'active' : ''}" data-val="no">
                            <span class="toggle-icon">🚪</span> No — Open Access
                        </button>
                    </div>
                </div>
                <div class="premiere-field" id="premiere-user-count-field" style="display:${state.premiereNeedsLogins ? 'block' : 'none'}">
                    <label class="premiere-label">How many users will need access?</label>
                    <div class="premiere-slider-wrap">
                        <input type="range" id="premiere-user-slider" min="1" max="200" value="${state.premiereUsers}" class="premiere-slider">
                        <div class="premiere-user-display">
                            <span class="user-count-num" id="premiere-user-num">${state.premiereUsers}</span>
                            <span class="user-count-label">users</span>
                        </div>
                        <div class="premiere-cost-preview" id="premiere-cost-preview">
                            $${state.premiereUsers * 25}/month user billing
                        </div>
                    </div>
                    <div class="glow-input-wrap" style="max-width:200px;margin-top:12px;">
                        <input type="number" id="premiere-user-exact" min="1" max="500" value="${state.premiereUsers}" placeholder="Exact count">
                        <div class="input-glow-line"></div>
                    </div>
                </div>
                <div class="premiere-summary">
                    <div class="premiere-summary-line">
                        <span>Rush Surcharge:</span>
                        <span class="premiere-val">+65% of project total</span>
                    </div>
                    <div class="premiere-summary-line" id="premiere-monthly-line" style="display:${state.premiereNeedsLogins ? 'flex' : 'none'}">
                        <span>Monthly User Billing:</span>
                        <span class="premiere-val" id="premiere-monthly-val">$${state.premiereUsers * 25}/mo until completion</span>
                    </div>
                    <div class="premiere-summary-line">
                        <span>Demo Delivery:</span>
                        <span class="premiere-val">Within 1 week of signing</span>
                    </div>
                </div>
                <button class="btn-primary full-width premiere-continue-btn" id="premiere-continue-btn">
                    Continue to Review →
                </button>
            </div>
        </div>
    `;

    // Toggle handlers
    container.querySelectorAll('.premiere-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            state.premiereNeedsLogins = btn.dataset.val === 'yes';
            container.querySelectorAll('.premiere-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const countField = document.getElementById('premiere-user-count-field');
            const monthlyLine = document.getElementById('premiere-monthly-line');
            if (countField) countField.style.display = state.premiereNeedsLogins ? 'block' : 'none';
            if (monthlyLine) monthlyLine.style.display = state.premiereNeedsLogins ? 'flex' : 'none';
        });
    });

    // Slider handler
    const slider = document.getElementById('premiere-user-slider');
    const exactInput = document.getElementById('premiere-user-exact');
    const numDisplay = document.getElementById('premiere-user-num');
    const costPreview = document.getElementById('premiere-cost-preview');
    const monthlyVal = document.getElementById('premiere-monthly-val');

    function updateUserCount(val) {
        val = Math.max(1, Math.min(500, parseInt(val) || 1));
        state.premiereUsers = val;
        if (numDisplay) numDisplay.textContent = val;
        if (costPreview) costPreview.textContent = `$${val * 25}/month user billing`;
        if (monthlyVal) monthlyVal.textContent = `$${val * 25}/mo until completion`;
        if (slider && parseInt(slider.value) !== val) slider.value = Math.min(val, 200);
        if (exactInput && parseInt(exactInput.value) !== val) exactInput.value = val;
    }

    if (slider) slider.addEventListener('input', () => updateUserCount(slider.value));
    if (exactInput) exactInput.addEventListener('input', () => updateUserCount(exactInput.value));

    // Continue button
    document.getElementById('premiere-continue-btn').addEventListener('click', () => {
        // Store premiere config in preferences
        state.preferences['premiere-config'] = {
            id: 'premiere-config',
            title: 'Première Enterprise Config',
            price: state.premiereNeedsLogins ? `$${state.premiereUsers * 25}/mo (${state.premiereUsers} users)` : 'Open access — no per-user billing',
            details: state.premiereNeedsLogins
                ? `${state.premiereUsers} user accounts with login access at $25/user/month until build completion.`
                : 'Open access mode — no individual user accounts required.',
            needsLogins: state.premiereNeedsLogins,
            userCount: state.premiereNeedsLogins ? state.premiereUsers : 0,
            perUserMonthly: state.premiereNeedsLogins ? 25 : 0,
            oneTimeMin: 0, oneTimeMax: 0, basePrice: 0,
            monthlyMin: state.premiereNeedsLogins ? state.premiereUsers * 25 : 0,
            monthlyMax: state.premiereNeedsLogins ? state.premiereUsers * 25 : 0,
            baseMonthly: state.premiereNeedsLogins ? state.premiereUsers * 25 : 0
        };

        state.cloudHistory.push({ stageId: 'premiere-config', stageIndex: state.currentStageIndex, optionId: 'premiere-config' });

        // Persist
        fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: state.preferences })
        }).catch(() => {});

        // Go to review
        const reviewIndex = cloudTree.findIndex(s => s.id === 'review');
        if (reviewIndex >= 0) showCloudStage(reviewIndex);
    });
}

/* --- REVIEW / CART STAGE RENDERER ---------------------------------------- */
function renderReviewStage(container) {
    const totals = computeTotals();

    const rows = Object.keys(state.preferences).map(key => {
        const p = state.preferences[key];
        // Find which stage index this came from
        const stageIdx = cloudTree.findIndex(s => s.id === key);
        return `
            <tr class="review-row" data-stage-key="${key}" ${stageIdx >= 0 ? `data-stage-index="${stageIdx}"` : ''}>
                <td class="review-sel-title">${p.title || key}</td>
                <td class="review-sel-price">${p.price || '—'}</td>
                <td class="review-sel-detail">${(p.details || '').substring(0, 90)}${p.details && p.details.length > 90 ? '...' : ''}</td>
                <td class="review-sel-action">${stageIdx >= 0 ? '<button class="review-edit-btn">✎ Edit</button>' : ''}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="cloud-stage-inner review-stage">
            <div class="stage-header">
                <div class="stage-icon">📋</div>
                <h2>Review Your Configuration</h2>
                <p class="stage-desc">Verify all selections before proceeding to the agreement. Click "Edit" to change any item.</p>
            </div>
            <div class="review-table-wrap">
                <table class="review-table">
                    <thead>
                        <tr>
                            <th>Selection</th>
                            <th>Price</th>
                            <th>Details</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#888;">No selections made yet.</td></tr>'}</tbody>
                </table>
            </div>
            <div class="review-totals-block">
                <div class="review-total-line review-total-primary">
                    <span class="rtl-label">Estimated One-Time Investment:</span>
                    <span class="rtl-value rtl-finalized">$${totals.oneTimeEst.toLocaleString()} CAD</span>
                </div>
                ${totals.oneTimeMin !== totals.oneTimeMax ? `
                <div class="review-total-line review-total-range">
                    <span class="rtl-label rtl-range-label">Typical range:</span>
                    <span class="rtl-value rtl-range-value">$${totals.oneTimeMin.toLocaleString()} – $${totals.oneTimeMax.toLocaleString()} CAD</span>
                </div>` : ''}
                ${totals.monthlyEst > 0 ? `
                <div class="review-total-line review-total-primary">
                    <span class="rtl-label">Estimated Monthly Cost:</span>
                    <span class="rtl-value rtl-finalized">$${totals.monthlyEst.toLocaleString()}/mo CAD</span>
                </div>` : ''}
                ${totals.monthlyMin > 0 && totals.monthlyMin !== totals.monthlyMax ? `
                <div class="review-total-line review-total-range">
                    <span class="rtl-label rtl-range-label">Monthly range:</span>
                    <span class="rtl-value rtl-range-value">$${totals.monthlyMin.toLocaleString()} – $${totals.monthlyMax.toLocaleString()}/mo CAD</span>
                </div>` : ''}
                ${totals.hourly > 0 ? `
                <div class="review-total-line">
                    <span class="rtl-label">Hourly Services:</span>
                    <span class="rtl-value">$${totals.hourly}/hour CAD (as needed)</span>
                </div>` : ''}
                <div class="review-total-note">
                    * Final quote confirmed after project scoping. All prices in Canadian Dollars (CAD).
                </div>
            </div>
            <div class="review-actions">
                <button class="btn-primary full-width" id="review-proceed-btn">
                    ✓ Looks Good — Proceed to Agreement
                </button>
            </div>
        </div>
    `;

    // Edit button handlers
    container.querySelectorAll('.review-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const stageKey = row.dataset.stageKey;
            const stageIdx = parseInt(row.dataset.stageIndex);

            // Remove this and all subsequent selections
            const histIdx = state.cloudHistory.findIndex(h => h.stageId === stageKey);
            if (histIdx >= 0) {
                const removed = state.cloudHistory.splice(histIdx);
                removed.forEach(r => delete state.preferences[r.stageId]);
            }
            delete state.preferences[stageKey];

            fetch('/api/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: state.preferences })
            }).catch(() => {});

            if (!isNaN(stageIdx) && stageIdx >= 0) {
                showCloudStage(stageIdx);
            }
        });
    });

    // Proceed button
    document.getElementById('review-proceed-btn').addEventListener('click', () => {
        buildAndShowAgreement();
    });
}

/* --- CLOUD OPTION HANDLER ------------------------------------------------ */
function handleCloudOption(stageId, optionId) {
    const stage = cloudTree.find(s => s.id === stageId);
    if (!stage) return;
    const selectedOption = stage.options.find(o => o.id === optionId);
    if (!selectedOption) return;

    // Store selection
    state.preferences[stageId] = { ...selectedOption };

    // History
    state.cloudHistory.push({ stageId: stageId, stageIndex: state.currentStageIndex, optionId });

    // Persist
    fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: state.preferences })
    }).catch(() => {});

    // Navigate
    const nextStageId = selectedOption.nextStage;
    if (nextStageId === 'complete') {
        buildAndShowAgreement();
    } else {
        const nextIndex = cloudTree.findIndex(s => s.id === nextStageId);
        if (nextIndex >= 0) showCloudStage(nextIndex);
    }
}

// Back navigation
document.getElementById('back-btn').addEventListener('click', () => {
    if (state.cloudHistory.length > 0) {
        const last = state.cloudHistory.pop();
        delete state.preferences[last.stageId];
        fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: state.preferences })
        }).catch(() => {});
        showCloudStage(last.stageIndex);
    }
});

/* --- LANDING PAGE --------------------------------------------------------- */
function handleNameEntry() {
    const input = document.getElementById('name-input');
    const name = input ? input.value.trim() : '';
    if (!name) { alert('Please enter your full name'); return; }
    state.userName = name;

    fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(r => r.json())
    .then(data => {
        if (data.exists) {
            const seal = document.getElementById('login-wax-seal');
            if (seal) seal.src = data.waxSeal || '';
            showPage('login-page');
            initLoginSigPad();
        } else {
            showPage('password-page');
            startSealGeneration();
        }
    })
    .catch(() => {
        showPage('password-page');
        startSealGeneration();
    });
}

document.getElementById('name-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') handleNameEntry();
});
document.getElementById('enter-name-btn').addEventListener('click', handleNameEntry);

/* --- REGISTRATION --------------------------------------------------------- */
function startSealGeneration() {
    const generating = document.getElementById('seal-generating');
    const form = document.getElementById('signature-password-form');
    const result = document.getElementById('wax-seal-result');
    if (generating) generating.style.display = 'flex';
    if (form) form.style.display = 'none';
    if (result) result.style.display = 'none';

    setTimeout(() => {
        if (generating) generating.style.display = 'none';
        if (form) form.style.display = 'block';
        initRegisterSigPad();
    }, 3000);
}

/* --- SIGNATURE PAD FACTORY ----------------------------------------------- */
function createSigPad(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let drawing = false;
    let pts = [];
    let lastX = 0, lastY = 0;

    function coords(e) {
        const r = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return [src.clientX - r.left, src.clientY - r.top];
    }
    function down(e) {
        e.preventDefault();
        drawing = true;
        [lastX, lastY] = coords(e);
        pts.push({ x: lastX, y: lastY, t: Date.now() });
    }
    function move(e) {
        if (!drawing) return;
        e.preventDefault();
        const [x, y] = coords(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
        pts.push({ x, y, t: Date.now() });
    }
    function up() { drawing = false; }

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mouseout', up);
    canvas.addEventListener('touchstart', down, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', up);

    return {
        clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); pts = []; },
        getData() { return pts.length > 8 ? pts : null; },
        getImage() { return canvas.toDataURL('image/png'); }
    };
}

function initRegisterSigPad() {
    const canvas = document.getElementById('register-signature-pad');
    if (!canvas) return;
    state.registerSigPad = createSigPad(canvas);
    document.getElementById('clear-register-signature').addEventListener('click', () => {
        if (state.registerSigPad) state.registerSigPad.clear();
    });
}

function initLoginSigPad() {
    const canvas = document.getElementById('login-signature-pad');
    if (!canvas) return;
    state.loginSigPad = createSigPad(canvas);
    document.getElementById('clear-login-signature').addEventListener('click', () => {
        if (state.loginSigPad) state.loginSigPad.clear();
    });
}

/* --- CREATE ACCOUNT ------------------------------------------------------- */
document.getElementById('create-account-btn').addEventListener('click', () => {
    const pw = document.getElementById('password').value;
    const pw2 = document.getElementById('confirm-password').value;
    const err = document.getElementById('password-error');
    err.textContent = '';

    if (pw) {
        if (pw.length < 6) { err.textContent = 'Password must be at least 6 characters'; return; }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) { err.textContent = 'Password must include a special character'; return; }
        if (!/\d/.test(pw)) { err.textContent = 'Password must include a number'; return; }
        if (pw !== pw2) { err.textContent = 'Passwords do not match'; return; }
    }

    const sigData = state.registerSigPad ? state.registerSigPad.getData() : null;
    if (!sigData) { err.textContent = 'Please sign to create your signature passkey'; return; }

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.userName, password: pw || null, confirmPassword: pw2 || null, signatureData: sigData })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            state.userToken = data.token;
            state.waxSealImage = data.waxSeal;
            document.getElementById('signature-password-form').style.display = 'none';
            document.getElementById('wax-seal-result').style.display = 'block';
            document.getElementById('user-wax-seal').src = data.waxSeal;
            document.getElementById('unique-token').textContent = data.token;
        } else {
            err.textContent = data.error || 'Registration failed';
        }
    })
    .catch(() => { err.textContent = 'Network error — please try again'; });
});

document.getElementById('continue-btn').addEventListener('click', () => {
    showPage('cloud-page');
    showCloudStage(0);
});

/* --- LOGIN ---------------------------------------------------------------- */
document.getElementById('show-password-login').addEventListener('click', () => {
    const pwSection = document.getElementById('password-login-section');
    const visible = pwSection.style.display !== 'none';
    pwSection.style.display = visible ? 'none' : 'block';
    state.usingPasswordBackup = !visible;
});

document.getElementById('login-btn').addEventListener('click', () => {
    const nameEl = document.getElementById('login-name');
    const name = nameEl ? nameEl.value.trim() : state.userName;
    const err = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    err.textContent = '';

    let sigData = null;
    if (!state.usingPasswordBackup) {
        sigData = state.loginSigPad ? state.loginSigPad.getData() : null;
        if (!sigData) { err.textContent = 'Please sign to authenticate'; return; }
    }

    const pw = state.usingPasswordBackup ? document.getElementById('login-password').value : null;
    if (!name) { err.textContent = 'Please enter your name'; return; }

    btn.textContent = 'Authenticating...';
    btn.disabled = true;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: pw, signatureData: sigData })
    })
    .then(r => r.json())
    .then(data => {
        btn.textContent = 'Authenticate';
        btn.disabled = false;
        if (data.success) {
            state.userName = name;
            state.userToken = data.token;
            state.waxSealImage = data.waxSeal;
            loadPreferencesAndShowCloud();
        } else {
            err.textContent = data.error || 'Authentication failed';
            if (data.confidence !== undefined) {
                err.textContent += ` (match: ${Math.round(data.confidence * 100)}%)`;
            }
        }
    })
    .catch(() => {
        btn.textContent = 'Authenticate';
        btn.disabled = false;
        err.textContent = 'Network error. Please try again.';
    });
});

function loadPreferencesAndShowCloud() {
    fetch('/api/preferences')
        .then(r => r.json())
        .then(data => {
            state.preferences = data.preferences || {};
            showPage('cloud-page');
            showCloudStage(0);
        })
        .catch(() => {
            showPage('cloud-page');
            showCloudStage(0);
        });
}

/* ==========================================================================
   STRUCTURED PRICING ENGINE — Range-Aware Totals
   ========================================================================== */
function computeTotals() {
    let oneTimeMin = 0, oneTimeMax = 0, oneTimeEst = 0;
    let monthlyMin = 0, monthlyMax = 0, monthlyEst = 0;
    let hourly = 0;

    // Accumulate from all preferences (except eta-rush and premiere-config handled separately)
    Object.keys(state.preferences).forEach(key => {
        if (key === 'eta-rush' || key === 'premiere-config') return;
        const p = state.preferences[key];
        oneTimeMin += (p.oneTimeMin || 0);
        oneTimeMax += (p.oneTimeMax || 0);
        oneTimeEst += (p.basePrice || 0);
        monthlyMin += (p.monthlyMin || 0);
        monthlyMax += (p.monthlyMax || 0);
        monthlyEst += (p.baseMonthly || 0);
        if (p.hourly) hourly += p.hourly;
    });

    // ETA Rush surcharge (percentage of one-time cost)
    const eta = state.preferences['eta-rush'];
    if (eta && eta.etaMultiplier && eta.etaMultiplier > 0) {
        const surchargeMin = Math.round(oneTimeMin * eta.etaMultiplier);
        const surchargeMax = Math.round(oneTimeMax * eta.etaMultiplier);
        const surchargeEst = Math.round(oneTimeEst * eta.etaMultiplier);
        oneTimeMin += surchargeMin;
        oneTimeMax += surchargeMax;
        oneTimeEst += surchargeEst;
    }

    // Première Enterprise user billing
    const premiere = state.preferences['premiere-config'];
    if (premiere) {
        monthlyMin += (premiere.monthlyMin || 0);
        monthlyMax += (premiere.monthlyMax || 0);
        monthlyEst += (premiere.baseMonthly || premiere.monthlyMin || 0);
    } else if (eta && eta.perUserMonthly && !state.preferences['premiere-config']) {
        // Default estimate if premiere-config not yet filled
        monthlyMin += eta.perUserMonthly;
        monthlyMax += eta.perUserMonthly;
        monthlyEst += eta.perUserMonthly;
    }

    return { oneTimeMin, oneTimeMax, oneTimeEst, monthlyMin, monthlyMax, monthlyEst, hourly };
}

function computeTotalLabel() {
    const t = computeTotals();
    let parts = [];

    // Show the FINALIZED estimated total as the primary value
    if (t.oneTimeEst > 0) {
        parts.push(`Est. $${t.oneTimeEst.toLocaleString()} CAD`);
    }
    if (t.monthlyEst > 0) {
        parts.push(`+ $${t.monthlyEst.toLocaleString()}/mo`);
    }
    if (t.hourly > 0) {
        parts.push(`+ $${t.hourly}/hr (as needed)`);
    }

    return parts.length > 0 ? parts.join(' ') : 'Custom pricing — contact for quote';
}

/* --- AGREEMENT BUILDER ---------------------------------------------------- */
function buildAndShowAgreement() {
    const prefs = state.preferences;
    const totalLabel = computeTotalLabel();

    // Build summary rows
    const rows = Object.keys(prefs).map(key => {
        const p = prefs[key];
        return `
            <tr>
                <td>${p.title || key}</td>
                <td>${p.price || '—'}</td>
                <td>${(p.details || '').substring(0, 80)}${p.details && p.details.length > 80 ? '...' : ''}</td>
            </tr>
        `;
    }).join('');

    const agType = (() => {
        const own = prefs['ownership'];
        if (own && own.id === 'subscription') return 'Subscription Services Agreement';
        if (own && own.id === 'full-ownership') return 'Full Stack Development Agreement';
        const pt = prefs['project-type'];
        if (pt && pt.id === 'startup-design') return 'Brand & Identity Services Agreement';
        if (pt && pt.id === 'server-it') return 'IT Services Agreement';
        if (pt && pt.id === 'simple-website') return 'Website Development Agreement';
        return 'Custom Development Agreement';
    })();

    state.agreementData.type = agType;
    state.agreementData.totalLabel = totalLabel;

    const content = `
        <div class="agreement-summary-wrap">
            <h2 class="summary-title">Configuration Summary</h2>
            <p class="summary-client">Prepared for: <strong>${state.userName}</strong></p>
            <table class="config-summary-table">
                <thead>
                    <tr><th>Selection</th><th>Price</th><th>Details</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="summary-total-block">
                <span class="total-label">Estimated Investment:</span>
                <span class="total-value">${totalLabel}</span>
            </div>
            <p class="summary-note">* All prices are in Canadian Dollars (CAD) and represent estimates based on your selections. 
               Final quote will be confirmed upon project scoping. Alberta GST applies where applicable.</p>
        </div>
    `;

    document.getElementById('agreement-content').innerHTML = content;
    document.getElementById('agreement-title').textContent = agType;
    const sealImg = document.getElementById('agreement-wax-seal-img');
    if (sealImg && state.waxSealImage) sealImg.src = state.waxSealImage;

    showPage('agreement-page');
    initScrollIndicator();
}

/* --- AGREEMENT PAGE ------------------------------------------------------- */
function initScrollIndicator() {
    const scrollArea = document.getElementById('agreement-scroll-area');
    const indicator = document.getElementById('scroll-indicator');
    if (!scrollArea || !indicator) return;

    scrollArea.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            indicator.style.opacity = '0';
        }
    });
}

document.getElementById('agree-checkbox').addEventListener('change', e => {
    const sigSection = document.getElementById('signature-section');
    if (sigSection) sigSection.style.display = e.target.checked ? 'block' : 'none';
    if (e.target.checked) {
        const seal = document.getElementById('signature-wax-seal');
        if (seal && state.waxSealImage) seal.src = state.waxSealImage;
        initAgreementSigPad();
    }
});

function initAgreementSigPad() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = canvas.offsetHeight || 200;
    state.agreementSigPad = createSigPad(canvas);
}

document.getElementById('clear-signature-btn').addEventListener('click', () => {
    if (state.agreementSigPad) state.agreementSigPad.clear();
    else {
        const c = document.getElementById('signature-pad');
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }
});

document.getElementById('finalize-agreement-btn').addEventListener('click', finalizeAgreement);

function finalizeAgreement() {
    const email = document.getElementById('client-email').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const errEl = document.getElementById('finalize-error');
    if (errEl) errEl.textContent = '';

    if (!email || !phone) {
        if (errEl) errEl.textContent = 'Please provide both email and phone number';
        return;
    }
    if (!email.includes('@')) {
        if (errEl) errEl.textContent = 'Please enter a valid email address';
        return;
    }

    const canvas = document.getElementById('signature-pad');
    const signatureData = canvas ? canvas.toDataURL('image/png') : '';

    state.agreementData.clientEmail = email;
    state.agreementData.clientPhone = phone;

    const btn = document.getElementById('finalize-agreement-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sealing Agreement...'; }

    // Save signature then generate contract in one flow
    fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData })
    })
    .then(r => r.json())
    .then(sigData => {
        if (!sigData.success) throw new Error('Failed to save signature');
        state.agreementData.clientSignature = sigData.signaturePath;

        // Generate contract (this creates the agreement record + contract)
        return fetch('/api/generate-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                preferences: state.preferences,
                clientSignature: state.agreementData.clientSignature,
                clientEmail: state.agreementData.clientEmail,
                clientPhone: state.agreementData.clientPhone,
                totalLabel: state.agreementData.totalLabel,
                agreementType: state.agreementData.type
            })
        });
    })
    .then(r => r.json())
    .then(contractData => {
        if (!contractData.success) throw new Error(contractData.error || 'Failed to generate contract');

        state.agreementData.contractId = contractData.agreementId;

        // Trigger invoice generation
        fetch('/api/generate-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agreementId: contractData.agreementId })
        }).catch(() => {}); // fire-and-forget

        // Save to localStorage for contract viewer
        localStorage.setItem('contractData', JSON.stringify({
            userName: state.userName,
            waxSealImage: state.waxSealImage,
            preferences: state.preferences,
            clientSignature: state.agreementData.clientSignature,
            clientEmail: state.agreementData.clientEmail,
            clientPhone: state.agreementData.clientPhone,
            totalLabel: state.agreementData.totalLabel,
            agreementType: state.agreementData.type
        }));

        showSuccessPage(contractData.agreementId);
    })
    .catch(err => {
        if (btn) { btn.disabled = false; btn.textContent = '🔏 Seal & Finalize Agreement'; }
        if (errEl) errEl.textContent = 'Error: ' + err.message;
        console.error(err);
    });
}

/* --- SUCCESS PAGE --------------------------------------------------------- */
function showSuccessPage(agreementId) {
    const totalLabel = state.agreementData.totalLabel || computeTotalLabel();
    const projectType = state.preferences['project-type'] ? state.preferences['project-type'].title : 'Custom Project';
    const etaOption = state.preferences['eta-rush'];
    const etaLabel = etaOption ? etaOption.title : 'Standard Timeline';
    const tokenId = agreementId || ('MM-' + Date.now().toString(36).toUpperCase());

    // Generate Digital Token of Excellence
    const tokenDisplay = `
        <div class="token-of-excellence">
            <div class="token-outer-glow"></div>
            <div class="token-card">
                <div class="token-header">
                    <div class="token-mm-icon">
                        <svg viewBox="0 0 100 60" width="80" height="48" xmlns="http://www.w3.org/2000/svg">
                            <text x="0" y="50" font-family="Cinzel Decorative, serif" font-size="58" font-weight="900"
                                  fill="none" stroke="url(#tg)" stroke-width="1.5" letter-spacing="-8">MM</text>
                            <defs>
                                <linearGradient id="tg" x1="0" y1="0" x2="100%" y2="0">
                                    <stop offset="0%" stop-color="#f5c842"/>
                                    <stop offset="50%" stop-color="#fff"/>
                                    <stop offset="100%" stop-color="#f5c842"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div class="token-brand-text">METHOD MEDIA</div>
                </div>
                <div class="token-divider"></div>
                <div class="token-title">Digital Token of Excellence</div>
                <div class="token-project-name">${projectType}</div>
                <div class="token-meta-grid">
                    <div class="token-meta-item">
                        <span class="tmeta-label">Client</span>
                        <span class="tmeta-value">${state.userName}</span>
                    </div>
                    <div class="token-meta-item">
                        <span class="tmeta-label">Token ID</span>
                        <span class="tmeta-value">${tokenId}</span>
                    </div>
                    <div class="token-meta-item">
                        <span class="tmeta-label">Est. Investment</span>
                        <span class="tmeta-value">${totalLabel}</span>
                    </div>
                    <div class="token-meta-item">
                        <span class="tmeta-label">Timeline</span>
                        <span class="tmeta-value">${etaLabel}</span>
                    </div>
                    <div class="token-meta-item">
                        <span class="tmeta-label">Issued</span>
                        <span class="tmeta-value">${new Date().toLocaleDateString('en-CA')}</span>
                    </div>
                    <div class="token-meta-item">
                        <span class="tmeta-label">Status</span>
                        <span class="tmeta-value status-active">In Production</span>
                    </div>
                </div>
                <div class="token-footer">
                    <div class="token-seal-wrap">
                        <img src="${state.waxSealImage}" alt="Wax Seal" class="token-seal-img">
                    </div>
                    <div class="token-slogan">it's all in the method</div>
                </div>
            </div>
        </div>
    `;

    // Build final content
    const finalContent = document.getElementById('final-agreement-content');
    if (finalContent) {
        finalContent.innerHTML = `
            <div class="success-token-section">
                ${tokenDisplay}
            </div>
            <div class="success-config-summary">
                <h3>Your Committed Configuration</h3>
                <table class="config-summary-table">
                    <tbody>
                        ${Object.keys(state.preferences).map(k => {
                            const p = state.preferences[k];
                            return `<tr><td>${p.title || k}</td><td>${p.price || '—'}</td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
                <div class="summary-total-block">
                    <span class="total-label">Total Investment:</span>
                    <span class="total-value">${totalLabel}</span>
                </div>
                <div class="invoice-notice">
                    <span class="invoice-icon">📄</span>
                    <span>An itemized invoice will be sent to <strong>${state.agreementData.clientEmail || 'your email'}</strong> within 24 hours on Method Media branded letterhead.</span>
                </div>
            </div>
        `;
    }

    showPage('final-agreement-page');
}

/* --- FINAL PAGE BUTTONS --------------------------------------------------- */
document.getElementById('view-contract-btn').addEventListener('click', () => {
    window.location.href = '/contract-viewer.html';
});

document.getElementById('download-btn').addEventListener('click', () => {
    if (state.agreementData.contractId) {
        window.open('/api/download-contract-pdf?id=' + state.agreementData.contractId, '_blank');
    } else {
        alert('Contract is being prepared — please check your email shortly.');
    }
});

document.getElementById('new-agreement-btn').addEventListener('click', () => {
    state.preferences = {};
    state.cloudHistory = [];
    state.agreementData = {};
    state.currentStageIndex = 0;
    state.premiereUsers = 5;
    state.premiereNeedsLogins = false;
    showPage('cloud-page');
    showCloudStage(0);
});

/* --- SECRET ADMIN TRIGGER ------------------------------------------------- */
(function initSecretAdmin() {
    const trigger = document.getElementById('mascot-secret-trigger');
    const overlay = document.getElementById('admin-secret-overlay');
    const hint = document.getElementById('admin-click-hint');
    if (!trigger || !overlay) return;

    let clicks = 0, clickTimer = null;
    const REQUIRED = 5;

    trigger.addEventListener('click', () => {
        clicks++;
        if (hint) hint.textContent = clicks < REQUIRED ? `${REQUIRED - clicks} more...` : '';

        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clicks = 0; if (hint) hint.textContent = ''; }, 1200);

        if (clicks >= REQUIRED) {
            clicks = 0;
            clearTimeout(clickTimer);
            openAdminModal();
        }
    });

    function openAdminModal() {
        overlay.classList.add('active');
        const uInput = document.getElementById('admin-username-input');
        if (uInput) uInput.focus();
    }

    function closeAdminModal() {
        overlay.classList.remove('active');
        const errEl = document.getElementById('admin-login-error');
        if (errEl) errEl.textContent = '';
        const uEl = document.getElementById('admin-username-input');
        const pEl = document.getElementById('admin-password-input');
        if (uEl) uEl.value = '';
        if (pEl) pEl.value = '';
    }

    document.getElementById('admin-cancel-btn').addEventListener('click', closeAdminModal);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeAdminModal();
    });

    document.getElementById('admin-login-btn').addEventListener('click', () => {
        const username = document.getElementById('admin-username-input').value.trim();
        const password = document.getElementById('admin-password-input').value;
        const errEl = document.getElementById('admin-login-error');
        if (!username || !password) { errEl.textContent = 'Enter credentials'; return; }

        fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                closeAdminModal();
                window.location.href = '/admin-dashboard.html';
            } else {
                errEl.textContent = data.error || 'Access denied';
            }
        })
        .catch(() => { errEl.textContent = 'Network error'; });
    });

    // Allow Enter key in admin fields
    ['admin-username-input', 'admin-password-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keypress', e => {
            if (e.key === 'Enter') document.getElementById('admin-login-btn').click();
        });
    });
})();

/* --- SUPERNINJA TEXT OVERRIDE -------------------------------------------- */
(function overrideSuperNinja() {
    function replace(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (/superninja/i.test(node.textContent)) {
                node.textContent = node.textContent.replace(/superninja/gi, 'Method-Media');
            }
        } else if (node.nodeType === Node.ELEMENT_NODE &&
                   node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            Array.from(node.childNodes).forEach(replace);
        }
    }
    const mo = new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(replace)));
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    replace(document.body);
})();

/* --- AUTH STATUS CHECK ON LOAD ------------------------------------------- */
fetch('/api/auth/status')
    .then(r => r.json())
    .then(data => {
        if (data.authenticated) {
            state.userName = data.userName;
            state.waxSealImage = data.waxSeal || '';
            loadPreferencesAndShowCloud();
        }
    })
    .catch(() => {});
/* --- ARTISTIC ENHANCEMENTS ----------------------------------------------- */
(function initArtisticEnhancements() {
    // Create dynamic floating neon particles
    function createNeonParticle() {
        const particle = document.createElement('div');
        particle.className = 'neon-particle';
        
        // Random color class
        const colors = ['cyan', 'purple', 'gold', 'magenta'];
        particle.classList.add(colors[Math.floor(Math.random() * colors.length)]);
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = -Math.random() * 12 + 's';
        particle.style.animationDuration = (10 + Math.random() * 8) + 's';
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => particle.remove(), 20000);
    }
    
    // Create initial batch of particles
    for (let i = 0; i < 6; i++) {
        setTimeout(createNeonParticle, i * 2000);
    }
    
    // Continuously create new particles
    setInterval(createNeonParticle, 4000);
    
    // Add artistic frame to review panels when they appear
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    // Check if it's a review stage panel
                    const reviewPanel = node.querySelector?.('.review-panel') || 
                                       (node.classList?.contains('review-panel') ? node : null);
                    if (reviewPanel) {
                        reviewPanel.classList.add('review-artistic-frame');
                        
                        // Add tech corner brackets
                        ['tl', 'tr', 'bl', 'br'].forEach(pos => {
                            const corner = document.createElement('div');
                            corner.className = `tech-corner-bracket ${pos}`;
                            reviewPanel.appendChild(corner);
                        });
                    }
                    
                    // Enhance buttons with artistic class
                    const buttons = node.querySelectorAll?.('.btn-primary') || [];
                    buttons.forEach(btn => btn.classList.add('btn-artistic'));
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Add tech lines to dividers
    document.querySelectorAll('.divider-line').forEach(div => {
        const techLine = document.createElement('div');
        techLine.className = 'tech-line';
        div.parentNode.insertBefore(techLine, div.nextSibling);
    });
    
    console.log('✨ Artistic enhancements initialized');
})();
