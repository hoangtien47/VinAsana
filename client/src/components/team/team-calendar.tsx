import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { PopoverContent, PopoverTrigger, Popover } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const localizer = momentLocalizer(moment);

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  projectId: number;
  creatorId: string;
  allDay: boolean;
  creator?: User;
  attendees?: User[];
}

interface TeamCalendarProps {
  projectId: number;
  members: { userId: string; user: User }[];
  currentUser: User;
}

const eventFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean().default(false),
  attendeeIds: z.array(z.string()).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export function TeamCalendar({ projectId, members, currentUser }: TeamCalendarProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      start: new Date(),
      end: new Date(),
      allDay: false,
      attendeeIds: [],
    },
  });

  useEffect(() => {
    fetchEvents();
  }, [projectId, calendarDate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Calculate start and end of month for filtering
      const start = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
      const end = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const response = await fetch(`/api/projects/${projectId}/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Convert string dates to Date objects
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = (data: EventFormValues) => {
    // Ensure end date is after start date
    if (data.end < data.start) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    apiRequest("POST", `/api/projects/${projectId}/events`, {
      title: data.title,
      description: data.description,
      startTime: data.start.toISOString(),
      endTime: data.end.toISOString(),
      projectId,
      allDay: data.allDay,
      attendeeIds: data.attendeeIds,
    })
      .then(() => {
        fetchEvents();
        setIsAddEventOpen(false);
        form.reset();
        toast({
          title: "Event created",
          description: "The event has been created successfully.",
        });
      })
      .catch((error) => {
        console.error("Failed to create event:", error);
        toast({
          title: "Error",
          description: "Failed to create event. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    apiRequest("DELETE", `/api/events/${selectedEvent.id}`, undefined)
      .then(() => {
        fetchEvents();
        setIsDeleteDialogOpen(false);
        setIsViewEventOpen(false);
        setSelectedEvent(null);
        toast({
          title: "Event deleted",
          description: "The event has been deleted successfully.",
        });
      })
      .catch((error) => {
        console.error("Failed to delete event:", error);
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    form.reset({
      title: "",
      description: "",
      start,
      end,
      allDay: false,
      attendeeIds: [],
    });
    setIsAddEventOpen(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewEventOpen(true);
  };

  const handleNavigate = (date: Date) => {
    setCalendarDate(date);
  };

  // Custom event component for styling
  const EventComponent = ({ event }: { event: Event }) => (
    <div
      className="text-xs p-1 overflow-hidden text-ellipsis whitespace-nowrap rounded"
      title={event.title}
    >
      {event.title}
    </div>
  );

  // Custom toolbar with better styling
  const CustomToolbar = ({ onNavigate, label }: any) => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('PREV')}
            className="ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('NEXT')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold">{label}</h2>
        <Button onClick={() => setIsAddEventOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Team Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <div className="h-full">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={['month', 'week', 'day']}
            defaultView={Views.MONTH}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar,
            }}
            eventPropGetter={(event) => {
              let backgroundColor = '#3b82f6'; // blue-500
              let textColor = 'white';
              
              if (event.allDay) {
                backgroundColor = '#10b981'; // green-500
              }
              
              return {
                style: {
                  backgroundColor,
                  color: textColor,
                  borderRadius: '4px',
                },
              };
            }}
            onNavigate={handleNavigate}
          />
        </div>
      </CardContent>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddEvent)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Event description"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                moment(field.value).format('MM/DD/YYYY h:mm A')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <input
                            type="datetime-local"
                            className="border rounded p-2 w-full"
                            value={moment(field.value).format('YYYY-MM-DDTHH:mm')}
                            onChange={(e) => {
                              const newDate = new Date(e.target.value);
                              field.onChange(newDate);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                moment(field.value).format('MM/DD/YYYY h:mm A')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <input
                            type="datetime-local"
                            className="border rounded p-2 w-full"
                            value={moment(field.value).format('YYYY-MM-DDTHH:mm')}
                            onChange={(e) => {
                              const newDate = new Date(e.target.value);
                              field.onChange(newDate);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="allDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>All-day event</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attendeeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendees</FormLabel>
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div key={member.userId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`attendee-${member.userId}`}
                            checked={field.value?.includes(member.userId)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, member.userId]);
                              } else {
                                field.onChange(currentValue.filter(id => id !== member.userId));
                              }
                            }}
                          />
                          <label
                            htmlFor={`attendee-${member.userId}`}
                            className="text-sm flex items-center cursor-pointer"
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.user.profileImageUrl} />
                              <AvatarFallback>
                                {getInitials(`${member.user.firstName || ''} ${member.user.lastName || ''}`)}
                              </AvatarFallback>
                            </Avatar>
                            {member.user.firstName} {member.user.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.description && (
                <p className="text-gray-700 dark:text-gray-300">{selectedEvent.description}</p>
              )}
              
              <div className="space-y-2">
                <p className="text-sm"><strong>Start:</strong> {moment(selectedEvent.start).format('MMMM D, YYYY h:mm A')}</p>
                <p className="text-sm"><strong>End:</strong> {moment(selectedEvent.end).format('MMMM D, YYYY h:mm A')}</p>
                {selectedEvent.allDay && <p className="text-sm text-blue-600">All-day event</p>}
              </div>
              
              {selectedEvent.creator && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Created by:</p>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={selectedEvent.creator.profileImageUrl} />
                      <AvatarFallback>
                        {getInitials(`${selectedEvent.creator.firstName || ''} ${selectedEvent.creator.lastName || ''}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedEvent.creator.firstName} {selectedEvent.creator.lastName}</span>
                  </div>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Attendees:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage src={attendee.profileImageUrl} />
                          <AvatarFallback>
                            {getInitials(`${attendee.firstName || ''} ${attendee.lastName || ''}`)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{attendee.firstName} {attendee.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="mr-auto"
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button variant="outline" onClick={() => setIsViewEventOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this event? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
