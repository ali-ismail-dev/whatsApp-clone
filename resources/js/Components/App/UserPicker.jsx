import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

export default function UserPicker({ value = [], options = [], onSelect = () => {} }) {
  // value may be a single object, or an array of objects (we accept both).
  const initial = Array.isArray(value) ? value : value ? [value] : [];
  const [selected, setSelected] = useState(initial);
  const [query, setQuery] = useState("");

  // Keep local selected in sync when parent changes the value prop
  useEffect(() => {
    const v = Array.isArray(value) ? value : value ? [value] : [];
    setSelected(v);
  }, [value]);

  const opts = Array.isArray(options) ? options : [];

  const filteredPeople =
    query.length === 0
      ? opts
      : opts.filter((person) =>
          (person?.name ?? "").toString().toLowerCase().includes(query.toLowerCase())
        );

  const onSelected = (personOrArray) => {
    // headlessui returns either an item or an array depending on "multiple"
    const newSelected = Array.isArray(personOrArray)
      ? personOrArray
      : personOrArray
      ? [personOrArray]
      : [];
    setSelected(newSelected);
    // Call parent with array (consistent shape)
    try {
      onSelect(newSelected);
    } catch (e) {
      console.error("UserPicker onSelect error:", e);
    }
  };

  // Display value for the input: show comma-separated names for multiple selection
  const displayValue = (sel) => {
    if (!sel) return "";
    if (Array.isArray(sel)) return sel.map((s) => s?.name ?? "").filter(Boolean).join(", ");
    return sel?.name ?? "";
  };

  return (
    <>
      <Combobox value={selected} onChange={onSelected} multiple>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white py-2 px-3 text-left shadow-md sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={() => displayValue(selected)}
              onChange={(event) => setQuery(event.target.value)}
              value={query}
              placeholder="Select a user"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <CheckIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredPeople.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <Combobox.Option
                    key={person.id}
                    value={person}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-indigo-600 text-white" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected: isSelected, active }) => (
                      <>
                        <span
                          className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}
                        >
                          {person?.name ?? ""}
                        </span>
                        {isSelected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-indigo-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {/* Show selected names (handles single or multiple) */}
      {selected && selected.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Selected: {selected.map((s) => s?.name ?? "").filter(Boolean).join(", ")}
        </p>
      )}
    </>
  );
}
