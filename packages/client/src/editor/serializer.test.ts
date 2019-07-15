import { conversationLink } from "./schema"
import serializer from "./serializer"

it("round-trips links", () => {
  const document = roundtrip(
    `<p><a href="http://somesite.com/">link text</a></p>`
  )
  const link = document.querySelector("p a")!
  expect(link).toBeTruthy()
  expect(link.getAttribute("href")).toBe("http://somesite.com/")
  expect(link.textContent).toBe("link text")
})

it("round-trips conversation links", () => {
  const document = roundtrip(
    `
    <p>
      <a
        href="mid:message%20ID"
        data-messageid="message ID"
        data-subject="Test thread 2019-07"
      >Test thread 2019-07</a>
    </p>
    `
  )
  const link = document.querySelector("p a")!
  expect(link).toBeTruthy()
  expect(link.attributes).toMatchObject({
    href: { value: "mid:message%20ID" },
    "data-messageid": { value: "message ID" },
    "data-subject": { value: "Test thread 2019-07" }
  })
})

it("deserializes conversation links", () => {
  const value = serializer.deserialize(
    `
      <p><a
        href="mid:message%20ID/content%20ID"
        data-messageid="message ID"
        data-subject="Test thread 2019-07"
      >Test thread 2019-07</a></p>
    `.trim()
  )
  expect(value.toJSON()).toMatchObject({
    document: {
      nodes: [
        {
          object: "block",
          type: "paragraph",
          nodes: [
            conversationLink({
              messageId: "message ID",
              subject: "Test thread 2019-07",
              nodes: [{ object: "text", text: "Test thread 2019-07" }]
            })
          ]
        }
      ]
    }
  })
})

function roundtrip(content: string): Element {
  const afterRoundtrip = serializer.serialize(serializer.deserialize(content))
  const newNode = document.createElement("div")
  newNode.innerHTML = afterRoundtrip
  return newNode
}
