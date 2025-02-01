import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Eye, Trash2 } from "lucide-react";
import { UploadPortfolioModal } from "@/components/modals/UploadPortfolioModal";
import { EditPortfolioModal } from "@/components/modals/EditPortfolioModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Portfolio {
  id: string;
  title: string;
  description: string;
  file_url: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPortfolios = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handlePreview = async (fileUrl: string) => {
    try {
      const { data } = await supabase.storage
        .from('files')
        .getPublicUrl(fileUrl);

      window.open(data.publicUrl, '_blank');
    } catch (error) {
      console.error("Error previewing file:", error);
      toast({
        title: "Error",
        description: "Failed to preview portfolio",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      const { data } = await supabase.storage
        .from('files')
        .getPublicUrl(fileUrl);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download portfolio",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    try {
      const { error: deleteFileError } = await supabase.storage
        .from('files')
        .remove([fileUrl]);

      if (deleteFileError) throw deleteFileError;

      const { error: deletePortfolioError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (deletePortfolioError) throw deletePortfolioError;

      toast({
        title: "Success",
        description: "Portfolio deleted successfully",
      });
      fetchPortfolios();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio",
        variant: "destructive",
      });
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio =>
    portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portfolio.profiles.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Portfolios</h1>
            <UploadPortfolioModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search portfolios..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-sage-200">
                      {portfolio.profiles.avatar_url && (
                        <img
                          src={portfolio.profiles.avatar_url}
                          alt={portfolio.profiles.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{portfolio.profiles.name}</h3>
                      <p className="text-sm text-sage-600">
                        {new Date(portfolio.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-sage-50 rounded-lg p-4 mb-4">
                    <FileText className="h-8 w-8 text-sage-600 mx-auto mb-2" />
                    <p className="text-center font-medium mb-1">{portfolio.title}</p>
                    <p className="text-center text-sm text-sage-600">{portfolio.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handlePreview(portfolio.file_url)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownload(portfolio.file_url, portfolio.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {currentUserId === portfolio.user_id && (
                    <div className="flex space-x-2 mt-2">
                      <EditPortfolioModal 
                        portfolio={portfolio} 
                        onUpdate={fetchPortfolios}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this portfolio? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(portfolio.id, portfolio.file_url)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portfolios;