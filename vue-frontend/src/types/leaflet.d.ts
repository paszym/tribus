import 'leaflet'

declare module 'leaflet' {
  interface MarkerOptions {
    isLite?: boolean
  }
}
