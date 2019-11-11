import patch from "@fn2/patch"
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

  elements: Record<string, Element>
  ssrElements: Record<string, Element>

  private events: Record<string, boolean>

  private htmlProps = {
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

  loadedBy(event: LoadedEvent): void {
    const { by } = event

    if (by.build) {
      this.patch.create(
        by,
        "build",
        {
          beforeRender: this.beforeRender.bind(this),
          args: [event],
          order: -1,
        },
        { build: by.build.bind(by), order: 0 },
        {
          afterRender: this.afterRender.bind(this),
          args: [event],
        }
      )
    }

    if (by.force) {
      this.patch.create(
        by,
        "force",
        {
          beforeForce: this.beforeForce.bind(by),
          args: [event],
          order: -1,
        },
        { force: by.force.bind(by), order: 0 }
      )
    }
  }

  reset(): void {
    this.elements = {}
    this.ssrElements = {}
    this.events = {}
  }

  beforeRender(
    event: LoadedEvent,
    id: string,
    ...args: any[]
  ): Element {
    const { by } = event
    const ssrElement = document.getElementById(id)

    let element = this.elements[id]

    if (ssrElement) {
      this.ssrElements[id] = ssrElement
    }

    if (!element && by.init) {
      element = by.init(id, ssrElement, ...args)
    }

    if (element) {
      this.elements[id] = element
    }

    return element
  }

  afterRender(event: LoadedEvent, id: string): Element {
    const { by } = event
    const { memo } = this.patch.find(by.build)

    const element = memo.build as Element
    const ssrElement = this.ssrElements[id]

    if (element && ssrElement && element !== ssrElement) {
      ssrElement.parentNode.replaceChild(
        element,
        ssrElement
      )
    }

    this.elements[id] = element

    return element
  }

  beforeForce(
    event: LoadedEvent,
    id: string,
    ...args: any[]
  ): Element {
    const { by } = event

    delete this.elements[id]
    delete this.ssrElements[id]

    return by.build(id, ...args)
  }

  createElement(tagName): Element {
    const node =
      tagName.nodeType === 1
        ? tagName
        : document.createElement(tagName)

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
              document.addEventListener(
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
                : document.createTextNode(arg[k])
            )
          }
        } else {
          node.appendChild(
            arg.nodeType
              ? arg
              : document.createTextNode(arg)
          )
        }
      }
    }
    return node
  }
}

export default new Render()
