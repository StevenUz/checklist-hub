/// <reference types="nativewind" />

import "react-native-css-interop/types";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }
}
