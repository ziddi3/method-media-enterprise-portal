'use strict';

const express   = require('express');
const sqlite3   = require('sqlite3').verbose();
const session   = require('express-session');
const bcrypt    = require('bcryptjs');
const bodyParser= require('body-parser');
const path      = require('path');
const fs        = require('fs');
const { createCanvas, loadImage } = require('canvas');
const SignatureVerifier = require('./signature-verifier');

const sigVerifier = new SignatureVerifier();
const app   = express();
const PORT  = process.env.PORT || 3000;

/* ─── MIDDLEWARE ───────────────────────────────────────── */
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'method-media-enterprise-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

/* ─── CSRF PROTECTION ─────────────────────────────────────────────── */
const crypto = require('crypto');

// Generate CSRF token for each session
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Endpoint to get CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.session.csrfToken });
});

// Validate CSRF on state-changing requests (POST/PUT/DELETE)
// Skip for API routes that handle their own auth (admin-login uses session check)
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const token = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!req.session.csrfToken || token === req.session.csrfToken) {
        return next();
    }
    // For now, log but don't block — gradual rollout
    // Once frontend sends tokens consistently, change to: return res.status(403).json({ error: 'Invalid CSRF token' });
    next();
});

/* ─── DATABASE ─────────────────────────────────────────── */
const db = new sqlite3.Database('./users.db', err => {
    if (err) { console.error('DB error:', err); process.exit(1); }
    console.log('Connected to SQLite database');
    initDB();
});

function initDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            username            TEXT    UNIQUE NOT NULL,
            password            TEXT,
            unique_token        TEXT    UNIQUE,
            wax_seal_path       TEXT,
            preferences         TEXT,
            signature_data      TEXT,
            signature_created_at DATETIME,
            created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS agreements (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER,
            agreement_type  TEXT,
            preferences     TEXT,
            status          TEXT DEFAULT 'signed',
            signatures      TEXT,
            client_email    TEXT,
            client_phone    TEXT,
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        /* ── Migrate old 'name' column if necessary ── */
        db.all("PRAGMA table_info(users)", (err, cols) => {
            if (err || !cols) return;
            const hasUsername = cols.some(c => c.name === 'username');
            const hasName     = cols.some(c => c.name === 'name');
            if (!hasUsername && hasName) {
                db.run("ALTER TABLE users RENAME COLUMN name TO username", e => {
                    if (e) console.error('Migration error:', e);
                    else   console.log('Migrated: name → username');
                });
            }
            const hasSigData = cols.some(c => c.name === 'signature_data');
            if (!hasSigData) {
                db.run("ALTER TABLE users ADD COLUMN signature_data TEXT");
                db.run("ALTER TABLE users ADD COLUMN signature_created_at DATETIME");
            }
            // Add client_email / client_phone to agreements if missing
            db.all("PRAGMA table_info(agreements)", (e2, acols) => {
                if (e2 || !acols) return;
                if (!acols.some(c => c.name === 'client_email')) {
                    db.run("ALTER TABLE agreements ADD COLUMN client_email TEXT");
                }
                if (!acols.some(c => c.name === 'client_phone')) {
                    db.run("ALTER TABLE agreements ADD COLUMN client_phone TEXT");
                }
                if (!acols.some(c => c.name === 'requirements')) {
                    db.run("ALTER TABLE agreements ADD COLUMN requirements TEXT");
                }
                if (!acols.some(c => c.name === 'owner_notes')) {
                    db.run("ALTER TABLE agreements ADD COLUMN owner_notes TEXT");
                }
                if (!acols.some(c => c.name === 'total_label')) {
                    db.run("ALTER TABLE agreements ADD COLUMN total_label TEXT");
                }
                if (!acols.some(c => c.name === 'invoice_number')) {
                    db.run("ALTER TABLE agreements ADD COLUMN invoice_number TEXT");
                }
                if (!acols.some(c => c.name === 'invoice_html')) {
                    db.run("ALTER TABLE agreements ADD COLUMN invoice_html TEXT");
                }
                if (!acols.some(c => c.name === 'invoice_generated_at')) {
                    db.run("ALTER TABLE agreements ADD COLUMN invoice_generated_at DATETIME");
                }
            });
            // Add is_admin column if missing (for owner account support)
            if (!cols.some(c => c.name === 'is_admin')) {
                db.run("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
            }
            if (!cols.some(c => c.name === 'email')) {
                db.run("ALTER TABLE users ADD COLUMN email TEXT");
            }
            if (!cols.some(c => c.name === 'phone')) {
                db.run("ALTER TABLE users ADD COLUMN phone TEXT");
            }
        });
    });
}

/* ─── HELPERS ──────────────────────────────────────────── */
function generateToken() {
    return 'MM-' + Math.random().toString(36).substr(2, 9).toUpperCase() +
           '-' + Date.now().toString(36).toUpperCase();
}

function validatePassword(pw) {
    if (!pw || pw.length < 6)             return { valid: false, message: 'Password must be at least 6 characters' };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return { valid: false, message: 'Password must contain at least one special character' };
    if (!/\d/.test(pw))                   return { valid: false, message: 'Password must contain at least one number' };
    return { valid: true };
}

