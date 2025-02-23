import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDialogProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  selectedHour: string;
  onHourSelect: (hour: string) => void;
  selectedMinute: string;
  onMinuteSelect: (minute: string) => void;
  selectedTherapist: string;
  onTherapistSelect: (therapistId: string) => void;
  therapists: { id: string; last_name: string }[];
  onBookAppointment: () => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ 
  selectedDate, 
  onDateSelect, 
  selectedHour, 
  onHourSelect, 
  selectedMinute, 
  onMinuteSelect, 
  selectedTherapist, 
  onTherapistSelect, 
  therapists = [], 
  onBookAppointment 
}) => {
  const hours = Array.from({ length: 9 }, (_, i) => (9 + i).toString());
  const minutes = ["00", "30"];

  return (
    <DialogContent className="sm:max-w-md p-6 rounded-xl bg-white">
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-[#146C94] text-2xl font-bold">
          Schedule Your Visit
        </DialogTitle>
        <p className="text-[#146C94]/70 text-sm mt-1">Let&apos;s find the perfect time for you!</p>
      </DialogHeader>
      
      <div className="space-y-8">
        {/* Date Selection with Popover */}
        <div className="space-y-3">
          <Label className="text-[#146C94] font-medium">Pick a Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-11 border-[#146C94]/20 bg-[#146C94]/5 rounded-lg justify-start text-left font-normal text-[#146C94]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border-[#146C94]/20 rounded-lg shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => onDateSelect(date ?? null)}
                initialFocus
                className="bg-[#146C94]/5 p-3 rounded-lg"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <Label className="text-[#146C94] font-medium">Choose a Time</Label>
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedHour} onValueChange={onHourSelect}>
              <SelectTrigger className="border-[#146C94]/20 h-11 bg-[#146C94]/5 rounded-lg">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {hours.map(hour => (
                  <SelectItem key={hour} value={hour}>
                    {parseInt(hour) > 12 ? `${parseInt(hour) - 12} PM` : `${hour} AM`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMinute} onValueChange={onMinuteSelect}>
              <SelectTrigger className="border-[#146C94]/20 h-11 bg-[#146C94]/5 rounded-lg">
                <SelectValue placeholder="Minutes" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {minutes.map(minute => (
                  <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Therapist Selection */}
        <div className="space-y-3">
          <Label className="text-[#146C94] font-medium">Your Therapist</Label>
          <Select value={selectedTherapist} onValueChange={onTherapistSelect}>
            <SelectTrigger className="border-[#146C94]/20 h-11 bg-[#146C94]/5 rounded-lg">
              <SelectValue placeholder="Choose your therapist" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {therapists.map(therapist => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  Dr. {therapist.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={onBookAppointment} 
          className="w-full bg-[#146C94] hover:bg-[#146C94]/90 rounded-full py-6 text-white font-medium text-lg transition-all duration-200"
        >
          Confirm Your Appointment
        </Button>
      </div>
    </DialogContent>
  );
};

export default BookingDialog;