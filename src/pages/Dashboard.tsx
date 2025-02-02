import Navbar from "@/components/Navbar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold text-sage-800">Dashboard</h1>
      </main>
    </div>
  );
};

export default Dashboard;