async function generateWaxSeal(name, signatureData = null) {
    try {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 3);

        /* All available seal templates */
        const templates = [
            'Picsart_26-03-01_00-53-34-334.png',
            'Picsart_26-03-01_00-58-40-075.png',
            'Picsart_26-03-01_03-44-34-566.png',
            'Picsart_26-03-01_05-14-46-016.png',
            'Picsart_26-03-02_21-29-15-536.png'
        ].filter(t => fs.existsSync(path.join(__dirname, 'public', t)));

        if (templates.length === 0) return null;

        const tpl  = templates[Math.floor(Math.random() * templates.length)];
        const img  = await loadImage(path.join(__dirname, 'public', tpl));
        const canvas = createCanvas(400, 400);
        const ctx  = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, 400, 400);

        /* Draw user signature as pattern */
        if (signatureData && Array.isArray(signatureData) && signatureData.length > 2) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            signatureData.forEach(p => {
                if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
            });
            const sw = maxX - minX || 1, sh = maxY - minY || 1;
            const scale = Math.min(160 / sw, 80 / sh) * 0.9;
            const ox = 200 - (sw * scale) / 2 - minX * scale;
            const oy = 200 - (sh * scale) / 2 - minY * scale;

            ctx.strokeStyle = 'rgba(100,20,20,0.55)';
            ctx.lineWidth   = 1.8;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';

            let started = false;
            signatureData.forEach((pt, i) => {
                const x = pt.x * scale + ox;
                const y = pt.y * scale + oy;
                if (i === 0 || pt.force === 0) {
                    if (started) ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(x, y); started = true;
                } else { ctx.lineTo(x, y); }
            });
            if (started) ctx.stroke();
        }

        /* Initials overlay */
        ctx.shadowColor  = 'rgba(255,215,0,0.7)';
        ctx.shadowBlur   = 20;
        ctx.fillStyle    = 'rgba(100,20,20,0.92)';
        ctx.font         = 'bold 52px Georgia, serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 200, 205);

        /* Save */
        const dir = path.join(__dirname, 'public', 'wax_seals');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filename = `seal_${Date.now()}.png`;
        fs.writeFileSync(path.join(dir, filename), canvas.toBuffer('image/png'));
        return filename;
    } catch (e) {
        console.error('generateWaxSeal error:', e);
        return null;
    }
}

/* ─── ROUTES ───────────────────────────────────────────── */

