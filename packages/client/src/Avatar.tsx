import MuiAvatar, { AvatarProps } from "@material-ui/core/Avatar"
import * as colors from "@material-ui/core/colors"
import * as React from "react"
import stringHash from "string-hash"

type Props = AvatarProps & {
  address?: { name?: string | null; mailbox: string; host: string }
}

export default function Avatar({ address, ...rest }: Props) {
  const letter = getLetter(
    (address && (address.name || address.mailbox)) || "?"
  )
  const [color, backgroundColor] = getColors(
    address ? `${address.mailbox}@${address.host}` : "?"
  )
  return (
    <MuiAvatar style={{ color, backgroundColor }} {...rest}>
      {letter}
    </MuiAvatar>
  )
}

const colorMaps = Array.from(Object.values(colors))
function extract(shade: string) {
  return (color: any) => {
    const result = color[shade]
    return result ? [result] : []
  }
}

const primaryColors = colorMaps.flatMap(extract("500"))
const accentColors = colorMaps.flatMap(extract("A100"))
const primaryCount = primaryColors.length
const accentCount = accentColors.length

function getColors(id: string): [string, string] {
  const f = stringHash("fg" + id)
  const b = stringHash("bg" + id)
  return [accentColors[f % accentCount], primaryColors[b % primaryCount]]
}

function getLetter(name: string): string {
  return (name || "?")[0].toUpperCase()
}
