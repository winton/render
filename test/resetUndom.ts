import undom from "undom"
import getElementById from "./getElementById"

export default function resetUndom(): void {
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
