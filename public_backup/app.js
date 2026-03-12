// State Management
const state = {
    currentPage: 'landing',
    userName: '',
    userToken: '',
    waxSealImage: '',
    preferences: {},
    currentCloudStage: 0,
    cloudHistory: [],
    agreementData: {},
    registerSignatureData: null,
    loginSignatureData: null,
    usingPasswordBackup: false
};

// Cloud Configuration Tree
const cloudTree = [
    {
        id: 'hosting',
        title: 'Choose Your Hosting',
        description: 'Select where your solution will be hosted. This affects your billing structure and maintenance responsibilities.',
        options: [
            {
                id: 'method-hub',
                title: 'Method Hub Hosting',
                description: 'One bill, full-service hosting. We handle everything so you can focus on your business.',
                price: 'Included in base package',
                nextStage: 'app-type',
                details: 'Full maintenance, security updates, backups, and 24/7 monitoring included.'
            },
            {
                id: 'public-cloud',
                title: 'Public Cloud Server',
                description: 'Host on AWS, Azure, or Google Cloud. You control the infrastructure.',
                price: 'You pay cloud provider directly',
                nextStage: 'app-type',
                details: 'You are responsible for all cloud charges, maintenance, and security. We provide setup assistance.'
            }
        ]
    },
    {
        id: 'app-type',
        title: 'Choose Your Application Type',
        description: 'Decide how your users will access your solution.',
        options: [
            {
                id: 'native-app',
                title: 'Native Mobile App',
                description: 'Downloadable app for iOS and Android with full device access.',
                price: '$15,000 - $25,000 CAD',
                nextStage: 'ownership',
                details: 'Requires App Store approval. Full offline capabilities.'
            },
            {
                id: 'pwa',
                title: 'Progressive Web App (PWA)',
                description: 'Web-based app that works on any device with a browser.',
                price: '$8,000 - $15,000 CAD',
                nextStage: 'ownership',
                details: 'No app store approval needed. Works offline with caching.'
            }
        ]
    },
    {
        id: 'ownership',
        title: 'Choose Your Ownership Model',
        description: 'Select how you want to own and use your solution.',
        options: [
            {
                id: 'subscription',
                title: 'Subscription Model',
                description: 'Pay monthly, always have the latest features.',
                price: '$299 - $1,499/month',
                nextStage: 'ai-integration',
                details: 'Includes all updates, support, and maintenance. Cancel anytime.'
            },
            {
                id: 'full-ownership',
                title: 'Full Ownership',
                description: 'Own your solution outright with exclusive rights.',
                price: '$45,000 - $85,000 CAD',
                nextStage: 'ai-integration',
                details: 'One-time payment. You own the code and can modify it freely.'
            }
        ]
    },
    {
                id: 'ai-integration',
                title: 'AI Integration Level',
        description: 'Choose how AI-powered your solution should be.',
        options: [
            {
                id: 'ai-none',
                title: 'No AI Integration',
                description: 'Traditional solution without AI features.',
                price: 'No additional cost',
                nextStage: 'maintenance',
                details: 'Focus on core functionality without AI capabilities.'
            },
            {
                id: 'ai-basic',
                title: 'Basic AI Assistant',
                description: 'AI-powered chatbot for customer support.',
                price: '$29/employee/month',
                nextStage: 'maintenance',
                details: 'Basic Q&A, document search, and simple task automation.'
            },
            {
                id: 'ai-advanced',
                title: 'Advanced AI Suite',
                description: 'Full AI integration with speech recognition and automation.',
                price: '$79/employee/month',
                nextStage: 'maintenance',
                details: 'Speech recognition, worker assistant, industry-specific decision support, automated form filling.'
            }
        ]
    },
    {
        id: 'maintenance',
        title: 'Choose Your Maintenance Plan',
        description: 'Select how ongoing support and updates will be handled.',
        options: [
            {
                id: 'self-maintained',
                title: 'Self-Maintained',
                description: 'Handle all maintenance and updates yourself.',
                price: 'No additional cost',
                nextStage: 'addons',
                details: 'Full control but requires technical expertise.'
            },
            {
                id: 'method-maintenance',
                title: 'Method Media Maintenance',
                description: 'We handle all maintenance, updates, and support.',
                price: '$199 - $599/month',
                nextStage: 'addons',
                details: '24/7 support, security updates, bug fixes, and feature enhancements.'
            }
        ]
    },
    {
        id: 'addons',
        title: 'Additional Features',
        description: 'Select any additional features you need.',
        options: [
            {
                id: 'analytics',
                title: 'Advanced Analytics Dashboard',
                description: 'Comprehensive analytics and reporting.',
                price: '$500 one-time + $50/month',
                nextStage: 'complete',
                details: 'Real-time metrics, custom reports, data export.'
            },
            {
                id: 'integrations',
                title: 'Third-Party Integrations',
                description: 'Connect with your existing tools and systems.',
                price: '$1,000 - $3,000 per integration',
                nextStage: 'complete',
                details: 'CRM, accounting, scheduling, and other business systems.'
            },
            {
                id: 'white-label',
                title: 'White-Label Solution',
                description: 'Your branding, your solution, your clients.',
                price: '$5,000 one-time',
                nextStage: 'complete',
                details: 'Full customization with your branding and client management.'
            },
            {
                id: 'none',
                title: 'No Additional Features',
                description: 'Proceed with your current configuration.',
                price: 'No additional cost',
                nextStage: 'complete',
                details: 'Your solution is ready with the features you\'ve selected.'
            }
        ]
    }
];

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    state.currentPage = pageId;
}

