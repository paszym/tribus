import L from 'leaflet'
import type { Vehicle } from '@/models/vehicle'

const vehicleIconCache = new Map<string, L.DivIcon>()
const vehicleIconLiteCache = new Map<string, L.DivIcon>()

export function useIcons() {
  const stopIcon = L.divIcon({
    className: '',
    html: `
      <div style="
        width: 26px; height: 28px;
        background: #b9c5df; border: 2px solid #0b204a;
        border-radius: 20%; display: flex; align-items: center;
        justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.3); opacity: 0.83;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 602 752">
          <rect x="1" y="1" width="600" height="750" rx="30" ry="30" fill="#fff"/>
          <rect x=".5" y=".5" width="601" height="751" rx="30.5" ry="30.5" fill="none" stroke="#000"/>
          <rect x="7" y="7" width="588" height="738" rx="24" ry="24" fill="#039"/>
          <rect x="81" y="81" width="440" height="440" fill="#fff"/>
          <path d="M482.045,232.25H106.646l-3.771,40.991v68.319l88.815,6.832c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h136.81c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h55.979l5.336-6.832v-40.991l-17.08-68.319ZM164.362,290.321l-3.416,3.416h-44.407l-3.416-3.416,3.32-40.991,3.512-3.416h40.991l3.416,3.416v40.991ZM178.026,293.737l-6.832-3.416v-40.991l6.832-3.416h54.655l6.832,3.416v40.991l-6.832,3.416h-54.655ZM307.832,290.321l-6.832,3.416h-47.823l-6.832-3.416v-40.991l6.832-3.416h47.823l6.832,3.416v40.991ZM335.159,293.737h-13.664v-47.823h13.664v47.823ZM355.655,293.737h-13.664v-47.823h13.664v47.823ZM437.638,290.321l-6.832,3.416h-61.487l-6.832-3.416v-40.991l6.832-3.416h61.487l6.832,3.416v40.991ZM478.629,314.233h-27.328l-6.832-6.832v-58.071l6.832-3.416h27.116l13.705,54.826-13.493,13.493Z" fill-rule="evenodd"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -10],
  })

  const stopIconLite = L.divIcon({
    className: '',
    html: `<div style="
      width: 12px; height: 12px; border-radius: 50%;
      background: #b8860b; border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -6],
  })

  const TRAM_PATH = `M23.63,15h1.31L22.73,7.67l-.07-.24H18A3.72,3.72,0,0,1,18,0H62.33a3.72,3.72,0,0,1,0,7.43H57.67l-.06.24L55.39,15h.5c5.29,0,11.71,6.85,12.79,12L80.21,81.93c1.09,5.17-5.65,12.64-10.94,12.64H17.48C5,94.57-2.35,92,.69,76.93l10-49.39c1-5.2,7.7-12.52,13-12.52ZM30.4,7.43,32.69,15h15l2.29-7.59ZM8.56,122.88l8.93-20.72h11l-2.95,6.65H55.14l-3-6.84H62.93l8.84,20.53H61.12L58,115.66H22.34l-2.95,7.22Zm17.33-49A7.14,7.14,0,1,1,18.75,81a7.13,7.13,0,0,1,7.14-7.13Zm7.58-52.14H46.33a.6.6,0,0,1,.6.6v6a.6.6,0,0,1-.6.6H33.47a.6.6,0,0,1-.6-.6v-6a.6.6,0,0,1,.6-.6ZM9.35,67.23l7-31.43H63.87l6.58,31.43Zm44.56,6.65A7.14,7.14,0,1,1,46.78,81a7.13,7.13,0,0,1,7.13-7.13Z`

  const BUS_PATH = `M105.5,104.64H99.44v9.53A6.81,6.81,0,0,1,92.65,121h-4a6.82,6.82,0,0,1-6.79-6.79v-9.53H40.82v9.53A6.82,6.82,0,0,1,34,121H30a6.81,6.81,0,0,1-6.78-6.79v-9.53H18.1c-3.54-.06-5.24-2-5.5-5.29V21.52c-2,.2-2.95.66-3.43,1.68V45.45H4.87A4.88,4.88,0,0,1,0,40.58V27.44a4.89,4.89,0,0,1,4.73-4.87c.41-3.82,2.06-4.93,8-5.21Q14,7.36,26.36,2.57C44.09-.68,77.73-1,96.52,2.57c8.28,3.19,12.8,8.12,13.62,14.79,6,.3,7.61,1.42,8,5.21a4.89,4.89,0,0,1,4.73,4.87V40.58A4.88,4.88,0,0,1,118,45.45h-4.3V23.14c-.48-1-1.47-1.44-3.43-1.63V98.59c0,4.46-1.44,6-4.78,6ZM16.13,84.87l.28-6.69c.16-1.17.78-1.69,1.89-1.5A129.9,129.9,0,0,1,34.39,86.85c1.09.72.66,2.11-.78,1.85L18.48,87.6a2.74,2.74,0,0,1-2.35-2.73ZM52,93.45H71.3a.94.94,0,0,1,.94.94v3.24a.94.94,0,0,1-.94.94H52a.94.94,0,0,1-.94-.94V94.39a.94.94,0,0,1,.94-.94Zm50.35,0A2.51,2.51,0,1,1,99.82,96a2.51,2.51,0,0,1,2.5-2.51Zm-82.65,0A2.51,2.51,0,1,1,17.16,96a2.51,2.51,0,0,1,2.51-2.51Zm87.08-8.63-.28-6.69c-.16-1.17-.78-1.69-1.88-1.5a129.28,129.28,0,0,0-16.1,10.17c-1.09.72-.66,2.11.78,1.85l15.13-1.1a2.73,2.73,0,0,0,2.35-2.73ZM48.19,6.11h26.5a1.63,1.63,0,0,1,1.62,1.62V12a1.63,1.63,0,0,1-1.62,1.62H48.19A1.63,1.63,0,0,1,46.57,12V7.73a1.63,1.63,0,0,1,1.62-1.62ZM20.32,18.91H102.2a2,2,0,0,1,2,2V64.09c0,1.08-.89,1.69-2,2-28.09,8.53-53.8,8.18-81.88,0-1.11-.3-2-.9-2-2V20.89a2,2,0,0,1,2-2Z`

  function getVehicleIcon(vehicle: Vehicle): L.DivIcon {
    const key = `${vehicle.type}-${vehicle.routeName}`
    if (vehicleIconCache.has(key)) return vehicleIconCache.get(key)!

    const isTram = vehicle.type === 'TRAM'
    const colors = isTram
      ? { bg: '#fadbd8', border: '#c0392b', text: '#922b21', icon: '#c0392b' }
      : { bg: '#d6eaf8', border: '#1a5276', text: '#1a5276', icon: '#1a5276' }

    const html = `
      <div style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 6px 3px 5px; background: ${colors.bg};
        border: 1.5px solid ${colors.border}; border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.25); white-space: nowrap;
      ">
        <svg viewBox="${isTram ? '0 0 80.33 122.88' : '0 0 122.88 120.96'}"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 14px; height: 14px; flex-shrink: 0; display: block;">
          <path d="${isTram ? TRAM_PATH : BUS_PATH}" fill="${colors.icon}" fill-rule="evenodd"/>
        </svg>
        <span style="font-size: 11px; font-weight: 700; color: ${colors.text}; line-height: 1; white-space: nowrap;">
          ${vehicle.routeName}
        </span>
      </div>
    `

    const width = 16 + vehicle.routeName.toString().length * 7 + 10

    const icon = L.divIcon({
      className: '',
      html,
      iconSize: [width, 22],
      iconAnchor: [width / 2 + 2, 11],
    })
    vehicleIconCache.set(key, icon)
    return icon
  }

  function getVehicleIconLite(vehicle: Vehicle): L.DivIcon {
    const key = vehicle.type
    if (vehicleIconLiteCache.has(key)) return vehicleIconLiteCache.get(key)!

    const isTram = vehicle.type === 'TRAM'
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 14px; height: 14px; border-radius: 50%;
        background: ${isTram ? '#cd6155' : '#497896'};
        border: 0.1px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.35);
      "></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    })
    vehicleIconLiteCache.set(key, icon)
    return icon
  }

  return {
    stopIcon,
    stopIconLite,
    getVehicleIcon,
    getVehicleIconLite,
    TRAM_PATH,
    BUS_PATH,
  }
}
