
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  category: string;
}

interface UserInterest {
  interest_id: string;
}

export const InterestsSection = ({ userId }: { userId: string }) => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserInterests();
    fetchAllInterests();
  }, []);

  const fetchAllInterests = async () => {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching interests:', error);
      return;
    }
    setInterests(data);
  };

  const fetchUserInterests = async () => {
    const { data, error } = await supabase
      .from('user_interests')
      .select('interest_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user interests:', error);
      return;
    }

    const interestIds = data.map((ui: UserInterest) => ui.interest_id);
    setUserInterests(interestIds);
  };

  useEffect(() => {
    const available = interests.filter(
      interest => !userInterests.includes(interest.id)
    );
    setAvailableInterests(available);
  }, [interests, userInterests]);

  const addInterest = async (interestId: string) => {
    const { error } = await supabase
      .from('user_interests')
      .insert({ user_id: userId, interest_id: interestId });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add interest",
        variant: "destructive",
      });
      return;
    }

    setUserInterests([...userInterests, interestId]);
    toast({
      title: "Success",
      description: "Interest added successfully",
    });
  };

  const removeInterest = async (interestId: string) => {
    const { error } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)
      .eq('interest_id', interestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove interest",
        variant: "destructive",
      });
      return;
    }

    setUserInterests(userInterests.filter(id => id !== interestId));
    toast({
      title: "Success",
      description: "Interest removed successfully",
    });
  };

  const getInterestName = (id: string) => {
    return interests.find(i => i.id === id)?.name || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">Interests</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Interests
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary">Add Interests</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {availableInterests.map((interest) => (
                <div key={interest.id} className="flex items-center justify-between">
                  <span className="text-sm">{interest.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => addInterest(interest.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {userInterests.map((interestId) => (
          <Badge
            key={interestId}
            variant="outline"
            className="bg-background border-primary text-primary flex items-center gap-2"
          >
            {getInterestName(interestId)}
            <button
              onClick={() => removeInterest(interestId)}
              className="hover:text-secondary"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
