declare var Buffer: {
  from(data: string | Uint8Array | ArrayBuffer | number[], encoding?: string): Buffer
  alloc(size: number, fill?: number | string): Buffer
  concat(list: Uint8Array[], totalLength?: number): Buffer
  isBuffer(obj: unknown): obj is Buffer
}

interface Buffer extends Uint8Array {
  toString(encoding?: string, start?: number, end?: number): string
  writeUInt16LE(value: number, offset?: number): number
  writeUInt32LE(value: number, offset?: number): number
  length: number
}

declare var process: {
  cwd(): string
  env: Record<string, string | undefined>
}

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: string | Uint8Array, inputEncoding?: string): any
    digest(encoding: "hex" | "base64"): string
    digest(): Buffer
  }
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array, inputEncoding?: string): any
    digest(encoding: "hex" | "base64"): string
    digest(): Buffer
  }
  export function createSign(algorithm: string): {
    update(data: string | Uint8Array, inputEncoding?: string): any
    end(): void
    sign(privateKey: string, outputEncoding: "base64" | "hex"): string
  }
  export function randomUUID(): string
}

declare module "node:fs" {
  export function readdirSync(path: string): string[]
  export function readFileSync(path: string, encoding: "utf8"): string
  export function readFileSync(path: string): Buffer
  export function statSync(path: string): {
    isDirectory(): boolean
    isFile(): boolean
  }
  export function existsSync(path: string): boolean
}

declare module "node:path" {
  export function join(...paths: string[]): string
  export function resolve(...paths: string[]): string
  export function dirname(path: string): string
  export function basename(path: string, suffix?: string): string
}

declare module "node:zlib" {
  export function deflateRawSync(buf: Buffer | Uint8Array): Buffer
}

declare module "node:test" {
  export function describe(name: string, fn: () => void | Promise<void>): void
  export function it(name: string, fn: () => void | Promise<void>): void
}

declare module "node:assert/strict" {
  const assert: {
    ok(value: unknown, message?: string): void
    equal(actual: unknown, expected: unknown, message?: string): void
    deepEqual(actual: unknown, expected: unknown, message?: string): void
    match(value: string, regExp: RegExp, message?: string): void
    throws(fn: () => unknown, error?: unknown, message?: string): void
    rejects(
      fn: () => Promise<unknown>,
      error?: unknown,
      message?: string
    ): Promise<void>
  }
  export default assert
}

declare module "react-i18next" {
  export interface I18nInstance {
    language: string
    resolvedLanguage?: string
    changeLanguage: (lng: string) => Promise<void>
    dir: (lng?: string) => "ltr" | "rtl"
  }

  export type TFunction = (
    key: string,
    options?: Record<string, string | number | boolean | undefined> | string
  ) => string

  export function useTranslation(ns?: string | string[]): {
    t: TFunction
    i18n: I18nInstance
    ready: boolean
  }
}

declare module "@mikro-orm/migrations" {
  export abstract class Migration {
    addSql(sql: string): void
    abstract up(): Promise<void>
    down(): Promise<void>
  }
}

declare module "@medusajs/framework/mikro-orm/migrations" {
  export { Migration } from "@mikro-orm/migrations"
}

declare module "@medusajs/framework/utils" {
  export const Modules: Record<string, string>
  export const ContainerRegistrationKeys: {
    QUERY: string
    LOGGER: string
    REMOTE_LINK: string
    [key: string]: string
  }

  export function defineLink(
    left: unknown,
    right: unknown
  ): { left: unknown; right: unknown }

  export class MedusaError extends Error {
    static Types: {
      DB_ERROR: string
      DUPLICATE_ERROR: string
      INVALID_ARGUMENT: string
      INVALID_DATA: string
      UNAUTHORIZED: string
      NOT_FOUND: string
      NOT_ALLOWED: string
      UNEXPECTED_STATE: string
      CONFLICT: string
    }
    type: string
    code?: string
    constructor(type: string, message: string, code?: string)
  }

  interface ChainableProperty {
    primaryKey(): ChainableProperty
    searchable(): ChainableProperty
    nullable(): ChainableProperty
    default(val: unknown): ChainableProperty
  }

  export const model: {
    define(
      name: string,
      schema: Record<string, unknown>
    ): {
      indexes(
        idx: Array<{
          name?: string
          on: string[]
          unique?: boolean
          where?: string
        }>
      ): unknown
    }
    id(opts?: { prefix?: string }): ChainableProperty
    text(): ChainableProperty
    number(): ChainableProperty
    float(): ChainableProperty
    bigNumber(): ChainableProperty
    boolean(): ChainableProperty
    json(): ChainableProperty
    dateTime(): ChainableProperty
    enum(values: readonly string[] | string[]): ChainableProperty
  }

  export function MedusaService<TModels extends Record<string, unknown>>(
    models: TModels
  ): {
    new (...args: any[]): Record<string, any>
  }

  export function Module(
    name: string,
    config: { service: unknown; loaders?: unknown[] }
  ): {
    name: string
    linkable: Record<string, any>
    service: unknown
    loaders?: unknown[]
  }
}

