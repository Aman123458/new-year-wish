// Shared interactions: confetti generator + countdown
(function(){
  function rand(a,b){return Math.random()*(b-a)+a}

  // Confetti: create many small colored divs and animate them with CSS transforms
  function startConfetti(){
    const colors=['#ff6b81','#ffd166','#6be7ff','#b28bff','#ff9db4']
    const count=40
    for(let i=0;i<count;i++){
      const el=document.createElement('div')
      el.className='confetti'
      el.style.left=rand(0,100)+'%'
      el.style.background=colors[Math.floor(rand(0,colors.length))]
      el.style.width=rand(6,10)+'px'
      el.style.height=rand(8,14)+'px'
      el.style.transform='translateY(-10vh) rotate('+rand(0,360)+'deg)'
      el.style.opacity=1
      el.style.transition='transform 3s linear, top 3s linear, opacity 1.2s ease'
      document.body.appendChild(el)
      // trigger fall
      setTimeout(()=>{
        const x=rand(-25,25)
        const y=rand(90,140)
        el.style.transform='translate('+x+'vw,'+y+'vh) rotate('+rand(180,720)+'deg)'
        el.style.opacity=0
      }, rand(50,400))
      // cleanup
      setTimeout(()=>el.remove(), 4200)
    }
  }

  // Countdown to 2026-01-01 local time
  function initCountdown(){
    const el=document.getElementById('countdown')
    if(!el) return
    function update(){
      const now=new Date()
      const target=new Date(now.getFullYear()>=2026? '2026-01-01T00:00:00' : '2026-01-01T00:00:00')
      const diff=target - now
      if(diff<=0){
        el.textContent='HAPPY 2026! 🎉'
        startConfetti()
        return
      }
      const s=Math.floor(diff/1000)%60
      const m=Math.floor(diff/60000)%60
      const h=Math.floor(diff/3600000)%24
      const d=Math.floor(diff/86400000)
      el.textContent = `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
    }
    update(); setInterval(update,500)
  }

  // Start small confetti on pages with .center
  document.addEventListener('DOMContentLoaded',()=>{
    try{ if(document.querySelector('.center')) startConfetti() }catch(e){}
    initCountdown()
  })

  // Expose for consoles/tests
  window._NY_startConfetti = startConfetti
})();

// Music placeholder: simple WebAudio tone + gentle modulation
(function(){
  let audioCtx = null
  let nodes = null
  let playing = false

  function createMusic(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtx
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'
    osc1.frequency.value = 220
    osc2.frequency.value = 440
    gain.gain.value = 0.0001

    lfo.frequency.value = 0.18
    lfoGain.gain.value = 30
    lfo.connect(lfoGain)
    lfoGain.connect(osc1.frequency)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start()
    osc2.start()
    lfo.start()

    nodes = {ctx, osc1, osc2, gain, lfo, lfoGain}
  }

  function startMusic(){
    if(playing) return
    createMusic()
    const {ctx,gain} = nodes
    // fade in
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.8)
    playing = true
    updateButtons(true)
  }

  function stopMusic(){
    if(!playing || !nodes) return
    const {ctx,gain,osc1,osc2,lfo} = nodes
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2)
    setTimeout(()=>{
      try{ osc1.stop(); osc2.stop(); lfo.stop(); }catch(e){}
      try{ ctx.close() }catch(e){}
      nodes = null
      audioCtx = null
      playing = false
      updateButtons(false)
    }, 1400)
  }

  function toggleMusic(){
    if(playing) stopMusic(); else startMusic();
  }

  function updateButtons(state){
    const els = document.querySelectorAll('.music-btn')
    els.forEach(el=>{
      el.textContent = state ? 'Stop Music' : 'Play Music'
    })
  }

  window._NY_toggleMusic = toggleMusic
  window._NY_musicPlaying = ()=>playing
})();

