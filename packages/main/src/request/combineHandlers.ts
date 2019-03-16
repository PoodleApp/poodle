import * as kefir from "kefir"

export interface Action<_Result, Payload = any, Tag = any> {
  type: Tag
  payload: Payload
}

export type Handler<Context, Result, Payload extends unknown[]> = (
  context: Context,
  ...payload: Payload
) => kefir.Observable<Result, Error>

type HandlerMap<Context> = Record<string, Handler<Context, any, any>>

// `Payload<H>` infers the payload type required by handler `H`. If the handler
// does not take a payload argument then the type of `Payload<H>` is `undefined`.
type Payload<H> = H extends (context: any, ...args: infer P) => any ? P : never

type Result<H> = H extends (...args: any[]) => kefir.Observable<infer R, any>
  ? R
  : never

// `ActionCreators<HM>` computes a type for an action creator map based on the
// handler map `HM`.
type ActionCreators<HM extends HandlerMap<any>> = {
  [K in keyof HM]: (
    ...args: Payload<HM[K]>
  ) => Action<Result<HM[K]>, Payload<HM[K]>>
}

type ActionTypes<HM extends HandlerMap<any>> = { [K in keyof HM]: K }

// `combineHandlers` calls two other functions to compute an action creator map,
// and a perform. Actions produced by generated action creators have a `type`
// property based on the map key of the handler / action creator. But short
// handler names might not be unique in the application. So each `type` property
// is prefixed with the given `prefix`, which should be unique to this module.
export function combineHandlers<Context, HM extends HandlerMap<Context>>(
  handlers: HM
): {
  actions: ActionCreators<HM>
  actionTypes: ActionTypes<HM>
  perform: <T>(
    context: Context,
    action: Action<T>
  ) => kefir.Observable<T, Error>
} {
  return {
    actions: extractActionCreators(handlers),
    actionTypes: extractActionTypes(handlers),
    perform: extractPerform(handlers)
  }
}

function extractActionCreators<HM extends HandlerMap<any>>(
  handlers: HM
): ActionCreators<HM> {
  const actionCreators: any = {}
  for (const type of Object.keys(handlers)) {
    actionCreators[type] = (...payload: any[]) => ({ payload, type })
  }
  return actionCreators
}

function extractActionTypes<HM extends HandlerMap<any>>(
  handlers: HM
): ActionTypes<HM> {
  const actionTypes: any = {}
  for (const type of Object.keys(handlers)) {
    actionTypes[type] = type
  }
  return actionTypes
}

function extractPerform<Context, HM extends HandlerMap<Context>>(
  handlers: HM
): <T>(context: Context, action: Action<T>) => kefir.Observable<T, Error> {
  return (context, action) => {
    const type = action.type
    const handler = handlers[type]
    if (!handler) {
      return kefir.constantError(
        new Error(`No handler for action type, ${type}`)
      )
    }
    try {
      return handler(context, ...action.payload)
    } catch (err) {
      return kefir.constantError(err)
    }
  }
}
