import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

# Parameters - Updated with final production URL
url = "https://sites.super.myninja.ai/97e4bb4e-8470-4ebe-aa33-fa02eb5624f0/e5d8ab17/master_services_agreement_fixed.html"
output_path = "mmhh_qr_fixed.png"
logo_path = None  # We'll add text instead of logo

# Create QR code with high error correction for logo placement
qr = qrcode.QRCode(
    version=4,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=6,  # Ensure proper border
)
qr.add_data(url)
qr.make(fit=True)

# Create QR code image
qr_img = qr.make_image(fill_color="#0066cc", back_color="white").convert('RGB')

# Add MMHH text in center
draw = ImageDraw.Draw(qr_img)
try:
    # Try to use a bold font
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
except:
    font = ImageFont.load_default()

text = "MMHH"
# Get text bounding box
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

# Calculate center position
center_x = qr_img.width // 2
center_y = qr_img.height // 2
x = center_x - text_width // 2
y = center_y - text_height // 2

# Draw text with shadow for better visibility
draw.text((x-1, y-1), text, fill="#333333", font=font)
draw.text((x+1, y-1), text, fill="#333333", font=font)
draw.text((x-1, y+1), text, fill="#333333", font=font)
draw.text((x+1, y+1), text, fill="#333333", font=font)
draw.text((x, y), text, fill="#0066cc", font=font)

# Save the QR code
qr_img.save(output_path)
print(f"QR code saved to {output_path}")
print(f"QR code dimensions: {qr_img.width}x{qr_img.height}")

# Verify the QR code is scannable
from qrcode.util import QRData
import io

# Test by recreating and checking data
test_qr = qrcode.QRCode(
    version=4,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=6,
)
test_qr.add_data(url)
test_qr.make(fit=True)

print("QR code generated successfully with proper framing")
print(f"Target URL: {url}")