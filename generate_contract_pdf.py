"""
Method Media - Agreement Contract PDF Generator
Renders contract text ON the template PNG images using ReportLab
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth
import os

PUBLIC_DIR  = '/workspace/public'
OUTPUT_PDF  = '/workspace/method-media-agreement-proof.pdf'
TEMPLATE_1  = os.path.join(PUBLIC_DIR, 'template_page1-1.png')
TEMPLATE_2  = os.path.join(PUBLIC_DIR, 'template_page2-1.png')
TEMPLATE_3  = os.path.join(PUBLIC_DIR, 'template_page3-1.png')
WAX_SEAL    = os.path.join(PUBLIC_DIR, 'wax_seals', 'seal_1773231816659.png')

PAGE_W, PAGE_H = letter

contract_data = {
    'type':    'Custom Software Development & Licensing Agreement',
    'token':   'MM-3EHNU7F7J-MMM0FUD8',
    'date':    'January 15, 2026',
    'client':  'Charles Sterling',
    'email':   'charles@methodmedia.ca',
    'phone':   '403-555-0199',
    'agid':    '#1',
    'config': [
        ('Project Type',      'Web Application - Responsive web app. Includes backend API, database design, and UI.',           '$9,500 - $22,000 CAD'),
        ('Hosting',           'Method Hub (Managed) - Fully managed by Method Media. 99.9% uptime SLA.',                       'Included in package'),
        ('Ownership Model',   'Full Ownership (Licence) - Source code & IP transfers to client upon final payment.',             'One-time + $195/mo'),
        ('AI Integration',    'Conversational AI (Basic) - Smart chatbot, FAQ automation, ticket routing.',                      '$39/user/month'),
        ('Maintenance Plan',  'Standard Support - Business-hours M-F 8am-6pm MT. Bug fixes within 5 business days.',            '$225/month CAD'),
        ('Add-On Features',   'Analytics Dashboard - Real-time KPIs, custom reports, CSV/Excel/PDF export.',                    '$1,200 + $65/mo'),
    ]
}

TERMS = [
    ('1. Acceptance',
     'By executing this Agreement (including digital execution via the Method Media Agreement Portal), '
     'the Client acknowledges they have read, understood, and agree to be bound by all terms herein.'),
    ('2. Services',
     'Method Media - Heavy Hitters (the Provider) agrees to design, develop, test, and deliver the digital '
     'solution per the selected configuration in Schedule A. All work is performed by qualified '
     'professionals based in Alberta, Canada.'),
    ('3. Payment',
     'Invoices are due Net-15 from date of issue. Overdue balances accrue interest at 2% per month '
     'compounded monthly. Provider may suspend services for non-payment after 30 days without further liability.'),
    ('4. Intellectual Property',
     'Provider retains ownership of all proprietary frameworks, tools, and methodologies. Upon receipt '
     'of final payment, client-specific assets and deliverables transfer under a perpetual non-exclusive '
     'licence unless Full Ownership was selected.'),
    ('5. Confidentiality',
     'Both parties shall hold all non-public information in strict confidence. This obligation survives '
     'termination for three (3) years.'),
    ('6. Warranty',
     'Provider warrants deliverables will conform to specifications for 90 days post-delivery. Warranty '
     'excludes issues caused by third-party systems, client modifications, or force majeure events.'),
    ('7. Limitation of Liability',
     'Neither party shall be liable for indirect, incidental, punitive, or consequential damages. '
     'Total liability shall not exceed fees paid in the three (3) months prior to the claim.'),
    ('8. Termination',
     'Either party may terminate with 30 days written notice. Completed milestones remain billable upon '
     'termination. Deposits are non-refundable unless Provider is in material breach.'),
    ('9. Independent Contractor',
     'Provider operates as an independent contractor. Nothing herein creates an employment, '
     'partnership, or joint-venture relationship.'),
    ('10. Third-Party Services',
     'Client is solely responsible for all charges, terms, and policies imposed by third-party '
     'providers selected under this Agreement (AWS, Azure, App Store, Google Workspace, etc.).'),
    ('11. Force Majeure',
     'Neither party is liable for delays caused by circumstances beyond reasonable control, including '
     'natural disasters, cyberattacks, internet outages, or government actions.'),
    ('12. Governing Law',
     'This Agreement is governed by the laws of the Province of Alberta, Canada. Disputes shall be '
     'resolved in the courts of Calgary, Alberta, or by binding arbitration under the Arbitration Act (Alberta).'),
    ('13. Entire Agreement',
     'This document and all attached Schedules constitute the entire agreement and supersede all prior '
     'negotiations, representations, and understandings between the parties.'),
]

CRIMSON   = colors.HexColor('#8b0000')
DARK_RED  = colors.HexColor('#6b0000')
GOLD      = colors.HexColor('#b8860b')
DARK_TEXT = colors.HexColor('#1a1a1a')
MID_TEXT  = colors.HexColor('#444444')
LIGHT_TXT = colors.HexColor('#888888')
ROW_ALT   = colors.HexColor('#faf7f0')
HDR_BG    = colors.HexColor('#f5ede0')
LINE_CLR  = colors.HexColor('#d4c9b0')
EXEC_BG   = colors.HexColor('#fdf8f0')


def wrap_text(text, font, size, max_width):
    words = text.split()
    lines = []
    cur = ''
    for word in words:
        test = (cur + ' ' + word).strip()
        if stringWidth(test, font, size) <= max_width:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def section_title(c, x, y, width, text):
    c.setFont('Helvetica-Bold', 6.5)
    c.setFillColor(CRIMSON)
    c.drawString(x, y, text.upper())
    tw = stringWidth(text.upper(), 'Helvetica-Bold', 6.5)
    c.setStrokeColor(colors.HexColor('#c8b090'))
    c.setLineWidth(0.5)
    c.line(x + tw + 4, y + 2, x + width, y + 2)


def party_block(c, x, y, label, value):
    c.setStrokeColor(colors.HexColor('#c8b090'))
    c.setLineWidth(1.5)
    c.line(x, y + 2, x, y - 22)
    c.setFont('Helvetica', 5.5)
    c.setFillColor(CRIMSON)
    c.drawString(x + 5, y, label.upper())
    c.setFont('Helvetica-Bold', 7)
    c.setFillColor(DARK_TEXT)
    lines = value.split('\n')
    for i, line in enumerate(lines):
        c.drawString(x + 5, y - 9 - i * 9, line)


def draw_white_panel(c, x, y_bottom, width, height):
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.93))
    c.setStrokeColor(colors.Color(0.7, 0.6, 0.4, alpha=0.3))
    c.setLineWidth(0.5)
    c.roundRect(x - 4, y_bottom - 4, width + 8, height + 8, 4, fill=1, stroke=1)


def draw_page_footer(c, text, y, W):
    c.setFont('Helvetica', 5.5)
    c.setFillColor(LIGHT_TXT)
    fw = stringWidth(text, 'Helvetica', 5.5)
    c.drawString(W/2 - fw/2, y, text)


def draw_page1(c, data):
    W, H = PAGE_W, PAGE_H
    c.drawImage(TEMPLATE_1, 0, 0, width=W, height=H, preserveAspectRatio=False)

    CONTENT_TOP    = H * 0.615
    CONTENT_BOTTOM = H * 0.058
    MARGIN_L = 48
    MARGIN_R = W - 48
    CONTENT_W = MARGIN_R - MARGIN_L

    draw_white_panel(c, MARGIN_L, CONTENT_BOTTOM, CONTENT_W, CONTENT_TOP - CONTENT_BOTTOM)

    y = CONTENT_TOP - 6

    # Doc title
    c.setFont('Helvetica-Bold', 11)
    c.setFillColor(DARK_RED)
    tw = stringWidth(data['type'], 'Helvetica-Bold', 11)
    c.drawString(W/2 - tw/2, y, data['type'])
    y -= 12

    c.setFont('Helvetica-Oblique', 7)
    c.setFillColor(LIGHT_TXT)
    ref = 'Agreement Token: ' + data['token'] + '  |  Executed ' + data['date']
    rw = stringWidth(ref, 'Helvetica-Oblique', 7)
    c.drawString(W/2 - rw/2, y, ref)
    y -= 14

    # Parties
    section_title(c, MARGIN_L, y, CONTENT_W, 'Parties to this Agreement')
    y -= 12
    col_w = (CONTENT_W - 16) / 2
    party_block(c, MARGIN_L,             y, 'Service Provider', 'Method Media - Heavy Hitters\nCalgary, Alberta, Canada')
    party_block(c, MARGIN_L + col_w + 16, y, 'Client', data['client'])
    y -= 28
    party_block(c, MARGIN_L,             y, 'Client Email', data['email'])
    party_block(c, MARGIN_L + col_w + 16, y, 'Client Phone', data['phone'])
    y -= 28

    # Config table
    section_title(c, MARGIN_L, y, CONTENT_W, 'Schedule A - Selected Configuration & Pricing (CAD)')
    y -= 10

    col_widths = [CONTENT_W * 0.22, CONTENT_W * 0.56, CONTENT_W * 0.22]
    row_h = 10

    # Header
    c.setFillColor(HDR_BG)
    c.setStrokeColor(LINE_CLR)
    c.setLineWidth(0.5)
    c.rect(MARGIN_L, y - row_h, CONTENT_W, row_h, fill=1, stroke=1)
    headers = ['Service', 'Selected Option & Description', 'Pricing']
    x = MARGIN_L
    c.setFont('Helvetica-Bold', 6)
    c.setFillColor(CRIMSON)
    for i, h in enumerate(headers):
        c.drawString(x + 4, y - row_h + 3, h)
        x += col_widths[i]
    y -= row_h

    for idx, (svc, desc, price) in enumerate(data['config']):
        desc_lines = wrap_text(desc, 'Helvetica', 6, col_widths[1] - 8)
        rh = max(row_h, len(desc_lines) * 7.5 + 4)
        c.setFillColor(ROW_ALT if idx % 2 == 0 else colors.white)
        c.setStrokeColor(LINE_CLR)
        c.setLineWidth(0.4)
        c.rect(MARGIN_L, y - rh, CONTENT_W, rh, fill=1, stroke=1)
        c.setFont('Helvetica-Bold', 6)
        c.setFillColor(MID_TEXT)
        c.drawString(MARGIN_L + 4, y - 8, svc)
        c.setFont('Helvetica', 6)
        c.setFillColor(DARK_TEXT)
        for li, ln in enumerate(desc_lines):
            c.drawString(MARGIN_L + col_widths[0] + 4, y - 7.5 - li * 7.5, ln)
        c.setFont('Helvetica-Bold', 6)
        c.setFillColor(CRIMSON)
        c.drawString(MARGIN_L + col_widths[0] + col_widths[1] + 4, y - 8, price)
        y -= rh

    y -= 8

    # Scope
    section_title(c, MARGIN_L, y, CONTENT_W, 'Scope of Work')
    y -= 10
    scope = ('Method Media - Heavy Hitters (the Provider) agrees to design, develop, test, and deliver '
             'the digital solution described in Schedule A above to ' + data['client'] + ' (the Client) in '
             'accordance with the configuration selections made herein. All work shall be performed by '
             'qualified professionals based in Alberta, Canada. Timelines, milestone schedules, and technical '
             'specifications shall be documented in a separate Project Charter to be co-signed within 5 '
             'business days of this Agreement becoming effective.')
    scope_lines = wrap_text(scope, 'Helvetica', 6.5, CONTENT_W)
    c.setFont('Helvetica', 6.5)
    c.setFillColor(MID_TEXT)
    for ln in scope_lines:
        c.drawString(MARGIN_L, y, ln)
        y -= 8.5

    y -= 8

    # Signatures
    sig_y = max(CONTENT_BOTTOM + 42, y)
    sig_col_w = (CONTENT_W - 30) / 2

    c.setFont('Helvetica', 5.5)
    c.setFillColor(LIGHT_TXT)
    c.drawString(MARGIN_L, sig_y + 18, 'CLIENT AUTHORIZED SIGNATURE')
    c.drawString(MARGIN_L + sig_col_w + 30, sig_y + 18, 'METHOD MEDIA AUTHORIZED REPRESENTATIVE')

    c.setStrokeColor(DARK_TEXT)
    c.setLineWidth(0.75)
    c.line(MARGIN_L, sig_y + 2, MARGIN_L + sig_col_w, sig_y + 2)
    c.line(MARGIN_L + sig_col_w + 30, sig_y + 2, MARGIN_L + CONTENT_W, sig_y + 2)

    c.setFont('Helvetica-Oblique', 14)
    c.setFillColor(DARK_TEXT)
    c.drawString(MARGIN_L + 4, sig_y + 6, data['client'])
    c.drawString(MARGIN_L + sig_col_w + 34, sig_y + 6, 'Method Media')

    c.setFont('Helvetica', 5.5)
    c.setFillColor(LIGHT_TXT)
    c.drawString(MARGIN_L, sig_y - 7, data['client'] + '  |  ' + data['date'])
    c.drawString(MARGIN_L + sig_col_w + 30, sig_y - 7, 'Method Media - Heavy Hitters  |  ' + data['date'])

    if os.path.exists(WAX_SEAL):
        seal_size = 62
        c.drawImage(WAX_SEAL, W - MARGIN_L - seal_size, CONTENT_BOTTOM + 4,
                    width=seal_size, height=seal_size, preserveAspectRatio=True, mask='auto')

    draw_page_footer(c, 'Page 1 of 3  |  ' + data['type'] + '  |  Method Media - Heavy Hitters  |  Calgary, AB, Canada', CONTENT_BOTTOM - 2, W)


def draw_terms_page(c, data, terms_slice, page_num, title, template_path, top_ratio=0.82):
    W, H = PAGE_W, PAGE_H
    c.drawImage(template_path, 0, 0, width=W, height=H, preserveAspectRatio=False)

    CONTENT_TOP    = H * top_ratio
    CONTENT_BOTTOM = H * 0.058
    MARGIN_L = 52
    MARGIN_R = W - 52
    CONTENT_W = MARGIN_R - MARGIN_L

    draw_white_panel(c, MARGIN_L, CONTENT_BOTTOM, CONTENT_W, CONTENT_TOP - CONTENT_BOTTOM)

    y = CONTENT_TOP - 6

    c.setFont('Helvetica-Bold', 10)
    c.setFillColor(DARK_RED)
    tw = stringWidth(title, 'Helvetica-Bold', 10)
    c.drawString(W/2 - tw/2, y, title)
    y -= 10

    c.setFont('Helvetica-Oblique', 6.5)
    c.setFillColor(LIGHT_TXT)
    ref = data['type'] + '  |  Token: ' + data['token'] + '  |  ' + data['date']
    rw = stringWidth(ref, 'Helvetica-Oblique', 6.5)
    c.drawString(W/2 - rw/2, y, ref)
    y -= 12

    section_title(c, MARGIN_L, y, CONTENT_W, 'Terms & Conditions')
    y -= 10

    for num_title, text in terms_slice:
        if y < CONTENT_BOTTOM + 65:
            break
        c.setFont('Helvetica-Bold', 6.5)
        c.setFillColor(CRIMSON)
        c.drawString(MARGIN_L, y, num_title + '.')
        nw = stringWidth(num_title + '.', 'Helvetica-Bold', 6.5)
        indent = MARGIN_L + nw + 4
        wrap_w = CONTENT_W - nw - 4
        term_lines = wrap_text(text, 'Helvetica', 6.5, wrap_w)
        c.setFont('Helvetica', 6.5)
        c.setFillColor(MID_TEXT)
        first = True
        for ln in term_lines:
            if first:
                c.drawString(indent, y, ln)
                first = False
            else:
                y -= 8
                c.drawString(MARGIN_L + 10, y, ln)
        y -= 10

    # Initials / execution
    if page_num == 2:
        init_y = max(CONTENT_BOTTOM + 28, y)
        init_col_w = (CONTENT_W - 30) / 2
        c.setFont('Helvetica', 5.5)
        c.setFillColor(LIGHT_TXT)
        c.drawString(MARGIN_L, init_y + 14, 'CLIENT INITIALS - PAGE 2')
        c.drawString(MARGIN_L + init_col_w + 30, init_y + 14, 'PROVIDER INITIALS - PAGE 2')
        c.setStrokeColor(colors.HexColor('#555555'))
        c.setLineWidth(0.5)
        c.line(MARGIN_L, init_y + 2, MARGIN_L + init_col_w, init_y + 2)
        c.line(MARGIN_L + init_col_w + 30, init_y + 2, MARGIN_L + CONTENT_W, init_y + 2)
        c.setFont('Helvetica', 5.5)
        c.setFillColor(LIGHT_TXT)
        c.drawString(MARGIN_L, init_y - 6, data['client'])
        c.drawString(MARGIN_L + init_col_w + 30, init_y - 6, 'Method Media - Heavy Hitters')
    else:
        # Page 3 - execution record + final signatures
        y -= 6
        section_title(c, MARGIN_L, y, CONTENT_W, 'Execution & Agreement Record')
        y -= 12
        col_w = (CONTENT_W - 16) / 2
        party_block(c, MARGIN_L,             y, 'Agreement ID', data['agid'] + ' - Method Media Portal')
        party_block(c, MARGIN_L + col_w + 16, y, 'Execution Date', data['date'])
        y -= 28
        party_block(c, MARGIN_L,             y, 'Client Name', data['client'])
        party_block(c, MARGIN_L + col_w + 16, y, 'Unique Token', data['token'])
        y -= 28

        # Execution notice box
        exec_text = ('This Agreement has been executed electronically. Digital signatures captured via the '
                     'Method Media Agreement Portal carry full legal weight under the Electronic Transactions Act '
                     '(Alberta) and the Personal Information Protection Act (PIPA). Both parties acknowledge '
                     'receipt of a copy of this executed agreement. Governing law: Province of Alberta, Canada.')
        exec_lines = wrap_text(exec_text, 'Helvetica', 6.5, CONTENT_W - 20)
        box_h = len(exec_lines) * 8.5 + 12
        c.setFillColor(EXEC_BG)
        c.setStrokeColor(colors.HexColor('#c8b090'))
        c.setLineWidth(0.5)
        c.roundRect(MARGIN_L, y - box_h, CONTENT_W, box_h, 3, fill=1, stroke=1)
        c.setFont('Helvetica', 6.5)
        c.setFillColor(MID_TEXT)
        for li, ln in enumerate(exec_lines):
            c.drawString(MARGIN_L + 10, y - 10 - li * 8.5, ln)
        y -= box_h + 10

        # Final signatures
        section_title(c, MARGIN_L, y, CONTENT_W, 'Final Execution Signatures')
        y -= 10
        sig_y = max(CONTENT_BOTTOM + 52, y)
        sig_col_w = (CONTENT_W - 30) / 2
        c.setFont('Helvetica', 5.5)
        c.setFillColor(LIGHT_TXT)
        c.drawString(MARGIN_L, sig_y + 18, 'CLIENT SIGNATURE - FINAL EXECUTION')
        c.drawString(MARGIN_L + sig_col_w + 30, sig_y + 18, 'METHOD MEDIA - AUTHORIZED PROVIDER')
        c.setStrokeColor(DARK_TEXT)
        c.setLineWidth(0.75)
        c.line(MARGIN_L, sig_y + 2, MARGIN_L + sig_col_w, sig_y + 2)
        c.line(MARGIN_L + sig_col_w + 30, sig_y + 2, MARGIN_L + CONTENT_W, sig_y + 2)
        c.setFont('Helvetica-Oblique', 14)
        c.setFillColor(DARK_TEXT)
        c.drawString(MARGIN_L + 4, sig_y + 6, data['client'])
        c.drawString(MARGIN_L + sig_col_w + 34, sig_y + 6, 'Method Media')
        c.setFont('Helvetica', 5.5)
        c.setFillColor(LIGHT_TXT)
        c.drawString(MARGIN_L, sig_y - 7, data['client'] + '  |  ' + data['date'])
        c.drawString(MARGIN_L + sig_col_w + 30, sig_y - 7, 'Method Media - Heavy Hitters  |  ' + data['date'])

        if os.path.exists(WAX_SEAL):
            seal_size = 62
            c.drawImage(WAX_SEAL, W - MARGIN_L - seal_size, CONTENT_BOTTOM + 4,
                        width=seal_size, height=seal_size, preserveAspectRatio=True, mask='auto')

    draw_page_footer(c, 'Page ' + str(page_num) + ' of 3  |  Method Media - Heavy Hitters  |  Calgary, AB, Canada', CONTENT_BOTTOM - 2, W)


def generate():
    c = canvas.Canvas(OUTPUT_PDF, pagesize=letter)
    c.setTitle('Method Media - Agreement Document')
    c.setAuthor('Method Media - Heavy Hitters')
    c.setSubject(contract_data['type'])

    draw_page1(c, contract_data)
    c.showPage()

    draw_terms_page(c, contract_data, TERMS[:9], 2,
                    'Schedule B - Terms & Conditions (Clauses 1-9)',
                    TEMPLATE_2, top_ratio=0.82)
    c.showPage()

    draw_terms_page(c, contract_data, TERMS[9:], 3,
                    'Schedule B - Clauses 10-13 & Final Execution',
                    TEMPLATE_3, top_ratio=0.83)
    c.showPage()

    c.save()
    sz = os.path.getsize(OUTPUT_PDF)
    print(f'PDF saved: {OUTPUT_PDF}  ({sz:,} bytes)')


if __name__ == '__main__':
    generate()
