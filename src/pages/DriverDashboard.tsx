import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, Car, Clock, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Trip {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  fare: number;
  status: "completed" | "cancelled";
}

const mockTrips: Trip[] = [
  { id: "1", pickup: "Downtown Station", dropoff: "Airport Terminal 2", date: "Jan 2, 2026", time: "9:15 AM", fare: 42.50, status: "completed" },
  { id: "2", pickup: "Central Park", dropoff: "Times Square", date: "Jan 2, 2026", time: "7:30 AM", fare: 18.75, status: "completed" },
  { id: "3", pickup: "Brooklyn Heights", dropoff: "Manhattan Bridge", date: "Jan 1, 2026", time: "6:45 PM", fare: 24.00, status: "completed" },
  { id: "4", pickup: "JFK Airport", dropoff: "Midtown Hotel", date: "Jan 1, 2026", time: "2:00 PM", fare: 65.00, status: "completed" },
  { id: "5", pickup: "Wall Street", dropoff: "Chelsea Market", date: "Jan 1, 2026", time: "11:20 AM", fare: 15.50, status: "cancelled" },
  { id: "6", pickup: "SoHo", dropoff: "Upper East Side", date: "Dec 31, 2025", time: "8:00 PM", fare: 28.25, status: "completed" },
];

const DriverDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);

  const completedTrips = mockTrips.filter(t => t.status === "completed");
  const todayEarnings = completedTrips.slice(0, 2).reduce((sum, t) => sum + t.fare, 0);
  const weeklyEarnings = completedTrips.reduce((sum, t) => sum + t.fare, 0);
  const totalTrips = completedTrips.length;
  const avgFare = weeklyEarnings / totalTrips;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-hero-foreground hover:bg-white/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-hero-foreground">Driver Dashboard</h1>
                <p className="text-sm text-hero-muted">Manage your rides and earnings</p>
              </div>
            </div>
            
            {/* Availability Toggle */}
            <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
              <span className={`text-sm font-medium ${isAvailable ? 'text-primary' : 'text-hero-muted'}`}>
                {isAvailable ? 'Online' : 'Offline'}
              </span>
              <Switch 
                checked={isAvailable} 
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Banner */}
        {isAvailable ? (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <p className="text-foreground font-medium">You're online and accepting ride requests</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-muted border border-border rounded-xl flex items-center gap-3">
            <div className="w-3 h-3 bg-muted-foreground rounded-full" />
            <p className="text-muted-foreground font-medium">You're offline. Toggle availability to start accepting rides.</p>
          </div>
        )}

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl font-bold text-foreground">${todayEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Earnings</p>
                  <p className="text-2xl font-bold text-foreground">${weeklyEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Car className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                  <p className="text-2xl font-bold text-foreground">{totalTrips}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Fare</p>
                  <p className="text-2xl font-bold text-foreground">${avgFare.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trip History */}
        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
            <CardDescription>Your recent completed and cancelled trips</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{trip.pickup}</p>
                          <p className="text-sm text-muted-foreground">→ {trip.dropoff}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{trip.date}</p>
                      <p className="text-sm text-muted-foreground">{trip.time}</p>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      ${trip.fare.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trip.status === "completed" ? "default" : "secondary"}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DriverDashboard;
