import undomType from "undom"
import getElementById from "./getElementById"

export default function resetUndom(
  undom: typeof undomType
): void {
  global["window"] = undom().defaultView

  for (const i in global["window"]) {
    global[i] = global["window"][i]
  }

  global["document"]["getElementById"] = (
    id: string
  ): Element => {
    return getElementById(document.body, id)
  }
}
