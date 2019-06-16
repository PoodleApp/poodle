import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

configure({ adapter: new Adapter() })

// This is necessary because we import Electron using
// `window.require("electron")`
window.require = require
