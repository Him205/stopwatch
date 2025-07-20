class Stopwatch {
    constructor() {
        this.time = 0;
        this.isRunning = false;
        this.lapTimes = [];
        this.intervalId = null;
        this.startTime = 0;
        this.lastLapTime = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapTimesSection = document.getElementById('lapTimesSection');
        this.lapCount = document.getElementById('lapCount');
        this.statsSection = document.getElementById('statsSection');
        this.bestLapText = document.getElementById('bestLapText');
        this.worstLapText = document.getElementById('worstLapText');
        this.lapList = document.getElementById('lapList');
    }
    
    bindEvents() {
        this.startStopBtn.addEventListener('click', () => this.handleStartStop());
        this.lapBtn.addEventListener('click', () => this.handleLap());
        this.resetBtn.addEventListener('click', () => this.handleReset());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.handleStartStop();
                    break;
                case 'KeyR':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.handleReset();
                    }
                    break;
                case 'KeyL':
                    if (this.isRunning) {
                        this.handleLap();
                    }
                    break;
            }
        });
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.timeDisplay.textContent = this.formatTime(this.time);
        
        if (this.isRunning) {
            this.timeDisplay.classList.add('running');
        } else {
            this.timeDisplay.classList.remove('running');
        }
    }
    
    updateButton() {
        if (this.isRunning) {
            this.startStopBtn.innerHTML = `
                <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause
            `;
            this.startStopBtn.classList.add('pause');
            this.lapBtn.disabled = false;
        } else {
            this.startStopBtn.innerHTML = `
                <svg class="btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5,3 19,12 5,21"/>
                </svg>
                Start
            `;
            this.startStopBtn.classList.remove('pause');
            this.lapBtn.disabled = true;
        }
    }
    
    handleStartStop() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        this.startTime = Date.now() - this.time;
        
        this.intervalId = setInterval(() => {
            this.time = Date.now() - this.startTime;
            this.updateDisplay();
        }, 10);
        
        this.updateButton();
    }
    
    stop() {
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateButton();
        this.updateDisplay();
    }
    
    handleReset() {
        this.stop();
        this.time = 0;
        this.lapTimes = [];
        this.lastLapTime = 0;
        
        this.updateDisplay();
        this.updateLapDisplay();
        this.lapTimesSection.style.display = 'none';
    }
    
    handleLap() {
        if (!this.isRunning) return;
        
        const currentLapTime = this.time - this.lastLapTime;
        const newLap = {
            id: this.lapTimes.length + 1,
            time: this.time,
            lapTime: currentLapTime,
            timestamp: new Date()
        };
        
        this.lapTimes.push(newLap);
        this.lastLapTime = this.time;
        
        this.updateLapDisplay();
        this.lapTimesSection.style.display = 'block';
    }
    
    updateLapDisplay() {
        if (this.lapTimes.length === 0) {
            this.lapTimesSection.style.display = 'none';
            return;
        }
        
        // Update lap count
        this.lapCount.textContent = `Total: ${this.lapTimes.length} lap${this.lapTimes.length !== 1 ? 's' : ''}`;
        
        // Update statistics
        if (this.lapTimes.length > 1) {
            const bestLap = this.getBestLap();
            const worstLap = this.getWorstLap();
            
            this.bestLapText.textContent = `Lap ${bestLap.id}: ${this.formatTime(bestLap.lapTime)}`;
            this.worstLapText.textContent = `Lap ${worstLap.id}: ${this.formatTime(worstLap.lapTime)}`;
            this.statsSection.style.display = 'grid';
        } else {
            this.statsSection.style.display = 'none';
        }
        
        // Update lap list
        this.updateLapList();
    }
    
    updateLapList() {
        const bestLap = this.getBestLap();
        const worstLap = this.getWorstLap();
        
        this.lapList.innerHTML = '';
        
        this.lapTimes.forEach((lap, index) => {
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            
            // Add special classes for best/worst laps
            if (lap.id === bestLap?.id) {
                lapItem.classList.add('best');
            } else if (lap.id === worstLap?.id && this.lapTimes.length > 1) {
                lapItem.classList.add('worst');
            }
            
            lapItem.innerHTML = `
                <div class="lap-info">
                    <div class="lap-number">${lap.id}</div>
                    <div class="lap-times">
                        <div class="lap-time">${this.formatTime(lap.lapTime)}</div>
                        <div class="total-time">Total: ${this.formatTime(lap.time)}</div>
                    </div>
                </div>
                <div class="lap-meta">
                    ${lap.id === bestLap?.id ? '<div class="lap-badge best">BEST</div>' : ''}
                    ${lap.id === worstLap?.id && this.lapTimes.length > 1 ? '<div class="lap-badge worst">SLOWEST</div>' : ''}
                    <div class="lap-timestamp">${lap.timestamp.toLocaleTimeString()}</div>
                </div>
            `;
            
            this.lapList.appendChild(lapItem);
        });
    }
    
    getBestLap() {
        if (this.lapTimes.length === 0) return null;
        return this.lapTimes.reduce((best, current) => 
            current.lapTime < best.lapTime ? current : best
        );
    }
    
    getWorstLap() {
        if (this.lapTimes.length === 0) return null;
        return this.lapTimes.reduce((worst, current) => 
            current.lapTime > worst.lapTime ? current : worst
        );
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});