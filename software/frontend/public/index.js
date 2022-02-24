class $590ce656a7d9e99b$export$41026bc5091240de {
    constructor(elem, options = {
    }){
        this.elem = elem;
        this.sendPath = options.sendTo;
        this.sendInt = options.sendInterval > 50 ? options.sendInterval : 50;
        this.debug = options.debug == true;
        this.enabled = false;
        this.initialized = false;
        this.prevX = 0; // prev values used to indicate the set of xy that is processed and sent to server
        this.prevY = 0;
        this.currX = 0;
        this.currY = 0;
        this.lastDispatch = 0;
        this.cbs = {
            tStart: this.handleTouch.bind(this),
            tMove: this.handleMove.bind(this),
            tEnd: this.handleRelease.bind(this)
        };
    }
    enable() {
        if (!this.initialized) return;
        this.enabled = true;
        this.elem.classList.remove('disabled');
    }
    disable() {
        this.enabled = false;
        this.elem.classList.add('disabled');
    }
    init() {
        if (this.initialized) return;
        this.elem.addEventListener('touchstart', this.cbs.tStart);
        this.elem.addEventListener('touchmove', this.cbs.tMove);
        this.elem.addEventListener('touchend', this.cbs.tEnd);
        this.initialized = true;
        this.stateCheckLoop();
        this.enable();
    }
    disconnect() {
        if (this.initialized) {
            this.elem.removeEventListener('touchstart', this.cbs.tStart);
            this.elem.removeEventListener('touchmove', this.cbs.tMove);
            this.elem.removeEventListener('touchend', this.cbs.tEnd);
        }
        this.initialized = false;
        this.disable();
    }
    handleTouch(e) {
        e.preventDefault();
        if (!this.enabled) return;
        let touch = e.touches[0] || e.changedTouches[0];
        let domRect = this.elem.getBoundingClientRect();
        this.updatePositionData(touch.clientX - domRect.left - this.elem.offsetWidth / 2, touch.clientY - domRect.top - this.elem.offsetWidth / 2);
        this.elem.classList.remove('released');
        this.repositionStick();
        this.dispatchState();
    }
    handleMove(e) {
        e.preventDefault();
        if (!this.enabled) return;
        let touch = e.touches[0] || e.changedTouches[0];
        let domRect = this.elem.getBoundingClientRect();
        this.updatePositionData(touch.clientX - domRect.left - this.elem.offsetWidth / 2, touch.clientY - domRect.top - this.elem.offsetWidth / 2);
        this.repositionStick();
    }
    handleRelease(e) {
        e.preventDefault();
        if (!this.enabled) return;
        this.updatePositionData(0, 0);
        this.elem.classList.add('released');
        this.repositionStick();
        this.dispatchState();
    }
    updatePositionData(x = 0, y = 0) {
        if (x != this.currX) this.currX = x;
        if (y != this.currY) this.currY = y;
    }
    repositionStick() {
        let stick = this.elem.children[0];
        if (!stick) return;
        let rad = Math.atan2(this.currY, this.currX);
        let mag = Math.hypot(this.currX, this.currY);
        if (mag > this.elem.offsetWidth / 2) {
            stick.style.left = (this.elem.offsetWidth * (Math.cos(rad) + 1) - stick.offsetWidth) / 2 + 'px';
            stick.style.top = (this.elem.offsetWidth * (Math.sin(rad) + 1) - stick.offsetHeight) / 2 + 'px';
        } else {
            stick.style.left = this.currX + (this.elem.offsetWidth - stick.offsetWidth) / 2 + 'px';
            stick.style.top = this.currY + (this.elem.offsetWidth - stick.offsetHeight) / 2 + 'px';
        }
    }
    processPositionData() {
        this.prevX = this.currX;
        this.prevY = this.currY;
        let px, py, rad, mag;
        rad = Math.atan2(this.currY, this.currX);
        mag = Math.hypot(this.currX, this.currY);
        if (mag > this.elem.offsetWidth / 2) {
            px = Math.round(this.currX / mag * 100);
            py = Math.round(this.currY / mag * 100);
        } else {
            px = Math.round(this.currX * 2 / this.elem.offsetWidth * 100);
            py = Math.round(this.currY * 2 / this.elem.offsetWidth * 100);
        }
        return {
            x: px,
            y: py
        };
    }
    dispatchState(ignoreLastDispatch = false) {
        if (this.prevX != this.currX || this.prevY != this.currY) {
            let now = Date.now();
            if (ignoreLastDispatch || now > this.lastDispatch + this.sendInt) {
                this.lastDispatch = now;
                let pCoords = this.processPositionData();
                let uri;
                if (this.sendPath) {
                    uri = `${this.sendPath}?x=${pCoords.x}&y=${pCoords.y}`;
                    fetch(uri, {
                        method: 'POST'
                    });
                }
                if (this.debug) {
                    if (uri) console.log(`[ID: '${this.elem.id}']: StickChange (POST '${uri}')`);
                    else console.log(`[ID: '${this.elem.id}']: StickChange (x: ${pCoords.x}, y: ${pCoords.y})`);
                }
            }
        }
    }
    stateCheckLoop() {
        if (!this.initialized) return;
        this.dispatchState(true);
        setTimeout(this.stateCheckLoop.bind(this), this.sendInt);
    }
}


let $31061dbdc1b1f585$var$joystick = new $590ce656a7d9e99b$export$41026bc5091240de(document.getElementById('joy-1'), {
    sendTo: '/integration/test1',
    sendInterval: 200,
    debug: true
});
$31061dbdc1b1f585$var$joystick.init();


//# sourceMappingURL=index.js.map
