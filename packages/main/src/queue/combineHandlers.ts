import BetterQueue from "better-queue"
import * as promises from "../util/promises"
import { Callback, Omit } from "../util/types"

export interface Action<_Result, EnqueueParams = unknown, Tag = any> {
  type: Tag
  payload: EnqueueParams
}

export interface Handler<EnqueueParams, Result, ProcessParams = unknown> {
  enqueue(actionPayload: EnqueueParams): ProcessParams
  process(task: ProcessParams): Promise<Result>
  failure?: (error: Error, task: ProcessParams) => void
  merge?: (
    oldTask: ProcessParams,
    newTask: ProcessParams
  ) => Promise<ProcessParams>
  priority?: number
  unique?: boolean
}

type Handlers = Record<string, Handler<any, any, any>>

type EnqueueParams<H> = H extends Handler<infer EnqueueParams, any, any>
  ? EnqueueParams
  : never

type Result<H> = H extends Handler<any, infer R, any> ? R : never

// `ActionCreators<HM>` computes a type for an action creator map based on the
// handler map `HM`.
type ActionCreators<HM extends Handlers> = {
  [K in keyof HM]: (
    params: EnqueueParams<HM[K]>
  ) => Action<Result<HM[K]>, EnqueueParams<HM[K]>>
}

type ActionTypeMap<HM extends Handlers> = {
  [K in keyof HM]: Action<Result<HM[K]>, EnqueueParams<HM[K]>, K>
}

type ActionTypes<HM extends Handlers> = ActionTypeMap<HM>[keyof HM]

type TaskTypeMap<HM extends Handlers> = {
  [K in keyof HM]: HM[K] extends Handler<any, any, infer ProcessParams>
    ? { type: K; params: ProcessParams; id?: string }
    : never
}

export type Task<HM extends Handlers> = TaskTypeMap<HM>[keyof HM]

class JobFailure<HM extends Handlers> extends Error {
  constructor(public cause: Error, public task: Task<HM>) {
    super(cause.message)
    Object.assign(this, cause)
  }
}

export const DEFAULT_PRIORITY = 50
export const HIGH_PRIORITY = 80
export const LOW_PRIORITY = 20

export function handler<EnqueueParams, Result, ProcessParams>(
  h: Handler<EnqueueParams, Result, ProcessParams>
): Handler<EnqueueParams, Result, ProcessParams> {
  return h
}

export function combineHandlers<HM extends Handlers>(
  queueOptions: Omit<
    BetterQueue.QueueOptions<Task<HM>, unknown>,
    "priority" | "process"
  >,
  handlers: HM
): {
  actions: ActionCreators<HM>
  queue: BetterQueue<Task<HM>>
  schedule: <T>(action: Action<T> & ActionTypes<HM>) => Promise<T | undefined>
} {
  const queue = new BetterQueue(process(handlers), {
    ...queueOptions,
    async filter(task, cb) {
      try {
        const unique = task.type && handlers[task.type].unique
        const store = queueOptions.store
        if (
          unique &&
          task.id &&
          typeof store === "object" &&
          "getTask" in store
        ) {
          const existing = await promises.lift1(cb => {
            store.getTask(task.id, cb)
          })
          if (existing) {
            return cb(null, null as any)
          }
        }
        return cb(null, task)
      } catch (error) {
        return cb(error, null as any)
      }
    },
    async merge(oldTask, newTask, cb) {
      try {
        const mergFunc = oldTask.type && handlers[oldTask.type].merge
        if (mergFunc && oldTask.params && newTask.params) {
          const mergedParams = await mergFunc(oldTask.params, newTask.params)
          cb(null, { ...oldTask, params: mergedParams })
        } else {
          cb(null, newTask)
        }
      } catch (error) {
        cb(error, null as any)
      }
    },
    priority(task, cb) {
      const priority = handlers[task.type].priority || DEFAULT_PRIORITY
      cb(null, priority)
    }
  })
  queue.on("task_failed", onFailure(handlers))
  return {
    actions: extractActionCreators(handlers),
    queue,
    schedule: schedule(handlers, queue)
  }
}

function schedule<HM extends Handlers>(
  handlers: HM,
  queue: BetterQueue<{ type: keyof HM; params: unknown }>
): <T>(action: Action<T> & ActionTypes<HM>) => Promise<T | undefined> {
  return async action => {
    const type = action.type
    const handler = handlers[type].enqueue
    if (!handler) {
      throw new Error(`No handler for action type, ${type}`)
    }
    const processParams = handler(action.payload)
    const id = processParams.id && { id: processParams.id }
    return new Promise((resolve, reject) => {
      queue.push({ type, params: processParams, ...id }, (error, result) => {
        // If filter rejects the task the error here will be the string,
        // "input_rejected".
        if (error === "input_rejected") {
          return resolve()
        }
        if (error) {
          return reject(error)
        }
        return resolve(result)
      })
    })
  }
}

function process<HM extends Handlers>(
  handlers: HM
): (task: Task<HM>, cb: Callback<unknown>) => Promise<void> {
  return async (task, cb) => {
    try {
      const result = await handlers[task.type].process(task.params)
      cb(null, result)
    } catch (error) {
      cb(new JobFailure(error, task))
    }
  }
}

function onFailure<HM extends Handlers>(
  handlers: HM
): (
  _taskId: string,
  error: JobFailure<HM>,
  _stats: { elapsed: number }
) => Promise<void> {
  return async (_taskId, error) => {
    if (error.task && error.task.type) {
      const failureHandler = handlers[error.task.type].failure
      if (failureHandler) {
        await failureHandler(error.cause, error.task.params)
      }
    } else {
      console.error(error)
    }
  }
}

function extractActionCreators<HM extends Handlers>(
  handlers: HM
): ActionCreators<HM> {
  const actionCreators: any = {}
  for (const type of Object.keys(handlers)) {
    actionCreators[type] = (payload: any) => ({ payload, type })
  }
  return actionCreators
}
