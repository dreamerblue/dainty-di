import { Container } from 'inversify';
import { PRIVATE_CONTAINER_KEYS } from './constants';

export type { Container } from 'inversify';

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
    return this._rootcontainer;
  }

  /**
   * Reset the global root container. All bindings will be removed.
   * @returns {void}
   */
  public static resetRootContainer(): void {
    this._rootcontainer.unbindAll();
    this._rootcontainer.bind(PRIVATE_CONTAINER_KEYS.Container).toConstantValue(_rootContainer);
  }
}