/* Check if user exists */
app.post('/api/check-user', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        const user = await dbGet('SELECT username, wax_seal_path FROM users WHERE username = ?', [name]);
        res.json({
            exists:  !!user,
            waxSeal: user?.wax_seal_path ? `/wax_seals/${user.wax_seal_path}` : null
        });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

/* Register */
app.post('/api/register', async (req, res) => {
    const { name, password, confirmPassword, signatureData } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!signatureData) return res.status(400).json({ error: 'Signature is required' });

    if (password) {
        if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
        const v = validatePassword(password);
        if (!v.valid) return res.status(400).json({ error: v.message });
    }

    try {
        const existing = await dbGet('SELECT id FROM users WHERE username = ?', [name]);
        if (existing) return res.status(400).json({ error: 'This name is already registered' });

        const hashed = password ? await bcrypt.hash(password, 12) : null;
        const token  = generateToken();
        const sealFile = await generateWaxSeal(name, signatureData);

        await dbRun(
            `INSERT INTO users (username, password, unique_token, wax_seal_path, signature_data, signature_created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [name, hashed, token, sealFile, JSON.stringify(signatureData)]
        );

        req.session.userId   = (await dbGet('SELECT id FROM users WHERE username = ?', [name])).id;
        req.session.userName = name;

        res.json({ success: true, token, waxSeal: sealFile ? `/wax_seals/${sealFile}` : null });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: 'Registration failed: ' + e.message });
    }
});

/* Login */
app.post('/api/login', async (req, res) => {
    const { name, password, signatureData } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    try {
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [name]);
        if (!user) return res.status(401).json({ error: 'No account found with that name' });

        /* Signature-first auth */
        if (signatureData && user.signature_data) {
            const result = sigVerifier.verifySignature(signatureData, user.signature_data);
            if (result.success) {
                req.session.userId   = user.id;
                req.session.userName = user.username;
                return res.json({
                    success: true, authMethod: 'signature',
                    confidence: result.confidence,
                    token:   user.unique_token,
                    waxSeal: user.wax_seal_path ? `/wax_seals/${user.wax_seal_path}` : null
                });
            }
            /* Signature failed — try password fallback */
            if (password && user.password) {
                const ok = await bcrypt.compare(password, user.password);
                if (ok) {
                    req.session.userId   = user.id;
                    req.session.userName = user.username;
                    return res.json({
                        success: true, authMethod: 'password',
                        message: 'Signature did not match; password backup accepted',
                        token:   user.unique_token,
                        waxSeal: user.wax_seal_path ? `/wax_seals/${user.wax_seal_path}` : null
                    });
                }
            }
            return res.status(401).json({
                error:      'Signature verification failed',
                confidence: result.confidence,
                threshold:  result.threshold,
                message:    'Please retry or use your backup password'
            });
        }

        /* Password-only path */
        if (password && user.password) {
            const ok = await bcrypt.compare(password, user.password);
            if (ok) {
                req.session.userId   = user.id;
                req.session.userName = user.username;
                return res.json({
                    success: true, authMethod: 'password',
                    token:   user.unique_token,
                    waxSeal: user.wax_seal_path ? `/wax_seals/${user.wax_seal_path}` : null
                });
            }
            return res.status(401).json({ error: 'Incorrect password' });
        }

        res.status(401).json({ error: 'Please provide your signature or password', hasPassword: !!user.password });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Login failed' });
    }
});

/* Check if current session is admin */
app.get('/api/admin/check-auth', (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

/* Get full agreement detail for owner dashboard */
app.get('/api/admin/agreement-detail/:id', async (req, res) => {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const row = await dbGet(`
            SELECT a.*, u.username AS user_name, u.wax_seal_path, u.email AS user_email, u.phone AS user_phone
            FROM agreements a LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `, [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true, agreement: row });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Save requirement checklist for an agreement */
app.post('/api/admin/requirements/:id', async (req, res) => {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { requirements } = req.body;
        await dbRun(
            'UPDATE agreements SET requirements = ? WHERE id = ?',
            [JSON.stringify(requirements), req.params.id]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Update agreement status */
app.post('/api/admin/status/:id', async (req, res) => {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { status, notes } = req.body;
        await dbRun(
            'UPDATE agreements SET status = ?, owner_notes = ? WHERE id = ?',
            [status, notes || '', req.params.id]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Admin logout */
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

/* ════════════════════════════════════════════════════════════
   SECRET OWNER ADMIN LOGIN
   Triggered by the 5-click mascot sequence on the landing page
   ════════════════════════════════════════════════════════════ */
app.post('/api/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Credentials required.' });
        }

        // Find user with admin flag
        const user = await dbGet(
            'SELECT * FROM users WHERE username = ? AND is_admin = 1',
            [username]
        );

        if (!user) {
            return res.status(401).json({ success: false, error: 'Access denied.' });
        }

        // Verify password
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ success: false, error: 'Access denied.' });
        }

        // Set session as admin
        req.session.userId  = user.id;
        req.session.isAdmin = true;
        req.session.save();

        res.json({ success: true, username: user.username });
    } catch (e) {
        console.error('Admin login error:', e);
        res.status(500).json({ success: false, error: 'Server error.' });
    }
});

/* Preferences */
app.post('/api/preferences', requireAuth, async (req, res) => {
    try {
        await dbRun('UPDATE users SET preferences = ? WHERE id = ?',
            [JSON.stringify(req.body.preferences), req.session.userId]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Failed to save preferences' }); }
});

app.get('/api/preferences', requireAuth, async (req, res) => {
    try {
        const row = await dbGet('SELECT preferences FROM users WHERE id = ?', [req.session.userId]);
        res.json({ preferences: row?.preferences ? JSON.parse(row.preferences) : {} });
    } catch (e) { res.status(500).json({ error: 'Failed to get preferences' }); }
});

/* Save signature image */
app.post('/api/signature', requireAuth, async (req, res) => {
    try {
        const { signatureData } = req.body; // base64 data-URL
        if (!signatureData) return res.status(400).json({ error: 'No signature data' });

        const dir = path.join(__dirname, 'public', 'signatures');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filename = `sig_${Date.now()}.png`;
        const base64   = signatureData.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(path.join(dir, filename), Buffer.from(base64, 'base64'));

        res.json({ success: true, signaturePath: `/signatures/${filename}` });
    } catch (e) {
        console.error('Signature save error:', e);
        res.status(500).json({ error: 'Failed to save signature' });
    }
});

/* Generate & save contract */
app.post('/api/generate-contract', requireAuth, async (req, res) => {
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { preferences, clientSignature, clientEmail, clientPhone, agreementType, totalLabel } = req.body;

        const result = await dbRun(
            `INSERT INTO agreements
               (user_id, agreement_type, preferences, signatures, client_email, client_phone, total_label, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'signed')`,
            [
                req.session.userId,
                agreementType || 'Master Services Agreement',
                JSON.stringify(preferences || {}),
                JSON.stringify({ clientSignature, timestamp: new Date().toISOString() }),
                clientEmail || '',
                clientPhone || '',
                totalLabel || ''
            ]
        );

        res.json({ success: true, agreementId: result.lastID });
    } catch (e) {
        console.error('Generate contract error:', e);
        res.status(500).json({ error: 'Failed to generate contract: ' + e.message });
    }
});

/* ═══════════════════════════════════════════════════════════════════
   INVOICE GENERATION
   Auto-triggered after contract generation, also callable manually
   ═══════════════════════════════════════════════════════════════════ */
app.post('/api/generate-invoice', requireAuth, async (req, res) => {
    try {
        const { agreementId } = req.body;
        if (!agreementId) return res.status(400).json({ error: 'Agreement ID required' });

        const agreement = await dbGet(
            `SELECT a.*, u.username AS user_name, u.unique_token, u.wax_seal_path, u.email AS user_email, u.phone AS user_phone
             FROM agreements a JOIN users u ON a.user_id = u.id
             WHERE a.id = ? AND a.user_id = ?`,
            [agreementId, req.session.userId]
        );
        if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

        // Generate invoice number: INV-YYYY-XXXXX
        const yr = new Date().getFullYear();
        const seq = String(agreementId).padStart(5, '0');
        const invoiceNumber = `INV-${yr}-${seq}`;

        // Parse preferences to build line items
        const prefs = (() => { try { return JSON.parse(agreement.preferences || '{}'); } catch { return {}; } })();
        const date = new Date(agreement.created_at).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });
        const dueDate = (() => {
            const d = new Date(agreement.created_at);
            d.setDate(d.getDate() + 15);
            return d.toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });
        })();

        const invoiceHTML = buildInvoiceHTML({
            invoiceNumber,
            date,
            dueDate,
            clientName: agreement.user_name || 'Client',
            clientEmail: agreement.client_email || '',
            clientPhone: agreement.client_phone || '',
            agreementType: agreement.agreement_type || 'Services Agreement',
            agreementId: agreement.id,
            token: agreement.unique_token || '',
            totalLabel: agreement.total_label || '',
            preferences: prefs
        });

        // Save to DB
        await dbRun(
            `UPDATE agreements SET invoice_number = ?, invoice_html = ?, invoice_generated_at = datetime('now') WHERE id = ?`,
            [invoiceNumber, invoiceHTML, agreementId]
        );

        res.json({ success: true, invoiceNumber, invoiceHTML });
    } catch (e) {
        console.error('Invoice generation error:', e);
        res.status(500).json({ error: 'Failed to generate invoice: ' + e.message });
    }
});

/* Download invoice as HTML */
app.get('/api/download-invoice/:id', async (req, res) => {
    try {
        let agreement;
        // Admin or authenticated user
        if (req.session && req.session.isAdmin) {
            agreement = await dbGet('SELECT * FROM agreements WHERE id = ?', [req.params.id]);
        } else if (req.session && req.session.userId) {
            agreement = await dbGet('SELECT * FROM agreements WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
        } else {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!agreement) return res.status(404).send('Invoice not found');

        if (agreement.invoice_html) {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${agreement.invoice_number || agreement.id}.html`);
            return res.send(agreement.invoice_html);
        }

        // Generate on the fly if not yet generated
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [agreement.user_id]);
        const prefs = (() => { try { return JSON.parse(agreement.preferences || '{}'); } catch { return {}; } })();
        const date = new Date(agreement.created_at).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });
        const dueDate = (() => {
            const d = new Date(agreement.created_at);
            d.setDate(d.getDate() + 15);
            return d.toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });
        })();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(agreement.id).padStart(5, '0')}`;

        const html = buildInvoiceHTML({
            invoiceNumber,
            date,
            dueDate,
            clientName: user?.username || 'Client',
            clientEmail: agreement.client_email || '',
            clientPhone: agreement.client_phone || '',
            agreementType: agreement.agreement_type || 'Services Agreement',
            agreementId: agreement.id,
            token: user?.unique_token || '',
            totalLabel: agreement.total_label || '',
            preferences: prefs
        });

        // Save it
        await dbRun(
            `UPDATE agreements SET invoice_number = ?, invoice_html = ?, invoice_generated_at = datetime('now') WHERE id = ?`,
            [invoiceNumber, html, agreement.id]
        );

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoiceNumber}.html`);
        res.send(html);
    } catch (e) {
        console.error('Download invoice error:', e);
        res.status(500).send('Error generating invoice');
    }
});

