import React from "react";

import { bottomRows, Row } from "@blainelewis1/keymap";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@material-ui/core";

import { Typography } from "@material-ui/core";

export default class KeyboardChooser extends React.Component {
  render() {
    return (
      <>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <Typography variant="h4">Keyboard Layout</Typography>
          </FormLabel>

          <RadioGroup
            aria-label="gender"
            name="gender1"
            value={this.props.layoutName}
            onChange={(e) => this.props.onChange(e.target.value)}
          >
            {Object.entries(bottomRows).map((entry) => (
              <FormControlLabel
                value={entry[0]}
                key={entry[0]}
                control={<Radio />}
                label={
                  <div
                    style={{ marginBottom: "30px" }}
                    className={`keymap--keymap active--keymap ${entry[0]}`}
                  >
                    <Row
                      row={entry[1]}
                      onKeyClick={() => {}}
                      commandsAvailable={{}}
                      modifiersPressed={{}}
                    />
                  </div>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
      </>
    );
  }
}
