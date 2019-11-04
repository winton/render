/** @jsx renderLib.createElement */

import Fn2 from "fn2"
import patch from "fn2/dist/cjs/patch"
import load from "@loaded/loaded"

import expect from "./expect"
import renderLib from "../src"
import resetUndom from "./resetUndom"

beforeEach(() => resetUndom())

it("renders", () => {
  class MyComponent {
    renderLib: typeof renderLib = null

    init(lid: string[]): void {
      expect(1).toBe(1)
    }

    render(id: string): Element {
      expect(1).toBe(1)
      return <div id={id} />
    }
  }

  const myComponent = new MyComponent()

  load({ Fn2, patch, renderLib })
  load({ myComponent })
  expect(myComponent.render("id")).toEqual(
    expect.any(Element)
  )
})
