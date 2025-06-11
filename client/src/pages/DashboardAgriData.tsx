import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ClipboardList, BarChart3, TrendingUp, TrendingDown, FileText, Warehouse, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

const dummyPrices = [
  { commodity: "Rice", price: 12000, change: 2.1 },
  { commodity: "Corn", price: 8500, change: -1.3 },
  { commodity: "Soybean", price: 10500, change: 0.5 },
  { commodity: "Chili", price: 32000, change: 3.8 },
  { commodity: "Shallot", price: 25000, change: -0.7 },
];

const dummyStocks = [
  { commodity: "Rice", stock: 120000, unit: "ton" },
  { commodity: "Corn", stock: 80000, unit: "ton" },
  { commodity: "Soybean", stock: 40000, unit: "ton" },
  { commodity: "Chili", stock: 15000, unit: "ton" },
];

const dummyReports = [
  { title: "Q2 2025 Food Security Report", source: "Ministry of Agriculture", date: "2025-06-01" },
  { title: "Commodity Price Trends May 2025", source: "BPS", date: "2025-05-28" },
  { title: "National Stock Update", source: "Bulog", date: "2025-05-20" },
];

const dummyCommodities = [
  { name: "Rice", icon: <ShoppingCart className="h-4 w-4 text-green-600" /> },
  { name: "Corn", icon: <ShoppingCart className="h-4 w-4 text-yellow-500" /> },
  { name: "Soybean", icon: <ShoppingCart className="h-4 w-4 text-orange-500" /> },
  { name: "Chili", icon: <ShoppingCart className="h-4 w-4 text-red-500" /> },
  { name: "Shallot", icon: <ShoppingCart className="h-4 w-4 text-purple-500" /> },
];

export default function DashboardAgriData() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-6 mb-0">
        {/* Commodities Overview */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-green-700" />
              {t('dashboard.agriDataTitle') || 'Agriculture Data'}
            </CardTitle>
            <CardDescription>
              {t('dashboard.agriDataDescription') || 'Key agricultural data and statistics.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dummyCommodities.map((c) => (
                <Badge key={c.name} variant="secondary" className="flex items-center gap-1 px-3 py-1 text-base">
                  {c.icon} {c.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Price Table */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t('dashboard.commodityPrices') || 'Commodity Prices'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Price (Rp/kg)</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyPrices.map((row) => (
                  <TableRow key={row.commodity}>
                    <TableCell>{row.commodity}</TableCell>
                    <TableCell>{row.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant={row.change >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {row.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {row.change > 0 ? '+' : ''}{row.change}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {/* Stocks & Reports Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-6 mt-6">
        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-amber-700" />
              {t('dashboard.commodityStocks') || 'Commodity Stocks'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyStocks.map((row) => (
                  <TableRow key={row.commodity}>
                    <TableCell>{row.commodity}</TableCell>
                    <TableCell>{row.stock.toLocaleString('id-ID')} {row.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Government Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-700" />
              {t('dashboard.governmentReports') || 'Government Reports'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dummyReports.map((r, i) => (
                <li key={i} className="flex flex-col border-b pb-2 last:border-b-0">
                  <span className="font-medium text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" /> {r.title}
                  </span>
                  <span className="text-xs text-gray-500">{r.source} • {new Date(r.date).toLocaleDateString('id-ID')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
