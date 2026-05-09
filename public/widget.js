;(function () {
  /**
   * Chatbotz embed widget (iframe-based).
   *
   * Usage:
   * <script async src="https://YOUR_DOMAIN/widget.js" data-chatbotz-bot="BOT_ID"></script>
   */

  function getActiveScript() {
    // Prefer currentScript, fallback to last script whose src ends with widget.js
    var s = document.currentScript
    if (s) return s
    var scripts = document.getElementsByTagName('script')
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute('src') || ''
      if (src.indexOf('widget.js') !== -1) return scripts[i]
    }
    return null
  }

  var script = getActiveScript()
  if (!script) return

  var botId = script.getAttribute('data-chatbotz-bot')
  if (!botId) {
    console.warn('[Chatbotz] Missing data-chatbotz-bot attribute')
    return
  }

  var origin = (script.getAttribute('data-chatbotz-origin') || '').trim() || (function () {
    try {
      return new URL(script.src).origin
    } catch {
      return window.location.origin
    }
  })()

  var position = (script.getAttribute('data-chatbotz-position') || 'bottom-right').toLowerCase()
  var offset = script.getAttribute('data-chatbotz-offset') || '20px'

  var containerId = 'chatbotz-embed-' + botId
  if (document.getElementById(containerId)) return

  var container = document.createElement('div')
  container.id = containerId
  container.style.position = 'fixed'
  container.style.zIndex = '2147483647'
  container.style.width = '380px'
  container.style.maxWidth = '92vw'

  var isBottom = position.indexOf('bottom') !== -1
  var isRight = position.indexOf('right') !== -1
  container.style[isBottom ? 'bottom' : 'top'] = offset
  container.style[isRight ? 'right' : 'left'] = offset

  var toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.setAttribute('aria-label', 'Open Chatbotz')
  toggle.style.width = '56px'
  toggle.style.height = '56px'
  toggle.style.borderRadius = '16px'
  toggle.style.border = '1px solid rgba(255,255,255,0.12)'
  toggle.style.background = 'linear-gradient(135deg, #6c63ff, #00d4ff)'
  toggle.style.color = 'white'
  toggle.style.cursor = 'pointer'
  toggle.style.boxShadow = '0 18px 50px rgba(0,0,0,0.45)'
  toggle.style.display = 'flex'
  toggle.style.alignItems = 'center'
  toggle.style.justifyContent = 'center'
  toggle.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
  toggle.style.fontSize = '22px'
  toggle.textContent = '💬'

  var frameWrap = document.createElement('div')
  frameWrap.style.width = '100%'
  frameWrap.style.height = '0'
  frameWrap.style.overflow = 'hidden'
  frameWrap.style.transition = 'height 180ms ease'

  var iframe = document.createElement('iframe')
  iframe.src = origin.replace(/\/$/, '') + '/embed/' + encodeURIComponent(botId) + '?embed=1'
  iframe.title = 'Chatbotz'
  iframe.style.width = '100%'
  iframe.style.height = '560px'
  iframe.style.border = '0'
  iframe.style.borderRadius = '20px'
  iframe.style.overflow = 'hidden'
  iframe.style.background = 'transparent'
  iframe.setAttribute('allow', 'clipboard-write')
  iframe.loading = 'lazy'

  frameWrap.appendChild(iframe)

  var open = false
  function setOpen(next) {
    open = next
    frameWrap.style.height = open ? '560px' : '0'
    toggle.textContent = open ? '×' : '💬'
    toggle.setAttribute('aria-label', open ? 'Close Chatbotz' : 'Open Chatbotz')
    toggle.style.fontSize = open ? '26px' : '22px'
  }

  toggle.addEventListener('click', function () {
    setOpen(!open)
  })

  container.appendChild(frameWrap)
  container.appendChild(toggle)

  // Layout: button slightly below frame when open
  container.style.display = 'flex'
  container.style.flexDirection = isBottom ? 'column' : 'column-reverse'
  container.style.alignItems = isRight ? 'flex-end' : 'flex-start'
  container.style.gap = '10px'

  document.body.appendChild(container)
})()
