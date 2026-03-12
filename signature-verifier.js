// Signature Verification System
// Implements multiple algorithms for signature recognition and comparison

class SignatureVerifier {
    constructor() {
        this.similarityThreshold = 0.75; // 75% similarity required to match
    }

    // Normalize signature data by removing outliers and smoothing
    normalizeSignature(points) {
        if (!points || points.length === 0) return [];
        
        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        });

        // Normalize to 0-1 range
        const width = maxX - minX || 1;
        const height = maxY - minY || 1;
        
        return points.map(p => ({
            x: (p.x - minX) / width,
            y: (p.y - minY) / height,
            time: p.time || 0
        }));
    }

    // Extract stroke-based features from signature
    extractStrokeFeatures(points) {
        if (!points || points.length < 2) return null;

        const features = {
            strokeCount: 0,
            totalLength: 0,
            averageSpeed: 0,
            directionChanges: 0,
            corners: []
        };

        // Detect strokes (lifted pen = new stroke)
        let strokes = [];
        let currentStroke = [points[0]];
        
        for (let i = 1; i < points.length; i++) {
            const timeDiff = points[i].time - points[i-1].time;
            // If time gap > 100ms, consider it a new stroke
            if (timeDiff > 100 || points[i].force === 0) {
                strokes.push(currentStroke);
                currentStroke = [points[i]];
            } else {
                currentStroke.push(points[i]);
            }
        }
        if (currentStroke.length > 0) strokes.push(currentStroke);
        features.strokeCount = strokes.length;

        // Calculate total length and speed
        let totalLength = 0;
        let totalTime = 0;
        
        strokes.forEach(stroke => {
            for (let i = 1; i < stroke.length; i++) {
                const dx = stroke[i].x - stroke[i-1].x;
                const dy = stroke[i].y - stroke[i-1].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                totalLength += dist;
                totalTime += (stroke[i].time - stroke[i-1].time);
            }
        });
        
        features.totalLength = totalLength;
        features.averageSpeed = totalTime > 0 ? totalLength / totalTime : 0;

        // Detect direction changes (corners)
        let prevAngle = null;
        strokes.forEach(stroke => {
            for (let i = 2; i < stroke.length; i++) {
                const dx1 = stroke[i-1].x - stroke[i-2].x;
                const dy1 = stroke[i-1].y - stroke[i-2].y;
                const dx2 = stroke[i].x - stroke[i-1].x;
                const dy2 = stroke[i].y - stroke[i-1].y;
                
                const angle1 = Math.atan2(dy1, dx1);
                const angle2 = Math.atan2(dy2, dx2);
                
                if (prevAngle !== null) {
                    const angleDiff = Math.abs(angle2 - angle1);
                    if (angleDiff > 0.5) { // Significant direction change
                        features.directionChanges++;
                        features.corners.push({x: stroke[i].x, y: stroke[i].y});
                    }
                }
                prevAngle = angle2;
            }
        });

        return features;
    }

    // Compare two signatures using point-to-point matching
    comparePoints(sig1, sig2) {
        const norm1 = this.normalizeSignature(sig1);
        const norm2 = this.normalizeSignature(sig2);
        
        if (norm1.length === 0 || norm2.length === 0) return 0;

        // Use Dynamic Time Warping for flexible matching
        const dtwDistance = this.calculateDTW(norm1, norm2);
        const maxDistance = Math.max(norm1.length, norm2.length);
        
        // Convert distance to similarity score (0-1)
        const similarity = Math.max(0, 1 - (dtwDistance / maxDistance));
        
        return similarity;
    }

    // Dynamic Time Warping algorithm for sequence matching
    calculateDTW(seq1, seq2) {
        const n = seq1.length;
        const m = seq2.length;
        const dtw = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
        
        dtw[0][0] = 0;
        
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cost = Math.sqrt(
                    Math.pow(seq1[i-1].x - seq2[j-1].x, 2) +
                    Math.pow(seq1[i-1].y - seq2[j-1].y, 2)
                );
                dtw[i][j] = cost + Math.min(
                    dtw[i-1][j],    // insertion
                    dtw[i][j-1],    // deletion
                    dtw[i-1][j-1]   // match
                );
            }
        }
        
        return dtw[n][m];
    }

    // Compare stroke-based features
    compareFeatures(features1, features2) {
        if (!features1 || !features2) return 0;

        let score = 0;
        let weight = 0;

        // Stroke count similarity (weight: 20%)
        const strokeDiff = Math.abs(features1.strokeCount - features2.strokeCount);
        const strokeSimilarity = Math.max(0, 1 - (strokeDiff / Math.max(features1.strokeCount, features2.strokeCount)));
        score += strokeSimilarity * 0.2;
        weight += 0.2;

        // Length similarity (weight: 30%)
        const lengthRatio = Math.min(features1.totalLength, features2.totalLength) / 
                           Math.max(features1.totalLength, features2.totalLength);
        score += lengthRatio * 0.3;
        weight += 0.3;

        // Speed similarity (weight: 20%)
        const speedRatio = Math.min(features1.averageSpeed, features2.averageSpeed) / 
                          Math.max(features1.averageSpeed, features2.averageSpeed);
        score += speedRatio * 0.2;
        weight += 0.2;

        // Direction changes similarity (weight: 30%)
        const directionDiff = Math.abs(features1.directionChanges - features2.directionChanges);
        const directionSimilarity = Math.max(0, 1 - (directionDiff / Math.max(features1.directionChanges, features2.directionChanges)));
        score += directionSimilarity * 0.3;
        weight += 0.3;

        return weight > 0 ? score / weight : 0;
    }

    // Main verification function - combines all methods
    verifySignature(inputSignature, referenceSignature) {
        if (!inputSignature || !referenceSignature) {
            return { success: false, confidence: 0, message: "Missing signature data" };
        }

        // Parse signature data if needed
        const sig1 = typeof inputSignature === 'string' ? JSON.parse(inputSignature) : inputSignature;
        const sig2 = typeof referenceSignature === 'string' ? JSON.parse(referenceSignature) : referenceSignature;

        // Extract features
        const features1 = this.extractStrokeFeatures(sig1);
        const features2 = this.extractStrokeFeatures(sig2);

        // Compare using both methods
        const pointSimilarity = this.comparePoints(sig1, sig2);
        const featureSimilarity = this.compareFeatures(features1, features2);

        // Combine scores (weighted average)
        const combinedScore = (pointSimilarity * 0.6) + (featureSimilarity * 0.4);

        const success = combinedScore >= this.similarityThreshold;

        return {
            success: success,
            confidence: combinedScore,
            pointSimilarity: pointSimilarity,
            featureSimilarity: featureSimilarity,
            threshold: this.similarityThreshold,
            message: success ? "Signature verified successfully" : "Signature verification failed"
        };
    }

    // Set custom threshold
    setThreshold(threshold) {
        if (threshold >= 0 && threshold <= 1) {
            this.similarityThreshold = threshold;
        }
    }
}

module.exports = SignatureVerifier;