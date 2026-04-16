import { Platform, View } from 'react-native';
import type { ReactNode } from 'react';

const WEB_MAX_WIDTH = 480;
const APP_MAX_WIDTH = 768;

type Props = {
  children: ReactNode;
  maxWidth?: number;
};

export function ResponsiveContainer({ children, maxWidth = APP_MAX_WIDTH }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1, width: '100%', maxWidth, alignSelf: 'center' }}>
      {children}
    </View>
  );
}

export { WEB_MAX_WIDTH, APP_MAX_WIDTH };
