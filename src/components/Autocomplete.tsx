// src/components/Autocomplete.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";
import "./styles.css";

interface AutocompleteProps {
  options: string[];
}

const Autocomplete: React.FC<AutocompleteProps> = ({ options }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const fetchSuggestions = useCallback(
    (searchText: string): string[] => {
      return options.filter((option) =>
        option.toLowerCase().includes(searchText.toLowerCase())
      );
    },
    [options]
  );

  useEffect(() => {
    if (!debouncedQuery) {
      // display first few results to give user an idea of what's available
      setSuggestions(options.slice(0, 5));
      return;
    }

    if (selectedItem) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error state before displaying suggestions

    const data = fetchSuggestions(debouncedQuery);
    setIsLoading(false);
    setSuggestions(data);
    console.info("Fetched suggestions successfully."); // Logs can be used for debugging/monitoring
  }, [debouncedQuery, options, selectedItem, fetchSuggestions]);

  useEffect(() => {
    if (selectedItem) {
      console.info("Selected item:", selectedItem); // Logs can be used for debugging/monitoring
      setQuery(selectedItem);
      setHighlightedIndex(-1);
    }
  }, [selectedItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClearInput = () => {
    setSelectedItem(null); // Clear the selected item
    setQuery(""); // Clear the query
    setSuggestions([]); // Clear the suggestions
    setHighlightedIndex(-1); // Reset the highlighted index
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && highlightedIndex < suggestions.length - 1) {
      setHighlightedIndex(highlightedIndex + 1);
    } else if (e.key === "ArrowUp" && highlightedIndex > 0) {
      setHighlightedIndex(highlightedIndex - 1);
    } else if (e.key === "ArrowRight") {
      buttonRef?.current?.focus();
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      setSelectedItem(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const handleKeyDownButton = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      inputRef?.current?.focus();
    }
  };

  const highlightMatch = (item: string) => {
    const regexSafeQuery = debouncedQuery.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const parts = item.split(new RegExp(`(${regexSafeQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === debouncedQuery.toLowerCase() ? (
            <strong key={i}>{part}</strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="autocomplete">
      <div className="autocomplete-container">
        <input
          type="text"
          placeholder="Search for items..."
          ref={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={query}
          className="autocomplete-input"
          aria-autocomplete="list"
          aria-controls="autocomplete-results"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `autocomplete-item-${highlightedIndex}`
              : undefined
          }
        />
        {error && <div className="autocomplete-error">{error}</div>}
        {isLoading && <div className="autocomplete-loading">Loading...</div>}
        {!error && !isLoading && suggestions.length > 0 && (
          <ul
            className="autocomplete-results"
            id="autocomplete-results"
            role="listbox"
          >
            {suggestions.map((item, index) => (
              <li
                key={index}
                id={`autocomplete-item-${index}`}
                role="option"
                className={`autocomplete-item ${
                  index === highlightedIndex ? "highlighted" : ""
                }`}
                aria-selected={index === highlightedIndex}
                onMouseOver={() => setHighlightedIndex(index)}
                onClick={() => {
                  setSelectedItem(item);
                }}
              >
                {highlightMatch(item)}
              </li>
            ))}
          </ul>
        )}
        {!error &&
          !isLoading &&
          suggestions.length === 0 &&
          query &&
          !selectedItem && (
            <div className="autocomplete-no-results">No results found</div>
          )}
      </div>
      <button
        ref={buttonRef}
        onClick={handleClearInput}
        className={`clear-button`}
        aria-label="Clear input" // Label for screen readers
        tabIndex={0} // Ensures button is focusable
        onKeyDown={handleKeyDownButton}
        disabled={!query}
      >
        X
      </button>
    </div>
  );
};

export default Autocomplete;