// Landing Page Handlers
document.getElementById('name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleNameEntry();
    }
});

document.getElementById('enter-name-btn').addEventListener('click', handleNameEntry);

function handleNameEntry() {
    const name = document.getElementById('name-input').value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    state.userName = name;
    
    // Check if user exists
    fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exists) {
            // Returning user - show login page
            document.getElementById('login-wax-seal').src = data.waxSeal || '';
            showPage('login-page');
            initLoginSignaturePad();
        } else {
            // New user - go to password setup
            showPage('password-page');
            startSealGeneration();
        }
    })
    .catch(err => {
        console.error('Error:', err);
        // Default to new user flow on error
        showPage('password-page');
        startSealGeneration();
    });
}

// Signature & Password Setup
function startSealGeneration() {
    const generatingSeal = document.querySelector('.generating-seal');
    const signaturePasswordForm = document.getElementById('signature-password-form');
    const waxSealResult = document.getElementById('wax-seal-result');
    
    generatingSeal.style.display = 'flex';
    signaturePasswordForm.style.display = 'none';
    waxSealResult.style.display = 'none';
    
    // Simulate generation time
    setTimeout(() => {
        generatingSeal.style.display = 'none';
        signaturePasswordForm.style.display = 'block';
        initRegisterSignaturePad();
    }, 3000);
}

// Initialize signature pads
let registerSignaturePad;
let loginSignaturePad;

function initRegisterSignaturePad() {
    const canvas = document.getElementById('register-signature-pad');
    if (!canvas) return;
    
    registerSignaturePad = createSignaturePad(canvas);
    
    document.getElementById('clear-register-signature').addEventListener('click', () => {
        registerSignaturePad.clear();
        state.registerSignatureData = null;
    });
}

function initLoginSignaturePad() {
    const canvas = document.getElementById('login-signature-pad');
    if (!canvas) return;
    
    loginSignaturePad = createSignaturePad(canvas);
    
    document.getElementById('clear-login-signature').addEventListener('click', () => {
        loginSignaturePad.clear();
        state.loginSignatureData = null;
    });
}

function createSignaturePad(canvas) {
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    let isDrawing = false;
    let signatureData = [];
    let strokeStartTime = 0;
    
    function startDrawing(e) {
        isDrawing = true;
        strokeStartTime = Date.now();
        const [x, y] = getCoordinates(e);
        signatureData.push({ x, y, time: Date.now(), force: 1 });
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const [x, y] = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(signatureData[signatureData.length - 1].x, signatureData[signatureData.length - 1].y);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        signatureData.push({ x, y, time: Date.now(), force: 1 });
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        return [clientX - rect.left, clientY - rect.top];
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
    
    return {
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            signatureData = [];
        },
        getData: () => signatureData.length > 0 ? signatureData : null
    };
}

