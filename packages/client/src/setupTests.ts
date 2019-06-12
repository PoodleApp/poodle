import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

configure({ adapter: new Adapter() })

// Mock calls to `window.require`
window.require = require
// window.require = mod => {
//   if (mod !== "electron") {
//     throw new Error("unexpected require")
//   }
//   return {
//     shell: jest.fn()
//   }
// }
