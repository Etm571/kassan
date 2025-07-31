"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  onClose: () => void;
};

export default function DropdownPortal({ children, triggerRef, onClose }: Props) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;

    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const top = rect.top + rect.height + window.scrollY;
      const left = rect.left + window.scrollX;

      setPosition({ top, left });
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [triggerRef, onClose]);

  useEffect(() => {
    if (portalRef.current) {
      const rect = portalRef.current.getBoundingClientRect();
      setDropdownWidth(rect.width);
    }
  }, [children]);

  return createPortal(
    <div
      ref={portalRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left - dropdownWidth,
        zIndex: 1000,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
