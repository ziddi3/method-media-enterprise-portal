import qrcode

def create_clean_qr():
    # The URL for the deployed agreement - updated to current deployment
    url = "https://sites.super.myninja.ai/97e4bb4e-8470-4ebe-aa33-fa02eb5624f0/61945c6a/index.html"
    
    # Create QR code instance optimized for scanning
    qr = qrcode.QRCode(
        version=2,  # Optimal size for mobile scanning
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=20,  # Large boxes for reliable scanning
        border=4,  # Standard border
    )
    
    # Add data
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create clean QR code - perfect contrast for scanning
    img = qr.make_image(
        back_color='white',  # Pure white background
        fill_color='black'   # Pure black foreground
    )
    
    # Save with high quality
    img.save('clean_qr_code.png', 'PNG', quality=100)
    print("Clean QR Code generated successfully: clean_qr_code.png")
    
    return img.size

if __name__ == "__main__":
    create_clean_qr()