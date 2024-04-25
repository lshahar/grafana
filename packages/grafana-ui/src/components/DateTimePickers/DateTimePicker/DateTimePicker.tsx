import { css, cx } from '@emotion/css';
import { autoUpdate, flip, shift, useFloating } from '@floating-ui/react';
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useOverlay } from '@react-aria/overlays';
import React, { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import { useMedia } from 'react-use';

import {
  dateTimeFormat,
  DateTime,
  dateTime,
  GrafanaTheme2,
  isDateTime,
  dateTimeForTimeZone,
  getTimeZone,
} from '@grafana/data';
import { Components } from '@grafana/e2e-selectors';

import { useStyles2, useTheme2 } from '../../../themes';
import { Button } from '../../Button/Button';
import { InlineField } from '../../Forms/InlineField';
import { Icon } from '../../Icon/Icon';
import { Input } from '../../Input/Input';
import { Stack } from '../../Layout/Stack/Stack';
import { getModalStyles } from '../../Modal/getModalStyles';
import { Portal } from '../../Portal/Portal';
import { TimeOfDayPicker, POPUP_CLASS_NAME } from '../TimeOfDayPicker';
import { getBodyStyles } from '../TimeRangePicker/CalendarBody';
import { isValid } from '../utils';
import { adjustDateForReactCalendar } from '../utils/adjustDateForReactCalendar';

export interface Props {
  /** Input date for the component */
  date?: DateTime;
  /** Callback for returning the selected date */
  onChange: (date: DateTime) => void;
  /** label for the input field */
  label?: ReactNode;
  /** Set the latest selectable date */
  maxDate?: Date;
  /** Set the minimum selectable date */
  minDate?: Date;
  /** Display seconds on the time picker */
  showSeconds?: boolean;
  /** Set the hours that can't be selected */
  disabledHours?: () => number[];
  /** Set the minutes that can't be selected */
  disabledMinutes?: () => number[];
  /** Set the seconds that can't be selected */
  disabledSeconds?: () => number[];
}

export const DateTimePicker = ({
  date,
  maxDate,
  minDate,
  label,
  onChange,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  showSeconds = true,
}: Props) => {
  const [isOpen, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const { overlayProps, underlayProps } = useOverlay(
    {
      onClose: () => setOpen(false),
      isDismissable: true,
      isOpen,
      shouldCloseOnInteractOutside: (element) => {
        const popupElement = document.getElementsByClassName(POPUP_CLASS_NAME)[0];
        return !(popupElement && popupElement.contains(element));
      },
    },
    ref
  );
  const { dialogProps } = useDialog({}, ref);

  const theme = useTheme2();
  const { modalBackdrop } = useStyles2(getModalStyles);
  const isFullscreen = useMedia(`(min-width: ${theme.breakpoints.values.lg}px)`);
  const styles = useStyles2(getStyles);

  // the order of middleware is important!
  // see https://floating-ui.com/docs/arrow#order
  const middleware = [
    flip({
      // see https://floating-ui.com/docs/flip#combining-with-shift
      crossAxis: false,
      boundary: document.body,
    }),
    shift(),
  ];

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: 'bottom-start',
    onOpenChange: setOpen,
    middleware,
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  });

  const onApply = useCallback(
    (date: DateTime) => {
      setOpen(false);
      onChange(date);
    },
    [onChange]
  );

  const onOpen = useCallback(
    (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setOpen(true);
    },
    [setOpen]
  );

  return (
    <div data-testid="date-time-picker" style={{ position: 'relative' }}>
      <DateTimeInput
        date={date}
        onChange={onChange}
        isFullscreen={isFullscreen}
        onOpen={onOpen}
        label={label}
        ref={refs.setReference}
        showSeconds={showSeconds}
      />
      {isOpen ? (
        isFullscreen ? (
          <Portal>
            <FocusScope contain autoFocus restoreFocus>
              <div ref={ref} {...overlayProps} {...dialogProps}>
                <DateTimeCalendar
                  date={date}
                  onChange={onApply}
                  isFullscreen={true}
                  onClose={() => setOpen(false)}
                  maxDate={maxDate}
                  minDate={minDate}
                  ref={refs.setFloating}
                  style={floatingStyles}
                  showSeconds={showSeconds}
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  disabledSeconds={disabledSeconds}
                />
              </div>
            </FocusScope>
          </Portal>
        ) : (
          <Portal>
            <div className={modalBackdrop} {...underlayProps} />
            <FocusScope contain autoFocus restoreFocus>
              <div ref={ref} {...overlayProps} {...dialogProps}>
                <div className={styles.modal}>
                  <DateTimeCalendar
                    date={date}
                    maxDate={maxDate}
                    minDate={minDate}
                    onChange={onApply}
                    isFullscreen={false}
                    onClose={() => setOpen(false)}
                    showSeconds={showSeconds}
                    disabledHours={disabledHours}
                    disabledMinutes={disabledMinutes}
                    disabledSeconds={disabledSeconds}
                  />
                </div>
              </div>
            </FocusScope>
          </Portal>
        )
      ) : null}
    </div>
  );
};

interface DateTimeCalendarProps {
  date?: DateTime;
  onChange: (date: DateTime) => void;
  onClose: () => void;
  isFullscreen: boolean;
  maxDate?: Date;
  minDate?: Date;
  style?: React.CSSProperties;
  showSeconds?: boolean;
  disabledHours?: () => number[];
  disabledMinutes?: () => number[];
  disabledSeconds?: () => number[];
}

