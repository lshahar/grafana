import { useObservable } from 'react-use';

import { PluginExtension } from '@grafana/data';
import { AppPluginConfig, GetPluginExtensionsOptions, UsePluginExtensionsResult, config } from '@grafana/runtime';

import { getPluginExtensions } from './getPluginExtensions';
import { ReactivePluginExtensionsRegistry } from './reactivePluginExtensionRegistry';
import { preloadPlugins } from '../pluginPreloader';

export function createPluginExtensionsHook(extensionsRegistry: ReactivePluginExtensionsRegistry) {
  const observableRegistry = extensionsRegistry.asObservable();
  const preloadedAppPlugins: Record<string, 'loading' | 'loaded'> = {};
  const preloadedExtensionPoints: Record<string, boolean> = {};
  const cache: {
    id: string;
    extensions: Record<string, { context: GetPluginExtensionsOptions['context']; extensions: PluginExtension[] }>;
  } = {
    id: '',
    extensions: {},
  };

  async function preloadAppPluginsForExtensionPoint(extensionPointId: string) {
    const appPlugins = getAppPluginIdsForExtensionPoint(extensionPointId);
    const appPluginsToPreload = appPlugins.filter((app) => !preloadedAppPlugins[app.id]);

    markAppPluginsAsPreloading(appPluginsToPreload);
    await preloadPlugins(appPluginsToPreload, extensionsRegistry);
    markAppPluginsAsPreloaded(appPluginsToPreload);
    markExtensionPointAsPreloaded(extensionPointId);
  }

  function getAppPluginIdsForExtensionPoint(extensionPointId: string) {
    return Object.values(config.apps).filter((app) =>
      app.extensions?.some((extension) => extension.extensionPointId === extensionPointId)
    );
  }

  function markExtensionPointAsPreloaded(extensionPointId: string) {
    preloadedExtensionPoints[extensionPointId] = true;
  }

  function markAppPluginsAsPreloading(apps: AppPluginConfig[]) {
    apps.forEach((app) => {
      preloadedAppPlugins[app.id] = 'loading';
    });
  }

  function markAppPluginsAsPreloaded(apps: AppPluginConfig[]) {
    apps.forEach((app) => {
      preloadedAppPlugins[app.id] = 'loaded';
    });
  }

  return function usePluginExtensions(options: GetPluginExtensionsOptions): UsePluginExtensionsResult<PluginExtension> {
    preloadAppPluginsForExtensionPoint(options.extensionPointId);

    // if (options.extensionPointId === 'grafana/dashboard/panel/menu') {
    //   debugger;
    // }

    const registry = useObservable(observableRegistry);
    const isLoading = !preloadedExtensionPoints[options.extensionPointId];

    if (!registry) {
      return { extensions: [], isLoading: false };
    }

    if (registry.id !== cache.id) {
      cache.id = registry.id;
      cache.extensions = {};
    }

    // `getPluginExtensions` will return a new array of objects even if it is called with the same options, as it always constructing a frozen objects.
    // Due to this we are caching the result of `getPluginExtensions` to avoid unnecessary re-renders for components that are using this hook.
    // (NOTE: we are only checking referential equality of `context` object, so it is important to not mutate the object passed to this hook.)
    const key = `${options.extensionPointId}-${options.limitPerPlugin}`;
    if (cache.extensions[key] && cache.extensions[key].context === options.context) {
      return {
        extensions: cache.extensions[key].extensions,
        isLoading,
      };
    }

    const { extensions } = getPluginExtensions({ ...options, registry });

    cache.extensions[key] = {
      context: options.context,
      extensions,
    };

    return {
      extensions,
      isLoading,
    };
  };
}
