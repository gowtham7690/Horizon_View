import FlightInputForm from '@/components/FlightInputForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          HorizonView
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-2">
          Flight Scenic Seat Advisor
        </p>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
          Pick the best sunrise/sunset window seats using our interactive flight path visualization
        </p>
      </div>

      {/* Flight Input Form */}
      <FlightInputForm />
    </div>
  );
}
