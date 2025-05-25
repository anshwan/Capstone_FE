// src/components/DropdownPortal.tsx

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownPortalProps {
    anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  show: boolean;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({ anchorRef, children, show }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current && show) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [anchorRef, show]);

  if (!show) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left - 55,
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        minWidth: "180px"
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
