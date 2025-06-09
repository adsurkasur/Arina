import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Wifi, Droplets, CloudRain, Thermometer, Sprout, AirVent } from "lucide-react";
import { useTranslation } from "react-i18next";

const dummyDevices = [
  { id: 1, name: "Drone 1", type: "drone", status: "active" },
  { id: 2, name: "Soil Sensor A", type: "soil", status: "active" },
  { id: 3, name: "Rain Sensor B", type: "rain", status: "inactive" },
  { id: 4, name: "Humidity Sensor C", type: "humidity", status: "active" },
  { id: 5, name: "Sprinkler 1", type: "sprinkler", status: "active" },
];

const typeIcon = (type: string) => {
  switch (type) {
    case "drone": return <AirVent className="h-5 w-5 text-blue-500" />; // AirVent as drone icon
    case "soil": return <Sprout className="h-5 w-5 text-green-600" />;
    case "rain": return <CloudRain className="h-5 w-5 text-blue-400" />;
    case "humidity": return <Droplets className="h-5 w-5 text-cyan-500" />;
    case "sprinkler": return <Wifi className="h-5 w-5 text-purple-500" />;
    default: return <Thermometer className="h-5 w-5 text-gray-400" />;
  }
};

export default function DashboardDevices() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-purple-600" />
            {t('dashboard.devicesTitle') || 'Device Management'}
          </CardTitle>
          <CardDescription>
            {t('dashboard.devicesDescription') || 'Manage your agriculture IoT devices here.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search devices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => setOpen(true)} variant="default">
              <Plus className="mr-2 h-4 w-4" /> Add Device
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyDevices.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(device => (
                <TableRow key={device.id}>
                  <TableCell>{typeIcon(device.type)}</TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>
                    <Badge variant={device.status === "active" ? "default" : "outline"}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-gray-400">Showing dummy data for agriculture devices.</span>
        </CardFooter>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Device Name" />
            <Input placeholder="Device Type (e.g. drone, soil, rain, etc)" />
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Add (Dummy)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