document.getElementById('create-account-btn').addEventListener('click', () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    
    errorDiv.textContent = '';
    
    // Validate password if provided
    if (password) {
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errorDiv.textContent = 'Password must contain at least one special character';
            return;
        }
        if (!/\d/.test(password)) {
            errorDiv.textContent = 'Password must contain at least one number';
            return;
        }
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }
    }
    
    // Get signature data
    const signatureData = registerSignaturePad.getData();
    if (!signatureData || signatureData.length < 10) {
        errorDiv.textContent = 'Please sign to create your signature passkey';
        return;
    }
    
    // Register user
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: state.userName,
            password: password || null,
            confirmPassword: confirmPassword || null,
            signatureData: signatureData
            name: state.userName,
            password: password,
            confirmPassword: confirmPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            state.userToken = data.token;
            state.waxSealImage = data.waxSeal;
            
            // Show wax seal result
            document.getElementById('password-form').style.display = 'none';
            document.getElementById('wax-seal-result').style.display = 'block';
            document.getElementById('user-wax-seal').src = data.waxSeal;
            document.getElementById('unique-token').textContent = data.token;
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
        }
    })
    .catch(err => {
        console.error('Error:', err);
        errorDiv.textContent = 'Registration failed. Please try again.';
    });
});

document.getElementById('continue-btn').addEventListener('click', () => {
    showPage('cloud-page');
    showCloudStage(0);
});

// Login Handlers
// Show password login fallback
document.getElementById('show-password-login').addEventListener('click', () => {
    const passwordSection = document.getElementById('password-login-section');
    passwordSection.style.display = passwordSection.style.display === 'none' ? 'block' : 'none';
    state.usingPasswordBackup = passwordSection.style.display === 'block';
});

document.getElementById('login-btn').addEventListener('click', () => {
    const name = document.getElementById('login-name').value;
    const password = state.usingPasswordBackup ? document.getElementById('login-password').value : null;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!name) {
        errorDiv.textContent = 'Please enter your name';
        return;
    }
    
    // Get signature data if not using password
    let signatureData = null;
    if (!state.usingPasswordBackup) {
        signatureData = loginSignaturePad.getData();
        if (!signatureData || signatureData.length < 10) {
            errorDiv.textContent = 'Please sign to authenticate';
            return;
        }
    }
    
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: name,
            password: password,
            signatureData: signatureData
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            state.userName = name;
            state.userToken = data.token;
            state.waxSealImage = data.waxSeal;
            
            // Show authentication method
            if (data.authMethod) {
                console.log(`Authenticated via: ${data.authMethod}`);
                if (data.confidence) {
                    console.log(`Confidence: ${(data.confidence * 100).toFixed(1)}%`);
                }
            }
            
            // Load existing preferences
            fetch('/api/preferences')
                .then(res => res.json())
                .then(prefData => {
                    state.preferences = prefData.preferences || {};
                    showPage('cloud-page');
                    showCloudStage(0);
                });
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            if (data.confidence !== undefined) {
                errorDiv.textContent += ` (Confidence: ${(data.confidence * 100).toFixed(1)}%)`;
            }
        }
    })
    .catch(err => {
        console.error('Error:', err);
        errorDiv.textContent = 'Login failed. Please try again.';
    });
});

// Cloud Configuration System
function showCloudStage(stageIndex) {
    const stage = cloudTree[stageIndex];
    const cloudStage = document.getElementById('cloud-stage');
    const backBtn = document.getElementById('back-btn');
    const nextPreview = document.getElementById('next-preview');
    
    state.currentCloudStage = stageIndex;
    
    // Show/hide back button
    backBtn.style.display = state.cloudHistory.length > 0 ? 'block' : 'none';
    
    // Update next preview
    if (stage.options[0]) {
        nextPreview.textContent = stage.options[0].nextStage === 'complete' 
            ? 'Complete configuration and generate agreement' 
            : cloudTree.find(s => s.id === stage.options[0].nextStage)?.title || 'Complete';
    }
    
    // Generate cloud content
    cloudStage.innerHTML = `
        <div class="cloud">
            <h2>${stage.title}</h2>
            <p class="cloud-description">${stage.description}</p>
            <div class="cloud-options">
                ${stage.options.map(option => `
                    <div class="cloud-option" data-option-id="${option.id}">
                        <h3>${option.title}</h3>
                        <p>${option.description}</p>
                        <p style="margin-top: 10px; color: #888;">${option.details}</p>
                        <div class="cloud-option-price">${option.price}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.cloud-option').forEach(option => {
        option.addEventListener('click', () => handleCloudOption(option.dataset.optionId));
    });
}

