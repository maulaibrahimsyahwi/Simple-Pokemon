// src/components/PokemonList/Filter.jsx
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowDropDownLine } from "react-icons/ri";

function Filter({
  isMobile,
  gridSize,
  setGridSize,
  filterType,
  setFilterType,
  colours,
  loadPokemons,
  setSearchQuery,
}) {
  const { t } = useTranslation();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const [hoveredType, setHoveredType] = useState(null);
  const filterDropdownRef = useRef(null);

  const handleFilterChange = (type, e) => {
    e.stopPropagation();
    setFilterType(type);
    setSearchQuery("");
    loadPokemons(type);
    setShowTypeDropdown(false);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowTypeDropdown(true);
    }, 200);
  };

  const handleDropdownMouseLeave = () => {
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowTypeDropdown(false);
    }, 200);
  };

  const handleWrapperClick = (e) => {
    if (filterDropdownRef.current.contains(e.target)) {
      setShowTypeDropdown((prev) => !prev);
    }
  };

  return (
    <div className="controls-container">
      {isMobile ? (
        <div className="mobile-controls-row">
          <div className="grid-size-container">
            <strong>{t("Size")}</strong>
            <div className="grid-buttons">
              {[2, 3].map((size) => (
                <button
                  key={size}
                  className={gridSize === size ? "active" : ""}
                  onClick={() => setGridSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-container">
            <strong>{t("filterByType")}</strong>
            <select
              className="type-dropdown"
              value={filterType}
              onChange={(e) => {
                const newType = e.target.value;
                setFilterType(newType);
                setSearchQuery("");
                loadPokemons(newType);
              }}
              style={{ "--type-color": colours[filterType] }}
            >
              <option value="all">{t("allType")}</option>
              {Object.keys(colours).map((type) => (
                <option key={type} value={type}>
                  {t(type.charAt(0).toUpperCase() + type.slice(1))}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <>
          <div className="filter-container">
            <strong>{t("filterByType")}</strong>
            <div
              className={`type-dropdown-wrapper ${
                showTypeDropdown ? "active" : ""
              }`}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
              onClick={handleWrapperClick}
              ref={filterDropdownRef}
            >
              <button
                type="button"
                className={`type-dropdown-button ${
                  filterType !== "all" ? "active" : ""
                }`}
                style={{
                  backgroundColor:
                    filterType === "all" ? "#efefef" : colours[filterType],
                  color: filterType === "all" ? "#333" : "white",
                }}
              >
                {t(filterType.charAt(0).toUpperCase() + filterType.slice(1))}
                <RiArrowDropDownLine className="dropdown-icon" />
              </button>
              {showTypeDropdown && (
                <div className="type-dropdown-menu">
                  <div
                    key="all"
                    className={`type-dropdown-item ${
                      filterType === "all" ? "active" : ""
                    }`}
                    onClick={(e) => handleFilterChange("all", e)}
                    onMouseEnter={() => setHoveredType("all")}
                    onMouseLeave={() => setHoveredType(null)}
                    style={{
                      backgroundColor:
                        hoveredType === "all" || filterType === "all"
                          ? "#4a90e2"
                          : "#f0f0f0",
                      color:
                        hoveredType === "all" || filterType === "all"
                          ? "white"
                          : "#333",
                      borderColor:
                        hoveredType === "all" || filterType === "all"
                          ? "#3d7dca"
                          : "#ddd",
                    }}
                  >
                    {t("allType")}
                  </div>
                  {Object.keys(colours).map((type) => (
                    <div
                      key={type}
                      className={`type-dropdown-item ${
                        filterType === type ? "active" : ""
                      }`}
                      onClick={(e) => handleFilterChange(type, e)}
                      onMouseEnter={() => setHoveredType(type)}
                      onMouseLeave={() => setHoveredType(null)}
                      style={{
                        backgroundColor:
                          hoveredType === type || filterType === type
                            ? colours[type]
                            : "#f0f0f0",
                        color:
                          hoveredType === type || filterType === type
                            ? "white"
                            : "#333",
                        borderColor:
                          hoveredType === type || filterType === type
                            ? colours[type]
                            : "#ddd",
                      }}
                    >
                      {t(type.charAt(0).toUpperCase() + type.slice(1))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="settings-container">
            <div className="grid-size-container">
              <strong>{t("Size")}</strong>
              <div className="grid-buttons">
                {[4, 5, 6, 7].map((size) => (
                  <button
                    key={size}
                    className={gridSize === size ? "active" : ""}
                    onClick={() => setGridSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Filter;
