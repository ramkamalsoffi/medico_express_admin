import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';

export interface FilterOption {
    id: string;
    label: string;
    value: string;
}

interface MultiSelectFilterProps {
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}

export default function MultiSelectFilter({
    label,
    options,
    selectedValues,
    onChange,
}: MultiSelectFilterProps) {
    const handleSelect = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const removeValue = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedValues.filter((v) => v !== value));
    };

    return (
        <div className="relative">
            <Listbox value={selectedValues} onChange={() => { }} multiple>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
                        <span className="block truncate">
                            {selectedValues.length === 0
                                ? label
                                : `${label} (${selectedValues.length})`}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 min-w-40">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={option.value}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selectedValues.includes(option.value)
                                                        ? 'font-medium'
                                                        : 'font-normal'
                                                    }`}
                                            >
                                                {option.label}
                                            </span>
                                            {selectedValues.includes(option.value) ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>

            {/* Selected Chips */}
            {selectedValues.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedValues.map((value) => {
                        const option = options.find((o) => o.value === value);
                        return (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                            >
                                {option?.label || value}
                                <button
                                    onClick={(e) => removeValue(value, e)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-blue-200 text-blue-600 focus:outline-none"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
