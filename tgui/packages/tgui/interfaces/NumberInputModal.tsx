import { isEscape, KEY } from 'common/keys';
import { useState } from 'react';
import { useBackend } from 'tgui/backend';
import { Box, Button, RestrictedInput, Section, Stack } from 'tgui/components';
import { Window } from 'tgui/layouts';

import { InputButtons } from './common/InputButtons';
import { Loader } from './common/Loader';

type NumberInputData = {
  init_value: number;
  large_buttons: boolean;
  max_value: number | null;
  message: string;
  min_value: number | null;
  timeout: number;
  title: string;
  round_value: boolean;
};

export const NumberInputModal = (props) => {
  const { act, data } = useBackend<NumberInputData>();
  const { init_value, large_buttons, message = '', timeout, title } = data;
  const [input, setInput] = useState(init_value);

  const setValue = (value: number) => {
    if (value === input) {
      return;
    }
    setInput(value);
  };

  // Dynamically changes the window height based on the message.
  const windowHeight =
    140 +
    (message.length > 30 ? Math.ceil(message.length / 3) : 0) +
    (message.length && large_buttons ? 5 : 0);

  return (
    <Window title={title} width={270} height={windowHeight}>
      {timeout && <Loader value={timeout} />}
      <Window.Content
        onKeyDown={(event) => {
          if (event.key === KEY.Enter) {
            act('submit', { entry: input });
          }
          if (isEscape(event.key)) {
            act('cancel');
          }
        }}
      >
        <Section fill>
          <Stack fill vertical>
            <Stack.Item grow>
              <Box color="label">{message}</Box>
            </Stack.Item>
            <Stack.Item>
              <InputArea
                input={input}
                onClick={setValue}
                onChange={setValue}
                onBlur={setValue}
              />
            </Stack.Item>
            <Stack.Item>
              <InputButtons input={input} />
            </Stack.Item>
          </Stack>
        </Section>
      </Window.Content>
    </Window>
  );
};

/** Gets the user input and invalidates if there's a constraint. */
const InputArea = (props) => {
  const { act, data } = useBackend<NumberInputData>();
  const { min_value, max_value, init_value, round_value } = data;
  const { input, onClick, onChange, onBlur } = props;

  return (
    <Stack fill>
      <Stack.Item>
        <Button
          disabled={input === min_value || min_value === -Infinity}
          icon={min_value === -Infinity ? 'infinity' : 'angle-double-left'}
          onClick={() => onClick(min_value)}
          tooltip={min_value ? `Min (${min_value})` : 'Min'}
        />
      </Stack.Item>
      <Stack.Item grow>
        <RestrictedInput
          autoFocus
          autoSelect
          fluid
          allowFloats={!round_value}
          minValue={min_value}
          maxValue={max_value}
          onChange={(_, value) => onChange(value)}
          onBlur={(_, value) => onBlur(value)}
          onEnter={(_, value) => act('submit', { entry: value })}
          value={input}
        />
      </Stack.Item>
      <Stack.Item>
        <Button
          disabled={input === max_value || max_value === Infinity}
          icon={max_value === Infinity ? 'infinity' : 'angle-double-right'}
          onClick={() => onClick(max_value)}
          tooltip={max_value ? `Max (${max_value})` : 'Max'}
        />
      </Stack.Item>
      <Stack.Item>
        <Button
          disabled={input === init_value}
          icon="redo"
          onClick={() => onClick(init_value)}
          tooltip={init_value ? `Reset (${init_value})` : 'Reset'}
        />
      </Stack.Item>
    </Stack>
  );
};
