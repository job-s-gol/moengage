import React, { useState, useRef } from "react";
import { debounce } from "lodash";
import "./searchInput.scss";

const SearchInput = ({ onSearch, minSearchLength }) => {
  const [error, setError] = useState("");
  const textRef = useRef(null);

  const search = () => {
    if (/^[a-z0-9 ]*$/i.test(textRef.current.value)) {
      if (
        textRef.current.value.length >= minSearchLength ||
        textRef.current.value.length === 0
      ) {
        onSearch(textRef.current.value);
        setError("");
      } else {
        setError(
          `Search query should be at least ${minSearchLength} characters long.`
        );
      }
    } else {
      console.log("fail");
    }
  };

  const searchDebounce = debounce(search, 1500);

  const onKeyDown = (event) => {
    if (/[a-z0-9 ]/i.test(event.key)) {
      searchDebounce();
    } else {
      event.preventDefault();
    }
  };

  return (
    <div className="search-input-container">
      <input
        ref={textRef}
        className="search-input"
        type="text"
        onKeyDown={onKeyDown}
      />
      <p
        className="search-input-error"
        style={error ? { visibility: "visible" } : { visibility: "hidden" }}
      >
        {error}
      </p>
    </div>
  );
};

export default SearchInput;
