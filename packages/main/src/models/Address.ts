import * as addrs from "email-addresses"
import imap from "imap"
import { Seq } from "immutable"
import { URI, mailtoUri } from "./uri"

export type Email = string

export default class Address {
  name: string | undefined
  mailbox: string
  host: string

  constructor(addr: imap.Address) {
    this.name = addr.name
    this.mailbox = addr.mailbox
    this.host = addr.host
  }

  get displayName(): string {
    return this.name || this.email
  }

  get email(): Email {
    return `${this.mailbox}@${this.host}`
  }

  get headerValue(): string {
    return this.name ? `${this.name} <${this.email}>` : this.email
  }

  get uri(): URI {
    return mailtoUri(this.email)
  }
}

// TODO: normalize when comparing
export function equals(x: imap.Address, y: imap.Address): boolean {
  return x.host === y.host && x.mailbox === y.mailbox
}

export function build({
  email,
  name
}: {
  email: string
  name?: string
}): Address {
  const [mailbox, host] = email.split("@", 2)
  return name
    ? new Address({
        name,
        mailbox,
        host
      })
    : new Address({ mailbox, host })
}

const specialChar = /[()<>[]:;@\\,."]/

// Print an address according to RFC 5322
export function formatAddress(a: imap.Address): string {
  const rawName = a.name
  if (!rawName) {
    return `${a.mailbox}@${a.host}`
  }
  const name = rawName.match(specialChar)
    ? '"' + rawName.replace(/"/g, '\\"') + '"'
    : rawName
  return `${name} <${a.mailbox}@${a.host}>`
}

// Print list of addresses as a single string according to RFC 5322
export function formatAddressList(as: Iterable<imap.Address>): string {
  return Seq(as)
    .map(formatAddress)
    .join(", ")
}

// Parse a list of addresses according to RFC 5322
export function parseAddressList(
  as: string | null | undefined
): Address[] | null | undefined {
  const results =
    typeof as === "string" ? addrs.parseAddressList(as) : undefined
  if (!results) {
    return results
  }
  const flatAddresses = results.flatMap(result =>
    "addresses" in result ? result.addresses : [result]
  )
  return flatAddresses.map(
    p =>
      new Address({
        name: p.name,
        mailbox: p.local,
        host: p.domain
      })
  )
}

// TODO: better normalization
export function normalizedEmail({ mailbox, host }: imap.Address): string {
  return `${mailbox.toLocaleLowerCase()}@${host.toLocaleLowerCase()}`
}
