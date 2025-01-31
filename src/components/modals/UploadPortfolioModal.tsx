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

export function UploadPortfolioModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Upload Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Portfolio</DialogTitle>
          <DialogDescription>
            Share your work and achievements with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="portfolio-title">Portfolio Title</Label>
            <Input id="portfolio-title" placeholder="Enter portfolio title" />
          </div>
          <div className="grid gap-2">
            <Label>Portfolio File (PDF)</Label>
            <div className="border-2 border-dashed border-sage-200 rounded-lg p-4 text-center">
              <FileUpload className="h-8 w-8 mx-auto mb-2 text-sage-500" />
              <p className="text-sm text-sage-600">
                Drag & drop or click to upload PDF
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="portfolio-description">Description</Label>
            <Textarea
              id="portfolio-description"
              placeholder="Describe your portfolio..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-sage-600 hover:bg-sage-700">Upload Portfolio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}