// Contract Generator Module
const ContractGenerator = {
    
    // Template images
    templates: {
        page1: 'template_page1-1.png',
        page2: 'template_page2-1.png',
        page3: 'template_page3-1.png'
    },
    
    // Post stamp image
    postStamp: null,
    
    // Wax seal templates
    waxSeals: [
        'Picsart_26-03-01_00-53-34-334.png',  // Bronze with flame
        'Picsart_26-03-01_00-58-40-075.png',  // Blue snowflake with numbers
        'Picsart_26-03-01_03-44-34-566.png',  // Red with flame
        'Picsart_26-03-01_05-14-46-016.png',  // Gold with coat of arms
        'Picsart_26-03-02_21-29-15-536.png'   // Bronze method alliance
    ],
    
    // Cursive font styles for old-school quill feel
    cursiveStyles: {
        fontFamily: "'Great Vibes', 'Brush Script MT', cursive",
        fontSize: '18px',
        lineHeight: '1.8',
        color: '#2c1810',
        fontWeight: '400'
    },
    
    // Generate contract text based on preferences
    generateContractText(preferences) {
        const ownership = preferences.ownership?.optionId || 'subscription';
        const hosting = preferences.hosting?.optionId || 'method-hub';
        const appType = preferences.appType?.optionId || 'pwa';
        const aiLevel = preferences.aiIntegration?.optionId || 'ai-none';
        const maintenance = preferences.maintenance?.optionId || 'self-maintained';
        
        let contractTitle = '';
        let contractType = '';
        
        if (ownership === 'subscription') {
            contractTitle = 'SUBSCRIPTION AGREEMENT';
            contractType = 'Subscription-Based Service';
        } else if (ownership === 'full-ownership') {
            contractTitle = 'FULL STACK DEVELOPMENT AGREEMENT';
            contractType = 'Custom Development with Full Ownership';
        } else {
            contractTitle = 'CUSTOM DEVELOPMENT AGREEMENT';
            contractType = 'Tailored Solution';
        }
        
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return {
            title: contractTitle,
            type: contractType,
            date: date,
            sections: this.generateSections(preferences, contractType)
        };
    },
    
    // Generate contract sections in cursive style
    generateSections(preferences, contractType) {
        const sections = [];
        
        // Section 1: Parties
        sections.push({
            title: 'I. PARTIES',
            content: `This Agreement is entered into on this ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}, by and between:\n\nMethod Media - Heavy Hitters, a digital solutions provider ("Service Provider"), and ${state.userName} ("Client"), collectively referred to as the "Parties."`
        });
        
        // Section 2: Scope of Services
        sections.push({
            title: 'II. SCOPE OF SERVICES',
            content: this.generateScopeSection(preferences)
        });
        
        // Section 3: Payment Terms
        sections.push({
            title: 'III. PAYMENT TERMS',
            content: this.generatePaymentSection(preferences)
        });
        
        // Section 4: Hosting and Infrastructure
        sections.push({
            title: 'IV. HOSTING AND INFRASTRUCTURE',
            content: this.generateHostingSection(preferences)
        });
        
        // Section 5: Intellectual Property
        sections.push({
            title: 'V. INTELLECTUAL PROPERTY',
            content: this.generateIPSection(preferences)
        });
        
        // Section 6: AI Integration (if applicable)
        if (preferences.aiIntegration?.optionId !== 'ai-none') {
            sections.push({
                title: 'VI. ARTIFICIAL INTELLIGENCE INTEGRATION',
                content: this.generateAISection(preferences)
            });
        }
        
        // Section 7: Maintenance and Support
        sections.push({
            title: preferences.aiIntegration?.optionId !== 'ai-none' ? 'VII. MAINTENANCE AND SUPPORT' : 'VI. MAINTENANCE AND SUPPORT',
            content: this.generateMaintenanceSection(preferences)
        });
        
        // Section 8: Terms and Conditions
        sections.push({
            title: 'VIII. TERMS AND CONDITIONS',
            content: this.generateTermsSection()
        });
        
        // Section 9: Signatures
        sections.push({
            title: 'IX. SIGNATURES',
            content: 'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.'
        });
        
        return sections;
    },
    
    generateScopeSection(preferences) {
        const appType = preferences.appType?.title || 'Web Application';
        const hosting = preferences.hosting?.title || 'Method Hub';
        
        return `Service Provider agrees to develop, deploy, and maintain a ${appType} solution for Client, hosted via ${hosting}.\n\nThe solution shall include all features and functionality as outlined in the Configuration Summary attached hereto as Schedule A.`;
    },
    
    generatePaymentSection(preferences) {
        const ownership = preferences.ownership;
        
        if (ownership?.optionId === 'subscription') {
            return `Client agrees to pay Service Provider the monthly subscription fee as outlined in the Configuration Summary. Payments are due in advance on the first day of each billing cycle.\n\nAll fees are non-refundable. Late payments may incur additional charges.`;
        } else {
            return `Client agrees to pay Service Provider the total development fee as outlined in the Configuration Summary. Payment shall be made according to the milestone schedule attached hereto as Schedule B.\n\nNo work shall commence on any milestone until full payment for said milestone has been received and cleared by Service Provider.`;
        }
    },
    
    generateHostingSection(preferences) {
        const hosting = preferences.hosting;
        
        if (hosting?.optionId === 'method-hub') {
            return `Service Provider shall provide all hosting infrastructure, security, maintenance, and updates as part of the agreed-upon fee. Client acknowledges that Service Provider shall be responsible for all hosting-related matters.\n\nService Provider guarantees 99.9% uptime subject to scheduled maintenance windows.`;
        } else {
            return `Client shall be solely responsible for all hosting arrangements, including but not limited to server costs, bandwidth charges, security measures, and third-party service fees.\n\nClient acknowledges and agrees that Service Provider shall not be liable for any hosting-related issues, downtime, or charges incurred from third-party providers.`;
        }
    },
    
    generateIPSection(preferences) {
        const ownership = preferences.ownership;
        
        if (ownership?.optionId === 'full-ownership') {
            return `Upon full payment of all fees, Client shall own exclusive rights to all custom-developed code, designs, and functionality created specifically for Client.\n\nService Provider retains all rights to its proprietary frameworks, libraries, methodologies, and pre-existing intellectual property.`;
        } else {
            return `Service Provider retains all rights, title, and interest in all software, code, designs, and intellectual property developed under this Agreement.\n\nClient is granted a non-exclusive, non-transferable license to use the software for the duration of the subscription term.`;
        }
    },
    
    generateAISection(preferences) {
        const ai = preferences.aiIntegration;
        
        if (ai?.optionId === 'ai-advanced') {
            return `Service Provider shall provide advanced AI integration including speech recognition, intelligent worker assistant, automated form filling, and industry-specific decision support.\n\nClient acknowledges that AI outputs are probabilistic and must be reviewed by qualified personnel before implementation.\n\nService Provider shall not be liable for any losses resulting from unverified AI-generated content.`;
        } else {
            return `Service Provider shall provide basic AI integration including chatbot functionality and document search capabilities.\n\nClient acknowledges that AI outputs are probabilistic and should be reviewed for accuracy.`;
        }
    },
    
    generateMaintenanceSection(preferences) {
        const maintenance = preferences.maintenance;
        
        if (maintenance?.optionId === 'method-maintenance') {
            return `Service Provider shall provide ongoing maintenance, security updates, bug fixes, and support as outlined in the Configuration Summary.\n\nSupport response times and service levels shall be as specified in the selected maintenance tier.`;
        } else {
            return `Client shall be solely responsible for all maintenance, updates, security patches, and technical support.\n\nService Provider may provide maintenance services on a time-and-materials basis upon request.`;
        }
    },
    
    generateTermsSection() {
        return `This Agreement constitutes the entire understanding between the Parties and supersedes all prior negotiations, representations, or agreements.\n\nEither party may terminate this Agreement with thirty (30) days written notice. All outstanding fees shall become immediately due and payable upon termination.\n\nThis Agreement shall be governed by the laws of Alberta, Canada. Any disputes shall be resolved in Calgary, Alberta.\n\nClient agrees to indemnify and hold Service Provider harmless from any claims, damages, or liabilities arising from Client's use of the software.`;
    },
    
    // Split content into pages
    splitContentIntoPages(sections) {
        const pages = [];
        let currentPage = { sections: [] };
        let currentHeight = 0;
        const maxHeight = 800; // Approximate max content per page
        
        sections.forEach(section => {
            const sectionHeight = this.estimateSectionHeight(section);
            
            if (currentHeight + sectionHeight > maxHeight && currentPage.sections.length > 0) {
                pages.push(currentPage);
                currentPage = { sections: [] };
                currentHeight = 0;
            }
            
            currentPage.sections.push(section);
            currentHeight += sectionHeight;
        });
        
        if (currentPage.sections.length > 0) {
            pages.push(currentPage);
        }
        
        return pages;
    },
    
    estimateSectionHeight(section) {
        // Rough estimation: title (50px) + content (30px per line)
        const lines = section.content.split('\n').length;
        return 50 + (lines * 30);
    },
    
    // Render contract page
    renderContractPage(pageData, pageNum, totalPages, signatureImage, waxSealImage) {
        const container = document.createElement('div');
        container.className = 'contract-page';
        container.style.display = pageNum === 1 ? 'block' : 'none';
        container.dataset.page = pageNum;
        
        // Background template
        const templateImg = document.createElement('img');
        templateImg.className = 'contract-template';
        templateImg.src = this.templates[`page${pageNum}`] || this.templates.page1;
        templateImg.alt = `Contract Page ${pageNum}`;
        
        // Content overlay
        const contentOverlay = document.createElement('div');
        contentOverlay.className = 'contract-content-overlay';
        
        // Render sections
        pageData.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'contract-section';
            
            const title = document.createElement('h3');
            title.className = 'contract-section-title';
            title.textContent = section.title;
            
            const content = document.createElement('div');
            content.className = 'contract-section-content';
            content.innerHTML = section.content.replace(/\n/g, '<br>');
            
            sectionDiv.appendChild(title);
            sectionDiv.appendChild(content);
            contentOverlay.appendChild(sectionDiv);
        });
        
        // Post stamp (bottom left)
        const postStamp = document.createElement('div');
        postStamp.className = 'post-stamp';
        postStamp.innerHTML = '<img src="data:image/png;base64,POST_STAMP_HERE" alt="Post Stamp">';
        
        // Signature (if last page)
        if (pageNum === totalPages) {
            const signatureSection = document.createElement('div');
            signatureSection.className = 'contract-signatures';
            
            signatureSection.innerHTML = `
                <div class="signature-line">
                    <span class="signature-label">Service Provider:</span>
                    ${signatureImage ? `<img src="${signatureImage}" class="signature-image" alt="Provider Signature">` : ''}
                </div>
                <div class="signature-line">
                    <span class="signature-label">Client:</span>
                    <img src="" class="signature-image-client" alt="Client Signature">
                </div>
                <div class="wax-seal-final">
                    <img src="${waxSealImage}" class="wax-seal-image" alt="Wax Seal">
                </div>
            `;
            
            contentOverlay.appendChild(signatureSection);
        }
        
        container.appendChild(templateImg);
        container.appendChild(contentOverlay);
        container.appendChild(postStamp);
        
        return container;
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContractGenerator;
}