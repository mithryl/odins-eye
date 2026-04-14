"use client";

import { useEffect, useState } from "react";
import { StepProps } from "@/lib/types";
import {
  Label,
  TextInput,
  RadioGroup,
  FieldGroup,
  Hint,
} from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import CityPicker, { CityOption } from "@/components/ui/CityPicker";

interface CountryOpt { code: string; name: string }
interface StateOpt { code: string; name: string }

export default function BirthDataStep({ data, updateData }: StepProps) {
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [states, setStates] = useState<StateOpt[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries once
  useEffect(() => {
    fetch("/api/places/countries")
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!data.birthCountryCode) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    fetch(`/api/places/states?country=${data.birthCountryCode}`)
      .then((r) => r.json())
      .then((list: StateOpt[]) => setStates(list))
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [data.birthCountryCode]);

  // Load cities when country or state changes
  useEffect(() => {
    if (!data.birthCountryCode) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    const params = new URLSearchParams({ country: data.birthCountryCode });
    if (data.birthStateCode) params.set("state", data.birthStateCode);
    fetch(`/api/places/cities?${params}`)
      .then((r) => r.json())
      .then((list: CityOption[]) => setCities(list))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [data.birthCountryCode, data.birthStateCode]);

  const handleCountryChange = (code: string) => {
    const c = countries.find((x) => x.code === code);
    updateData({
      birthCountryCode: code,
      birthCountry: c?.name || "",
      birthStateCode: "",
      birthState: "",
      birthCity: "",
      birthLatitude: null,
      birthLongitude: null,
    });
  };

  const handleStateChange = (code: string) => {
    const s = states.find((x) => x.code === code);
    updateData({
      birthStateCode: code,
      birthState: s?.name || "",
      birthCity: "",
      birthLatitude: null,
      birthLongitude: null,
    });
  };

  const handleCitySelect = (city: CityOption) => {
    updateData({
      birthCity: city.name,
      birthLatitude: city.latitude,
      birthLongitude: city.longitude,
    });
  };

  const handleCityClear = () => {
    if (data.birthLatitude !== null) {
      updateData({ birthCity: "", birthLatitude: null, birthLongitude: null });
    }
  };

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
        <Select
          id="birthCountry"
          value={data.birthCountryCode}
          onChange={handleCountryChange}
          placeholder={countries.length ? "Select a country..." : "Loading..."}
          options={countries.map((c) => ({ value: c.code, label: c.name }))}
          disabled={countries.length === 0}
        />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldGroup>
          <Label htmlFor="birthState">Birth state / province</Label>
          <Select
            id="birthState"
            value={data.birthStateCode}
            onChange={handleStateChange}
            placeholder={
              !data.birthCountryCode
                ? "Select country first"
                : loadingStates
                  ? "Loading..."
                  : states.length === 0
                    ? "No states available"
                    : "Select a state..."
            }
            options={states.map((s) => ({ value: s.code, label: s.name }))}
            disabled={!data.birthCountryCode || states.length === 0}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="birthCity">Birth city</Label>
          <CityPicker
            id="birthCity"
            value={data.birthCity}
            cities={cities}
            onSelect={handleCitySelect}
            onClear={handleCityClear}
            placeholder={
              !data.birthCountryCode
                ? "Select country first"
                : loadingCities
                  ? "Loading cities..."
                  : "Start typing..."
            }
            disabled={!data.birthCountryCode || cities.length === 0}
          />
          {data.birthLatitude !== null && (
            <Hint>
              ✓ Location set ({data.birthLatitude.toFixed(2)}°, {data.birthLongitude?.toFixed(2)}°)
            </Hint>
          )}
        </FieldGroup>
      </div>
    </div>
  );
}
