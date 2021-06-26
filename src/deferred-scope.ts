import 'reflect-metadata';
import { ContainerAccessor } from './container';
import type { Container } from './container';
import { DEFAULT_PROVIDER_SCOPE, PRIVATE_CONTAINER_KEYS } from './constants';
import type { DependencyIdentifier, DeferredScopeProvider } from './typings';
import { DIUtility } from './utils';

export class DeferredScopeUtility {
  /**
   * Create a deferred scope sub container.
   *
   * All deferred scope providers will be bound to this sub container.
   * @param parentContainer The parent container (default to root container).
   * @returns The new deferred scope container.
   */
  public static createDeferredScopeContainer(parentContainer?: Container) {
    const parent = parentContainer ?? ContainerAccessor.getRootContainer();
    const deferredContainer = parent.createChild({
      defaultScope: DEFAULT_PROVIDER_SCOPE,
      skipBaseClassChecks: true,
    });
    const deferredScopeProviders: Map<DependencyIdentifier, DeferredScopeProvider[]> =
      parent.isBound(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders)
        ? parent.get(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders)
        : new Map();
    for (const providers of deferredScopeProviders.values()) {
      for (const { identifier, value, scope, type } of providers) {
        DIUtility.bindProvider(
          {
            identifier,
            value,
            scope,
            type,
          },
          deferredContainer,
        );
      }
    }
    return deferredContainer;
  }

  /**
   * Get deferred scope providers of specified identifier.
   * @param id Identifier.
   * @returns All matched deferred scope providers of specified identifier.
   */
  public static getDeferredScopeProvidersById(id: DependencyIdentifier) {
    const container = ContainerAccessor.getRootContainer();
    const resolvedIdentifier = DIUtility.getResolvedIdentifier(id);
    if (!container.isBound(PRIVATE_CONTAINER_KEYS.DeferredScopeProviders)) {
      return [];
    }
    const allProviders = container.get<Map<DependencyIdentifier, DeferredScopeProvider[]>>(
      PRIVATE_CONTAINER_KEYS.DeferredScopeProviders,
    );
    return allProviders.get(resolvedIdentifier) ?? [];
  }
}
