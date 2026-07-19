import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";

const COMMON_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "Swift",
    "React", "Node.js", "Express", "Next.js", "Vue.js", "Angular", "Django", "Flask", "Spring Boot",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Sass",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase",
    "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Machine Learning", "Data Analysis", "UI/UX Design", "Figma", "Agile", "Scrum"
];

interface SkillInputProps {
    value: string[];
    onChange: (skills: string[]) => void;
}

export default function SkillInput({ value = [], onChange }: SkillInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = COMMON_SKILLS.filter(skill => 
        skill.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(skill)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(value.filter(s => s !== skillToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill(inputValue);
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            removeSkill(value[value.length - 1]);
        }
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            <div className="min-h-9 px-2 py-1.5 border border-gray-200 rounded-lg mt-1 flex flex-wrap gap-2 items-center bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                {value.map((skill, index) => (
                    <span key={index} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500">
                            <FiX size={12} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                    placeholder={value.length === 0 ? "Type a skill and press Enter..." : ""}
                />
            </div>
            
            {showSuggestions && inputValue && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((skill, index) => (
                            <li 
                                key={index} 
                                onClick={() => addSkill(skill)}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                {skill}
                            </li>
                        ))
                    ) : (
                        <li 
                            onClick={() => addSkill(inputValue)}
                            className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                        >
                            <span>Add "{inputValue}"</span>
                            <span className="text-xs text-blue-400">Press Enter</span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
