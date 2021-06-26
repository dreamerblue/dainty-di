import 'reflect-metadata';
import { inject, injectable, multiInject, optional } from 'inversify';
import { PRIVATE_CONTAINER_KEYS } from './constants';
import { DIUtility } from './utils';
import type {
  DependencyIdentifier,
  Newable,
  ProvideCommonOptions,
  ProvideDecoratorLifeCycleOptions,
  ProvideDecoratorOptions,
} from './typings';

class DecoratorImpl {
  public static provide(
    target: Function,
    options: ProvideDecoratorOptions,
    lifeCycleOptions: ProvideDecoratorLifeCycleOptions = {},
  ) {
    lifeCycleOptions.beforeProvide?.(target, options);
    DIUtility.provideClass({
      ...options,
      id: options.id ?? (target as Newable),
      value: target,
    });
    lifeCycleOptions.afterProvide?.(target, options);
  }

  public static inject(
    id: DependencyIdentifier | undefined,
    target: Object,
    propertyKey: string,
    parameterIndex?: number,
    multi = false,
  ) {
    let usingId = id;
    if (!usingId) {
      usingId =
        typeof parameterIndex === 'number'
          ? Reflect.getMetadata('design:paramtypes', target, propertyKey)[parameterIndex]
          : Reflect.getMetadata('design:type', target, propertyKey);
    }
    if (!usingId) {
      let extraMessages: string[] = [];
      propertyKey && extraMessages.push(`propertyKey: ${propertyKey}`);
      typeof parameterIndex === 'number' && extraMessages.push(`parameterIndex: ${parameterIndex}`);
      throw new Error(
        `Cannot resolve identifier for ${target.constructor.name} (${extraMessages.join(', ')})`,
      );
    }
    const resolvedIdentifier = DIUtility.getResolvedIdentifier(usingId);
    !multi
      ? inject(resolvedIdentifier)(target, propertyKey, parameterIndex)
      : multiInject(resolvedIdentifier)(target, propertyKey, parameterIndex);
  }
}

export class DecoratorUtility {
  /**
   * Create Provide decorator factory.
   * @param presetOptions The preset default options.
   * @param lifeCycleOptions The life cycle options to be called while registering provider.
   * @returns Custom Provide decorator factory.
   */
  public static createProvideDecoratorFactory(
    presetOptions: ProvideCommonOptions,
    lifeCycleOptions?: ProvideDecoratorLifeCycleOptions,
  ) {
    return (options: ProvideDecoratorOptions = {}) => {
      const usingOptions: ProvideDecoratorOptions = {
        id: options.id,
        scope: options.scope ?? presetOptions.scope,
        condition: options.condition ?? presetOptions.condition,
        override: options.override ?? presetOptions.override,
      };
      return function (target: Function) {
        DecoratorImpl.provide(target, usingOptions, lifeCycleOptions);
      };
    };
  }
}

/**
 * Declare a dependency as injectable and provide it to the container automatically when the decorator is applied.
 * @decorator {class}
 */
export function Provide(options: ProvideDecoratorOptions = {}) {
  return function (target: Function) {
    DecoratorImpl.provide(target, {
      id: options.id,
      scope: options.scope,
      condition: options.condition,
      override: options.override,
    });
  };
}

/**
 * Inject a dependency.
 * @param id The dependency identifier.
 * @decorator {property}
 * @decorator {parameter} Can only be used on constructor parameters.
 * @throws {Error} When the dependency identifier is not provided.
 */
export function Inject(id?: DependencyIdentifier) {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    DecoratorImpl.inject(id, target, propertyKey, parameterIndex);
  };
}

/**
 * Inject all matching dependencies as an array (multi-injection).
 * @param id The dependency identifier.
 * @decorator {property}
 * @decorator {parameter} Can only be used on constructor parameters.
 */
export function MultiInject(id?: DependencyIdentifier) {
  return function (target: Object, propertyKey: string, parameterIndex?: number) {
    DecoratorImpl.inject(id, target, propertyKey, parameterIndex, true);
  };
}

/**
 * Optionally inject a dependency only if it is already bound in the container.
 * @decorator {property}
 */
export const Optional = optional;

/**
 * Declare a dependency as injectable.
 * @decorator {class}
 */
export const Injectable = injectable;

/**
 * Inject the root container.
 * @decorator {property}
 * @decorator {parameter} Can only be used on constructor parameters.
 */
export function InjectRootContainer() {
  return Inject(PRIVATE_CONTAINER_KEYS.Container);
}
