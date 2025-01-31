import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Plus } from "lucide-react"

export function CreateEventModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Plan and schedule a new event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input id="event-title" placeholder="Enter event title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
                <Input id="event-date" type="date" className="pl-10" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-time">Time</Label>
              <Input id="event-time" type="time" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
              <Input
                id="event-location"
                placeholder="Enter location"
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Describe the event..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-sage-600 hover:bg-sage-700">Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}