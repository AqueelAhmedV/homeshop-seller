import { DefaultTheme } from 'react-native-paper'

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#000000',
    primary:'#50C878',
    secondary: '#414757',
    error: '#f13a59',
    primaryBg: "radial-gradient(circle, rgba(51,215,105,1) 4%, rgba(62,173,98,1) 67%)"
  },
}
