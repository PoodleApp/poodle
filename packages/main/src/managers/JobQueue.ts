import * as kefir from "kefir"

type Job<A, B> = {
  payload: A
  emitter: kefir.Emitter<B, Error>
}

type Processor<A, B> = (payload: A) => kefir.Observable<B, Error>

export default class JobQueue<A, B> {
  private busy: boolean
  private jobs: Job<A, B>[]
  private processor: Processor<A, B>

  constructor(processor: Processor<A, B>) {
    this.busy = false
    this.jobs = []
    this.processor = processor
  }

  process(payload: A): kefir.Observable<B, Error> {
    return kefir.stream(emitter => {
      const job = { emitter, payload }
      this.jobs.push(job)
      process.nextTick(() => this.run())
    })
  }

  run() {
    if (this.busy || this.jobs.length < 1) {
      return
    }
    this.busy = true
    const job = this.jobs.shift()!
    try {
      const result = this.processor.call(null, job.payload)
      result.observe(job.emitter as any)
      result.onEnd(() => {
        this.busy = false
        if (this.jobs.length > 0) {
          process.nextTick(() => this.run())
        }
      })
    } catch (err) {
      job.emitter.error(err)
      job.emitter.end()
      this.busy = false
    }
  }
}
