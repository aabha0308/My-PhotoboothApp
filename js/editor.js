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
        this.stickers = ['🐥', '⭐', '🌟', '✨', '🍒', '💋', '🧁', '💕', '🌈', '☀️', '🌙', '⚡', '💗', '🦋', '🌸','🪅','🐱', '🐶'];
        
        // Frame colors
        this.frames = [
            { color: '#ffffff', name: 'White' },
            { color: '#550909ff', name: 'Maroon' },
            { color: '#b3f6ffff', name: 'blue' },
            { color: '#fee770ff', name: 'Yellow' },
            { color: '#437563ff', name: 'Sage Green' },
            { color: '#ffbabaff', name: 'Pink' },
            { color: '#d6adffff', name: 'Purple' },
            { color: '#000000ff', name: 'Black'}
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
        this.enableStickerDrag();
        this.enableStickerInteractions();

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
     this.selectedStickers.push({
        emoji: emoji,
        x: Math.random() * 0.8 + 0.1, // random position within frame
        y: Math.random() * 0.8 + 0.1,
        size: 64 // default size
    });

    // Visual feedback
    buttonElement.classList.add('selected');
    setTimeout(() => buttonElement.classList.remove('selected'), 300);

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
        this.ctx.font = `${sticker.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            sticker.emoji,
            sticker.x * this.finalCanvas.width,
            sticker.y * this.finalCanvas.height
        );
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


    enableStickerDrag() {
    let isDragging = false;
    let currentSticker = null;
    let offsetX, offsetY;

    this.finalCanvas.addEventListener('mousedown', (e) => {
        const rect = this.finalCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        if (this.selectedStickers.length > 0) {
            const sticker = this.selectedStickers[0];
            const totalWidth = this.finalCanvas.width;
            const totalHeight = this.finalCanvas.height;

            const stickerX = sticker.x * totalWidth;
            const stickerY = sticker.y * totalHeight;
            const size = sticker.size;

            // Simple hit detection (within a square around emoji)
            if (Math.abs(x - stickerX) < size && Math.abs(y - stickerY) < size) {
                isDragging = true;
                currentSticker = sticker;
                offsetX = x - stickerX;
                offsetY = y - stickerY;
            }
        }
    });

    this.finalCanvas.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentSticker) return;

        const rect = this.finalCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update sticker’s relative coordinates (0–1 scale)
        currentSticker.x = x / this.finalCanvas.width;
        currentSticker.y = y / this.finalCanvas.height;

        this.renderFinalImage();
    });

    this.finalCanvas.addEventListener('mouseup', () => {
        isDragging = false;
        currentSticker = null;
    });

    this.finalCanvas.addEventListener('mouseleave', () => {
        isDragging = false;
        currentSticker = null;
    });
}

enableStickerInteractions() {
    let isDragging = false;
    let activeSticker = null;
    let offsetX = 0, offsetY = 0;

    // Mouse down → select sticker
    this.finalCanvas.addEventListener('mousedown', (e) => {
        const rect = this.finalCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Iterate from topmost to bottommost (reverse for z-order)
        for (let i = this.selectedStickers.length - 1; i >= 0; i--) {
            const sticker = this.selectedStickers[i];
            const sX = sticker.x * this.finalCanvas.width;
            const sY = sticker.y * this.finalCanvas.height;
            const radius = sticker.size / 2;

            if (Math.abs(x - sX) < radius && Math.abs(y - sY) < radius) {
                activeSticker = sticker;
                isDragging = true;
                offsetX = x - sX;
                offsetY = y - sY;
                break;
            }
        }
    });

    // Mouse move → drag active sticker
    this.finalCanvas.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeSticker) return;

        const rect = this.finalCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        activeSticker.x = x / this.finalCanvas.width;
        activeSticker.y = y / this.finalCanvas.height;

        this.renderFinalImage();
    });

    // Mouse up → release
    this.finalCanvas.addEventListener('mouseup', () => {
        isDragging = false;
        activeSticker = null;
    });

    this.finalCanvas.addEventListener('mouseleave', () => {
        isDragging = false;
        activeSticker = null;
    });

    // Mouse wheel → resize
    this.finalCanvas.addEventListener('wheel', (e) => {
        if (!activeSticker) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 5 : -5;
        activeSticker.size = Math.max(20, activeSticker.size + delta);
        this.renderFinalImage();
    });
}


}

// Export editor instance
const photoEditor = new PhotoEditor();