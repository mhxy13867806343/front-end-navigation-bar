/* =========================================================================
   Retro Web Games - Shared Audio Synthesizer & Control Helper
   Shared by 1942.html, doraemon.html, goldsun.html
   ========================================================================= */

(function (global) {
  "use strict";

  let audioCtx = null;
  let isMuted = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, gainVal = 0.1) {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore autoplay error
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
  }

  function setMute(muted) {
    isMuted = !!muted;
    return isMuted;
  }

  function isAudioMuted() {
    return isMuted;
  }

  global.RetroGameAudio = {
    getAudioContext,
    playTone,
    toggleMute,
    setMute,
    isAudioMuted
  };
})(window);