function handleCloudOption(optionId) {
    const currentStage = cloudTree[state.currentCloudStage];
    const selectedOption = currentStage.options.find(opt => opt.id === optionId);
    
    // Store preference
    state.preferences[currentStage.id] = {
        optionId: optionId,
        ...selectedOption
    };
    
    // Add to history
    state.cloudHistory.push({
        stageIndex: state.currentCloudStage,
        optionId: optionId
    });
    
    // Save preferences
    fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: state.preferences })
    });
    
    // Navigate to next stage
    if (selectedOption.nextStage === 'complete') {
        generateAgreement();
    } else {
        const nextStageIndex = cloudTree.findIndex(s => s.id === selectedOption.nextStage);
        showCloudStage(nextStageIndex);
    }
}

document.getElementById('back-btn').addEventListener('click', () => {
    if (state.cloudHistory.length > 0) {
        const lastState = state.cloudHistory.pop();
        
        // Remove preference
        const stageId = cloudTree[lastState.stageIndex].id;
        delete state.preferences[stageId];
        
        // Save updated preferences
        fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: state.preferences })
        });
        
        // Show previous stage
        showCloudStage(lastState.stageIndex);
    }
});

// Agreement Generation
function generateAgreement() {
    const agreementType = determineAgreementType();
    
    state.agreementData = {
        type: agreementType,
        preferences: state.preferences,
        userName: state.userName,
        userToken: state.userToken
    };
    
    // Generate agreement HTML
    const agreementHTML = generateAgreementHTML();
    document.getElementById('agreement-content').innerHTML = agreementHTML;
    document.getElementById('agreement-wax-seal-img').src = state.waxSealImage;
    
    // Set title
    document.getElementById('agreement-title').textContent = getAgreementTitle(agreementType);
    
    // Show agreement page
    showPage('agreement-page');
    
    // Initialize scroll listener
    initScrollListener();
}

function determineAgreementType() {
    const ownership = state.preferences.ownership?.optionId;
    const hosting = state.preferences.hosting?.optionId;
    
    if (ownership === 'subscription') {
        return 'Subscription Agreement';
    } else if (ownership === 'full-ownership') {
        return 'Full Stack Development Agreement';
    }
    
    return 'Custom Development Agreement';
}

function getAgreementTitle(type) {
    return type;
}

function generateAgreementHTML() {
    let html = '<h2>Configuration Summary</h2>';
    
    Object.keys(state.preferences).forEach(key => {
        const pref = state.preferences[key];
        html += `
            <div class="preference-item">
                <h3>${pref.title}</h3>
                <p>${pref.description}</p>
                <p><strong>Price:</strong> ${pref.price}</p>
                <p><strong>Details:</strong> ${pref.details}</p>
            </div>
        `;
    });
    
    html += '<h2 style="margin-top: 30px;">Agreement Terms</h2>';
    html += '<p>This agreement is entered into between Method Media - Heavy Hitters (Service Provider) and ' + state.userName + ' (Client).</p>';
    
    return html;
}

// Scroll Handler for Agreement
function initScrollListener() {
    const finePrint = document.getElementById('fine-print');
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    finePrint.addEventListener('scroll', () => {
        const scrollHeight = finePrint.scrollHeight - finePrint.clientHeight;
        const scrolled = finePrint.scrollTop;
        
        if (scrolled >= scrollHeight - 10) {
            scrollIndicator.style.display = 'none';
        }
    });
}

