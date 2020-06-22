import { Editor, Element, Node, Text } from "slate"

export enum ElementType {
  ConversationLink = "conversationLink",
  Paragraph = "paragraph"
}

export interface ConversationLink {
  type: ElementType.ConversationLink
  children: Node[]
  messageId: string
  subject: string
}

// export const schema: SchemaProperties = {
//   document: {
//     nodes: [
//       {
//         match: [{ type: "paragraph" }, { type: "image" }]
//       }
//     ]
//   },
//   blocks: {
//     paragraph: {
//       nodes: [
//         {
//           match: [
//             { object: "text" },
//             { type: "link" },
//             { type: CONVERSATION_LINK }
//           ]
//         }
//       ]
//     },
//     image: {
//       isVoid: true,
//       data: {
//         src: v => v && isUrl(v)
//       }
//     }
//   },
//   inlines: {
//     link: {
//       data: {
//         href: v => v && isUrl(v)
//       },
//       nodes: [{ match: [{ object: "text" }] }]
//     },
//     [ElementType.ConversationLink]: {
//       // Mark links as void nodes so that users can't edit the text of the node.
//       isVoid: true
//     }
//   }
// }

// export const editorExtenions: Partial<Editor> = {
//   isInline(el: Element): boolean {
//     return [ElementType.ConversationLink].includes(el.type)
//   },

//   isVoid(el: Element): boolean {
//     return [ElementType.ConversationLink].includes(el.type)
//   }
// }

export function conversationLink({
  messageId,
  subject
}: {
  messageId: string
  subject: string
}): ConversationLink {
  const children: Text[] = [{ text: subject }]
  return {
    type: ElementType.ConversationLink,
    messageId,
    subject,
    children
  }
}

// export function conversationLink({
//   messageId,
//   subject,
//   nodes
// }: {
//   messageId: string
//   subject: string
//   nodes: Node[]
// }) {
//   return {
//     data: {
//       messageId,
//       subject
//     },
//     nodes,
//     object: "inline",
//     type: ElementType.ConversationLink
//   } as any
// }

export function link({ href, nodes }: { href: string; nodes: Node[] }) {
  return {
    data: { href },
    nodes,
    object: "inline",
    type: "link"
  }
}
