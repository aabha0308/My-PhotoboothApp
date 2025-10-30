// Camera Module - Handles all camera-related functionality

class CameraManager {
    constructor() {
        this.stream = null;
        this.videoElement = document.getElementById('video');
        this.captureCanvas = document.getElementById('captureCanvas');
        this.countdownElement = document.getElementById('countdown');
        this.photoCounterElement = document.getElementById('photoCounter');
        this.capturedPhotos = [];
    }

    // Start camera stream
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            this.videoElement.srcObject = this.stream;
            console.log('Camera started successfully');
            return true;
        } catch (error) {
            console.error('Camera error:', error);
            alert('❌ Camera access denied!\n\nPlease allow camera access to use the photo booth.\n\nTip: Check your browser settings and reload the page.');
            return false;
        }
    }

    // Stop camera stream
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            console.log('Camera stopped');
        }
    }

    // Show countdown animation
    async showCountdown(seconds) {
        for (let i = seconds; i > 0; i--) {
            this.countdownElement.textContent = i;
            this.countdownElement.classList.add('active');
            await this.sleep(1000);
            this.countdownElement.classList.remove('active');
            await this.sleep(100);
        }
    }

    // Capture a single photo
    capturePhoto() {
        const ctx = this.captureCanvas.getContext('2d');
        
        // Set canvas size to match video
        this.captureCanvas.width = this.videoElement.videoWidth;
        this.captureCanvas.height = this.videoElement.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(this.videoElement, 0, 0);
        
        // Convert to data URL and return
        return this.captureCanvas.toDataURL('image/png');
    }

    // Display captured photo in grid
    displayPhotoInGrid(photoData, index) {
        const slot = document.getElementById(`slot-${index}`);
        if (slot) {
            const img = document.createElement('img');
            img.src = photoData;
            slot.innerHTML = '';
            slot.appendChild(img);
        }
    }

    // Update photo counter display
    updatePhotoCounter(current, total) {
        this.photoCounterElement.textContent = `Photo ${current} of ${total}`;
    }

    // Capture sequence of photos
    async captureSequence(photoCount) {
        this.capturedPhotos = [];
        
        for (let i = 0; i < photoCount; i++) {
            // Show countdown
            await this.showCountdown(3);
            
            // Capture photo
            const photoData = this.capturePhoto();
            this.capturedPhotos.push(photoData);
            
            // Display in grid
            this.displayPhotoInGrid(photoData, i);
            
            // Update counter
            this.updatePhotoCounter(i + 1, photoCount);
            
            // Small pause between photos
            await this.sleep(500);
        }
        
        return this.capturedPhotos;
    }

    // Get captured photos
    getPhotos() {
        return this.capturedPhotos;
    }

    // Clear captured photos
    clearPhotos() {
        this.capturedPhotos = [];
    }

    // Utility sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export camera manager instance
const cameraManager = new CameraManager();