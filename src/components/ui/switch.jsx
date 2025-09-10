import React from "react";

/**
 * Minimal Switch component compatible con nuestras páginas de Admin.
 * Props:
 * - checked: boolean
 * - onCheckedChange: (boolean) => void
 * - disabled?: boolean
 */
export function Switch({ checked = false, onCheckedChange, disabled = false }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer
                      peer-checked:bg-green-500 transition-colors relative">
        <div className={
          "absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform " +
          (checked ? "translate-x-5" : "")
        }></div>
      </div>
    </label>
  );
}

export default Switch;