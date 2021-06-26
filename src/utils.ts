import { injectable } from 'inversify';
import type { interfaces as InversifyOriginalInterfaces } from 'inversify';
import { ContainerAccessor } from './container';
import type { Container } from './container';
import { ProviderScope, ProviderType } from './enums';
import { DEFAULT_PROVIDER_SCOPE, PRIVATE_CONTAINER_KEYS } from './constants';
import type {
  DependencyIdentifier,
  ProvideAPIOptions,
  ProvideCommonOptions,
  DeferredScopeProvider,
} from './typings';

class PrivateUtility {
  public static isConstructor(f: any) {
    try {
      Reflect.construct(String, [], f);
      return true;
    } catch (e) {
      return false;
    }
  }

  public static wildBind<T = any>(
    options: { id: DependencyIdentifier; value: T } & ProvideCommonOptions,
    type: ProviderType,
  ): InversifyOriginalInterfaces.Binding<T> | undefined {
    // check if need to bind, based on static `options.condition`
    const needBind =
      typeof options.condition === 'string'
        ? process.env.NODE_ENV === options.condition
        : typeof options.condition === 'boolean'
        ? options.condition
        : true;
    if (!needBind) {
      return;
    }

    const { value } = options;
    const resolvedIdentifier = DIUtility.getResolvedIdentifier(options.id);
    const scope = options.scope || DEFAULT_PROVIDER_SCOPE;
    const isDeferredScope =
      scope === ProviderScope.Deferred || scope === ProviderScope.DeferredTransient;
    const override = options.override === true;

    if (!isDeferredScope) {
      const binding = DIUtility.bindProvider({
        identifier: resolvedIdentifier,
        value,
        scope,
        override,
        type,
      });
      return binding;
    } else {
      // only store deferred providers and delay binding to deferred created
      const container = ContainerAccessor.getRootContainer();
      if (!container.isBound(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders)) {
        container.bind(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders).toConstantValue(new Map());
      }
      const deferredScopeProviders = container.get<
        Map<DependencyIdentifier, DeferredScopeProvider[]>
      >(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders);
      let bound = deferredScopeProviders.get(resolvedIdentifier) || [];
      if (override) {
        bound = [];
      }
      bound.push({
        identifier: resolvedIdentifier,
        value,
        scope:
          scope === ProviderScope.DeferredTransient
            ? ProviderScope.Transient
            : ProviderScope.Singleton,
        type,
      });
      deferredScopeProviders.set(resolvedIdentifier, bound);
    }
  }
}

export class DIUtility {
  /**
   * Get resolved identifier of the dependency that can be used in the container.
   *
   * If the identifier is a string, it will be converted to `Provide<${string}>`,
   * otherwise the provided identifier will be used directly.
   * @param idOrTarget The specified identifier token or the target class.
   * @returns The identifier.
   */
  public static getResolvedIdentifier(idOrTarget: DependencyIdentifier) {
    if (PrivateUtility.isConstructor(idOrTarget) || typeof idOrTarget === 'symbol') {
      return idOrTarget;
    }
    if (typeof idOrTarget === 'string') {
      return `Provide<${idOrTarget}>`;
    }
    throw new Error(
      'No valid identifier specified. The identifier must be a string, a symbol or a constructor',
    );
  }

  /**
   * Bind a provider to the container.
   * @param options The options of provider.
   * @param container The container to bind to, default to root container.
   * @returns The binding instance.
   * @throws Error if some of options are invalid.
   */
  public static bindProvider<T = any>(
    options: {
      type: ProviderType;
      identifier: DependencyIdentifier;
      value: any;
      scope: ProviderScope;
      override?: boolean;
    },
    container?: Container,
  ): InversifyOriginalInterfaces.Binding<T> {
    const usingContainer = container ?? ContainerAccessor.getRootContainer();
    const { type, identifier, value, scope, override } = options;
    if (override && usingContainer.isBound(identifier)) {
      usingContainer.unbind(identifier);
    }
    const binding = usingContainer.bind(identifier);
    let bindingChainWhenOn: InversifyOriginalInterfaces.BindingInWhenOnSyntax<any>;
    switch (type) {
      case ProviderType.Class:
        bindingChainWhenOn = binding.to(value);
        break;
      case ProviderType.Value:
        binding.toConstantValue(value);
        break;
      default:
        throw new Error(`Type ${type} of identifier ${String(identifier)} is unrecognized`);
    }
    switch (scope) {
      case ProviderScope.Singleton:
        bindingChainWhenOn?.inSingletonScope();
        break;
      case ProviderScope.Transient:
        bindingChainWhenOn?.inTransientScope();
        break;
      case ProviderScope.Deferred:
      case ProviderScope.DeferredTransient:
        throw new Error(
          'Deferred scope should not be bound directly before being converted to real scope',
        );
      default:
        throw new Error(`Scope ${scope} of identifier ${String(identifier)} is unrecognized`);
    }
    // @ts-ignore
    const bindingInstance = binding._binding;
    return bindingInstance;
  }

  /**
   * Provide a class as a dependency.
   * @param options Provider options.
   * @returns The binding instance if the provider is bound to the container, otherwise undefined.
   */
  public static provideClass<T>(options: ProvideAPIOptions<T>) {
    injectable()(options.value);
    return PrivateUtility.wildBind(options, ProviderType.Class);
  }

  /**
   * Provide a value as a dependency.
   * @param options Provider options.
   * @returns The binding instance if the provider is bound to the container, otherwise undefined.
   */
  public static provideValue<T>(options: Omit<ProvideAPIOptions<T>, 'scope'>) {
    return PrivateUtility.wildBind(options, ProviderType.Value);
  }

  /**
   * Get the dependency by the specified identifier.
   * @param id The identifier.
   * @param container The container to get the dependency from (default to root container).
   * @returns The dependency.
   * @throws If the dependency is not found or there are multiple dependencies with the same identifier.
   */
  public static getDependency<T>(id: DependencyIdentifier, container?: Container): T {
    const identifier = DIUtility.getResolvedIdentifier(id);
    return (container || ContainerAccessor.getRootContainer()).get<T>(identifier);
  }
}
