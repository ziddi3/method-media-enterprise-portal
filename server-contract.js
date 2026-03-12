// Enhanced server contract generation
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

class ContractImageProcessor {
    
    constructor() {
        this.waxSealTemplates = [
            'Picsart_26-03-01_00-53-34-334.png',
            'Picsart_26-03-01_00-58-40-075.png',
            'Picsart_26-03-01_03-44-34-566.png',
            'Picsart_26-03-01_05-14-46-016.png',
            'Picsart_26-03-02_21-29-15-536.png'
        ];
        this.postStampPath = 'template_page1-1.png'; // Will extract from template
    }
    
    // Extract post stamp from template
    async extractPostStamp() {
        try {
            const template = await loadImage(this.postStampPath);
            const canvas = createCanvas(150, 150);
            const ctx = canvas.getContext('2d');
            
            // Extract bottom-left corner where post stamp is located
            ctx.drawImage(template, 0, template.height - 150, 150, 150, 0, 0, 150, 150);
            
            const buffer = canvas.toBuffer('image/png');
            const stampPath = path.join(__dirname, 'public', 'extracted_post_stamp.png');
            fs.writeFileSync(stampPath, buffer);
            
            return stampPath;
        } catch (error) {
            console.error('Error extracting post stamp:', error);
            return null;
        }
    }
    
    // Generate custom wax seal with initials
    async generateCustomWaxSeal(name) {
        try {
            // Get initials
            const initials = name.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substr(0, 3);
            
            // Select random wax seal template
            const templatePath = this.waxSealTemplates[Math.floor(Math.random() * this.waxSealTemplates.length)];
            const template = await loadImage(templatePath);
            
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');
            
            // Draw template
            ctx.drawImage(template, 0, 0, 400, 400);
            
            // Add initials overlay
            ctx.font = 'bold 60px Georgia, serif';
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Position initials in center
            ctx.fillText(initials, 200, 200);
            
            // Add subtle glow effect
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillText(initials, 200, 200);
            
            // Save image
            const filename = `custom_wax_seal_${Date.now()}.png`;
            const filePath = path.join(__dirname, 'public', 'wax_seals', filename);
            
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);
            
            return filename;
        } catch (error) {
            console.error('Error generating custom wax seal:', error);
            return null;
        }
    }
    
    // Process signature for contract
    async processSignature(signatureData) {
        try {
            // Remove data URL prefix
            const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
            
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `signature_${Date.now()}.png`;
            const filePath = path.join(__dirname, 'public', 'signatures', filename);
            
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, buffer);
            
            return filename;
        } catch (error) {
            console.error('Error processing signature:', error);
            return null;
        }
    }
    
    // Generate contract PDF with styling
    async generateContractPDF(contractData) {
        // This would integrate with a PDF library like pdfkit
        // For now, we'll create HTML that can be converted to PDF
        const contractHTML = this.generateContractHTML(contractData);
        
        const filename = `contract_${Date.now()}.html`;
        const filePath = path.join(__dirname, 'public', 'contracts', filename);
        
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, contractHTML);
        
        return filename;
    }
    
    generateContractHTML(contractData) {
        const preferences = contractData.preferences;
        const userName = contractData.userName;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contract - ${userName}</title>
    <style>
        @page { margin: 0; }
        body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Georgia', serif;
            background: #fff;
        }
        .contract-page {
            width: 100%;
            min-height: 1100px;
            position: relative;
            page-break-after: always;
        }
        .template-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            opacity: 0.9;
        }
        .content-overlay {
            position: relative;
            z-index: 10;
            padding: 100px 120px;
        }
        .contract-title {
            font-family: 'Great Vibes', cursive;
            font-size: 48px;
            text-align: center;
            color: #1a1a2e;
            margin-bottom: 20px;
        }
        .contract-type {
            font-family: 'Great Vibes', cursive;
            font-size: 24px;
            text-align: center;
            color: #2c1810;
            margin-bottom: 60px;
        }
        .section-title {
            font-family: 'Great Vibes', cursive;
            font-size: 32px;
            color: #1a1a2e;
            margin: 40px 0 20px 0;
            border-bottom: 2px solid #ffd700;
        }
        .section-content {
            font-family: 'Great Vibes', cursive;
            font-size: 20px;
            line-height: 1.9;
            color: #2c1810;
            text-align: justify;
            white-space: pre-wrap;
        }
        .signature-section {
            position: absolute;
            bottom: 120px;
            left: 100px;
            right: 100px;
        }
        .signature-line {
            margin: 30px 0;
            font-family: 'Great Vibes', cursive;
            font-size: 20px;
        }
        .post-stamp {
            position: absolute;
            bottom: 40px;
            left: 40px;
            width: 120px;
            height: 120px;
        }
    </style>
</head>
<body>
    <!-- Contract pages would be generated here -->
    <div class="contract-page">
        <div class="template-bg">
            <img src="template_page1-1.png" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="content-overlay">
            <div class="contract-title">SUBSCRIPTION AGREEMENT</div>
            <div class="contract-type">Method Media - Heavy Hitters</div>
            <!-- Contract content would be here -->
        </div>
    </div>
</body>
</html>
        `;
    }
}

module.exports = ContractImageProcessor;