declare module "@medusajs/framework/http" {
  export interface MedusaRequest<TBody = any> {
    params: Record<string, string>
    query: Record<string, any>
    body: TBody
    validatedBody: TBody
    validatedQuery?: Record<string, any>
    auth_context?: {
      actor_id?: string
      actor_type?: string
    }
    scope: {
      resolve<T = any>(key: string): T
    }
  }

  export interface MedusaResponse {
    status(code: number): MedusaResponse
    sendStatus(code: number): MedusaResponse
    setHeader(name: string, value: string): MedusaResponse
    send(body: unknown): void
    json(payload: unknown): void
  }

  export function defineMiddlewares(config: {
    routes: Array<{
      matcher: string | RegExp
      method?: string | string[]
      middlewares?: unknown[]
    }>
  }): {
    routes: Array<{
      matcher: string | RegExp
      method?: string | string[]
      middlewares?: unknown[]
    }>
  }

  export function validateAndTransformBody(schema: unknown): unknown
  export function validateAndTransformQuery(
    schema: unknown,
    config?: Record<string, unknown>
  ): unknown
}

declare module "@medusajs/framework/workflows-sdk" {
  export class StepResponse<TOutput = any, TComp = any> {
    constructor(output: TOutput, compensateInput?: TComp)
  }

  export class WorkflowResponse<TOutput = any> {
    constructor(output: TOutput)
  }

  export function createStep<TInput = any, TOutput = any, TComp = any>(
    name: string,
    invokeFn: (
      input: TInput,
      context: { container: { resolve<T = any>(key: string): T } }
    ) => Promise<StepResponse<TOutput, TComp>>,
    compensateFn?: (
      compInput: TComp | undefined,
      context: { container: { resolve<T = any>(key: string): T } }
    ) => Promise<void>
  ): ((input: TInput) => TOutput) & {
    __stepName: string
    invoke: (
      input: TInput,
      context: { container: { resolve<T = any>(key: string): T } }
    ) => Promise<StepResponse<TOutput, TComp>>
    compensate?: (
      compInput: TComp | undefined,
      context: { container: { resolve<T = any>(key: string): T } }
    ) => Promise<void>
  }

  export function createWorkflow<TInput = any, TOutput = any>(
    name: string,
    composer: (input: TInput) => WorkflowResponse<TOutput>
  ): ((scope?: unknown) => {
    run(opts?: { input?: TInput }): Promise<{
      result: TOutput
      compensate?: () => Promise<void>
    }>
  }) & {
    getName(): string
  }
}

declare module "@medusajs/framework/zod" {
  export interface ZodType<T = any> {
    _output: T
    min(n: number, msg?: string): ZodType<T>
    max(n: number, msg?: string): ZodType<T>
    int(): ZodType<T>
    regex(pattern: RegExp, msg?: string): ZodType<T>
    or<U extends ZodType<any>>(other: U): ZodType<T | U["_output"]>
    positive(): ZodType<T>
    nonnegative(): ZodType<T>
    email(): ZodType<T>
    url(): ZodType<T>
    optional(): ZodType<T | undefined>
    nullable(): ZodType<T | null>
    default(val: T): ZodType<T>
    partial(): ZodType<Partial<T>>
    omit<K extends keyof T>(mask: Record<K, true>): ZodType<Omit<T, K>>
    passthrough(): ZodType<T>
    parse(val: unknown): T
    safeParse(
      val: unknown
    ): { success: true; data: T } | { success: false; error: unknown }
  }

  export const z: {
    string(): ZodType<string>
    number(): ZodType<number>
    boolean(): ZodType<boolean>
    unknown(): ZodType<unknown>
    any(): ZodType<any>
    enum<T extends readonly [string, ...string[]]>(values: T): ZodType<T[number]>
    array<T extends ZodType<any>>(schema: T): ZodType<Array<T["_output"]>>
    record<K extends ZodType<string>, V extends ZodType<any>>(
      key: K,
      value?: V
    ): ZodType<Record<string, any>>
    object<T extends Record<string, ZodType<any>>>(
      shape: T
    ): ZodType<{ [K in keyof T]: T[K]["_output"] }>
    union<T extends readonly [ZodType<any>, ...ZodType<any>[]]>(
      items: T
    ): ZodType<T[number]["_output"]>
    coerce: {
      number(): ZodType<number>
      boolean(): ZodType<boolean>
    }
  }

  export namespace z {
    export type infer<T extends ZodType<any>> = T["_output"]
  }
}

declare module "@medusajs/framework/types" {
  export interface MedusaContainer {
    resolve<T = any>(key: string): T
  }
}

declare module "@medusajs/framework" {
  import type { MedusaContainer } from "@medusajs/framework/types"

  export interface SubscriberArgs<T = unknown> {
    event: { data: T; name?: string }
    container: MedusaContainer
  }

  export interface SubscriberConfig {
    event: string | string[]
    context?: Record<string, unknown>
  }
}

declare module "react" {
  export type ReactNode = any
  export function useState<T>(
    initial: T | (() => T)
  ): [T, (next: T | ((prev: T) => T)) => void]
  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly unknown[]
  ): void
  export function useCallback<T extends (...args: any[]) => any>(
    fn: T,
    deps: readonly unknown[]
  ): T
  export function useMemo<T>(fn: () => T, deps: readonly unknown[]): T
  export function useRef<T>(initial: T): { current: T }
}
