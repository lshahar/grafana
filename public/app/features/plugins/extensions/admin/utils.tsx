import { PluginExtensionConfig, PluginExtensionPoints } from '@grafana/data';

import { PluginExtensionRegistry } from '../types';

import { ExtensionPointConfig } from './types';

// Gets persisted settings for an extension point
export function getExtensionPointSettings(extensionPointId: string) {}

// Updates settings for an extension point and persists them
export function setExtensionPointSettings(extensionPointId: string) {}

// Gets persisted settings for an extension
export function getExtensionSettings(id: string) {}

// Updates settings for an extension and persists them
export function setExtensionSettings(id: string) {}

// Gets settings for a plugin that registers extensions. (These settings are only about the plugins extensions)
export function getPluginSettings() {}

// Updates settings for a plugin that registers extensions. (These settings are only about the plugins extensions)
export function setPluginSettings() {}

// Gets settings for a plugin capability
export function getCapabilitySettings() {}

// Updates settings for a plugin capability
export function setCapabilitySettings() {}

// Gets the extensions that I have registered using the extensions explore tool
export function getMyExtensions() {}

// Update the extensions that I have registered using the extensions explore tool
export function setMyExtensions() {}

// Gets the capabilities that I have registered using the extensions explore tool
export function getMyCapabilities() {}

// Update the capabilities that I have registered using the extensions explore tool
export function setMyCapabilities() {}

// Gets the repl for the current user (the content of the REPL)
export function getRepl() {}

// Update the repl for the current user (the content of the REPL)
export function setRepl() {}

export function getCoreExtensionPoints(regsitry?: PluginExtensionRegistry): ExtensionPointConfig[] {
  const availableIds = Object.values(PluginExtensionPoints);
  const coreExtensionPoints = availableIds.map((id) => ({
    id,
    extensions: regsitry?.[id] || [],
  }));

  return coreExtensionPoints;
}

export function getPluginExtensionPoints(regsitry?: PluginExtensionRegistry): ExtensionPointConfig[] {
  if (!regsitry) {
    return [];
  }

  return Object.keys(regsitry)
    .filter((key) => key.startsWith('plugins/'))
    .map((key) => ({
      id: key,
      extensions: regsitry[key],
    }));
}

export function getPluginCapabilities(regsitry?: PluginExtensionRegistry): Record<string, ExtensionPointConfig[]> {
  const pluginCapabilities: Record<string, ExtensionPointConfig[]> = {};

  if (!regsitry) {
    return pluginCapabilities;
  }

  Object.keys(regsitry)
    .filter((key) => key.startsWith('capabilities/'))
    .forEach((key) => {
      const pluginId = key.split('/')[1];
      pluginCapabilities[pluginId] = pluginCapabilities[pluginId] || [];
      pluginCapabilities[pluginId].push({
        id: key,
        extensions: regsitry[key],
      });
    });

  return pluginCapabilities;
}

