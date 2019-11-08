/** @jsx render.createElement */

import fn2 from "fn2"
import patch from "@fn2/patch"
import load from "@fn2/loaded"
import tinyId from "@fn2/tiny-id"

import expect from "./expect"
import render from "../src"
import resetUndom from "./resetUndom"

beforeEach(() => resetUndom())

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

  load(fn2, { fn2, myComponent, patch, render, tinyId })

  expect(myComponent.build("id")).toEqual(
    expect.any(Element)
  )
})
