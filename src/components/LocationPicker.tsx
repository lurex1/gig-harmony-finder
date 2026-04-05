/**
 * LocationPicker – converts a typed address to lat/lng using Places Autocomplete.
 *
 * Places API returns geometry.location directly → no Geocoding API needed.
 * The component hosts its own APIProvider so it works on any page.
 */
import { useEffect, useRef, useCallback } from 'react'
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

export interface LocationResult {
  lat: number
  lng: number
  address: string
}

interface InnerProps {
  value: string
  placeholder?: string
  onChange: (result: LocationResult) => void
  onAddressChange: (raw: string) => void
}

function AutocompleteInput({ value, placeholder, onChange, onAddressChange }: InnerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const places = useMapsLibrary('places')

  const handleSelect = useCallback(
    (ac: google.maps.places.Autocomplete) => {
      const place = ac.getPlace()
      if (!place.geometry?.location) return
      const result: LocationResult = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address ?? inputRef.current?.value ?? '',
      }
      if (inputRef.current) inputRef.current.value = result.address
      onChange(result)
    },
    [onChange]
  )

  useEffect(() => {
    if (!places || !inputRef.current) return

    const ac = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address'],
      // Bias toward Poland but allow any country
      componentRestrictions: undefined,
    })

    const listener = ac.addListener('place_changed', () => handleSelect(ac))

    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [places, handleSelect])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder ?? 'Wpisz adres lub nazwę miejsca…'}
        onChange={e => onAddressChange(e.target.value)}
        className="
          flex h-10 w-full rounded-md border border-input bg-background
          pl-9 pr-3 py-2 text-sm ring-offset-background
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
        "
      />
    </div>
  )
}

interface LocationPickerProps {
  value?: string
  placeholder?: string
  /** Called when user selects a suggestion — includes lat/lng */
  onSelect: (result: LocationResult) => void
  /** Called on every keystroke (before a place is selected) */
  onRawChange?: (address: string) => void
}

export function LocationPicker({ value = '', placeholder, onSelect, onRawChange }: LocationPickerProps) {
  return (
    <APIProvider apiKey={API_KEY} libraries={['places']}>
      <AutocompleteInput
        value={value}
        placeholder={placeholder}
        onChange={onSelect}
        onAddressChange={onRawChange ?? (() => {})}
      />
    </APIProvider>
  )
}
