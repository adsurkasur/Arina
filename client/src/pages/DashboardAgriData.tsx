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
	{ commodity: "Cabbage", price: 8000, change: 1.2 },
	{ commodity: "Tomato", price: 15000, change: -2.1 },
	{ commodity: "Potato", price: 12500, change: 0.8 },
	{ commodity: "Carrot", price: 11000, change: 1.5 },
	{ commodity: "Spinach", price: 7500, change: -0.9 },
];

const dummyStocks = [
	{ commodity: "Rice", stock: 120000, unit: "ton" },
	{ commodity: "Corn", stock: 80000, unit: "ton" },
	{ commodity: "Soybean", stock: 40000, unit: "ton" },
	{ commodity: "Chili", stock: 15000, unit: "ton" },
	{ commodity: "Cabbage", stock: 25000, unit: "ton" },
	{ commodity: "Tomato", stock: 18000, unit: "ton" },
	{ commodity: "Potato", stock: 35000, unit: "ton" },
	{ commodity: "Carrot", stock: 22000, unit: "ton" },
];

const dummyReports = [
	{ title: "Q2 2025 Food Security Report", source: "Ministry of Agriculture", date: "2025-06-01" },
	{ title: "Commodity Price Trends May 2025", source: "BPS", date: "2025-05-28" },
	{ title: "National Stock Update", source: "Bulog", date: "2025-05-20" },
	{ title: "Agricultural Production Forecast", source: "Ministry of Agriculture", date: "2025-05-15" },
	{ title: "Export-Import Balance Report", source: "Ministry of Trade", date: "2025-05-10" },
	{ title: "Weather Impact Analysis", source: "BMKG", date: "2025-05-05" },
	{ title: "Farming Technology Adoption", source: "Research Institute", date: "2025-04-30" },
	{ title: "Regional Market Analysis", source: "BPS", date: "2025-04-25" },
];

const dummyCommodities = [
	{ name: "Rice", icon: <ShoppingCart className="h-4 w-4 text-green-600" /> },
	{ name: "Corn", icon: <ShoppingCart className="h-4 w-4 text-yellow-500" /> },
	{ name: "Soybean", icon: <ShoppingCart className="h-4 w-4 text-orange-500" /> },
	{ name: "Chili", icon: <ShoppingCart className="h-4 w-4 text-red-500" /> },
	{ name: "Shallot", icon: <ShoppingCart className="h-4 w-4 text-purple-500" /> },
	{ name: "Cabbage", icon: <ShoppingCart className="h-4 w-4 text-green-500" /> },
	{ name: "Tomato", icon: <ShoppingCart className="h-4 w-4 text-red-400" /> },
	{ name: "Potato", icon: <ShoppingCart className="h-4 w-4 text-amber-600" /> },
];

// Custom scrollbar CSS class
const customScrollbarClass = `
  scrollbar-thin 
  scrollbar-track-gray-100 
  scrollbar-thumb-gray-300 
  hover:scrollbar-thumb-gray-400 
  scrollbar-thumb-rounded-full 
  scrollbar-track-rounded-full
`;

