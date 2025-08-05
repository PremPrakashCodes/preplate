"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date and time",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "12:00"
  );

  const handleDateSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    setSelectedDate(newDay);

    // Combine the selected date with the current time
    if (timeValue) {
      const [hours, minutes] = timeValue
        .split(":")
        .map((str) => parseInt(str, 10));
      const newDateTime = new Date(
        newDay.getFullYear(),
        newDay.getMonth(),
        newDay.getDate(),
        hours,
        minutes
      );
      setDate(newDateTime);
    } else {
      setDate(newDay);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeValue(time);

    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
      const newDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes
      );
      setDate(newDateTime);
    }
  };

  // Update internal state when external date prop changes
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  const footer = (
    <div className="px-4 pt-0 pb-4 border-t">
      <Label htmlFor="time" className="text-sm font-medium">
        Time
      </Label>
      <Input
        id="time"
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        className="mt-2"
        disabled={disabled}
      />
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP 'at' HH:mm") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) =>
            date < new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
        {footer}
      </PopoverContent>
    </Popover>
  );
}
