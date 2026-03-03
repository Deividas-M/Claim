import { useState } from "react";

export function useInformPickerState() {
  const [informSearch, setInformSearch] = useState("");
  const [isInformListOpen, setIsInformListOpen] = useState(false);

  const shouldShowInformList = isInformListOpen || informSearch.trim().length > 0;

  function onInformSearchChange(value: string) {
    setInformSearch(value);
    if (value.trim().length > 0) {
      setIsInformListOpen(true);
    }
  }

  function resetInformPicker() {
    setInformSearch("");
    setIsInformListOpen(false);
  }

  function toggleInformList() {
    setIsInformListOpen((prev) => !prev);
  }

  return {
    informSearch,
    isInformListOpen,
    shouldShowInformList,
    setInformSearch,
    setIsInformListOpen,
    onInformSearchChange,
    resetInformPicker,
    toggleInformList,
  };
}

