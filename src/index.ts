import patch from "fn2/dist/cjs/patch"
import { LoadedEvent } from "@loaded/loaded"

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

  elements: Record<string, Element> = {}
  ssrElements: Record<string, Element> = {}

  private events: Record<string, boolean> = {}

  private htmlProps = {
    className: true,
    id: true,
    innerHTML: true,
    nodeValue: true,
    tabIndex: true,
    textContent: true,
    value: true,
  }

  loadedBy(event: LoadedEvent): void {
    const { by, byName } = event

    if (by.render) {
      this.patch.add(
        by,
        byName,
        "render",
        {
          beforeRender: this.beforeRender.bind(this),
          prependArg: event,
          order: -1,
        },
        { render: by.render.bind(by) },
        {
          afterRender: this.afterRender.bind(this),
          prependOutputArg: event,
          return: "afterRender",
        }
      )
    }

    if (by.force) {
      this.patch.add(
        by,
        byName,
        "force",
        {
          beforeForce: this.beforeForce.bind(by),
          order: -1,
          prependArg: event,
          prependArgOutput: true,
          return: "beforeForce",
        },
        { force: by.force.bind(by) }
      )
    }
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

  afterRender(
    output: Record<string, any>,
    id: string
  ): Element {
    const element = output.render as Element
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

    return by.render(id, ...args)
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
