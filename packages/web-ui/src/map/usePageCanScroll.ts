import { useEffect, useState } from 'react'

/** App shell scrollport — set on PanelShell `<main>`. */
const PAGE_SCROLL_SELECTOR = '[data-page-scroll]'

export function usePageCanScroll(): boolean {
  const [pageCanScroll, setPageCanScroll] = useState(false)

  useEffect(function observePageScrollability() {
    function updatePageCanScroll() {
      setPageCanScroll(canPageScrollVertically())
    }

    updatePageCanScroll()

    const resizeObserver = new ResizeObserver(updatePageCanScroll)
    const mutationObserver = new MutationObserver(function onScrollportChildren() {
      observeScrollports(resizeObserver)
      updatePageCanScroll()
    })

    observeScrollports(resizeObserver)

    for (const scrollport of getPageScrollports()) {
      // childList only — deep Leaflet tile mutations must not thrash this.
      mutationObserver.observe(scrollport, { childList: true })
    }

    const visualViewport = window.visualViewport
    visualViewport?.addEventListener('resize', updatePageCanScroll)
    window.addEventListener('resize', updatePageCanScroll)
    window.addEventListener('orientationchange', updatePageCanScroll)

    return function cleanupPageScrollability() {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      visualViewport?.removeEventListener('resize', updatePageCanScroll)
      window.removeEventListener('resize', updatePageCanScroll)
      window.removeEventListener('orientationchange', updatePageCanScroll)
    }
  }, [])

  return pageCanScroll
}

function canPageScrollVertically(): boolean {
  return getPageScrollports().some(canScrollVertically)
}

function getPageScrollports(): HTMLElement[] {
  const ports: HTMLElement[] = []
  const seen = new Set<HTMLElement>()

  function add(element: Element | null | undefined) {
    if (!(element instanceof HTMLElement) || seen.has(element)) {
      return
    }
    seen.add(element)
    ports.push(element)
  }

  add(document.querySelector(PAGE_SCROLL_SELECTOR))
  add(document.scrollingElement)
  add(document.documentElement)
  add(document.body)

  return ports
}

function observeScrollports(observer: ResizeObserver) {
  observer.disconnect()

  for (const scrollport of getPageScrollports()) {
    observer.observe(scrollport)
    // scrollHeight can change when children resize without the scrollport box resizing
    for (const child of scrollport.children) {
      if (child instanceof Element) {
        observer.observe(child)
      }
    }
  }
}

/**
 * CSSOM View metrics work in browsers, mobile Safari, and installed PWAs.
 * `visualViewport` covers dynamic browser chrome on phones.
 */
function canScrollVertically(element: HTMLElement): boolean {
  const contentOverflows = element.scrollHeight - element.clientHeight > 1

  if (isDocumentRoot(element)) {
    if (contentOverflows) {
      return true
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    return element.scrollHeight > viewportHeight + 1
  }

  if (!contentOverflows) {
    return false
  }

  const { overflowY } = getComputedStyle(element)
  return (
    overflowY === 'auto' ||
    overflowY === 'scroll' ||
    overflowY === 'overlay'
  )
}

function isDocumentRoot(element: HTMLElement): boolean {
  return (
    element === document.scrollingElement ||
    element === document.documentElement ||
    element === document.body
  )
}
