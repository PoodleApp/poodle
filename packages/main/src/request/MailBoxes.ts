import imap from "imap"

export function findBox(
  p: (box: imap.Folder, boxName: string) => boolean,
  boxes: imap.MailBoxes,
  path: string = ""
): { box: imap.Folder; name: string } | null | undefined {
  const pairs = Object.keys(boxes).map(k => ({ name: k, box: boxes[k] }))
  const match = pairs.find(({ box, name }) => p(box, name))
  if (match) {
    const { name, box } = match
    return { name: path + name, box }
  } else {
    return pairs
      .map(({ box, name }) =>
        box.children ? findBox(p, box.children, name + box.delimiter) : null
      )
      .filter(child => !!child)[0]
  }
}

export function byAttribute(attribute: string): (box: imap.Folder) => boolean {
  return box => box.attribs.some(a => a === attribute)
}

export function byName(
  name: string
): (_: imap.Folder, boxName: string) => boolean {
  return (_, boxName) => boxName === name
}
