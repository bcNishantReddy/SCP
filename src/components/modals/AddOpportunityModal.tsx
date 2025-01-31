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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddOpportunityModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Post Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Post New Opportunity</DialogTitle>
          <DialogDescription>
            Share opportunities with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="opportunity-title">Title</Label>
            <Input id="opportunity-title" placeholder="Enter opportunity title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="opportunity-type">Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="funding">Funding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="opportunity-description">Description</Label>
            <Textarea
              id="opportunity-description"
              placeholder="Describe the opportunity..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input type="date" id="deadline" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-sage-600 hover:bg-sage-700">Post Opportunity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}