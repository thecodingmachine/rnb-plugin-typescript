import Variables from './Variables'
import { DefaultVariables, Fonts, Gutters, Images, Layout } from './index'

export type ThemeVariables = {
  Colors: typeof Variables.Colors
  NavigationColors: typeof Variables.NavigationColors
  FontSize: typeof Variables.FontSize
  MetricsSizes: typeof Variables.MetricsSizes
}

export type Theme<F, G, I, L, C> = ThemeVariables & {
  Fonts: F
  Gutters: G
  Images: I
  Layout: L
  Common: C
  Variables?: Partial<ThemeVariables>
}

export type ThemeNavigationColors = {
  primary: string
  background: string
  card: string
  text: string
  border: string
  notification: string
}

export type ThemeNavigationTheme = {
  dark: boolean
  colors: ThemeNavigationColors
}

const fonts = Fonts(DefaultVariables)
const gutters = Gutters(DefaultVariables)
const images = Images(DefaultVariables)
const layout = Layout(DefaultVariables)

export type CommonParams<C> = ThemeVariables &
  Pick<
    Theme<typeof fonts, typeof gutters, typeof images, typeof layout, C>,
    'Layout' | 'Gutters' | 'Fonts' | 'Images'
  >
