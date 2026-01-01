import { Button } from "@/components/ui/button";
import { DollarSign, Clock, Car } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn on your schedule",
    description: "Drive when you want, earn what you need",
  },
  {
    icon: Clock,
    title: "Flexible hours",
    description: "Be your own boss with no fixed schedule",
  },
  {
    icon: Car,
    title: "Use your own car",
    description: "No special equipment required to start",
  },
];

const DriverCTA = () => {
  return (
    <section id="drive" className="py-20 hero-section">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-hero-foreground mb-4 animate-slide-up">
            Drive with RideFlow
          </h2>
          <p className="text-lg text-hero-muted mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Turn your car into a money-making machine. Join thousands of drivers earning on their own terms.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-hero-foreground mb-2">{benefit.title}</h3>
                <p className="text-hero-muted">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="lg">
              Apply to drive
            </Button>
            <Button variant="heroOutline" size="lg">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverCTA;
