import qrcode
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def create_perfect_qr():
    # The correct URL for the deployed agreement - FINAL VERSION
    url = "https://sites.super.myninja.ai/97e4bb4e-8470-4ebe-aa33-fa02eb5624f0/1f075423/index.html"
    
    # Create QR code with high error correction for logo overlay
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=15,
        border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    
    # Make base QR code
    qr_img = qr.make_image(back_color='white', fill_color='black')
    
    # Extract and place your MMHH logo
    try:
        # Load your logo image
        logo = Image.open('1766093981441.jpg')
        
        # Get dimensions and crop the central logo part
        width, height = logo.size
        # Focus on the central circular logo with flame/snowflake
        crop_left = width // 4
        crop_top = height // 4 - 50  # Move up to capture the flame
        crop_right = width * 3 // 4
        crop_bottom = height * 3 // 4 - 50
        
        logo_cropped = logo.crop((crop_left, crop_top, crop_right, crop_bottom))
        
        # Resize to fit QR center
        logo_size = 70
        logo_resized = logo_cropped.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Create circular mask
        mask = Image.new('L', (logo_size, logo_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, logo_size, logo_size), fill=255)
        
        # Apply circular mask to logo
        logo_resized.putalpha(mask)
        
        # Position logo in center of QR
        qr_width, qr_height = qr_img.size
        logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
        
        # Create final QR with logo
        qr_with_logo = qr_img.copy()
        
        # Add white circle background for better contrast
        bg_size = logo_size + 12
        bg = Image.new('RGBA', (bg_size, bg_size), (255, 255, 255, 255))
        bg_mask = Image.new('L', (bg_size, bg_size), 0)
        bg_draw = ImageDraw.Draw(bg_mask)
        bg_draw.ellipse((0, 0, bg_size, bg_size), fill=255)
        bg.putalpha(bg_mask)
        
        # Paste background circle and logo
        bg_pos = (logo_pos[0] - 6, logo_pos[1] - 6)
        qr_with_logo.paste(bg, bg_pos, bg)
        qr_with_logo.paste(logo_resized, logo_pos, logo_resized)
        
        final_qr = qr_with_logo
        
    except Exception as e:
        print(f"Logo error: {e}")
        final_qr = qr_img
    
    # Create the complete document
    canvas_size = (600, 700)
    canvas = Image.new('RGB', canvas_size, (10, 10, 31))
    draw = ImageDraw.Draw(canvas)
    
    # Add decorative borders
    for i in range(0, 120, 30):
        draw.line([(i, 0), (i, 50)], fill=(0, 150, 255), width=2)
        draw.line([(canvas_size[0]-i, 0), (canvas_size[0]-i, 50)], fill=(0, 150, 255), width=2)
        draw.line([(i, canvas_size[1]-50), (i, canvas_size[1])], fill=(0, 150, 255), width=2)
        draw.line([(canvas_size[0]-i, canvas_size[1]-50), (canvas_size[0]-i, canvas_size[1])], fill=(0, 150, 255), width=2)
    
    # Add title text
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        instruction_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        instruction_font = ImageFont.load_default()
    
    # Title
    title = "MASTER SERVICES AGREEMENT"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (canvas_size[0] - title_width) // 2
    draw.text((title_x, 70), title, fill=(0, 204, 255), font=title_font)
    
    # Subtitle
    subtitle = "Method Media: Heavy Hitters"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (canvas_size[0] - subtitle_width) // 2
    draw.text((subtitle_x, 105), subtitle, fill=(136, 204, 255), font=subtitle_font)
    
    # Paste QR code
    qr_pos = ((canvas_size[0] - final_qr.size[0]) // 2, 160)
    canvas.paste(final_qr, qr_pos)
    
    # Instructions
    instruction1 = "SCAN TO SIGN AGREEMENT"
    instruction2 = "with MMHH Digital Signature System"
    
    inst1_bbox = draw.textbbox((0, 0), instruction1, font=instruction_font)
    inst1_width = inst1_bbox[2] - inst1_bbox[0]
    inst1_x = (canvas_size[0] - inst1_width) // 2
    draw.text((inst1_x, 460), instruction1, fill=(0, 255, 136), font=instruction_font)
    
    inst2_bbox = draw.textbbox((0, 0), instruction2, font=subtitle_font)
    inst2_width = inst2_bbox[2] - inst2_bbox[1]
    inst2_x = (canvas_size[0] - inst2_width) // 2
    draw.text((inst2_x, 480), instruction2, fill=(136, 204, 255), font=subtitle_font)
    
    # Add hexagon decorations
    def draw_hexagon(cx, cy, size, color):
        points = []
        for i in range(6):
            angle = 60 * i
            x = cx + size * np.cos(np.radians(angle))
            y = cy + size * np.sin(np.radians(angle))
            points.append((x, y))
        draw.polygon(points, outline=color, width=2)
    
    draw_hexagon(50, 50, 25, (0, 150, 255))
    draw_hexagon(550, 50, 25, (0, 150, 255))
    draw_hexagon(50, 650, 25, (0, 150, 255))
    draw_hexagon(550, 650, 25, (0, 150, 255))
    
    # Save final QR code
    canvas.save('mmhh_qr_perfect.png', 'PNG', quality=100)
    print("Perfect QR Code with MMHH logo created: mmhh_qr_perfect.png")
    
    # Test: print the URL to verify it's correct
    print(f"QR code contains URL: {url}")
    
    return canvas_size

if __name__ == "__main__":
    create_perfect_qr()