export default function DashboardAgriData() {
	const { t } = useTranslation();

	return (
		<div className="w-full h-full flex flex-col bg-gray-50">
			{/* Header Section - Fixed */}
			<div className="bg-white border-b p-6 flex-shrink-0 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							{t("dashboard.agriDataTitle") || "Data Pertanian"}
						</h1>
						<p className="text-gray-600 mt-1">
							{t("dashboard.agriDataDescription") ||
								"Data dan statistik pertanian terkini"}
						</p>
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<span>Terakhir diperbarui:</span>
						<Badge variant="outline">
							{new Date().toLocaleDateString("id-ID")}
						</Badge>
					</div>
				</div>
			</div>

			{/* Scrollable Content */}
			<div className={`flex-1 overflow-y-auto ${customScrollbarClass}`}>
				<div className="space-y-6 p-6">
					{/* Overview Section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Commodities Overview */}
						<Card className="col-span-1 md:col-span-1">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ClipboardList className="h-6 w-6 text-green-700" />
									{t("dashboard.commoditiesOverview") || "Komoditas Utama"}
								</CardTitle>
								<CardDescription>
									{t("dashboard.commoditiesDescription") ||
										"Komoditas pertanian yang dipantau"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{dummyCommodities.map((c) => (
										<Badge
											key={c.name}
											variant="secondary"
											className="flex items-center gap-1 px-3 py-1 text-sm hover:bg-gray-200 transition-colors cursor-pointer"
										>
											{c.icon} {c.name}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Price Summary Stats */}
						<Card className="col-span-1 md:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="h-5 w-5 text-blue-600" />
									{t("dashboard.priceOverview") || "Ringkasan Harga"}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4">
									<div className="text-center p-3 bg-green-50 rounded-lg">
										<div className="text-2xl font-bold text-green-600">
											{dummyPrices.filter((p) => p.change > 0).length}
										</div>
										<div className="text-sm text-green-700">Naik</div>
									</div>
									<div className="text-center p-3 bg-red-50 rounded-lg">
										<div className="text-2xl font-bold text-red-600">
											{dummyPrices.filter((p) => p.change < 0).length}
										</div>
										<div className="text-sm text-red-700">Turun</div>
									</div>
									<div className="text-center p-3 bg-gray-50 rounded-lg">
										<div className="text-2xl font-bold text-gray-600">
											{dummyPrices.filter((p) => p.change === 0).length}
										</div>
										<div className="text-sm text-gray-700">Stabil</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Price Table Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-blue-600" />
								{t("dashboard.commodityPrices") || "Harga Komoditas"}
							</CardTitle>
							<CardDescription>
								Harga komoditas pertanian per kilogram dalam Rupiah
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[200px]">Komoditas</TableHead>
											<TableHead className="text-right">Harga (Rp/kg)</TableHead>
											<TableHead className="text-center">Perubahan</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{dummyPrices.map((row) => (
											<TableRow key={row.commodity} className="hover:bg-gray-50">
												<TableCell className="font-medium">{row.commodity}</TableCell>
												<TableCell className="text-right font-mono">
													Rp {row.price.toLocaleString("id-ID")}
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant={row.change >= 0 ? "default" : "destructive"}
														className="flex items-center gap-1 justify-center w-fit mx-auto"
													>
														{row.change >= 0 ? (
															<TrendingUp className="h-3 w-3" />
														) : (
															<TrendingDown className="h-3 w-3" />
														)}
														{row.change > 0 ? "+" : ""}
														{row.change}%
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					{/* Stocks & Reports Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Stock Table */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Warehouse className="h-5 w-5 text-amber-700" />
									{t("dashboard.commodityStocks") || "Stok Komoditas"}
								</CardTitle>
								<CardDescription>
									Stok nasional komoditas pertanian utama
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{dummyStocks.map((row) => (
										<div
											key={row.commodity}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div className="flex items-center gap-3">
												<ShoppingCart className="h-4 w-4 text-amber-600" />
												<span className="font-medium">{row.commodity}</span>
											</div>
											<div className="text-right">
												<div className="font-mono font-semibold">
													{row.stock.toLocaleString("id-ID")} {row.unit}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Government Reports */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-gray-700" />
									{t("dashboard.governmentReports") || "Laporan Pemerintah"}
								</CardTitle>
								<CardDescription>
									Laporan dan publikasi resmi terbaru
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div
									className={`space-y-3 max-h-80 overflow-y-auto ${customScrollbarClass} pr-2`}
								>
									{dummyReports.map((r, i) => (
										<div
											key={i}
											className="flex flex-col p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
										>
											<div className="flex items-start gap-3">
												<FileText className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
												<div className="flex-1 min-w-0">
													<span className="font-medium text-sm text-gray-900 block leading-tight">
														{r.title}
													</span>
													<div className="flex items-center gap-2 mt-1">
														<Badge variant="outline" className="text-xs">
															{r.source}
														</Badge>
														<span className="text-xs text-gray-500">
															{new Date(r.date).toLocaleDateString("id-ID", {
																year: "numeric",
																month: "short",
																day: "numeric",
															})}
														</span>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Additional Statistics Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<TrendingUp className="h-5 w-5 text-green-600" />
								</div>
								<div>
									<div className="text-2xl font-bold text-gray-900">
										{dummyPrices.filter((p) => p.change > 0).length}
									</div>
									<div className="text-sm text-gray-600">Harga Naik</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-red-100 rounded-lg">
									<TrendingDown className="h-5 w-5 text-red-600" />
								</div>
								<div>
									<div className="text-2xl font-bold text-gray-900">
										{dummyPrices.filter((p) => p.change < 0).length}
									</div>
									<div className="text-sm text-gray-600">Harga Turun</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-amber-100 rounded-lg">
									<Warehouse className="h-5 w-5 text-amber-600" />
								</div>
								<div>
									<div className="text-2xl font-bold text-gray-900">
										{dummyStocks.length}
									</div>
									<div className="text-sm text-gray-600">Komoditas</div>
								</div>
							</div>
						</Card>

						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<FileText className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<div className="text-2xl font-bold text-gray-900">
										{dummyReports.length}
									</div>
									<div className="text-sm text-gray-600">Laporan</div>
								</div>
							</div>
						</Card>
					</div>

					{/* Footer Space */}
					<div className="h-6"></div>
				</div>
			</div>

			{/* Custom Scrollbar Styles */}
			<style>{`
				.scrollbar-thin::-webkit-scrollbar {
					width: 6px;
				}
				.scrollbar-track-gray-100::-webkit-scrollbar-track {
					background-color: #f3f4f6;
					border-radius: 9999px;
				}
				.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
					background-color: #d1d5db;
					border-radius: 9999px;
				}
				.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
					background-color: #9ca3af;
				}
			`}</style>
		</div>
	);
}
