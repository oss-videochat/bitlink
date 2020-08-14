import React, { ChangeEvent, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./SearchBar.css";

interface ISearchBarProps {
  onChange: (input: string) => void;
}

const SearchBar: React.FunctionComponent<ISearchBarProps> = ({ onChange }) => {
  const [value, setValue] = useState("");

  function handleKeyUp(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    onChange(event.target.value);
  }

  return (
    <div className={"search-wrapper"}>
      <div className={"search-container"}>
        <span className={"search--icon"}>
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          data-private={"lipsum"}
          className={"search--input"}
          placeholder={"Search"}
          onChange={handleKeyUp}
          value={value}
        />
      </div>
    </div>
  );
};
export default SearchBar;
