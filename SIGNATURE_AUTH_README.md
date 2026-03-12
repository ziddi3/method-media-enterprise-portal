# Signature-Based Authentication System

## Overview

The Method Media Cloud Agreement System now features **signature-based authentication** as the primary login method, with password as an optional backup. This provides a more secure and user-friendly authentication experience.

## Key Features

### 1. Signature Verification System
- **Algorithm**: Dynamic Time Warping (DTW) for point-to-point matching
- **Feature Extraction**: Stroke count, total length, average speed, direction changes
- **Confidence Threshold**: 75% similarity required for successful authentication
- **Multi-factor**: Combines spatial matching with temporal features

### 2. Registration Flow
- **Primary**: User creates a signature passkey during registration
- **Optional**: User can add a password as backup
- **Wax Seal**: User's signature is incorporated as a unique pattern on their wax seal
- **Storage**: Signature data stored as JSON array of points with timestamps

### 3. Login Flow
- **Primary Method**: User signs with signature pad
- **Automatic Verification**: System compares signature to stored reference
- **Fallback**: If signature doesn't match, password can be used
- **Feedback**: Confidence score displayed to user

### 4. Wax Seal Generation
- **16 Templates**: Diverse wax seal templates with Method Media branding
- **Signature Pattern**: User's signature overlaid as unique identifier
- **Initials**: Artistically imprinted initials on top
- **Visual Effects**: Glow, shadow, and metallic effects

## Technical Implementation

### Signature Verifier Module
- Point normalization to 0-1 range
- Stroke feature extraction (count, length, speed, corners)
- Dynamic Time Warping distance calculation
- Weighted similarity scoring

### Database Schema
- users table with signature_data column (TEXT)
- signature_created_at timestamp
- password now optional (nullable)

### API Endpoints
- POST /api/register - Accepts name, signatureData, optional password
- POST /api/login - Accepts name, signatureData, optional password

## Branding Updates
- Method Media logo replaces MM sphere
- Elf mascot and trident icon assets
- Fire ring animated effects
- Gold/orange/blue/purple color scheme