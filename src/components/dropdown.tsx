import React, { useState } from 'react';

export default function Dropdown({ options, onSelect, isOpen, setIsOpen, width, marginBottom }: { options: string[], onSelect: (option: string) => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, width: string, marginBottom: string }) {
    // const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(options[0]);

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        setIsOpen(false);
        onSelect(option);
    }

    return (
        <div className={`relative inline-block text-left ${width} mx-auto ${marginBottom}`}>
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-violet-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedOption}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-500 hover:text-gray-100"
                                role="menuitem"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}