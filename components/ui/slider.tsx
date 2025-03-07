"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  variants="default",
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { variants?: string }) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "cursor-pointer relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col group",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-[rgba(255,255,255,0.55)] relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          variants !== "white" && "group-hover:bg-[rgb(255,255,255)]"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            variants === "default" && "bg-primary",
            variants === "green" && "bg-green-500",
            variants === "red" && "bg-[rgb(255,0,0)]",
            variants === "white" && "bg-white",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "bg-background ring-ring/50 block size-3 shrink-0 rounded-full bordertransition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            variants === "default" && "bg-background",
            variants === "green" && "bg-green-500",
            variants === "red" && "bg-[rgb(255,0,0)]",
            variants === "white" && "bg-white",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
