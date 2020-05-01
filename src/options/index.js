import {
  Paper,
  Typography,
  Grid,
  Slider,
  Input,
  InputAdornment,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import HourglassEmpty from "@material-ui/icons/HourglassEmpty";
import KeyMap from "@blainelewis1/keymap";

import { CHROME_COMMAND_HIERARCHY } from "../CommandHierarchies";

import styled from "styled-components";
import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash-es";
import defaultConfig from "../defaultConfig";

import KeyboardChooser from "./KeyboardChooser";

let Container = styled(Paper)`
  margin: auto;
  width: 1100px;
  padding: 30px;
`;

let pushUpdate = debounce((config) => chrome.storage.sync.set({ config }), 250);

export default () => {
  let [config, setConfig] = useState(undefined);

  let updateConfig = useCallback((currentConfig, newValues) => {
    setConfig({ ...currentConfig, ...newValues });
    pushUpdate({ ...currentConfig, ...newValues });
  }, []);

  // Load all of the configs.
  useEffect(
    () =>
      chrome.storage.sync.get("config", ({ config = undefined }) => {
        if (!config) {
          updateConfig(defaultConfig, {});
        } else {
          setConfig(config);
        }
      }),
    [updateConfig]
  );

  return (
    <Container>
      <Typography variant="h1">KeyMap Options</Typography>
      {!config && <CircularProgress />}
      {config && (
        <>
          <DelayControl
            onChange={(delay) => updateConfig(config, { delay })}
            delay={config.delay}
          />
          <AlwaysDisplayControl
            onChange={(disableAlwaysKeys) =>
              updateConfig(config, { disableAlwaysKeys })
            }
            disableAlwaysKeys={config.disableAlwaysKeys}
          />
          <KeyboardChooser
            layoutName={config.layoutName}
            onChange={(layoutName) => {
              updateConfig(config, { layoutName });
            }}
          />
          <div style={{ height: "300px" }}></div>
        </>
      )}

      <KeyMap
        {...config}
        onCommand={() => {}}
        commandHierarchy={CHROME_COMMAND_HIERARCHY}
      />
    </Container>
  );
};

const AlwaysDisplayControl = ({ disableAlwaysKeys, onChange }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={!disableAlwaysKeys}
        onChange={() => onChange(!disableAlwaysKeys)}
      />
    }
    label="Disable persistent key display."
  />
);

const DelayControl = ({ onChange, delay }) => {
  // const [value, setValue] = React.useState(0);
  const max = 2200;
  const min = 0;

  const handleSliderChange = (event, newValue) => {
    onChange(newValue);
  };

  const handleInputChange = (event) => {
    onChange(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (delay < min) {
      onChange(min);
    } else if (delay > max) {
      onChange(max);
    }
  };

  return (
    <>
      <Typography variant={"h4"} id="input-slider" gutterBottom>
        Delay
      </Typography>
      <Typography variant={"p"} id="input-slider" gutterBottom>
        There is a slight delay before displaying the KeyMap. You can control
        the amount of time before it displays.
      </Typography>
      <Grid container spacing={4} alignItems="center">
        <Grid item>
          <HourglassEmpty />
        </Grid>
        <Grid item xs>
          <Slider
            step={1}
            min={min}
            max={max}
            marks={[
              { value: 0, label: "No delay" },
              { value: 200, label: "200ms" },
              { value: 333, label: "333ms" },
              { value: 500, label: "500ms" },
              { value: 1000, label: "1 second" },
              { value: 2000, label: "2 seconds" },
            ]}
            value={typeof delay === "number" ? delay : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        {/* {
              "0": 0,
              "200": 200,
              "333": 333,
              "500": 500,
              "1000": 1000,
              "2000": 2000,
            } */}
        <Grid item>
          <Input
            value={delay}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 50,
              min,
              max,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
            endAdornment={<InputAdornment position="end">ms</InputAdornment>}
          />
        </Grid>
      </Grid>
    </>
  );
};
