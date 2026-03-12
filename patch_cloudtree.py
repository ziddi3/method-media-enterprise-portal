content = open('/workspace/public/app.js', 'r', encoding='utf-8').read()

start_marker = '/* \u2500\u2500\u2500 CLOUD CONFIGURATION'
end_marker = '];\n\nfunction loadPreferencesAndShowCloud'

start = content.find(start_marker)
end = content.find(end_marker)

# end_marker includes '];' so we need to cut right after the ];
# We'll replace from start_marker up to and including the ];
old_section = content[start:end + 2]  # +2 for ];

new_section = '''/* \u2500\u2500\u2500 CLOUD CONFIGURATION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

// Alberta-calibrated pricing \u2014 15\u201325% above regional market average
const cloudTree = [

    /* \u2500\u2500 STAGE 0: What type of project? \u2500\u2500 */
    {
        id: 'project-type', title: 'What Are We Building?', icon: '\ud83c\udfd7\ufe0f',
        description: 'Select the primary category of your project. Each path has its own tailored options and Alberta market pricing.',
        options: [
            {
                id: 'simple-website', icon: '\ud83c\udf10', title: 'Simple Website Build',
                price: '$1,800 \u2013 $6,500 CAD',
                nextStage: 'website-type',
                details: 'Professional website design & development. Brochure sites, portfolios, business landing pages, and small business web presence.',
                basePrice: 3500
            },
            {
                id: 'web-app', icon: '\u2699\ufe0f', title: 'Web Application',
                price: '$9,500 \u2013 $22,000 CAD',
                nextStage: 'hosting',
                details: 'Responsive web app deployable on any browser. Includes backend API, database design, user authentication, and custom UI.',
                basePrice: 15000
            },
            {
                id: 'mobile-app', icon: '\ud83d\udcf1', title: 'Native Mobile App',
                price: '$18,500 \u2013 $34,000 CAD',
                nextStage: 'hosting',
                details: 'iOS & Android with full device access. Push notifications, camera, GPS, and biometric support. Includes App Store submission.',
                basePrice: 26000
            },
            {
                id: 'ecommerce', icon: '\ud83d\uded2', title: 'E-Commerce Platform',
                price: '$12,500 \u2013 $28,000 CAD',
                nextStage: 'hosting',
                details: 'Full online store with Stripe/PayPal/Interac payment processing, inventory management, order tracking, and analytics.',
                basePrice: 20000
            },
            {
                id: 'enterprise', icon: '\ud83c\udfe2', title: 'Enterprise Suite',
                price: '$28,000 \u2013 $65,000 CAD',
                nextStage: 'hosting',
                details: 'Multi-module enterprise system: CRM, ERP, HR management, reporting dashboards. Fully custom-built to your operations.',
                basePrice: 45000
            },
            {
                id: 'server-it', icon: '\ud83d\udda5\ufe0f', title: 'Server & IT Setup',
                price: '$1,200 \u2013 $18,000 CAD',
                nextStage: 'server-type',
                details: 'Physical or cloud server provisioning, network configuration, security hardening, domain & DNS, email hosting, and ongoing IT management.',
                basePrice: 4500
            },
            {
                id: 'startup-design', icon: '\ud83d\ude80', title: 'Startup Business Design',
                price: '$650 \u2013 $4,200 CAD',
                nextStage: 'startup-type',
                details: 'Brand identity creation for new businesses. Business name generation, logo design, slogan crafting, and icon/symbol creation engineered for subconscious brand recall.',
                basePrice: 2200
            }
        ]
    },

    /* \u2500\u2500 STAGE 1a: Website Build Type \u2500\u2500 */
    {
        id: 'website-type', title: 'Website Build \u2014 Select Your Package', icon: '\ud83c\udf10',
        description: 'Choose the website package that matches your needs. All packages include mobile-responsive design, SSL certificate, and 1 full revision round.',
        options: [
            {
                id: 'web-landing', icon: '\ud83c\udfaf', title: 'Landing Page / Single Page',
                price: '$1,800 \u2013 $2,800 CAD',
                nextStage: 'website-features',
                details: 'One-page scrolling site. Hero section, services/products, testimonials, and contact form. Perfect for campaigns and new business launches.',
                basePrice: 2200
            },
            {
                id: 'web-brochure', icon: '\ud83d\udcc4', title: 'Brochure / Business Site (3\u20136 pages)',
                price: '$2,800 \u2013 $4,200 CAD',
                nextStage: 'website-features',
                details: 'Home, About, Services, Gallery, Contact. Professional business web presence. CMS included so you can update content yourself without developer help.',
                basePrice: 3400
            },
            {
                id: 'web-portfolio', icon: '\ud83c\udfa8', title: 'Portfolio / Creative Site',
                price: '$2,400 \u2013 $3,800 CAD',
                nextStage: 'website-features',
                details: 'Showcase-focused design with rich media galleries, project case studies, and inquiry forms. Optimized for creative professionals and agencies.',
                basePrice: 3000
            },
            {
                id: 'web-blog', icon: '\u270d\ufe0f', title: 'Blog / Content Platform',
                price: '$2,200 \u2013 $3,600 CAD',
                nextStage: 'website-features',
                details: 'Full CMS-powered blog with categories, tags, author profiles, newsletter integration, and SEO optimization built in from day one.',
                basePrice: 2800
            },
            {
                id: 'web-business-plus', icon: '\ud83c\udfc6', title: 'Business Plus (7\u201315 pages)',
                price: '$4,200 \u2013 $6,500 CAD',
                nextStage: 'website-features',
                details: 'Full business website with custom design, multiple service pages, team profiles, testimonials, integrated booking/calendar, Google Maps, and live chat widget.',
                basePrice: 5200
            }
        ]
    },

    /* \u2500\u2500 STAGE 1b: Server & IT Setup Type \u2500\u2500 */
    {
        id: 'server-type', title: 'Server & IT Setup \u2014 Select Your Service', icon: '\ud83d\udda5\ufe0f',
        description: 'Professional server provisioning and IT infrastructure services for Alberta businesses. All work is documented and handed off with full admin credentials.',
        options: [
            {
                id: 'server-vps', icon: '\u2601\ufe0f', title: 'VPS / Cloud Server Setup',
                price: '$1,200 \u2013 $2,800 CAD',
                nextStage: 'server-addons',
                details: 'DigitalOcean, Linode, Vultr, or AWS EC2 provisioning. LEMP/LAMP stack, UFW firewall, SSH hardening, automated daily backups, and uptime monitoring.',
                basePrice: 1800
            },
            {
                id: 'server-dedicated', icon: '\ud83d\udda7', title: 'Dedicated Server Configuration',
                price: '$2,400 \u2013 $5,500 CAD',
                nextStage: 'server-addons',
                details: 'Bare-metal server setup: OS installation, RAID configuration, web/database server install, SSL certificates, performance tuning, and remote management console.',
                basePrice: 3800
            },
            {
                id: 'server-email', icon: '\ud83d\udce7', title: 'Business Email & Domain Setup',
                price: '$450 \u2013 $1,200 CAD',
                nextStage: 'server-addons',
                details: 'Domain registration, DNS configuration, professional email hosting (Google Workspace or Zoho), MX records, SPF/DKIM/DMARC anti-spam protection setup.',
                basePrice: 750
            },
            {
                id: 'server-network', icon: '\ud83d\udd0c', title: 'Office Network & IT Infrastructure',
                price: '$1,800 \u2013 $6,500 CAD',
                nextStage: 'server-addons',
                details: 'LAN/Wi-Fi setup, router/switch configuration, VPN for remote workers, NAS storage, printer networking, hardware firewall, and full network security audit.',
                basePrice: 3800
            },
            {
                id: 'server-managed', icon: '\ud83d\udee1\ufe0f', title: 'Fully Managed IT (Monthly Retainer)',
                price: '$650 \u2013 $2,200/month CAD',
                nextStage: 'server-addons',
                details: 'Ongoing IT management: security patching, monitoring, backups, helpdesk support (8hrs/mo), hardware procurement, and vendor coordination for your team.',
                basePrice: 1200, monthly: 1200
            },
            {
                id: 'server-migration', icon: '\ud83d\udd04', title: 'Server / Data Migration',
                price: '$950 \u2013 $3,200 CAD',
                nextStage: 'server-addons',
                details: 'Migrate websites, databases, emails, or entire server environments. Zero-downtime migration planning, data integrity verification, and rollback contingency.',
                basePrice: 1800
            }
        ]
    },

    /* \u2500\u2500 STAGE 1c: Startup Business Design Type \u2500\u2500 */
    {
        id: 'startup-type', title: 'Startup Business Design \u2014 Select Services', icon: '\ud83d\ude80',
        description: 'Brand identity services engineered for maximum market impact and subconscious brand recall. All designs are human-crafted and psychologically calibrated for the Alberta market.',
        options: [
            {
                id: 'design-name', icon: '\u2728', title: 'Business Name Generation',
                price: '$350 \u2013 $650 CAD',
                nextStage: 'startup-addons',
                details: 'Strategic business name development. 10 curated name concepts with domain availability check, trademark screening, and linguistic/cultural suitability analysis.',
                basePrice: 450
            },
            {
                id: 'design-logo', icon: '\ud83c\udfa8', title: 'Logo Design',
                price: '$650 \u2013 $1,800 CAD',
                nextStage: 'startup-addons',
                details: 'Professional logo design with 3 initial concepts, 2 revision rounds. Delivered in all formats (SVG, PNG, PDF). Includes dark/light variants and a favicon version.',
                basePrice: 1100
            },
            {
                id: 'design-slogan', icon: '\ud83d\udcac', title: 'Slogan / Tagline Creation',
                price: '$275 \u2013 $550 CAD',
                nextStage: 'startup-addons',
                details: '5 unique slogan concepts crafted using NLP and persuasion principles. Emotionally resonant, memorable, and aligned with your brand voice and Alberta market positioning.',
                basePrice: 375
            },
            {
                id: 'design-icon', icon: '\ud83d\udd2e', title: 'Icon / Symbol Creation (Psychologically Engineered)',
                price: '$750 \u2013 $2,000 CAD',
                nextStage: 'startup-addons',
                details: 'Human-made brand icon/symbol socially engineered for subconscious attention and recall. Applies psychological shape theory, color psychology, and visual hierarchy. Delivered as scalable vector files.',
                basePrice: 1200
            },
            {
                id: 'design-full-brand', icon: '\ud83c\udfc6', title: 'Full Brand Identity Package',
                price: '$2,200 \u2013 $4,200 CAD',
                nextStage: 'startup-addons',
                details: 'Complete brand identity: business name + logo + slogan + icon + brand guidelines document + business card design + social media starter kit. Everything to launch professionally.',
                basePrice: 3000
            }
        ]
    },

    /* \u2500\u2500 STAGE 2a: Website Features Add-ons \u2500\u2500 */
    {
        id: 'website-features', title: 'Website \u2014 Feature Add-Ons', icon: '\u2699\ufe0f',
        description: 'Enhance your website with additional functionality. All features are built and tested to Alberta web standards.',
        options: [
            {
                id: 'web-seo', icon: '\ud83d\udcc8', title: 'SEO Optimization Package',
                price: '$550 one-time + $185/mo CAD',
                nextStage: 'ownership',
                details: 'On-page SEO, keyword research report, Google Search Console & Analytics setup, XML sitemap, schema markup, Core Web Vitals optimization, and monthly ranking reports.',
                basePrice: 550, addonPrice: 550
            },
            {
                id: 'web-booking', icon: '\ud83d\udcc5', title: 'Online Booking / Scheduling System',
                price: '$650 \u2013 $1,200 CAD',
                nextStage: 'ownership',
                details: 'Appointment booking with calendar sync (Google/Outlook), automated email/SMS reminders, deposit collection via Stripe, and staff availability management.',
                basePrice: 850, addonPrice: 850
            },
            {
                id: 'web-ecom-light', icon: '\ud83d\udecd\ufe0f', title: 'Light E-Commerce (up to 50 products)',
                price: '$950 \u2013 $1,800 CAD',
                nextStage: 'ownership',
                details: 'Product catalog, shopping cart, Stripe/PayPal/Interac Online checkout, order management dashboard. Ideal for small product lines or packaged services.',
                basePrice: 1300, addonPrice: 1300
            },
            {
                id: 'web-no-addons', icon: '\u2714', title: 'No Additional Features',
                price: 'No additional cost',
                nextStage: 'ownership',
                details: 'Proceed with the base website package as selected. Features can always be added in future phases.',
                addonPrice: 0
            }
        ]
    },

    /* \u2500\u2500 STAGE 2b: Server Add-ons \u2500\u2500 */
    {
        id: 'server-addons', title: 'Server & IT \u2014 Add-On Services', icon: '\ud83d\udd27',
        description: 'Strengthen your IT setup with additional managed services.',
        options: [
            {
                id: 'srv-backup', icon: '\ud83d\udcbe', title: 'Automated Offsite Backup Solution',
                price: '$280 setup + $85/mo CAD',
                nextStage: 'maintenance',
                details: 'Automated daily backups to offsite location (Backblaze B2 or AWS S3), 30-day retention policy, one-click restore, and monthly backup integrity verification.',
                addonPrice: 280
            },
            {
                id: 'srv-security', icon: '\ud83d\udd12', title: 'Security Hardening & Audit',
                price: '$650 \u2013 $1,400 CAD',
                nextStage: 'maintenance',
                details: 'Full security audit, vulnerability scanning, firewall rule optimization, intrusion detection setup (fail2ban), SSL/TLS review, and written security findings report.',
                addonPrice: 950
            },
            {
                id: 'srv-monitoring', icon: '\ud83d\udce1', title: '24/7 Uptime & Performance Monitoring',
                price: '$120/month CAD',
                nextStage: 'maintenance',
                details: 'Real-time server monitoring with CPU/RAM/disk alerts, downtime notifications via SMS and email, monthly performance trend reports, and anomaly detection.',
                addonPrice: 0, maintMonthly: 120
            },
            {
                id: 'srv-no-addons', icon: '\u2714', title: 'No Additional IT Services',
                price: 'No additional cost',
                nextStage: 'maintenance',
                details: 'Proceed with the selected server package as configured.',
                addonPrice: 0
            }
        ]
    },

    /* \u2500\u2500 STAGE 2c: Startup Design Add-ons \u2500\u2500 */
    {
        id: 'startup-addons', title: 'Startup Design \u2014 Supporting Materials', icon: '\u2728',
        description: 'Complete your brand launch with professional supporting collateral.',
        options: [
            {
                id: 'brand-cards', icon: '\ud83d\udcb3', title: 'Business Card Design',
                price: '$185 \u2013 $350 CAD',
                nextStage: 'eta-rush',
                details: 'Double-sided business card design (front + back). 3 layout options, print-ready files (CMYK), digital version, and local printer referral in Alberta.',
                addonPrice: 250
            },
            {
                id: 'brand-social', icon: '\ud83d\udcf1', title: 'Social Media Branding Kit',
                price: '$325 \u2013 $650 CAD',
                nextStage: 'eta-rush',
                details: 'Branded profile images, cover photos, and post templates for Facebook, Instagram, LinkedIn, and TikTok. Consistent visual identity across all social platforms.',
                addonPrice: 450
            },
            {
                id: 'brand-letterhead', icon: '\ud83d\udccb', title: 'Letterhead & Document Templates',
                price: '$250 \u2013 $480 CAD',
                nextStage: 'eta-rush',
                details: 'Branded letterhead, invoice template, proposal template, and email signature HTML file. Complete professional document suite for business operations.',
                addonPrice: 350
            },
            {
                id: 'brand-no-addons', icon: '\u2714', title: 'No Additional Deliverables',
                price: 'No additional cost',
                nextStage: 'eta-rush',
                details: 'Proceed with the selected design package only.',
                addonPrice: 0
            }
        ]
    },

    /* \u2500\u2500 STAGE 3: Hosting (web app / mobile / ecommerce / enterprise) \u2500\u2500 */
    {
        id: 'hosting', title: 'Choose Your Hosting', icon: '\u2601\ufe0f',
        description: 'Where will your solution live? Your hosting choice affects billing, control, and ongoing maintenance responsibilities.',
        options: [
            {
                id: 'method-hub', icon: '\ud83d\udd12', title: 'Method Hub (Fully Managed)',
                price: 'Included in package',
                nextStage: 'ownership',
                details: 'Fully managed by Method Media. One monthly bill, zero infrastructure headaches. 99.9% uptime SLA with automatic backups, updates, and security patches.',
                monthlyAddon: 0
            },
            {
                id: 'public-cloud', icon: '\u2601\ufe0f', title: 'Public Cloud (AWS / Azure / GCP)',
                price: 'You pay cloud provider directly',
                nextStage: 'ownership',
                details: 'Full infrastructure control on your own cloud account. Provider charges billed separately. Method Media handles setup, migration, and configuration.',
                monthlyAddon: 0
            },
            {
                id: 'hybrid', icon: '\u26a1', title: 'Hybrid (On-Premise + Cloud)',
                price: '$950 setup + shared cloud cost',
                nextStage: 'ownership',
                details: 'Sensitive or regulated data stays on-premise while scalable workloads run in the cloud. Ideal for businesses with compliance requirements or existing server assets.',
                monthlyAddon: 950
            }
        ]
    },

    /* \u2500\u2500 STAGE 4: Ownership Model \u2500\u2500 */
    {
        id: 'ownership', title: 'Ownership Model', icon: '\ud83d\udcdd',
        description: 'How will you own and operate your solution long-term?',
        options: [
            {
                id: 'subscription', icon: '\ud83d\udd04', title: 'Subscription (SaaS / Managed)',
                price: '$350 \u2013 $1,800/month CAD',
                nextStage: 'ai',
                details: 'Always on the latest version. Includes hosting, all updates, security patches, and support bundled into one monthly fee. Cancel with 30 days notice.',
                monthly: 875
            },
            {
                id: 'full-ownership', icon: '\ud83c\udfc6', title: 'Full Ownership (One-Time Licence)',
                price: 'One-time fee + $195/mo optional support',
                nextStage: 'ai',
                details: 'You own the complete source code and all intellectual property outright. Optional monthly support retainer available. Future feature updates quoted separately.',
                monthly: 195
            }
        ]
    },

    /* \u2500\u2500 STAGE 5: AI Integration \u2500\u2500 */
    {
        id: 'ai', title: 'AI Integration Level', icon: '\ud83e\udd16',
        description: 'Enhance your solution with artificial intelligence. Alberta businesses using AI report 28% average productivity gains.',
        options: [
            {
                id: 'ai-none', icon: '\u2014', title: 'No AI Features',
                price: 'No additional cost',
                nextStage: 'maintenance',
                details: 'Core functionality only, no AI components. AI integrations can be added in any future phase without rebuilding.',
                aiAddon: 0
            },
            {
                id: 'ai-basic', icon: '\ud83d\udcac', title: 'Conversational AI (Basic)',
                price: '$39/user/month CAD',
                nextStage: 'maintenance',
                details: 'Smart chatbot, FAQ automation, ticket routing, and AI-powered search. Ideal for automating customer service and reducing support overhead.',
                aiAddon: 39
            },
            {
                id: 'ai-advanced', icon: '\ud83e\udde0', title: 'Advanced AI Suite',
                price: '$89/user/month CAD',
                nextStage: 'maintenance',
                details: 'Voice recognition, predictive analytics, automated decision-making workflows, and industry-specific AI models calibrated to your sector.',
                aiAddon: 89
            },
            {
                id: 'ai-custom', icon: '\ud83d\ude80', title: 'Custom AI Model Training',
                price: '$4,500 \u2013 $12,000 CAD',
                nextStage: 'maintenance',
                details: 'Fine-tuned language or vision AI model trained exclusively on your proprietary data. Deployed on your infrastructure \u2014 fully owned by you.',
                aiAddon: 0
            }
        ]
    },

    /* \u2500\u2500 STAGE 6: Support & Maintenance \u2500\u2500 */
    {
        id: 'maintenance', title: 'Support & Maintenance Plan', icon: '\ud83d\udee1\ufe0f',
        description: 'Protect your investment with ongoing professional support. All plans are delivered by Canadian-based team members.',
        options: [
            {
                id: 'self-maintain', icon: '\ud83d\udd27', title: 'Self-Maintained',
                price: 'No additional cost',
                nextStage: 'addons',
                details: 'Full source code access provided. You manage updates, bug fixes, and security patches independently on your own schedule.',
                maintMonthly: 0
            },
            {
                id: 'standard-support', icon: '\ud83d\udcde', title: 'Standard Support',
                price: '$225/month CAD',
                nextStage: 'addons',
                details: 'Business-hours support (M\u2013F 8am\u20136pm MT). Bug fixes within 5 business days. Monthly security updates and performance health reports.',
                maintMonthly: 225
            },
            {
                id: 'priority-support', icon: '\u26a1', title: 'Priority 24/7 Support',
                price: '$545/month CAD',
                nextStage: 'addons',
                details: '24/7 emergency hotline with 4-hour response SLA. Weekly security patching, dedicated account manager, and proactive uptime monitoring.',
                maintMonthly: 545
            },
            {
                id: 'enterprise-support', icon: '\ud83c\udfc5', title: 'Enterprise SLA Package',
                price: '$1,100/month CAD',
                nextStage: 'addons',
                details: '99.99% uptime guarantee. 1-hour critical response SLA. Quarterly architecture reviews, onsite visits available in Alberta, and dedicated development resources.',
                maintMonthly: 1100
            }
        ]
    },

    /* \u2500\u2500 STAGE 7: Add-On Features \u2500\u2500 */
    {
        id: 'addons', title: 'Add-On Features', icon: '\u2728',
        description: 'Enhance your package with premium features tailored for Alberta market needs.',
        options: [
            {
                id: 'analytics', icon: '\ud83d\udcca', title: 'Analytics Dashboard',
                price: '$1,200 one-time + $65/mo',
                nextStage: 'eta-rush',
                details: 'Real-time KPI dashboards, custom report builder, data export (CSV/Excel/PDF), and automated email digest reports for stakeholders.',
                addonPrice: 1200
            },
            {
                id: 'integrations', icon: '\ud83d\udd17', title: 'Third-Party Integrations',
                price: '$1,400 \u2013 $3,800 each',
                nextStage: 'eta-rush',
                details: 'QuickBooks, Sage, Salesforce, Shopify, Stripe, Google Workspace, Microsoft 365, and 40+ additional connectors. Each integration scoped and quoted individually.',
                addonPrice: 2200
            },
            {
                id: 'white-label', icon: '\ud83c\udfa8', title: 'White-Label Reseller Rights',
                price: '$6,500 one-time CAD',
                nextStage: 'eta-rush',
                details: 'Sell the platform under your own brand to your clients. Includes full customization rights, branded admin panel, and complete reseller documentation.',
                addonPrice: 6500
            },
            {
                id: 'accessibility', icon: '\u267f', title: 'AODA / WCAG 2.1 Compliance Pack',
                price: '$875 one-time CAD',
                nextStage: 'eta-rush',
                details: 'Full accessibility audit, remediation to WCAG 2.1 AA standard, and ongoing compliance monitoring to meet Alberta AODA requirements.',
                addonPrice: 875
            },
            {
                id: 'no-addons', icon: '\u2714', title: 'No Additional Features',
                price: 'No additional cost',
                nextStage: 'eta-rush',
                details: 'Proceed with your current configuration as selected. Add-ons can always be scoped in a future phase.',
                addonPrice: 0
            }
        ]
    },

    /* \u2500\u2500 STAGE 8: Rush ETA / Delivery Timeline \u2500\u2500 */
    {
        id: 'eta-rush', title: 'Delivery Timeline', icon: '\u23f1\ufe0f',
        description: 'Select your preferred delivery timeline. Expedited builds require additional resource allocation and priority scheduling fees.',
        options: [
            {
                id: 'no-rush', icon: '\ud83c\udf3f', title: 'Standard Delivery (No Rush)',
                price: 'No additional charge',
                nextStage: 'complete',
                details: 'No specific deadline pressure. Quality-first development pace. Typical timelines vary by project scope and are documented in the Project Charter signed within 5 business days.',
                etaAddon: 0,
                etaLabel: 'Standard \u2014 quality-first pace'
            },
            {
                id: 'rush-level-2', icon: '\u26a1', title: 'Rush Level 2 \u2014 3 to 7 Months',
                price: '+18% of project total CAD',
                nextStage: 'complete',
                details: 'Expedited delivery with a committed 3\u20137 month timeline. Additional development resources allocated and milestone schedule guaranteed in the Project Charter.',
                etaAddon: 0.18,
                etaLabel: '3\u20137 Month Rush Delivery'
            },
            {
                id: 'rush-level-3', icon: '\ud83d\udd25', title: 'Rush Level 3 \u2014 2 to 3 Months',
                price: '+35% of project total CAD',
                nextStage: 'complete',
                details: 'High-priority fast-track delivery. Dedicated full-time development team, extended working hours, and daily progress reports. Strict 2\u20133 month timeline commitment.',
                etaAddon: 0.35,
                etaLabel: '2\u20133 Month Fast-Track'
            },
            {
                id: 'premiere-enterprise', icon: '\ud83d\udc51', title: 'Premi\u00e8re Enterprise \u2014 1-Week Demo',
                price: '+65% upfront \u00b7 $25/user/mo until complete',
                nextStage: 'complete',
                details: 'Elite tier: a functional working demo is delivered within 1 calendar week. Your company operates on the live beta while full development continues in parallel. A per-user fee of $25/month applies until the final production build is deployed and signed off.',
                etaAddon: 0.65,
                etaLabel: '1-Week Demo \u00b7 Beta Launch \u00b7 $25/user/mo',
                premiereEnterprise: true
            }
        ]
    }
];'''

new_content = content[:start] + new_section + content[end + 2:]
open('/workspace/public/app.js', 'w', encoding='utf-8').write(new_content)
print(f'Done. New file length: {len(new_content)} chars')
print(f'Old section length: {len(old_section)}, new section length: {len(new_section)}')