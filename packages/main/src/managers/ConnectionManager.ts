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
import { ConnectionFactory } from "../account"
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
  private connectionFactory: ConnectionFactory
  private queue: JobQueue<Action<any>, Result>

  constructor(connectionFactory: ConnectionFactory) {
    this.connectionFactory = connectionFactory
    this.queue = new JobQueue(this.process.bind(this))
  }

  request<T>(action: Action<T>): kefir.Observable<T, Error> {
    return this.queue.process(action)
  }

  // TODO: close connection after a period of inactivity
  private async getConn(): Promise<Connection> {
    if (!this.conn) {
      const connPromise = this.connectionFactory().then(conn => {
        const onClose = () => {
          if (this.conn === connPromise) {
            this.conn = null
          }
        }
        conn.addListener("close", onClose)
        conn.addListener("end", onClose)
        return conn
      })
      this.conn = connPromise
    }
    return this.conn
  }

  private process<T>(action: Action<T>): kefir.Observable<T, Error> {
    return kefir
      .fromPromise(this.getConn())
      .flatMap(conn => perform(conn, action))
  }
}
