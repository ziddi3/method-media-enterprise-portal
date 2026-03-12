import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer
from qrcode.image.styles.colormasks import SquareGradiantColorMask
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import urllib.request
import io

def add_logo_to_qr(qr_img, logo_path="1766093981441.jpg"):
    """Add actual MMHH logo to center of QR code"""
    try:
        # Load the actual logo image
        logo = Image.open(logo_path)
        
        # Crop to the circular logo with flame/snowflake
        logo_width, logo_height = logo.size
        # Focus on the central circular part with the flame/snowflake
        crop_size = int(min(logo_width, logo_height) * 0.6)
        left = (logo_width - crop_size) // 2
        top = (logo_height - crop_size) // 2 - 50  # Move up to capture the flame/snowflake
        logo = logo.crop((left, top, left + crop_size, top + crop_size))
        
        # Resize logo to fit nicely in QR center
        logo_size = 70
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Create circular mask for the logo
        mask = Image.new('L', (logo_size, logo_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((5, 5, logo_size-5, logo_size-5), fill=255)
        
        # Apply circular mask to logo
        logo.putalpha(mask)
        
        # Add white background circle behind logo for better contrast
        qr_with_logo = qr_img.copy()
        qr_width, qr_height = qr_with_logo.size
        logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
        
        # Draw white circle background
        bg_size = logo_size + 12
        background = Image.new('RGBA', (bg_size, bg_size), (255, 255, 255, 255))
        bg_mask = Image.new('L', (bg_size, bg_size), 0)
        bg_draw = ImageDraw.Draw(bg_mask)
        bg_draw.ellipse((0, 0, bg_size, bg_size), fill=255)
        background.putalpha(bg_mask)
        
        bg_pos = (logo_pos[0] - 6, logo_pos[1] - 6)
        qr_with_logo.paste(background, bg_pos, background)
        
        # Paste the logo
        qr_with_logo.paste(logo, logo_pos, logo)
        
        return qr_with_logo
        
    except Exception as e:
        print(f"Error loading logo: {e}")
        # Fallback to simple logo
        return create_fallback_logo(qr_img)

def create_fallback_logo(qr_img):
    """Create fallback MMHH logo"""
    logo_size = 60
    logo = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(logo)
    
    # Draw circle background
    draw.ellipse((5, 5, 55, 55), fill=(0, 50, 100), outline=(0, 150, 255), width=2)
    
    # Draw MMHH text
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    draw.text((12, 20), "MM", fill=(0, 200, 255), font=font)
    draw.text((28, 20), "HH", fill=(0, 200, 255), font=font)
    
    # Calculate position to center logo on QR code
    qr_width, qr_height = qr_img.size
    logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
    
    # Create a copy of QR code and add logo
    qr_with_logo = qr_img.copy()
    qr_with_logo.paste(logo, logo_pos, logo)
    
    return qr_with_logo

def create_stylized_qr():
    # The URL for the deployed agreement - updated to current deployment
    url = "https://sites.super.myninja.ai/97e4bb4e-8470-4ebe-aa33-fa02eb5624f0/61945c6a/index.html"
    
    # Create QR code instance with higher error correction for reliability
    qr = qrcode.QRCode(
        version=2,  # Smaller version for better scanning
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=20,  # Larger boxes for better scanning
        border=4,  # Adequate border
    )
    
    # Add data
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create PERFECTLY clean QR code - no interference
    img = qr.make_image(
        back_color='white',  # Pure white background
        fill_color='black'   # Pure black foreground
    )
    
    # Create canvas with proper spacing
    canvas_size = (600, 700)
    canvas = Image.new('RGB', canvas_size, (10, 10, 31))  # Dark background
    draw = ImageDraw.Draw(canvas)
    
    # Add decorative borders ONLY - keep away from QR area
    for i in range(0, 100, 20):
        draw.line([(i, 0), (i, 30)], fill=(0, 150, 255), width=2)
        draw.line([(canvas_size[0]-i, 0), (canvas_size[0]-i, 30)], fill=(0, 150, 255), width=2)
        draw.line([(i, canvas_size[1]-30), (i, canvas_size[1])], fill=(0, 150, 255), width=2)
        draw.line([(canvas_size[0]-i, canvas_size[1]-30), (canvas_size[0]-i, canvas_size[1])], fill=(0, 150, 255), width=2)
    
    # Add logo to QR code
    img_with_logo = add_logo_to_qr(img)
    
    # Paste QR code with logo and generous white space
    qr_pos = ((canvas_size[0] - img_with_logo.size[0]) // 2, 150)
    canvas.paste(img_with_logo, qr_pos)
    
    # Add "SCAN TO VIEW AGREEMENT" text at bottom
    try:
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font_small = ImageFont.load_default()
    
    scan_text = "SCAN TO VIEW AGREEMENT"
    scan_bbox = draw.textbbox((0, 0), scan_text, font=font_small)
    scan_width = scan_bbox[2] - scan_bbox[0]
    scan_x = (canvas_size[0] - scan_width) // 2
    draw.text((scan_x, 450), scan_text, fill=(0, 204, 255), font=font_small)
    
    # Add hexagonal decorations (away from QR code)
    def draw_hexagon(x, y, size, color):
        points = []
        for i in range(6):
            angle = 60 * i
            px = x + size * np.cos(np.radians(angle))
            py = y + size * np.sin(np.radians(angle))
            points.append((px, py))
        draw.polygon(points, outline=color, width=2)
    
    # Place hexagons in corners, away from QR code
    draw_hexagon(60, 60, 25, (0, 150, 255))
    draw_hexagon(540, 60, 25, (0, 150, 255))
    draw_hexagon(60, 640, 25, (0, 150, 255))
    draw_hexagon(540, 640, 25, (0, 150, 255))
    
    # Add title (above QR code)
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Add title text
    title = "MASTER SERVICES AGREEMENT"
    title_bbox = draw.textbbox((0, 0), title, font=font_large)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (canvas_size[0] - title_width) // 2
    draw.text((title_x, 60), title, fill=(0, 204, 255), font=font_large)
    
    # Add subtitle
    subtitle = "Method Media: Heavy Hitters"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (canvas_size[0] - subtitle_width) // 2
    draw.text((subtitle_x, 90), subtitle, fill=(136, 204, 255), font=font_small)
    
    # Add instructions (below QR code)
    instruction = "SCAN TO SIGN AGREEMENT"
    instruction_bbox = draw.textbbox((0, 0), instruction, font=font_small)
    instruction_width = instruction_bbox[2] - instruction_bbox[0]
    instruction_x = (canvas_size[0] - instruction_width) // 2
    draw.text((instruction_x, 500), instruction, fill=(0, 255, 136), font=font_small)
    
    # Add "ACTIVE & SECURE" status
    status = "● ACTIVE & SECURE ●"
    status_bbox = draw.textbbox((0, 0), status, font=font_small)
    status_width = status_bbox[2] - status_bbox[0]
    status_x = (canvas_size[0] - status_width) // 2
    draw.text((status_x, 530), status, fill=(0, 255, 136), font=font_small)
    
    # Add website URL at bottom
    short_url = "mmhh-agreement.com"
    url_bbox = draw.textbbox((0, 0), short_url, font=font_small)
    url_width = url_bbox[2] - url_bbox[0]
    url_x = (canvas_size[0] - url_width) // 2
    draw.text((url_x, 560), short_url, fill=(136, 204, 255), font=font_small)
    
    # Save the QR code
    canvas.save('mmhh_qr_code.png', 'PNG', quality=95)
    print("QR Code generated successfully: mmhh_qr_code.png")
    
    return canvas_size

if __name__ == "__main__":
    create_stylized_qr()