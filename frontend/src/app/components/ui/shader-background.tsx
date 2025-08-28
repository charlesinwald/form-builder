"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [colors, setColors] = useState({
    background: "#ffffff",
    primary: "#164e63",
    foreground: "#475569",
    accent: "#15803d",
    muted: "#f0fdf4",
  });

  useEffect(() => {
    const updateColors = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setColors({
        background:
          computedStyle.getPropertyValue("--color-background").trim() ||
          "#ffffff",
        primary:
          computedStyle.getPropertyValue("--color-primary").trim() || "#164e63",
        foreground:
          computedStyle.getPropertyValue("--color-foreground").trim() ||
          "#475569",
        accent:
          computedStyle.getPropertyValue("--color-accent").trim() || "#15803d",
        muted:
          computedStyle.getPropertyValue("--color-muted").trim() || "#f0fdf4",
      });
    };

    updateColors();

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateColors);

    return () => mediaQuery.removeEventListener("change", updateColors);
  }, []);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.1" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.95 0"
              result="tint"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[
          colors.background,
          colors.primary,
          colors.muted,
          colors.accent,
          colors.foreground,
        ]}
        speed={0.2}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30"
        colors={[
          colors.muted,
          colors.primary,
          colors.foreground,
          colors.background,
        ]}
        speed={0.15}
      />

      {/* Subtle overlay to ensure content readability */}
      <div className="absolute inset-0 bg-background/60" />

      {children}
    </div>
  );
}