// Agreement Signature
document.getElementById('agree-checkbox').addEventListener('change', (e) => {
    const signatureSection = document.getElementById('signature-section');
    
    if (e.target.checked) {
        signatureSection.style.display = 'block';
        document.getElementById('signature-wax-seal').src = state.waxSealImage;
        initSignaturePad();
    } else {
        signatureSection.style.display = 'none';
    }
});

// Signature Pad
let signaturePad;
function initSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const [x, y] = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        return [clientX - rect.left, clientY - rect.top];
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
}

document.getElementById('clear-signature-btn').addEventListener('click', () => {
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('finalize-agreement-btn').addEventListener('click', () => {
    const canvas = document.getElementById('signature-pad');
    const signatureData = canvas.toDataURL();
    const email = document.getElementById('client-email').value;
    const phone = document.getElementById('client-phone').value;
    
    // Validate contact info
    if (!email || !phone) {
        alert('Please provide both email and phone number');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    state.agreementData.clientEmail = email;
    state.agreementData.clientPhone = phone;
    
    // Save signature
    fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signatureData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            state.agreementData.clientSignature = data.signaturePath;
            
            // Save agreement and generate contract
            return fetch('/api/agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agreementType: state.agreementData.type,
                    preferences: state.agreementData.preferences
                })
            });
        }
        throw new Error('Failed to save signature: ' + (data.error || 'Unknown error'));
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Generate contract
            return fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences: state.agreementData.preferences,
                    clientSignature: state.agreementData.clientSignature,
                    clientEmail: state.agreementData.clientEmail,
                    clientPhone: state.agreementData.clientPhone
                })
            });
        }
        throw new Error('Failed to save agreement: ' + (data.error || 'Unknown error'));
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Save contract data to localStorage
            localStorage.setItem('contractData', JSON.stringify({
                userName: state.userName,
                waxSealImage: state.waxSealImage,
                preferences: state.agreementData.preferences,
                clientSignature: state.agreementData.clientSignature,
                clientEmail: state.agreementData.clientEmail,
                clientPhone: state.agreementData.clientPhone
            }));
            
            // Redirect to contract viewer
            window.location.href = '/contract-viewer.html';
        } else {
            throw new Error(data.error || 'Failed to generate contract');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to finalize agreement: ' + error.message);
    });
});

function showFinalAgreement() {
    const finalContent = document.getElementById('final-agreement-content');
    
    finalContent.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 20px;">${getAgreementTitle(state.agreementData.type)}</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>Client:</strong> ${state.userName}</p>
            <p><strong>Token:</strong> ${state.userToken}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <h3 style="color: #ffd700; margin: 20px 0;">Selected Configuration</h3>
        ${Object.keys(state.preferences).map(key => {
            const pref = state.preferences[key];
            return `
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                    <h4 style="color: #fff;">${pref.title}</h4>
                    <p style="color: #ccc; font-size: 14px;">${pref.description}</p>
                    <p style="color: #ffd700; font-weight: bold; margin-top: 5px;">${pref.price}</p>
                </div>
            `;
        }).join('')}
        <div style="margin-top: 30px; text-align: center;">
            <img src="${state.waxSealImage}" style="width: 100px; height: 100px; border-radius: 50%;" alt="Wax Seal">
        </div>
    `;
    
    showPage('final-agreement-page');
}

// Final Agreement Actions
document.getElementById('download-btn').addEventListener('click', () => {
    alert('PDF download feature - In production, this would generate and download a PDF of the agreement');
});

document.getElementById('share-btn').addEventListener('click', () => {
    alert('Share feature - In production, this would generate a shareable link for remote signing');
});

document.getElementById('new-agreement-btn').addEventListener('click', () => {
    // Reset state
    state.preferences = {};
    state.cloudHistory = [];
    state.agreementData = {};
    state.currentCloudStage = 0;
    
    // Go back to cloud page
    showPage('cloud-page');
    showCloudStage(0);
});

// Check authentication on load
fetch('/api/auth/status')
    .then(res => res.json())
    .then(data => {
        if (data.authenticated) {
            state.userName = data.userName;
            fetch('/api/preferences')
                .then(res => res.json())
                .then(prefData => {
                    state.preferences = prefData.preferences || {};
                    showPage('cloud-page');
                    showCloudStage(0);
                });
        }
    });