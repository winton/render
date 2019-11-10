/** @jsx render.createElement */

import patch from "@fn2/patch"
import load from "@fn2/loaded"
import logger from "@fn2/logger"
import tinyId from "@fn2/tiny-id"
import undom from "undom"

import expect from "./expect"
import render, { resetUndom } from "../src"

beforeEach(() => resetUndom(undom))

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

  load({ logger, myComponent, patch, render, tinyId })

  expect(myComponent.build("id")).toEqual(
    expect.any(Element)
  )
})