interface InputProps {
  label?: ReactNode;
  date?: DateTime;
  isFullscreen: boolean;
  onChange: (date: DateTime) => void;
  onOpen: (event: FormEvent<HTMLElement>) => void;
  showSeconds?: boolean;
}

type InputState = {
  value: string;
  invalid: boolean;
};

const DateTimeInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ date, label, onChange, onOpen, showSeconds = true }, ref) => {
    const format = showSeconds ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
    const [internalDate, setInternalDate] = useState<InputState>(() => {
      return { value: date ? dateTimeFormat(date) : dateTimeFormat(dateTime()), invalid: false };
    });

    useEffect(() => {
      if (date) {
        setInternalDate({
          invalid: !isValid(dateTimeFormat(date, { format })),
          value: isDateTime(date) ? dateTimeFormat(date, { format }) : date,
        });
      }
    }, [date, format]);

    const onChangeDate = useCallback((event: FormEvent<HTMLInputElement>) => {
      const isInvalid = !isValid(event.currentTarget.value);
      setInternalDate({
        value: event.currentTarget.value,
        invalid: isInvalid,
      });
    }, []);

    const onBlur = useCallback(() => {
      if (!internalDate.invalid) {
        const date = dateTimeForTimeZone(getTimeZone(), internalDate.value);
        onChange(date);
      }
    }, [internalDate, onChange]);

    const icon = <Button aria-label="Time picker" icon="calendar-alt" variant="secondary" onClick={onOpen} />;
    return (
      <InlineField
        label={label}
        invalid={!!(internalDate.value && internalDate.invalid)}
        className={css({
          marginBottom: 0,
        })}
      >
        <Input
          onChange={onChangeDate}
          addonAfter={icon}
          value={internalDate.value}
          onBlur={onBlur}
          data-testid={Components.DateTimePicker.input}
          placeholder="Select date/time"
          ref={ref}
        />
      </InlineField>
    );
  }
);

DateTimeInput.displayName = 'DateTimeInput';

const DateTimeCalendar = React.forwardRef<HTMLDivElement, DateTimeCalendarProps>(
  (
    {
      date,
      onClose,
      onChange,
      isFullscreen,
      maxDate,
      minDate,
      style,
      showSeconds = true,
      disabledHours,
      disabledMinutes,
      disabledSeconds,
    },
    ref
  ) => {
    const calendarStyles = useStyles2(getBodyStyles);
    const styles = useStyles2(getStyles);

    // need to keep these 2 separate in state since react-calendar doesn't support different timezones
    const [timeOfDayDateTime, setTimeOfDayDateTime] = useState(() => {
      if (date && date.isValid()) {
        return dateTimeForTimeZone(getTimeZone(), date.toDate());
      }

      return dateTimeForTimeZone(getTimeZone(), new Date());
    });
    const [reactCalendarDate, setReactCalendarDate] = useState<Date>(() => {
      if (date && date.isValid()) {
        return adjustDateForReactCalendar(date.toDate(), getTimeZone());
      }

      return new Date();
    });

    const onChangeDate = useCallback<NonNullable<React.ComponentProps<typeof Calendar>['onChange']>>((date) => {
      if (date && !Array.isArray(date)) {
        setReactCalendarDate(date);
      }
    }, []);

    const onChangeTime = useCallback((date: DateTime) => {
      setTimeOfDayDateTime(date);
    }, []);

    // here we need to stitch the 2 date objects back together
    const handleApply = () => {
      // we take the date that's set by TimeOfDayPicker
      const newDate = new Date(timeOfDayDateTime.toDate());

      // and apply the date/month/year set by react-calendar
      newDate.setDate(reactCalendarDate.getDate());
      newDate.setMonth(reactCalendarDate.getMonth());
      newDate.setFullYear(reactCalendarDate.getFullYear());

      onChange(dateTime(newDate));
    };

    return (
      <div className={cx(styles.container, { [styles.fullScreen]: isFullscreen })} style={style} ref={ref}>
        <Calendar
          next2Label={null}
          prev2Label={null}
          value={reactCalendarDate}
          nextLabel={<Icon name="angle-right" />}
          nextAriaLabel="Next month"
          prevLabel={<Icon name="angle-left" />}
          prevAriaLabel="Previous month"
          onChange={onChangeDate}
          locale="en"
          className={calendarStyles.body}
          tileClassName={calendarStyles.title}
          maxDate={maxDate}
          minDate={minDate}
        />
        <div className={styles.time}>
          <TimeOfDayPicker
            showSeconds={showSeconds}
            onChange={onChangeTime}
            value={timeOfDayDateTime}
            disabledHours={disabledHours}
            disabledMinutes={disabledMinutes}
            disabledSeconds={disabledSeconds}
          />
        </div>
        <Stack>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </div>
    );
  }
);

DateTimeCalendar.displayName = 'DateTimeCalendar';

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    padding: theme.spacing(1),
    border: `1px ${theme.colors.border.weak} solid`,
    borderRadius: theme.shape.radius.default,
    backgroundColor: theme.colors.background.primary,
    zIndex: theme.zIndex.modal,
  }),
  fullScreen: css({
    position: 'absolute',
  }),
  time: css({
    marginBottom: theme.spacing(2),
  }),
  modal: css({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: theme.zIndex.modal,
    maxWidth: '280px',
  }),
});
