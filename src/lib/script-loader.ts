// Load external script dynamically
export function loadScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement
    if (existingScript) {
      if (existingScript.dataset.loaded) {
        resolve(existingScript)
      } else {
        existingScript.addEventListener('load', () => resolve(existingScript))
        existingScript.addEventListener('error', reject)
      }
      return
    }

    // Create new script element
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.loaded = 'true'

    script.onload = () => resolve(script)
    script.onerror = reject

    document.head.appendChild(script)
  })
}
