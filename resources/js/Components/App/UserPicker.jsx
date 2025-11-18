import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { CheckIcon, ChevronUpDownIcon, UserIcon } from "@heroicons/react/20/solid";

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
          <div className="
            relative w-full cursor-default overflow-hidden 
            rounded-2xl backdrop-blur-sm
            bg-gradient-to-br from-slate-800/80 to-slate-900/80
            border border-slate-600/50
            py-2 px-3 text-left shadow-lg
            transition-all duration-300
            focus-within:border-cyan-500 focus-within:shadow-cyan-500/10
            hover:border-slate-500/50
          ">
            <Combobox.Input
              className="
                w-full border-none bg-transparent
                py-2 pl-3 pr-10 text-sm leading-5
                text-slate-200 placeholder-slate-400
                focus:ring-0 focus:outline-none
              "
              displayValue={() => displayValue(selected)}
              onChange={(event) => setQuery(event.target.value)}
              value={query}
              placeholder="Search users..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-slate-400 hover:text-cyan-400 transition-colors duration-300"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="
              absolute mt-2 max-h-60 w-full overflow-auto 
              rounded-2xl backdrop-blur-xl
              bg-gradient-to-br from-slate-800/95 to-slate-900/95
              border border-slate-600/50
              shadow-2xl shadow-blue-500/20
              py-2 text-base focus:outline-none z-50
            ">
              {filteredPeople.length === 0 && query !== "" ? (
                <div className="
                  relative cursor-default select-none 
                  py-3 px-4 text-slate-400 text-sm
                  flex items-center gap-2
                ">
                  <UserIcon className="h-4 w-4" />
                  No users found.
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <Combobox.Option
                    key={person.id}
                    value={person}
                    className={({ active }) =>
                      `relative cursor-default select-none py-3 pl-10 pr-4 mx-2 rounded-xl transition-all duration-300 ${
                        active 
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-cyan-500/30' 
                          : 'text-slate-200'
                      }`
                    }
                  >
                    {({ selected: isSelected, active }) => (
                      <>
                        <span
                          className={`block truncate ${isSelected ? "font-semibold" : "font-normal"}`}
                        >
                          {person?.name ?? ""}
                        </span>
                        {isSelected ? (
                          <span
                            className={`
                              absolute inset-y-0 left-0 flex items-center pl-3 
                              transition-all duration-300
                              ${active ? "text-cyan-400" : "text-cyan-400"}
                            `}
                          >
                            <div className="
                              p-1 rounded-lg backdrop-blur-sm
                              bg-gradient-to-r from-cyan-500/20 to-blue-500/20
                              border border-cyan-500/30
                            ">
                              <CheckIcon className="h-4 w-4" aria-hidden="true" />
                            </div>
                          </span>
                        ) : null}

                        {/* Online status indicator */}
                        {person?.is_online && (
                          <span className="
                            absolute right-3 top-1/2 -translate-y-1/2
                            w-2 h-2 rounded-full
                            bg-gradient-to-r from-green-500 to-emerald-500
                            animate-pulse border border-slate-800
                          "></span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      {/* Show selected names with enhanced styling */}
      {selected && selected.length > 0 && (
        <div className="mt-3 p-3 rounded-xl backdrop-blur-sm bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
              <UserIcon className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-slate-200">Selected Users</span>
            <span className="
              px-2 py-1 text-xs font-medium
              bg-gradient-to-r from-blue-500 to-cyan-500
              text-white rounded-full
            ">
              {selected.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((s) => (
              <span
                key={s.id}
                className="
                  inline-flex items-center gap-1.5
                  px-3 py-1.5 rounded-lg
                  bg-gradient-to-r from-slate-700/50 to-slate-800/50
                  border border-slate-600/50
                  text-slate-200 text-sm
                  backdrop-blur-sm
                  transition-all duration-300 hover:scale-105
                "
              >
                {s?.name ?? ""}
                {s?.is_online && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}