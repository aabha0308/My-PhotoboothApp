// Editor Module - Handles photo editing, stickers, and frames

class PhotoEditor {
    constructor() {
        this.finalCanvas = document.getElementById('finalCanvas');
        this.ctx = this.finalCanvas.getContext('2d');
        this.selectedStickers = [];
        this.selectedFrame = '#ffffff';
        this.currentLayout = null;
        this.photos = [];
        
        // Stickers collection
        this.stickers = ['❤️', '⭐', '🌟', '✨', '💫', '🎈', '🎉', '🎊', '🌈', '☀️', '🌙', '⚡', '💖', '🦋', '🌸'];
        
        // Frame colors
        this.frames = [
            { color: '#ffffff', name: 'White' },
            { color: '#ff6b6b', name: 'Red' },
            { color: '#4ecdc4', name: 'Teal' },
            { color: '#ffe66d', name: 'Yellow' },
            { color: '#a8e6cf', name: 'Green' },
            { color: '#ff8b94', name: 'Pink' },
            { color: '#c7ceea', name: 'Purple' }
        ];
    }

    // Initialize editor with photos and layout
    init(photos, layout) {
        this.photos = photos;
        this.currentLayout = layout;
        this.selectedStickers = [];
        this.renderStickers();
        this.renderFrames();
        this.renderFinalImage();
    }

    // Render sticker options
    renderStickers() {
        const stickersGrid = document.getElementById('stickersGrid');
        stickersGrid.innerHTML = '';
        
        this.stickers.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'sticker-btn';
            btn.textContent = emoji;
            btn.addEventListener('click', () => this.addSticker(emoji, btn));
            stickersGrid.appendChild(btn);
        });
    }

    // Add sticker to photo
    addSticker(emoji, buttonElement) {
        // Add sticker with random position
        this.selectedStickers.push({
            emoji: emoji,
            x: Math.random() * 0.6 + 0.2, // Random position between 20-80%
            y: Math.random() * 0.6 + 0.2
        });
        
        // Visual feedback
        buttonElement.classList.add('selected');
        setTimeout(() => buttonElement.classList.remove('selected'), 300);
        
        // Re-render image
        this.renderFinalImage();
    }

    // Render frame color options
    renderFrames() {
        const framesGrid = document.getElementById('framesGrid');
        framesGrid.innerHTML = '';
        
        this.frames.forEach(frame => {
            const btn = document.createElement('button');
            btn.className = 'frame-btn';
            btn.style.background = frame.color;
            btn.title = frame.name;
            btn.addEventListener('click', () => this.selectFrame(frame.color, btn));
            
            // Mark first frame as selected by default
            if (frame.color === this.selectedFrame) {
                btn.classList.add('selected');
            }
            
            framesGrid.appendChild(btn);
        });
    }

    // Select frame color
    selectFrame(color, buttonElement) {
        // Remove selection from all buttons
        document.querySelectorAll('.frame-btn').forEach(btn => 
            btn.classList.remove('selected')
        );
        
        // Select current button
        buttonElement.classList.add('selected');
        this.selectedFrame = color;
        
        // Re-render image
        this.renderFinalImage();
    }

    // Get layout dimensions
    getLayoutDimensions() {
        let cols, rows;
        
        switch(this.currentLayout) {
            case '2x2':
                cols = 2;
                rows = 2;
                break;
            case '1x4':
                cols = 1;
                rows = 4;
                break;
            case '2x3':
                cols = 2;
                rows = 3;
                break;
            default:
                cols = 2;
                rows = 2;
        }
        
        return { cols, rows };
    }

    // Render final photo strip
    renderFinalImage() {
        const { cols, rows } = this.getLayoutDimensions();
        
        // Photo and layout dimensions
        const photoWidth = 300;
        const photoHeight = 400;
        const padding = 20;
        
        // Calculate canvas size
        this.finalCanvas.width = cols * photoWidth + (cols + 1) * padding;
        this.finalCanvas.height = rows * photoHeight + (rows + 1) * padding;
        
        // Draw frame background
        this.ctx.fillStyle = this.selectedFrame;
        this.ctx.fillRect(0, 0, this.finalCanvas.width, this.finalCanvas.height);
        
        // Draw each photo
        let loadedCount = 0;
        const totalPhotos = this.photos.length;
        
        this.photos.forEach((photoData, index) => {
            const img = new Image();
            img.src = photoData;
            
            img.onload = () => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = col * photoWidth + (col + 1) * padding;
                const y = row * photoHeight + (row + 1) * padding;
                
                // Draw photo
                this.ctx.drawImage(img, x, y, photoWidth, photoHeight);
                
                loadedCount++;
                
                // Draw stickers after all photos are loaded
                if (loadedCount === totalPhotos) {
                    this.drawStickers(x, y, photoWidth, photoHeight, cols, rows);
                }
            };
        });
    }

    // Draw stickers on photos
    drawStickers(baseX, baseY, photoWidth, photoHeight, cols, rows) {
        this.selectedStickers.forEach(sticker => {
            // Draw sticker on each photo
            this.photos.forEach((_, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = col * photoWidth + (col + 1) * 20; // 20 is padding
                const y = row * photoHeight + (row + 1) * 20;
                
                this.ctx.font = '48px Arial';
                this.ctx.fillText(
                    sticker.emoji,
                    x + sticker.x * photoWidth,
                    y + sticker.y * photoHeight
                );
            });
        });
    }

    // Download final image
    downloadImage() {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `glass-photobooth-${timestamp}.png`;
        link.href = this.finalCanvas.toDataURL('image/png');
        link.click();
        
        console.log('Photo downloaded successfully!');
    }

    // Reset editor
    reset() {
        this.selectedStickers = [];
        this.selectedFrame = '#ffffff';
        this.photos = [];
        this.ctx.clearRect(0, 0, this.finalCanvas.width, this.finalCanvas.height);
    }
}

// Export editor instance
const photoEditor = new PhotoEditor();