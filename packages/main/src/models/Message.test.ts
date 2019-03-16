import { contentParts } from "./Message"
import { testThread } from "../cache/testFixtures"

const testMessage = testThread[0]

it("gets content parts from a message", () => {
  expect(contentParts(testMessage.attributes.struct!).toArray()).toEqual([
    {
      description: null,
      disposition: null,
      encoding: "7BIT",
      id: "htmlContent",
      language: null,
      lines: 1,
      md5: null,
      partID: "4",
      subtype: "html",
      type: "text",
      size: 8,
      params: { charset: "UTF-8" }
    }
  ])
})
