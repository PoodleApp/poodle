/*
 * Exposes methods for communicating with an IMAP server. Some providers have
 * strict limits on numbers of open connections - so we want to keep IMAP
 * connections to a minimum. So this interface abstracts over a worker pool (of
 * size 1 by default). The interface also abstracts over stateful properties of
 * IMAP connections, such as opening and closing boxes.
 *
 * @flow
 */

import Connection from "imap"
import * as kefir from "kefir"
import { ConnectionFactory } from "../types"
import { Action, perform } from "../request"
import JobQueue from "./JobQueue"

type Result = any

/*
 * Given a `connectionFactory`, manages connection state and acts as an
 * interface to an IMAP server. The connection produced by `connectionFactory`
 * should be authenticated and ready (the factory should wait for the connection
 * to emit a `'ready'` event before resolving the returned promise).
 */
export default class ConnectionManager {
  private conn: Promise<Connection> | null | undefined
  private queue: JobQueue<Action<any>, Result>
  private isClose: Boolean = false

  constructor(
    private connectionFactory: ConnectionFactory,
    private options: {
      keepalive?: boolean
      onConnect?: () => void
      onUpdates?: (newMessageCount: number) => void
    } = {}
  ) {
    this.queue = new JobQueue(this.process.bind(this))
    if (options.keepalive) {
      this.getConn()
    }
  }

  request<T>(action: Action<T>): kefir.Observable<T, Error> {
    return this.queue.process(action)
  }

  private async getConn(): Promise<Connection> {
    if (!this.conn) {
      const connPromise = this.connectionFactory({
        keepalive: Boolean(this.options.keepalive)
      }).then(conn => {
        const onClose = () => {
          if (this.conn === connPromise) {
            this.conn = null
          }
          if (this.options.keepalive && !this.isClose) {
            this.getConn()
          }
        }
        conn.addListener("close", onClose)
        conn.addListener("end", onClose)
        if (this.options.onUpdates) {
          conn.addListener("mail", this.options.onUpdates)
          conn.addListener("update", this.options.onUpdates)
        }
        if (this.options.onConnect) {
          this.options.onConnect()
        }
        return conn
      })
      this.conn = connPromise
    }
    return this.conn
  }

  public async closeConn() {
    if (this.conn) {
      this.getConn().then(conn => {
        this.isClose = true
        conn.end()
      })
    }
  }

  private process<T>(action: Action<T>): kefir.Observable<T, Error> {
    return kefir
      .fromPromise(this.getConn())
      .flatMap(conn => perform(conn, action))
  }
}
