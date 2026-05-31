import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    if (autocompleteRef.current) return; 

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: "br" }, 
        fields: ["formatted_address", "geometry"],
        types: ["address"],
      },
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      required={required}
      autoComplete="off"
    />
  );
}