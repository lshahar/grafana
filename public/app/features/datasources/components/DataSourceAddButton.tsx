import React from 'react';

import { config } from '@grafana/runtime';
import { LinkButton } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { Trans } from 'app/core/internationalization';
import { AccessControlAction } from 'app/types';

// @todo: replace barrel import path
import { useDataSourcesRoutes } from '../state/index';

export function DataSourceAddButton(): JSX.Element | null {
  const canCreateDataSource = contextSrv.hasPermission(AccessControlAction.DataSourcesCreate);
  const dataSourcesRoutes = useDataSourcesRoutes();

  return canCreateDataSource ? (
    <LinkButton icon="plus" href={config.appSubUrl + dataSourcesRoutes.New}>
      <Trans i18nKey="data-sources.datasource-add-button.label">Add new data source</Trans>
    </LinkButton>
  ) : null;
}
