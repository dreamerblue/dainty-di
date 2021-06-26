import { ProviderScope } from './enums';

export const PRIVATE_CONTAINER_KEYS = {
  Container: Symbol('@dainty-di.ContainerKeys.Container'),
  DeferredScopeProviders: Symbol('@dainty-di.ContainerKeys.DeferredScopeProviders'),
};

export const DEFAULT_PROVIDER_SCOPE = ProviderScope.Singleton;
