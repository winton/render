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
  expect.assertions(3)

  class MyComponent {
    render: typeof render = null

    init(id: string): void {
      expect(id).toBe("id")
    }

    build(id: string): Element {
      expect(id).toBe("id")
      return <div id={id} />
    }
  }

  const myComponent = new MyComponent()

  loaded.load({
    logger,
    myComponent,
    patch,
    render,
    ssr,
    tinyId,
    undom,
  })

  expect(myComponent.build("id")).toEqual(
    expect.any(Element)
  )
})
