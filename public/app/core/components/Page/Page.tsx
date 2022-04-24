// Libraries
import { css, cx } from '@emotion/css';
import React, { FC, HTMLAttributes, useEffect } from 'react';

import { GrafanaTheme2, NavModel } from '@grafana/data';
import { CustomScrollbar, PageToolbar, useStyles2 } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { getTitleFromNavModel } from 'app/core/selectors/navModel';

// Components
import { Branding } from '../Branding/Branding';
import { Footer } from '../Footer/Footer';
import { ToggleMegaMenu } from '../NavBar/Next/MegaMenu';
import PageHeader from '../PageHeader/PageHeader';

import { PageContents } from './PageContents';
import { PageSubNav } from './PageSubNav';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  navModel?: NavModel;
}

export interface PageType extends FC<Props> {
  Header: typeof PageHeader;
  Contents: typeof PageContents;
}

export const Page: PageType = ({ navModel, children, className, ...otherProps }) => {
  const styles = useStyles2(getStyles);

  useEffect(() => {
    if (navModel) {
      const title = getTitleFromNavModel(navModel);
      document.title = title ? `${title} - ${Branding.AppTitle}` : Branding.AppTitle;
    } else {
      document.title = Branding.AppTitle;
    }
  }, [navModel]);

  if (!navModel) {
    return null;
  }

  return (
    <div {...otherProps} className={cx(styles.wrapper, className)}>
      <PageToolbar navModel={navModel.node} onOpenMenu={() => appEvents.publish(new ToggleMegaMenu())} />
      <PagePanes navModel={navModel}>{children}</PagePanes>
    </div>
  );
};

export interface PagePanesProps {
  navModel: NavModel;
  children: React.ReactNode;
}

export function PagePanes({ navModel, children }: PagePanesProps) {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.panes}>
      <PageSubNav model={navModel} />
      <div className={styles.pageContent}>
        <CustomScrollbar autoHeightMin={'100%'}>
          <div className={styles.pageInner}>
            <h1 className={styles.pageTitle}>{navModel.node.text}</h1>
            {children}
          </div>
          <Footer />
        </CustomScrollbar>
      </div>
    </div>
  );
}

Page.Header = PageHeader;
Page.Contents = PageContents;

export default Page;

const getStyles = (theme: GrafanaTheme2) => {
  const shadow = theme.isDark
    ? `0 0.6px 1.5px -1px rgb(0 0 0),0 2px 4px -1px rgb(0 0 0 / 40%),0 5px 10px -1px rgb(0 0 0 / 23%)`
    : '0 0.6px 1.5px -1px rgb(0 0 0 / 8%),0 2px 4px rgb(0 0 0 / 6%),0 5px 10px -1px rgb(0 0 0 / 5%)';

  return {
    wrapper: css`
      height: 100%;
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      min-height: 0;
    `,
    panes: css({
      display: 'flex',
      height: '100%',
      width: '100%',
      flexGrow: 1,
      minHeight: 0,
    }),
    pageTitle: css({
      marginBottom: theme.spacing(3),
    }),
    pageContent: css({
      flexGrow: 1,
      background: theme.colors.background.primary,
      boxShadow: shadow,
    }),
    pageInner: css({
      padding: theme.spacing(3),
      marginBottom: theme.spacing(2),
      minHeight: '100% - 80px',
    }),
  };
};
