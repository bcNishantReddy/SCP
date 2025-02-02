import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold text-sage-800">Welcome Home</h1>
      </main>
    </div>
  );
};

export default Home;