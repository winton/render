import patch from "@fn2/patch"
import ssr from "@fn2/ssr"

import { LoadedEvent } from "@fn2/loaded"

declare global {
  // eslint-disable-next-line
  namespace JSX {
    interface IntrinsicElements {
      [prop: string]: any
    }
  }
}

export class Render {
  patch: typeof patch = null
  ssr: typeof ssr = null

  doc: Document
  events: Record<string, boolean>

  htmlProps = {
    className: true,
    id: true,
    innerHTML: true,
    nodeValue: true,
    tabIndex: true,
    textContent: true,
    value: true,
  }

  constructor() {
    this.reset()
  }

  reset(): void {
    this.events = {}
  }

  loaded(): void {
    if (this.ssr) {
      this.doc = this.ssr.dom.document
    } else {
      this.doc = document
    }
  }

  loadedBy(event: LoadedEvent): void {
    const { by } = event

    if (by.element) {
      this.patch.create(
        by,
        "element",
        {
          element: by.element.bind(by),
          order: -1,
        },
        {
          afterElement: this.afterElement.bind(this),
          args: [event],
          order: 0,
        }
      )
    }
  }

  afterElement(event: LoadedEvent): Element {
    const { by } = event
    const { memo } = this.patch.find(by.element)
    const element = memo.element as Element

    if (element && by.cache !== element) {
      by.cache = element

      if (by.id) {
        const docEl = this.doc.getElementById(by.id)

        if (docEl) {
          docEl.parentNode.replaceChild(element, docEl)
        }
      }
    }

    return by.cache
  }

  createElement(tagName): Element {
    const node =
      tagName.nodeType === 1
        ? tagName
        : this.doc.createElement(tagName)

    for (let i = 1; i < arguments.length; ++i) {
      // eslint-disable-next-line
      const arg = arguments[i]
      if (!arg) {
        continue
      }
      if (!arg.constructor || arg.constructor === Object) {
        for (
          let j = 0, ks = Object.keys(arg);
          j < ks.length;
          ++j
        ) {
          const key = ks[j],
            val = arg[key]
          if (key === "style") {
            node.style.cssText = val
          } else if (
            typeof val !== "string" ||
            this.htmlProps[key]
          ) {
            node[key] = val
            //set synthetic events for onUpperCaseName
            if (
              key[0] === "o" &&
              key[1] === "n" &&
              key.charCodeAt(2) < 91 &&
              key.charCodeAt(2) > 64 &&
              !this.events[key]
            ) {
              this.doc.addEventListener(
                key.slice(2).toLowerCase(),
                function(e): any {
                  let tgt: any = e.target
                  do {
                    if (tgt[key]) {
                      return tgt[key](e)
                    }
                  } while ((tgt = tgt.parentNode))
                }
              )
              this.events[key] = true
            }
          } else {
            node.setAttribute(key, val)
          }
        }
      } else {
        if (Array.isArray(arg)) {
          for (let k = 0; k < arg.length; ++k) {
            node.appendChild(
              arg[k].nodeType
                ? arg[k]
                : this.doc.createTextNode(arg[k])
            )
          }
        } else {
          node.appendChild(
            arg.nodeType
              ? arg
              : this.doc.createTextNode(arg)
          )
        }
      }
    }
    return node
  }
}

export default new Render()
