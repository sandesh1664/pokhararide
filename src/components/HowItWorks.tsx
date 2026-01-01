import { MapPin, Car, Navigation, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Set your pickup",
    description: "Enter your location or use GPS to find the nearest drivers in your area.",
  },
  {
    icon: Navigation,
    title: "Choose destination",
    description: "Tell us where you want to go and see upfront pricing before you book.",
  },
  {
    icon: Car,
    title: "Meet your driver",
    description: "Track your driver in real-time and know exactly when they'll arrive.",
  },
  {
    icon: CheckCircle,
    title: "Arrive safely",
    description: "Enjoy your ride with our verified drivers and cashless payments.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting a ride has never been easier. Just four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              {/* Step Number */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
