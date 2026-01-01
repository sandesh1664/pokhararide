import { Shield, Phone, Share2, UserCheck, Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const safetyFeatures = [
  {
    icon: Shield,
    title: "24/7 Support",
    description: "Our safety team is always available to help you.",
  },
  {
    icon: Phone,
    title: "Emergency Button",
    description: "One-tap access to local emergency services.",
  },
  {
    icon: Share2,
    title: "Share Your Trip",
    description: "Let friends and family track your ride in real-time.",
  },
  {
    icon: UserCheck,
    title: "Verified Drivers",
    description: "All drivers pass strict background checks.",
  },
  {
    icon: Star,
    title: "Two-Way Ratings",
    description: "Both riders and drivers are rated for accountability.",
  },
  {
    icon: Clock,
    title: "Trip History",
    description: "Access complete records of all your rides.",
  },
];

const SafetySection = () => {
  return (
    <section id="safety" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your safety is our
              <br />
              <span className="text-gradient">top priority</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We've built comprehensive safety features into every ride to ensure you always feel secure.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {safetyFeatures.map((feature, index) => (
                <Card
                  key={index}
                  variant="feature"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="w-3/4 h-3/4 rounded-2xl bg-card shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-24 h-24 text-primary mx-auto mb-4" />
                  <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
                  <div className="text-muted-foreground">Safe rides completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
