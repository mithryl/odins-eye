"use client";

import { useCallback } from "react";
import { StepProps } from "@/lib/types";
import {
  Label,
  TextInput,
  RadioGroup,
  FieldGroup,
  Hint,
} from "@/components/ui/FormField";
import Autocomplete from "@/components/ui/Autocomplete";
import { COUNTRIES } from "@/lib/countries";

function filterCountries(query: string): string[] {
  const q = query.toLowerCase();
  return COUNTRIES.filter((c) => c.toLowerCase().startsWith(q)).slice(0, 8);
}

async function searchCities(
  query: string,
  country: string,
  state: string
): Promise<string[]> {
  if (query.length < 2) return [];
  // Build search query with state context for disambiguation
  const parts = [query, state, country].filter(Boolean);
  const searchQuery = parts.join(", ");
  const countryParam = country
    ? `&countrycodes=${countryToCode(country)}`
    : "";
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&featuretype=city${countryParam}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OdinsEye/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set<string>();
    return data
      .map((r: { display_name: string }) => {
        // Show "City, State" for disambiguation
        const parts = r.display_name.split(",").map((s: string) => s.trim());
        // Typically: City, County, State, Country
        if (parts.length >= 3) {
          return `${parts[0]}, ${parts[parts.length - 2]}`;
        }
        return parts[0];
      })
      .filter((name: string) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  } catch {
    return [];
  }
}

function countryToCode(country: string): string {
  const map: Record<string, string> = {
    "United States": "us", "United Kingdom": "gb", "Canada": "ca",
    "Australia": "au", "Germany": "de", "France": "fr", "Italy": "it",
    "Spain": "es", "Mexico": "mx", "Brazil": "br", "India": "in",
    "China": "cn", "Japan": "jp", "South Korea": "kr", "Russia": "ru",
    "Netherlands": "nl", "Belgium": "be", "Switzerland": "ch",
    "Sweden": "se", "Norway": "no", "Denmark": "dk", "Finland": "fi",
    "Ireland": "ie", "Poland": "pl", "Portugal": "pt", "Austria": "at",
    "New Zealand": "nz", "South Africa": "za", "Argentina": "ar",
    "Colombia": "co", "Chile": "cl", "Peru": "pe", "Philippines": "ph",
    "Indonesia": "id", "Thailand": "th", "Vietnam": "vn", "Turkey": "tr",
    "Israel": "il", "Egypt": "eg", "Nigeria": "ng", "Kenya": "ke",
    "Ukraine": "ua", "Czech Republic": "cz", "Romania": "ro",
    "Hungary": "hu", "Greece": "gr", "Croatia": "hr", "Singapore": "sg",
    "Malaysia": "my", "Taiwan": "tw", "Pakistan": "pk",
    "Saudi Arabia": "sa", "United Arab Emirates": "ae",
  };
  return map[country] || "";
}

export default function BirthDataStep({ data, updateData }: StepProps) {
  const getCitySuggestions = useCallback(
    (query: string) => searchCities(query, data.birthCountry, data.birthState),
    [data.birthCountry, data.birthState]
  );

  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label htmlFor="firstName">What should we call you?</Label>
        <TextInput
          id="firstName"
          value={data.firstName}
          onChange={(v) => updateData({ firstName: v })}
          placeholder="Your first name"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="birthDate">When were you born?</Label>
        <TextInput
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(v) => updateData({ birthDate: v })}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Do you know your birth time?</Label>
        <RadioGroup
          id="birthTimePrecision"
          value={data.birthTimePrecision}
          onChange={(v) =>
            updateData({
              birthTimePrecision: v as "exact" | "approximate" | "unknown",
              birthTimeExact: "",
              birthTimeApproximate: "",
            })
          }
          options={[
            { value: "exact", label: "I know the exact time" },
            { value: "approximate", label: "Approximately" },
            { value: "unknown", label: "I don't know" },
          ]}
        />
        <Hint>
          Birth time determines your rising sign and house placements. The more
          precise, the deeper the reading.
        </Hint>
      </FieldGroup>

      {data.birthTimePrecision === "exact" && (
        <FieldGroup>
          <Label htmlFor="birthTimeExact">Exact birth time</Label>
          <TextInput
            id="birthTimeExact"
            type="time"
            value={data.birthTimeExact}
            onChange={(v) => updateData({ birthTimeExact: v })}
          />
          <Hint>Check your birth certificate if you&apos;re unsure.</Hint>
        </FieldGroup>
      )}

      {data.birthTimePrecision === "approximate" && (
        <FieldGroup>
          <Label>Approximate time of day</Label>
          <RadioGroup
            id="birthTimeApprox"
            value={data.birthTimeApproximate}
            onChange={(v) =>
              updateData({
                birthTimeApproximate: v as
                  | "morning"
                  | "afternoon"
                  | "evening"
                  | "night",
              })
            }
            options={[
              { value: "morning", label: "Morning (6am - 12pm)" },
              { value: "afternoon", label: "Afternoon (12pm - 6pm)" },
              { value: "evening", label: "Evening (6pm - 12am)" },
              { value: "night", label: "Night (12am - 6am)" },
            ]}
          />
        </FieldGroup>
      )}

      <FieldGroup>
        <Label htmlFor="birthCountry">Birth country</Label>
        <Autocomplete
          id="birthCountry"
          value={data.birthCountry}
          onChange={(v) => updateData({ birthCountry: v })}
          placeholder="Start typing..."
          getSuggestions={filterCountries}
          debounceMs={50}
        />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldGroup>
          <Label htmlFor="birthState">Birth state / province</Label>
          <TextInput
            id="birthState"
            value={data.birthState}
            onChange={(v) => updateData({ birthState: v })}
            placeholder={
              data.birthCountry
                ? `State/province in ${data.birthCountry}`
                : "Select country first"
            }
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="birthCity">Birth city</Label>
          <Autocomplete
            id="birthCity"
            value={data.birthCity}
            onChange={(v) => updateData({ birthCity: v })}
            placeholder={
              data.birthState
                ? `City in ${data.birthState}`
                : data.birthCountry
                  ? `City in ${data.birthCountry}`
                  : "Select country first"
            }
            getSuggestions={getCitySuggestions}
            debounceMs={400}
          />
        </FieldGroup>
      </div>
    </div>
  );
}
