
(function(root, undefined) {
    'use strict';

    /**
     * Represents a single slide-CAPTCHA instance.
     * @param captcha - Represents the outer element of the markup
     * @param callback - What to call when the SlideCAPTCHA is satisfied
     * @constructor
     */
    var SlideCAPTCHA = function(captcha, callback) {
        this.captcha = captcha;
        this.callback = callback || undefined;
        this.handle = this.captcha.querySelector('div');
        this.dragState = undefined;
        this.dimensions = {};

        this.handlers = {
            setDimensions: this.setDimensions.bind(this),
            dragStart: this.dragStartHandler.bind(this),
            dragMove: this.dragMoveHandler.bind(this),
            dragEnd: this.dragEndHandler.bind(this)
        };

        this.handle.addEventListener("mousedown", this.handlers.dragStart);
        this.handle.addEventListener("mousemove", this.handlers.dragMove);
        this.handle.addEventListener("mouseup", this.handlers.dragEnd);
        this.handle.addEventListener('touchstart', this.handlers.dragStart);
        this.handle.addEventListener('touchmove', this.handlers.dragMove);
        this.handle.addEventListener('touchend', this.handlers.dragEnd);
        root.addEventListener('resize', this.handlers.setDimensions);
        this.setDimensions();
    };

    SlideCAPTCHA.prototype = {
        setDimensions: function() {
            var bb = this.captcha.getBoundingClientRect();
            this.dimensions = {
                width: bb.width,
                height: bb.height
            };
        },

        dragStartHandler: function(evt) {
            evt.preventDefault();
            this.dragState = evt.screenX || evt.touches[0].pageX;
            this.handle.classList.add('active');
            this.handle.addEventListener("mouseout", this.handlers.dragEnd);
            this.handle.addEventListener("touchleave", this.handlers.dragEnd);
        },

        dragEndHandler: function(evt) {
            evt.preventDefault();
            if (this.dragState) {
                this.dragState = undefined;
                this.handle.classList.remove('active');
            }
            this.handle.removeAttribute('style');
            this.handle.removeEventListener('mouseout', this.handlers.dragEnd);
            this.handle.removeEventListener('touchleave', this.handlers.dragEnd);
        },

        dragMoveHandler: function(evt) {
            var delta, start, distance;

            if (this.dragState) {
                evt.preventDefault();
                start = this.dimensions.height;
                distance = this.dimensions.width;
                delta = (evt.screenX || evt.touches[0].pageX) - this.dragState;
                delta = Math.min(distance, Math.max(0, delta));
                if (delta >= distance - start) {
                    // We did it!
                    this.handle.removeEventListener("mouseout", this.handlers.dragEnd);
                    this.handle.removeEventListener("mousedown", this.handlers.dragStart);
                    this.handle.removeEventListener("mousemove", this.handlers.dragMove);
                    this.handle.removeEventListener("mouseup", this.handlers.dragEnd);
                    this.handle.removeEventListener('touchstart', this.handlers.dragStart);
                    this.handle.removeEventListener('touchmove', this.handlers.dragMove);
                    this.handle.removeEventListener('touchend', this.handlers.dragEnd);
                    this.captcha.classList.add('satisfied');
                    this.handle.classList.remove('active');
                    this.handle.setAttribute('style', 'right: 0;left: auto;');
                    this.dragState = undefined;
                    if (this.callback) {
                        this.callback.call(document, this.captcha);
                    }
                    return;
                }
                this.handle.setAttribute("style", "left:" + (delta + start) + "px;");
            }
        }
    };

    // Factory: Instantiates all the SlideCAPTCHAs specified by the selector
    window.slideCAPTCHA = function(selector, opts, callback){
        Array.prototype.forEach.call(document.querySelectorAll(selector), function(captcha){
            new SlideCAPTCHA(captcha, opts, callback);
        });
    }
}(window));

window.slideCAPTCHA('.captcha', function(captcha){});
