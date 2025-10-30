// Main Application - Coordinates between camera and editor modules

class PhotoBoothApp {
    constructor() {
        this.selectedLayout = null;
        this.currentScreen = 'home';
        
        // Initialize when DOM is ready
        this.init();
    }

    init() {
        console.log('Photo Booth App initialized');
        this.setupEventListeners();
        this.showScreen('home');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Layout selection
        document.querySelectorAll('.layout-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectLayout(e));
        });

        // Start button (home screen)
        document.getElementById('startBtn').addEventListener('click', () => this.startPhotoBooth());

        // Capture button (camera screen)
        document.getElementById('captureBtn').addEventListener('click', () => this.capturePhotos());

        // Retake button (edit screen)
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakePhotos());

        // Download button (edit screen)
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPhoto());
    }

    // Select layout
    selectLayout(event) {
        // Remove selection from all options
        document.querySelectorAll('.layout-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select clicked option
        const selectedOption = event.currentTarget;
        selectedOption.classList.add('selected');
        this.selectedLayout = selectedOption.dataset.layout;

        // Enable start button
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = false;
        startBtn.textContent = '📷 Start Photo Booth';

        console.log('Layout selected:', this.selectedLayout);
    }

    // Start photo booth session
    async startPhotoBooth() {
        if (!this.selectedLayout) {
            alert('Please select a layout first!');
            return;
        }

        console.log('Starting photo booth...');
        
        // Start camera
        const cameraStarted = await cameraManager.startCamera();
        
        if (cameraStarted) {
            // Setup photo grid
            this.setupPhotoGrid();
            
            // Switch to camera screen
            this.showScreen('camera');
            
            // Reset photo counter
            cameraManager.updatePhotoCounter(0, this.getPhotoCount());
        }
    }

    // Setup photo grid based on selected layout
    setupPhotoGrid() {
        const grid = document.getElementById('photosGrid');
        grid.innerHTML = '';
        
        const photoCount = this.getPhotoCount();
        
        // Adjust grid layout
        if (this.selectedLayout === '1x4') {
            grid.style.gridTemplateColumns = '1fr';
        } else if (this.selectedLayout === '2x3') {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
        
        // Create photo slots
        for (let i = 0; i < photoCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'photo-slot';
            slot.id = `slot-${i}`;
            grid.appendChild(slot);
        }
        
        console.log(`Created ${photoCount} photo slots`);
    }

    // Get number of photos based on layout
    getPhotoCount() {
        switch(this.selectedLayout) {
            case '2x2':
                return 4;
            case '1x4':
                return 4;
            case '2x3':
                return 6;
            default:
                return 4;
        }
    }

    // Capture photos sequence
    async capturePhotos() {
        const captureBtn = document.getElementById('captureBtn');
        
        // Disable button during capture
        captureBtn.disabled = true;
        captureBtn.textContent = '📸 Capturing...';
        
        try {
            const photoCount = this.getPhotoCount();
            
            // Capture sequence
            const photos = await cameraManager.captureSequence(photoCount);
            
            console.log(`Captured ${photos.length} photos`);
            
            // Stop camera
            cameraManager.stopCamera();
            
            // Initialize editor with photos
            photoEditor.init(photos, this.selectedLayout);
            
            // Switch to edit screen
            this.showScreen('edit');
            
        } catch (error) {
            console.error('Capture error:', error);
            alert('Error capturing photos. Please try again.');
        } finally {
            // Re-enable button
            captureBtn.disabled = false;
            captureBtn.textContent = '📸 Start Capture';
        }
    }

    // Retake photos
    async retakePhotos() {
        console.log('Retaking photos...');
        
        // Reset editor
        photoEditor.reset();
        
        // Clear camera photos
        cameraManager.clearPhotos();
        
        // Restart camera
        await cameraManager.startCamera();
        
        // Setup grid again
        this.setupPhotoGrid();
        
        // Go back to camera screen
        this.showScreen('camera');
        
        // Reset counter
        cameraManager.updatePhotoCounter(0, this.getPhotoCount());
    }

    // Download final photo
    downloadPhoto() {
        console.log('Downloading photo...');
        photoEditor.downloadImage();
        
        // Optional: Show success message
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '✓ Downloaded!';
        
        setTimeout(() => {
            downloadBtn.textContent = originalText;
        }, 2000);
    }

    // Show specific screen
    showScreen(screenName) {
        console.log(`Switching to ${screenName} screen`);
        
        // Hide all screens
        document.querySelectorAll('[class^="screen-"]').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        const targetScreen = document.querySelector(`.screen-${screenName}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    const app = new PhotoBoothApp();
    
    // Make app globally accessible for debugging
    window.photoBoothApp = app;
});