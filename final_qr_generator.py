import qrcode
from PIL import Image, ImageDraw, ImageFont

def create_final_qr():
    # The correct URL for the deployed agreement
    url = "https://sites.super.myninja.ai/97e4bb4e-8470-4ebe-aa33-fa02eb5624f0/61945c6a/index.html"
    
    # Create QR code instance optimized for scanning
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo
        box_size=20,
        border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create base QR code
    qr_img = qr.make_image(back_color='white', fill_color='black')
    
    # Add your MMHH logo
    try:
        logo = Image.open('1766093981441.jpg')
        
        # Crop to just the circular logo part with flame/snowflake
        logo_width, logo_height = logo.size
        crop_width = int(logo_width * 0.4)
        crop_height = int(logo_height * 0.4)
        left = (logo_width - crop_width) // 2
        top = (logo_height - crop_height) // 2 - 100  # Move up to capture the flame
        
        logo = logo.crop((left, top, left + crop_width, top + crop_height))
        
        # Resize for QR center
        logo_size = 80
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Create circular mask
        mask = Image.new('L', (logo_size, logo_size), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, logo_size, logo_size), fill=255)
        
        # Apply mask to logo
        logo.putalpha(mask)
        
        # Create final QR with logo
        qr_width, qr_height = qr_img.size
        logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
        
        # Add white circle background for logo
        bg_size = logo_size + 15
        bg = Image.new('RGBA', (bg_size, bg_size), (255, 255, 255, 255))
        bg_mask = Image.new('L', (bg_size, bg_size), 0)
        bg_draw = ImageDraw.Draw(bg_mask)
        bg_draw.ellipse((0, 0, bg_size, bg_size), fill=255)
        bg.putalpha(bg_mask)
        
        qr_final = qr_img.copy()
        bg_pos = (logo_pos[0] - 7, logo_pos[1] - 7)
        qr_final.paste(bg, bg_pos, bg)
        qr_final.paste(logo, logo_pos, logo)
        
    except Exception as e:
        print(f"Error with logo: {e}")
        qr_final = qr_img
    
    # Create the styled document
    canvas_size = (600, 700)
    canvas = Image.new('RGB', canvas_size, (10, 10, 31))
    draw = ImageDraw.Draw(canvas)
    
    # Add header styling
    for i in range(0, 100, 20):
        draw.line([(i, 0), (i, 40)], fill=(0, 150, 255), width=2)
        draw.line([(canvas_size[0]-i, 0), (canvas_size[0]-i, 40)], fill=(0, 150, 255), width=2)
    
    # Add title
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    title = "MASTER SERVICES AGREEMENT"
    title_bbox = draw.textbbox((0, 0), title, font=font_large)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (canvas_size[0] - title_width) // 2
    draw.text((title_x, 60), title, fill=(0, 204, 255), font=font_large)
    
    subtitle = "Method Media: Heavy Hitters"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (canvas_size[0] - subtitle_width) // 2
    draw.text((subtitle_x, 90), subtitle, fill=(136, 204, 255), font=font_small)
    
    # Paste QR code
    qr_pos = ((canvas_size[0] - qr_final.size[0]) // 2, 150)
    canvas.paste(qr_final, qr_pos)
    
    # Add scan instruction
    scan_text = "SCAN TO SIGN AGREEMENT"
    scan_bbox = draw.textbbox((0, 0), scan_text, font=font_small)
    scan_width = scan_bbox[2] - scan_bbox[0]
    scan_x = (canvas_size[0] - scan_width) // 2
    draw.text((scan_x, 450), scan_text, fill=(0, 255, 136), font=font_small)
    
    # Add hexagon decorations
    def draw_hexagon(x, y, size, color):
        points = []
        for i in range(6):
            angle = 60 * i
            px = x + size * 0.866 * (1 if i % 2 == 0 else 0.5)
            py = y + size * 0.5 * (1 if i % 3 == 0 else -1)
            points.append((px, py))
        draw.polygon(points, outline=color, width=2)
    
    draw_hexagon(60, 60, 20, (0, 150, 255))
    draw_hexagon(540, 60, 20, (0, 150, 255))
    draw_hexagon(60, 640, 20, (0, 150, 255))
    draw_hexagon(540, 640, 20, (0, 150, 255))
    
    # Save
    canvas.save('mmhh_qr_code_final.png', 'PNG', quality=95)
    print("Final QR Code with MMHH logo generated: mmhh_qr_code_final.png")

if __name__ == "__main__":
    create_final_qr()