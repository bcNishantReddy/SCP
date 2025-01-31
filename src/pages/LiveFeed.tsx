import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Heart, Share2, Image, Link, Send } from "lucide-react";

const LiveFeed = () => {
  const [newPost, setNewPost] = useState("");

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <Input
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button variant="ghost" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </div>
              <Button className="bg-sage-600 hover:bg-sage-700">
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>

          {/* Posts */}
          {[1, 2, 3].map((post) => (
            <div key={post} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-sage-200" />
                <div>
                  <h3 className="font-semibold">John Doe</h3>
                  <p className="text-sm text-sage-600">2 hours ago</p>
                </div>
              </div>
              <p className="text-gray-700">
                This is a sample post showing how the feed will look like. Users can interact
                with posts through likes, comments, and shares.
              </p>
              <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LiveFeed;