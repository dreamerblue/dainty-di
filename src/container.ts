import { Container } from 'inversify';
import { PRIVATE_CONTAINER_KEYS } from './constants';

export { Container } from 'inversify';

const _rootContainer = new Container({
  skipBaseClassChecks: true,
});

_rootContainer.bind(PRIVATE_CONTAINER_KEYS.Container).toConstantValue(_rootContainer);

/**
 * The container accessor which can access the global root container.
 */
export class ContainerAccessor {
  private static _rootcontainer: Container = _rootContainer;

  /**
   * Get the global root container.
   * @returns {Container} The root container.
   */
  public static getRootContainer(): Container {
    return ContainerAccessor._rootcontainer;
  }

  /**
   * Reset the global root container. All bindings will be removed.
   * @returns {void}
   */
  public static resetRootContainer(): void {
    ContainerAccessor._rootcontainer.unbindAll();
    ContainerAccessor._rootcontainer.bind(PRIVATE_CONTAINER_KEYS.Container).toConstantValue(_rootContainer);
  }
}
