import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2, urlUtil } from '@grafana/data';
import { Badge, Button, Dropdown, Icon, LinkButton, Menu, Stack, Text, useStyles2 } from '@grafana/ui';

import { ConfigurationTrackerDrawer } from './ConfigurationTrackerDrawer';

export interface EssentialsProps {
  onClose: () => void;
}
export function Essentials({ onClose }: EssentialsProps) {
  return (
    <ConfigurationTrackerDrawer
      title="Essentials"
      subtitle="Complete basic recommended configuration to start using apps basic features"
      onClose={onClose}
    >
      <EssentialContent />
    </ConfigurationTrackerDrawer>
  );
}
interface StepButtonDto {
  type: 'openLink' | 'dropDown';
  url: string;
  label: string;
  options?: [{ label: string; value: string }];
  done?: boolean;
}
interface SectionDto {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    button: StepButtonDto;
  }>;
}
interface SectionsDto {
  sections: SectionDto[];
}
const ESSENTIAL_CONTENT: SectionsDto = {
  sections: [
    {
      title: 'Detect',
      description: 'Configure alerting',
      steps: [
        {
          title: 'Create alert rule',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/alerting/new',
            label: 'Create',
            done: isCreateAlertRuleDone(),
          },
        },
        {
          title: 'Update notification policy',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/alerting/notifications',
            label: 'Update',
          },
        },
        {
          title: 'Create OnCall contact point',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/alerting/notifications',
            label: 'View',
          },
        },
      ],
    },
    {
      title: 'Respond',
      description: 'Configure OnCall and Incident',
      steps: [
        {
          title: 'Initialize Incident plugin',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/a/grafana-incident-app/walkthrough/generate-key',
            label: 'Initialize',
          },
        },
        {
          title: 'Create OnCall integration to receive Alerts',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/alerting/notifications',
            label: 'View',
          },
        },
        {
          title: 'Create your ChatOps workspace to OnCall',
          description: 'tbd',
          button: {
            type: 'dropDown',
            url: '/alerting/notifications',
            label: 'Connect',
            options: [{ label: 'Option 1', value: '1' }],
          },
        },
        {
          title: 'Create your ChatOps workspace to Incident',
          description: 'tbd',
          button: {
            type: 'dropDown',
            url: '/a/grafana-incident-app/integrations/grate.slack',
            label: 'Connect',
          },
        },
        {
          title: 'Add ChatOps to your integration',
          description: 'tbd',
          button: {
            type: 'dropDown',
            url: '/alerting/notifications',
            label: 'Connect',
          },
        },
      ],
    },
    {
      title: 'Test your config',
      description: '',
      steps: [
        {
          title: 'Send OnCall demo alert',
          description: 'tbd',
          button: {
            type: 'dropDown',
            url: '/alerting/test',
            label: 'Select integration',
            options: [{ label: 'integration 1', value: '1' }],
          },
        },
        {
          title: 'Create Incident drill',
          description: 'tbd',
          button: {
            type: 'openLink',
            url: '/a/grafana-incident-app?declare=new&drill=1',
            label: 'Start drill',
          },
        },
      ],
    },
  ],
};

function EssentialContent() {
  return (
    <>
      {ESSENTIAL_CONTENT.sections.map((section: SectionDto) => (
        <Section key={section.title} section={section} />
      ))}
    </>
  );
}

function Section({ section }: { section: SectionDto }) {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles.wrapper}>
      <Text element="h4">{section.title}</Text>

      <Text color="secondary">{section.description}</Text>
      <Stack direction={'column'} gap={2}>
        {section.steps.map((step, index) => (
          <Step key={index} step={step} />
        ))}
      </Stack>
    </div>
  );
}

function Step({ step }: { step: SectionDto['steps'][0] }) {
  return (
    <Stack direction={'row'} justifyContent={'space-between'}>
      <Stack direction={'row'} alignItems="center">
        <Text variant="body">{step.title}</Text>
        <Icon name="question-circle" />
      </Stack>
      <StepButton {...step.button} />
    </Stack>
  );
}

function StepButton({ type, url, label, options, done = false }: StepButtonDto) {
  const urlToGo = urlUtil.renderUrl(url, {
    returnTo: location.pathname + location.search,
  });
  if (done) {
    return <Badge color="green" icon="check" text="Done" />;
  }
  switch (type) {
    case 'openLink':
      return (
        <LinkButton href={urlToGo} variant="secondary">
          {label}
        </LinkButton>
      );
    case 'dropDown':
      return (
        <Dropdown
          overlay={
            <Menu>
              {options?.map((option) => <Menu.Item label={option.label} onClick={() => {}} key={option.label} />)}
            </Menu>
          }
        >
          <Button variant="secondary" size="md">
            {label}
            <Icon name="angle-down" />
          </Button>
        </Dropdown>
      );
  }
}
const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css({
      margin: theme.spacing(2, 0),
      padding: theme.spacing(2),
      border: `1px solid ${theme.colors.border.medium}`,
      borderRadius: theme.shape.radius.default,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    }),
  };
};

function isCreateAlertRuleDone() {
  return true;
}
