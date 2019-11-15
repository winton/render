/** @jsx render.createElement */

import patch from "@fn2/patch"
import loaded from "@fn2/loaded"
import logger from "@fn2/logger"
import ssr from "@fn2/ssr"
import tinyId from "@fn2/tiny-id"
import undom from "undom"

import expect from "./expect"
import render from "../src"

beforeEach(() => loaded.reset())

it("renders", () => {
  class MyComponent {
    render: typeof render = null

    id = "myComponent"
    cache: Element

    element(): Element {
      return this.cache || <div id={this.id} />
    }
  }

  const myComponent = new MyComponent()

  loaded.load({
    dom: undom(),
    logger,
    myComponent,
    patch,
    render,
    ssr,
    tinyId,
  })

  const ssrEl = <div id="myComponent" />
  render.doc.body.appendChild(ssrEl)

  const el = myComponent.element()
  const getEl = render.doc.getElementById(el.id)

  expect(el).toEqual(expect.any(Element))
  expect(el.id).toBe("myComponent")

  expect(el).toBe(getEl)
  expect(el).not.toBe(ssrEl)

  const el2 = myComponent.element()
  expect(el).toBe(el2)
})
