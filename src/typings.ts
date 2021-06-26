import { ProviderScope, ProviderType } from './enums';

export type Newable<T = any> = new (...args: any) => T;
export type DependencyIdentifier = string | symbol | Newable;
export type ProviderWhen = /** boolean expression */ boolean | /** process.env.NODE_ENV */ string;

export interface ProvideCommonOptions {
  /**
   * Scope of the provider.
   * @default ProviderScope.Singleton
   */
  scope?: ProviderScope;

  /**
   * The condition to be provided.
   *
   * Can be an environment name (NODE_ENV) or a boolean expression.
   *
   * It will only be bound into the container when the condition is met.
   */
  condition?: ProviderWhen;

  /**
   * Whether to override previous provider.
   *
   * If true, another provider with the same identifier will be overridden by this provider.
   *
   * This option is only suitable for the case where you want an identifier to provide only one dependency
   * and override the default under some conditions (also works well with the `condition` option).
   *
   * If an identifier has multiple non-mutually exclusive providers at the same time, the override will cause unexpected behavior.
   */
  override?: boolean;
}

export interface ProvideDecoratorOptions extends ProvideCommonOptions {
  id?: DependencyIdentifier;
}

export interface ProvideAPIOptions<T = any> extends ProvideCommonOptions {
  id: DependencyIdentifier;
  value: T;
}

export interface ProvideDecoratorLifeCycleOptions {
  beforeProvide?(target: Function, options: ProvideDecoratorOptions): void;
  afterProvide?(target: Function, options: ProvideCommonOptions): void;
}

export interface DeferredScopeProvider {
  identifier: DependencyIdentifier;
  value: any;
  scope: ProviderScope;
  type: ProviderType;
}
