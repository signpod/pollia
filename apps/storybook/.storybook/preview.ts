import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Preview } from "@storybook/react";
import React from "react";
import "../src/globals.css";

const muiTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story): React.ReactElement =>
      React.createElement(
        ThemeProvider,
        { theme: muiTheme },
        React.createElement(Story as React.ComponentType),
      ),
  ],
};

export default preview;
