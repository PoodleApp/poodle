/// <reference types="node" />

declare module "xoauth2" {
  import { Readable } from "stream"

  export interface AccessToken {
    // TODO
  }

  class XOAuth2Generator extends Readable {
    getToken(cb: (err: Error, token: string) => unknown): void
    updateToken(accessToken: string, timeout: number): void
    generateToken(cb: (err: Error, token: string) => unknown): void
  }

  export function createXOAuth2Generator(options: {
    user: string
    accessUrl?: string
    clientId: string
    clientSecret: string
    refreshToken: string
    accessToken?: AccessToken
    timeout?: number
    customHeaders?: Record<string, string>
    customParams?: Record<string, string>
  }): XOAuth2Generator

  // With options for Google service account
  export function createXOAuth2Generator(options: {
    service: string
    user: string
    scope: string
    privateKey: string
    serviceRequestTimeout?: number
    accessUrl?: string
    accessToken?: AccessToken
    timeout?: number
    customHeaders?: Record<string, string>
    customParams?: Record<string, string>
  }): XOAuth2Generator
}
