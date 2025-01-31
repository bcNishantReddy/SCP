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
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

export function EventRegistrationModal() {
  const { toast } = useToast()

  const handleRegister = () => {
    toast({
      title: "Registration Successful!",
      description: "You have successfully registered for this event.",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-sage-600 hover:bg-sage-700">
          Register Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Event Registration</DialogTitle>
          <DialogDescription>
            Confirm your registration for this event.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-sage-600">
            By registering, you agree to attend this event and receive updates about it.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button 
            className="bg-sage-600 hover:bg-sage-700"
            onClick={handleRegister}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm Registration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}