/* ─── INVOICE HTML BUILDER (Branded Letterhead) ───────────────────── */
function buildInvoiceHTML(data) {
    const { invoiceNumber, date, dueDate, clientName, clientEmail, clientPhone,
            agreementType, agreementId, token, totalLabel, preferences } = data;

    // Build line items from preferences
    let lineItems = '';
    let itemNum = 0;
    const prefsArray = Object.values(preferences);

    prefsArray.forEach(p => {
        if (!p.title) return;
        itemNum++;
        const oneTimeMin = p.oneTimeMin || 0;
        const oneTimeMax = p.oneTimeMax || 0;
        const monthlyMin = p.monthlyMin || 0;
        const monthlyMax = p.monthlyMax || 0;

        let priceCell = '';
        if (oneTimeMax > 0) {
            priceCell = oneTimeMin === oneTimeMax
                ? `$${oneTimeMin.toLocaleString()}`
                : `$${oneTimeMin.toLocaleString()} – $${oneTimeMax.toLocaleString()}`;
        }
        if (monthlyMax > 0) {
            const mLabel = monthlyMin === monthlyMax
                ? `$${monthlyMin.toLocaleString()}/mo`
                : `$${monthlyMin.toLocaleString()} – $${monthlyMax.toLocaleString()}/mo`;
            priceCell = priceCell ? priceCell + ' + ' + mLabel : mLabel;
        }
        if (p.hourly) {
            priceCell = priceCell ? priceCell + ' + $' + p.hourly + '/hr' : '$' + p.hourly + '/hr';
        }
        if (!priceCell) priceCell = p.price || 'Included';

        lineItems += `
            <tr>
                <td style="padding:10px 14px;border:1px solid #e0ddd6;color:#555;text-align:center;">${itemNum}</td>
                <td style="padding:10px 14px;border:1px solid #e0ddd6;color:#222;font-weight:600;">${p.title}</td>
                <td style="padding:10px 14px;border:1px solid #e0ddd6;color:#444;font-size:12px;">${(p.details || '').substring(0, 100)}</td>
                <td style="padding:10px 14px;border:1px solid #e0ddd6;color:#8b0000;font-weight:700;white-space:nowrap;text-align:right;">${priceCell}</td>
            </tr>
        `;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${invoiceNumber} — Method Media</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Rajdhani:wght@400;600&family=Great+Vibes&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Georgia',serif; background:#f4f0e8; color:#1a1a1a; }
  .invoice-page {
    width:816px; min-height:1056px; margin:30px auto; background:#fff;
    padding:0; position:relative;
    box-shadow:0 8px 40px rgba(0,0,0,0.18);
  }
  .letterhead-bg {
    width:100%; height:auto; display:block;
    position:absolute; top:0; left:0; opacity:0.10; z-index:0;
  }
  .invoice-content {
    position:relative; z-index:1; padding:60px 60px 50px;
  }
  .inv-header {
    display:flex; justify-content:space-between; align-items:flex-start;
    border-bottom:3px double #8b0000; padding-bottom:24px; margin-bottom:28px;
  }
  .inv-brand {
    display:flex; flex-direction:column; gap:4px;
  }
  .inv-brand-name {
    font-family:'Cinzel',serif; font-size:22px; color:#8b0000;
    letter-spacing:0.12em; font-weight:700;
  }
  .inv-brand-sub {
    font-size:11px; color:#888; letter-spacing:0.08em;
    font-family:'Rajdhani',sans-serif; text-transform:uppercase;
  }
  .inv-brand-contact {
    font-size:11px; color:#666; line-height:1.6; margin-top:6px;
    font-family:'Rajdhani',sans-serif;
  }
  .inv-badge {
    text-align:right;
  }
  .inv-badge-title {
    font-family:'Cinzel',serif; font-size:28px; color:#8b0000;
    letter-spacing:0.08em; font-weight:700;
  }
  .inv-badge-number {
    font-family:'Rajdhani',sans-serif; font-size:13px; color:#888;
    letter-spacing:0.06em; margin-top:4px;
  }
  .inv-meta-grid {
    display:grid; grid-template-columns:1fr 1fr; gap:20px;
    margin-bottom:28px;
  }
  .inv-meta-block {
    background:#faf9f5; border:1px solid #e8e4da; border-radius:8px; padding:14px 18px;
  }
  .inv-meta-label {
    font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.12em;
    text-transform:uppercase; color:#8b0000; margin-bottom:6px;
  }
  .inv-meta-value {
    font-size:13px; color:#222; line-height:1.6;
  }
  .inv-section-title {
    font-family:'Cinzel',serif; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;
    color:#8b0000; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:14px; margin-top:24px;
  }
  .inv-table {
    width:100%; border-collapse:collapse; font-size:13px;
  }
  .inv-table thead th {
    padding:10px 14px; text-align:left; font-family:'Cinzel',serif;
    font-size:10px; color:#8b0000; letter-spacing:0.1em; text-transform:uppercase;
    background:#f5f0e8; border:1px solid #e0ddd6;
  }
  .inv-table thead th:last-child { text-align:right; }
  .inv-table tbody tr:nth-child(even) td { background:#fafaf7; }
  .inv-total-row {
    margin-top:18px; display:flex; justify-content:flex-end;
    border-top:2px solid #8b0000; padding-top:14px;
  }
  .inv-total-box {
    text-align:right;
  }
  .inv-total-label {
    font-family:'Cinzel',serif; font-size:11px; color:#888;
    letter-spacing:0.08em; text-transform:uppercase;
  }
  .inv-total-value {
    font-family:'Cinzel',serif; font-size:20px; color:#8b0000;
    font-weight:700; margin-top:4px;
  }
  .inv-terms {
    margin-top:32px; font-size:11px; line-height:1.7; color:#666;
    border-top:1px solid #e0ddd6; padding-top:16px;
  }
  .inv-terms strong { color:#444; }
  .inv-footer {
    text-align:center; font-size:10px; color:#bbb; margin-top:30px;
    border-top:1px solid #e0ddd6; padding-top:14px;
  }
  .inv-footer-sig {
    margin-top:20px; text-align:right;
  }
  .inv-footer-sig-line {
    border-bottom:1.5px solid #333; width:200px; display:inline-block; margin-bottom:4px;
  }
  .inv-footer-sig-text {
    font-family:'Great Vibes',cursive; font-size:22px; color:#1a1a1a;
  }
  .inv-footer-sig-label {
    font-size:10px; color:#888; letter-spacing:0.08em; text-transform:uppercase;
  }
  @media print { body { background:#fff; } .invoice-page { box-shadow:none; margin:0; } }
</style>
</head>
<body>
<div class="invoice-page">
  <div class="invoice-content">
    <div class="inv-header">
      <div class="inv-brand">
        <div class="inv-brand-name">⚜ METHOD MEDIA — HEAVY HITTERS ⚜</div>
        <div class="inv-brand-sub">Engineering Excellence · Alberta, Canada</div>
        <div class="inv-brand-contact">
          Calgary, Alberta, Canada<br>
          info@method-media.ca<br>
          methodmedia.ca
        </div>
      </div>
      <div class="inv-badge">
        <div class="inv-badge-title">INVOICE</div>
        <div class="inv-badge-number">${invoiceNumber}</div>
      </div>
    </div>

    <div class="inv-meta-grid">
      <div class="inv-meta-block">
        <div class="inv-meta-label">Bill To</div>
        <div class="inv-meta-value">
          <strong>${clientName}</strong><br>
          ${clientEmail ? clientEmail + '<br>' : ''}
          ${clientPhone ? clientPhone : ''}
        </div>
      </div>
      <div class="inv-meta-block">
        <div class="inv-meta-label">Invoice Details</div>
        <div class="inv-meta-value">
          <strong>Date:</strong> ${date}<br>
          <strong>Due:</strong> ${dueDate} (Net 15)<br>
          <strong>Agreement:</strong> #${agreementId}<br>
          ${token ? '<strong>Token:</strong> ' + token : ''}
        </div>
      </div>
    </div>

    <div class="inv-section-title">Itemized Services — ${agreementType}</div>
    <table class="inv-table">
      <thead>
        <tr>
          <th style="width:40px;text-align:center;">#</th>
          <th>Service</th>
          <th>Description</th>
          <th style="text-align:right;">Amount (CAD)</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems || '<tr><td colspan="4" style="padding:10px 14px;color:#888;text-align:center;border:1px solid #e0ddd6;">No line items</td></tr>'}
      </tbody>
    </table>

    <div class="inv-total-row">
      <div class="inv-total-box">
        <div class="inv-total-label">Estimated Total</div>
        <div class="inv-total-value">${totalLabel || 'Contact for quote'}</div>
      </div>
    </div>

    <div class="inv-terms">
      <strong>Payment Terms:</strong> Net 15. All invoices are due within 15 days of the invoice date.
      Overdue balances accrue interest at 2% per month compounded monthly.
      Method Media reserves the right to suspend deliverables for non-payment.<br><br>
      <strong>GST/HST:</strong> Alberta GST (5%) applies and will be calculated on the final confirmed amount.
      GST Registration Number provided upon request.<br><br>
      <strong>Scope:</strong> This invoice reflects the estimated investment based on your selected configuration.
      Final billable amounts will be confirmed upon detailed project scoping and may be adjusted to reflect
      actual scope, complexity, and any change orders approved by both parties.
    </div>

    <div class="inv-footer-sig">
      <div class="inv-footer-sig-line">
        <span class="inv-footer-sig-text">Method Media</span>
      </div>
      <div class="inv-footer-sig-label">Authorized Representative</div>
    </div>

    <div class="inv-footer">
      Method Media — Heavy Hitters · Calgary, Alberta, Canada · Invoice ${invoiceNumber} · Agreement #${agreementId}
    </div>
  </div>
</div>
</body>
</html>`;
}

/* Admin: list agreements */
app.get('/api/admin/agreements', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT a.*, u.username AS user_name
            FROM agreements a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);
        res.json({ success: true, agreements: rows });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/admin/agreement/:id', async (req, res) => {
    try {
        const row = await dbGet(`
            SELECT a.*, u.username AS user_name, u.wax_seal_path
            FROM agreements a LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = ?
        `, [req.params.id]);
        if (!row) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, agreement: row });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/admin/download/:id', async (req, res) => {
    try {
        const row = await dbGet('SELECT * FROM agreements WHERE id = ?', [req.params.id]);
        if (!row) return res.status(404).send('Not found');
        const html = buildContractHTML(row);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=agreement_${row.id}.html`);
        res.send(html);
    } catch (e) { res.status(500).send(e.message); }
});

/* Generate PDF contract for current user's latest agreement */
app.get('/api/download-contract-pdf', requireAuth, async (req, res) => {
    const { exec } = require('child_process');
    const os = require('os');
    try {
        const agreement = await dbGet(
            'SELECT a.*, u.username AS user_name FROM agreements a JOIN users u ON a.user_id = u.id WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 1',
            [req.session.userId]
        );
        if (!agreement) return res.status(404).json({ error: 'No agreement found' });

        const prefs  = (() => { try { return JSON.parse(agreement.preferences || '{}'); } catch { return {}; } })();
        const sigs   = (() => { try { return JSON.parse(agreement.signatures  || '{}'); } catch { return {}; } })();
        const date   = new Date(agreement.created_at).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });
        const token  = (await dbGet('SELECT unique_token FROM users WHERE id = ?', [req.session.userId]))?.unique_token || '';
        const sealPath = (await dbGet('SELECT wax_seal_path FROM users WHERE id = ?', [req.session.userId]))?.wax_seal_path || '';

        // Write temp Python script to generate PDF
        const tmpScript = path.join(os.tmpdir(), `contract_gen_${Date.now()}.py`);
        const tmpPDF    = path.join(os.tmpdir(), `agreement_${agreement.id}_${Date.now()}.pdf`);

        const configRows = Object.values(prefs).map(p =>
            `    ('${(p.title||'').replace(/'/g,"\\'")}', '${(p.details||p.description||'').replace(/'/g,"\\'").substr(0,120)}', '${(p.price||'').replace(/'/g,"\\'")}'),`
        ).join('\n');

        const scriptContent = `
import sys
sys.path.insert(0, '/workspace')
import os
os.chdir('/workspace')

# Override output path
import generate_contract_pdf as g
g.OUTPUT_PDF = '${tmpPDF}'
g.contract_data = {
    'type':   '${(agreement.agreement_type||'Master Services Agreement').replace(/'/g,"\\'")}',
    'token':  '${token.replace(/'/g,"\\'")}',
    'date':   '${date.replace(/'/g,"\\'")}',
    'client': '${(agreement.user_name||'Client').replace(/'/g,"\\'")}',
    'email':  '${(agreement.client_email||'').replace(/'/g,"\\'")}',
    'phone':  '${(agreement.client_phone||'').replace(/'/g,"\\'")}',
    'agid':   '#${agreement.id}',
    'config': [
${configRows}
    ]
}
if '${sealPath}':
    g.WAX_SEAL = os.path.join(g.PUBLIC_DIR, 'wax_seals', '${sealPath}')
g.generate()
`;
        fs.writeFileSync(tmpScript, scriptContent);

        exec(`python3 "${tmpScript}"`, { timeout: 30000 }, (err, stdout, stderr) => {
            fs.unlinkSync(tmpScript);
            if (err || !fs.existsSync(tmpPDF)) {
                console.error('PDF gen error:', err, stderr);
                // Fall back to HTML
                const html = buildContractHTML(agreement);
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `attachment; filename=agreement_${agreement.id}.html`);
                return res.send(html);
            }
            const pdfData = fs.readFileSync(tmpPDF);
            fs.unlinkSync(tmpPDF);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=method-media-agreement-${agreement.id}.pdf`);
            res.send(pdfData);
        });
    } catch (e) {
        console.error('Download PDF error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: !!req.session.userId, userName: req.session.userName || null });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

/* ─── CONTRACT HTML GENERATOR ──────────────────────────── */
function buildContractHTML(agreement) {
    const prefs = (() => { try { return JSON.parse(agreement.preferences || '{}'); } catch { return {}; } })();
    const sigs  = (() => { try { return JSON.parse(agreement.signatures  || '{}'); } catch { return {}; } })();
    const date  = new Date(agreement.created_at).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric' });

    const sections = Object.values(prefs).map(p => `
        <tr>
            <td style="padding:10px 14px;color:#555;font-weight:600;white-space:nowrap;">${p.title || 'Selection'}</td>
            <td style="padding:10px 14px;color:#222;">${p.details || '—'}</td>
            <td style="padding:10px 14px;color:#8b0000;font-weight:700;white-space:nowrap;">${p.price || ''}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Method Media — Agreement #${agreement.id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Georgia',serif; background:#f4f0e8; color:#1a1a1a; }
  .page { width:816px; min-height:1056px; margin:30px auto; background:#fff;
          padding:72px 72px 80px; position:relative;
          box-shadow:0 8px 40px rgba(0,0,0,0.18); page-break-after:always; }
  .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg);
               font-family:'Cinzel',serif; font-size:72px; color:rgba(176,28,28,0.06);
               white-space:nowrap; pointer-events:none; letter-spacing:0.1em; }
  .hdr { text-align:center; border-bottom:3px double #8b0000; padding-bottom:28px; margin-bottom:30px; }
  .logo-name { font-family:'Cinzel',serif; font-size:26px; color:#8b0000; letter-spacing:0.15em; }
  .hdr-sub { font-size:12px; color:#888; letter-spacing:0.08em; margin-top:6px; }
  .doc-title { font-family:'Cinzel',serif; font-size:20px; letter-spacing:0.08em; color:#1a1a1a;
               text-align:center; margin:24px 0 6px; }
  .doc-ref { text-align:center; font-size:11px; color:#999; margin-bottom:28px; }
  .section { margin-bottom:28px; }
  .section-title { font-family:'Cinzel',serif; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;
                   color:#8b0000; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:14px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  tr:nth-child(even) td { background:#fafaf7; }
  td { border:1px solid #e0ddd6; vertical-align:top; }
  .terms { font-size:11.5px; line-height:1.75; color:#444; }
  .terms li { margin-bottom:8px; }
  .sign-block { margin-top:40px; display:flex; gap:60px; }
  .sign-col { flex:1; }
  .sign-label { font-size:11px; color:#888; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
  .sign-line { border-bottom:1.5px solid #333; padding-bottom:2px; min-height:50px; }
  .sign-cursive { font-family:'Great Vibes',cursive; font-size:28px; color:#1a1a1a; }
  .footer { text-align:center; font-size:10px; color:#bbb; margin-top:40px;
            border-top:1px solid #e0ddd6; padding-top:16px; }
  @media print { body { background:#fff; } .page { box-shadow:none; margin:0; } }
</style>
</head>
<body>
<div class="page">
  <div class="watermark">METHOD MEDIA</div>
  <div class="hdr">
    <div class="logo-name">⚜ METHOD MEDIA — HEAVY HITTERS ⚜</div>
    <div class="hdr-sub">ENGINEERING EXCELLENCE · ALBERTA, CANADA</div>
  </div>
  <div class="doc-title">${agreement.agreement_type || 'Master Services Agreement'}</div>
  <div class="doc-ref">Agreement #${agreement.id} · Executed ${date}</div>

  <div class="section">
    <div class="section-title">Party Information</div>
    <table>
      <tr><td style="padding:9px 14px;width:160px;color:#666;font-weight:600;">Service Provider</td>
          <td style="padding:9px 14px;">Method Media – Heavy Hitters · Calgary, Alberta, Canada</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-weight:600;">Client</td>
          <td style="padding:9px 14px;">${agreement.user_name || 'Client'}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-weight:600;">Email</td>
          <td style="padding:9px 14px;">${agreement.client_email || sigs.clientEmail || '—'}</td></tr>
      <tr><td style="padding:9px 14px;color:#666;font-weight:600;">Phone</td>
          <td style="padding:9px 14px;">${agreement.client_phone || sigs.clientPhone || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Selected Configuration &amp; Pricing</div>
    <table>
      <tr style="background:#f5f0e8;">
        <th style="padding:9px 14px;text-align:left;font-family:'Cinzel',serif;font-size:11px;color:#8b0000;">Service</th>
        <th style="padding:9px 14px;text-align:left;font-family:'Cinzel',serif;font-size:11px;color:#8b0000;">Description</th>
        <th style="padding:9px 14px;text-align:left;font-family:'Cinzel',serif;font-size:11px;color:#8b0000;">Pricing</th>
      </tr>
      ${sections || '<tr><td colspan="3" style="padding:10px 14px;color:#888;">No configuration data available.</td></tr>'}
    </table>
  </div>

  <div class="sign-block">
    <div class="sign-col">
      <div class="sign-label">Client Signature</div>
      <div class="sign-line">
        ${sigs.clientSignature ? `<img src="${sigs.clientSignature}" style="max-height:60px;" alt="signature">` : ''}
      </div>
      <div style="margin-top:8px;font-size:11px;color:#888;">${agreement.user_name || ''} — ${date}</div>
    </div>
    <div class="sign-col">
      <div class="sign-label">Method Media Authorized</div>
      <div class="sign-line"><span class="sign-cursive">Method Media</span></div>
      <div style="margin-top:8px;font-size:11px;color:#888;">Method Media – Heavy Hitters · ${date}</div>
    </div>
  </div>

  <div class="footer">
    This agreement is governed by the laws of Alberta, Canada.
    Agreement #${agreement.id} · Token: ${agreement.user_id || '—'}
  </div>
</div>

<div class="page">
  <div class="watermark">METHOD MEDIA</div>
  <div class="hdr">
    <div class="logo-name">⚜ METHOD MEDIA — HEAVY HITTERS ⚜</div>
    <div class="hdr-sub">TERMS &amp; CONDITIONS</div>
  </div>
  <div class="doc-title">Schedule B — Terms &amp; Conditions</div>
  <div class="doc-ref">Agreement #${agreement.id} · Continuation</div>

  <div class="section" style="margin-top:24px;">
    <ol class="terms">
      <li><strong>Acceptance.</strong> By executing this Agreement (including digital execution via signature pad), the Client acknowledges they have read, understood, and agree to be bound by all terms herein.</li>
      <li><strong>Services.</strong> Method Media – Heavy Hitters ("Provider") agrees to design, develop, test, and deliver the digital solution per the selected configuration in Schedule A. All work is performed by qualified professionals based in Alberta, Canada.</li>
      <li><strong>Payment.</strong> Invoices are due Net-15. Overdue balances accrue interest at 2% per month compounded monthly. Provider may suspend services after 30 days of non-payment without further liability.</li>
      <li><strong>Intellectual Property.</strong> Provider retains ownership of all proprietary frameworks, tools, and methodologies. Upon receipt of final payment, client-specific assets and deliverables transfer under a perpetual non-exclusive licence unless Full Ownership was selected.</li>
      <li><strong>Confidentiality.</strong> Both parties shall hold all non-public information in strict confidence. This obligation survives termination for three (3) years.</li>
      <li><strong>Warranty.</strong> Provider warrants deliverables will conform to specifications for 90 days post-delivery. Warranty excludes issues caused by third-party systems, client modifications, or force majeure events.</li>
      <li><strong>Limitation of Liability.</strong> Neither party shall be liable for indirect, incidental, punitive, or consequential damages. Total liability shall not exceed fees paid in the three (3) months prior to the claim.</li>
      <li><strong>Termination.</strong> Either party may terminate with 30 days written notice. Completed milestones remain billable upon termination. Deposits are non-refundable unless Provider is in material breach.</li>
      <li><strong>Independent Contractor.</strong> Provider operates as an independent contractor. Nothing herein creates an employment, partnership, or joint-venture relationship.</li>
      <li><strong>Third-Party Services.</strong> Client is solely responsible for all charges, terms, and policies imposed by third-party providers selected under this Agreement (AWS, Azure, App Store, etc.).</li>
      <li><strong>Force Majeure.</strong> Neither party is liable for delays caused by circumstances beyond reasonable control, including natural disasters, cyberattacks, internet outages, or government actions.</li>
      <li><strong>Governing Law.</strong> This Agreement is governed by the laws of the Province of Alberta, Canada. Disputes shall be resolved in the courts of Calgary, Alberta, or by binding arbitration under the Arbitration Act (Alberta).</li>
      <li><strong>Entire Agreement.</strong> This document and all attached Schedules constitute the entire agreement and supersede all prior negotiations, representations, and understandings.</li>
    </ol>
  </div>

  <div class="sign-block">
    <div class="sign-col">
      <div class="sign-label">Client Initials</div>
      <div class="sign-line"></div>
    </div>
    <div class="sign-col">
      <div class="sign-label">Provider Initials</div>
      <div class="sign-line"></div>
    </div>
  </div>

  <div class="footer">
    Page 2 of 2 · Agreement #${agreement.id} · Method Media – Heavy Hitters · Calgary, AB, Canada
  </div>
</div>
</body>
</html>`;
}

/* ─── DB HELPERS ───────────────────────────────────────── */
function dbGet(sql, params = []) {
    return new Promise((res, rej) => db.get(sql, params, (e, row) => e ? rej(e) : res(row)));
}
function dbAll(sql, params = []) {
    return new Promise((res, rej) => db.all(sql, params, (e, rows) => e ? rej(e) : res(rows)));
}
function dbRun(sql, params = []) {
    return new Promise((res, rej) => db.run(sql, params, function(e) { e ? rej(e) : res(this); }));
}
function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    next();
}

/* ─── START ────────────────────────────────────────────── */
function tryListen(port) {
    const server = app.listen(port, () => console.log(`Server running on port ${port}`));
    server.on('error', err => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use, trying ${port + 1}…`);
            tryListen(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}
tryListen(PORT);