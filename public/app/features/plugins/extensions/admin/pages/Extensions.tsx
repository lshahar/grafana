import React, { ReactElement, useState } from 'react';

import { IconName } from '@grafana/data';
import { TabsBar, TabContent, Tab } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { useSelector } from 'app/types';

import ExtensionSettings from '../components/ExtensionSettings';

export default function Extensions(): ReactElement | null {
  const navModel = useSelector((state) => getNavModel(state.navIndex, 'extensions'));
  const [activeTab, setActivetab] = useState('settings');
  const tabs = [
    { value: 'settings', label: 'Settings', icon: 'cog' },
    { value: 'explore', label: 'Explore', icon: 'bolt' },
  ];

  return (
    <Page navModel={navModel} subTitle={'Manage UI extensions.'}>
      <Page.Contents>
        <TabsBar>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              active={tab.value === activeTab}
              icon={tab.icon as IconName}
              onChangeTab={() => setActivetab(tab.value)}
            />
          ))}
        </TabsBar>
        <TabContent>
          {tabs[0].value === activeTab && <ExtensionSettings />}
          {tabs[1].value === activeTab && <div>Second tab content</div>}
        </TabContent>
      </Page.Contents>
    </Page>
  );
}
