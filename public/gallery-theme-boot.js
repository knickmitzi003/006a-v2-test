(function () {
  try {
    var el = document.getElementById('__NEXT_DATA__')
    if (!el) return
    var pageProps = JSON.parse(el.textContent).props.pageProps || {}
    var isGallery = pageProps.activeTheme === 'gallery'

    if (!isGallery) {
      document.cookie = 'active_theme=;path=/;max-age=0;SameSite=Lax'
      return
    }

    var href = '/themes/gallery/favicon-32.png?v=5'
    document
      .querySelectorAll("link[rel='icon'], link[rel='shortcut icon']")
      .forEach(function (node) {
        node.parentNode && node.parentNode.removeChild(node)
      })

    ;['icon', 'shortcut icon'].forEach(function (rel) {
      var link = document.createElement('link')
      link.rel = rel
      link.type = 'image/png'
      link.href = href
      document.head.appendChild(link)
    })
  } catch (e) {
    /* ignore */
  }
})()
