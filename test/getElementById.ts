export default function getElementById(
  el: Element,
  id: string
): Element {
  if (el.id && el.id === id) {
    return el
  }
  for (let i = 0; i < el.childNodes.length; i++) {
    const found = getElementById(el[i], id)

    if (found) {
      return found
    }
  }
}
