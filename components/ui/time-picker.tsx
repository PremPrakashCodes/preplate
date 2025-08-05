"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  time?: string;
  setTime: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  time,
  setTime,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    setOpen(false);
  };

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return placeholder;
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate time options for quick selection
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = formatDisplayTime(timeValue);
        options.push({ value: timeValue, display: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime(time || "")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time-input" className="text-sm font-medium">
              Enter Time
            </Label>
            <Input
              id="time-input"
              type="time"
              value={time || ""}
              onChange={handleTimeChange}
              disabled={disabled}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={time === option.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setTime(option.value);
                    setOpen(false);
                  }}
                >
                  {option.display}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
