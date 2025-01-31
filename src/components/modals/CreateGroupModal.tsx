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
import { FileUpload, Plus } from "lucide-react"

export function CreateGroupModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to connect with others who share your interests.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input id="group-name" placeholder="Enter group name" />
          </div>
          <div className="grid gap-2">
            <Label>Group Banner</Label>
            <div className="border-2 border-dashed border-sage-200 rounded-lg p-4 text-center">
              <FileUpload className="h-8 w-8 mx-auto mb-2 text-sage-500" />
              <p className="text-sm text-sage-600">
                Drag & drop or click to upload
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              placeholder="Describe your group..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="group-category">Category</Label>
            <Input id="group-category" placeholder="e.g., Technology, Research" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-sage-600 hover:bg-sage-700">Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}