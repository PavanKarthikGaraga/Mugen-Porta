"use client";
import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ value, onChange, placeholder = "Search activities…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
        style={{ "--tw-ring-color": "rgb(151,0,3)" }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
