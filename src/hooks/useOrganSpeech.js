function getWomanVoice() {
  const voices = window.speechSynthesis.getVoices()

  // Prefer these in order
  const preferred = [
    'Google UK English Female',
    'Google US English Female',
    'Microsoft Zira - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Samantha',
    'Karen',
    'Moira',
    'Tessa',
  ]

  for (const name of preferred) {
    const match = voices.find((v) => v.name === name)
    if (match) return match
  }

  // Fallback: any female English voice
  return (
    voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  )
}

function speak(text) {
  if (!text || !window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang   = 'en-US'
  utterance.rate   = 0.92
  utterance.pitch  = 1.1
  utterance.volume = 1.0

  // Voices may not be loaded yet — wait if needed
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    const voice = getWomanVoice()
    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      const voice = getWomanVoice()
      if (voice) utterance.voice = voice
      window.speechSynthesis.speak(utterance)
    }
  }
}

export function speakOrgan(organ) {
  if (!organ) return
  speak(`${organ.name}. ${organ.description}`)
}

export function speakSystem(system) {
  if (!system) return
  speak(`${system.name}. ${system.description}`)
}