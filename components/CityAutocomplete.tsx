"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Suggestion {
    display_name: string;
    lat: string;
    lon: string;
}

interface CityAutocompleteProps {
    value: string;
    onChange: (city: string) => void;
    onSelect: (city: string, lat: number, lon: number) => void;
}

export default function CityAutocomplete({
    value,
    onChange,
    onSelect,
}: CityAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch suggestions with debounce
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/geocode/autocomplete?q=${encodeURIComponent(query)}`
            );
            if (res.ok) {
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setIsOpen(data.length > 0);
                setActiveIndex(-1);
            }
        } catch {
            setSuggestions([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced input handler
    const handleChange = (text: string) => {
        onChange(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
    };

    // Pick a suggestion
    const handleSelect = (s: Suggestion) => {
        // Use a shorter display: take the first two parts of display_name
        const parts = s.display_name.split(", ");
        const short = parts.slice(0, 2).join(", ");
        onChange(short);
        onSelect(short, parseFloat(s.lat), parseFloat(s.lon));
        setIsOpen(false);
        setSuggestions([]);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="city-autocomplete-wrapper">
            <input
                type="text"
                id="city"
                required
                autoComplete="off"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                placeholder="Start typing a city name…"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="city-suggestions"
                role="combobox"
            />

            {isOpen && (
                <ul
                    id="city-suggestions"
                    role="listbox"
                    className="city-autocomplete-dropdown"
                >
                    {suggestions.map((s, i) => (
                        <li
                            key={`${s.lat}-${s.lon}`}
                            role="option"
                            aria-selected={i === activeIndex}
                            className={`city-autocomplete-item ${i === activeIndex ? "active" : ""
                                }`}
                            onMouseDown={() => handleSelect(s)}
                            onMouseEnter={() => setActiveIndex(i)}
                        >
                            <i className="fas fa-map-marker-alt city-autocomplete-icon" />
                            <span>{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}

            {isLoading && (
                <div className="city-autocomplete-loading">
                    <i className="fas fa-spinner fa-spin" />
                </div>
            )}
        </div>
    );
}
