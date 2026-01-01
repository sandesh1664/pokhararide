import { Car, Sparkles, Crown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const rideOptions = [
  {
    id: "economy",
    name: "Economy",
    description: "Affordable rides for everyday trips",
    price: "$8-12",
    eta: "3 min",
    icon: Car,
    capacity: "1-3",
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Extra legroom and top-rated drivers",
    price: "$12-18",
    eta: "5 min",
    icon: Sparkles,
    capacity: "1-3",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Luxury vehicles for special occasions",
    price: "$25-35",
    eta: "8 min",
    icon: Crown,
    capacity: "1-3",
  },
  {
    id: "xl",
    name: "XL",
    description: "Spacious rides for groups up to 6",
    price: "$18-25",
    eta: "6 min",
    icon: Users,
    capacity: "4-6",
  },
];

const RideOptions = () => {
  return (
    <section id="rides" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose your ride
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From budget-friendly to premium luxury, we have the perfect ride for every occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rideOptions.map((option, index) => (
            <Card
              key={option.id}
              variant="ride"
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <option.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{option.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-lg font-bold text-foreground">{option.price}</div>
                    <div className="text-xs text-muted-foreground">{option.capacity} passengers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">{option.eta}</div>
                    <div className="text-xs text-muted-foreground">pickup</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RideOptions;
