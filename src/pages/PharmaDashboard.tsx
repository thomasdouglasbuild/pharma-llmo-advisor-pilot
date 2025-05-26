
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCompanies,
  getProducts,
  triggerIngestTop100,
  triggerIngestProducts,
  triggerRebuildCompetitors,
  searchAndUpdatePharmaData,
} from "@/services/pharmaDataService";
import { importBlockbusterProducts, checkDataAvailability } from "@/services/dataImportService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CompaniesTable from "@/components/pharma/CompaniesTable";
import ProductsTable from "@/components/pharma/ProductsTable";
import CompetitorGraph from "@/components/pharma/CompetitorGraph";
import { LoaderCircle, Search, Download, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PharmaDashboard = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: dataStatus, refetch: refetchDataStatus } = useQuery({
    queryKey: ["data-availability"],
    queryFn: checkDataAvailability,
  });

  const handleTriggerIngest = async (type: string) => {
    try {
      let success = false;
      
      switch (type) {
        case 'top100':
          success = await triggerIngestTop100();
          break;
        case 'products':
          success = await triggerIngestProducts();
          break;
        case 'competitors':
          success = await triggerRebuildCompetitors();
          break;
        default:
          throw new Error('Invalid ingest type');
      }
      
      if (success) {
        // Refetch data after successful ingest
        if (type === 'top100' || type === 'competitors') {
          companiesQuery.refetch();
        }
        if (type === 'products' || type === 'competitors') {
          productsQuery.refetch();
        }
        refetchDataStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImportBlockbusters = async () => {
    setIsImporting(true);
    try {
      const success = await importBlockbusterProducts();
      if (success) {
        // Refetch data after successful import
        productsQuery.refetch();
        refetchDataStatus();
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpdatePharmaData = async () => {
    setIsUpdating(true);
    try {
      const success = await searchAndUpdatePharmaData();
      if (success) {
        // Refetch both companies and products data
        companiesQuery.refetch();
        productsQuery.refetch();
        refetchDataStatus();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Show data import alert if no products are available
  const showDataImportAlert = dataStatus && !dataStatus.hasProducts;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pharma Data Dashboard</h1>
        <Button 
          onClick={handleUpdatePharmaData}
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          {isUpdating ? (
            <LoaderCircle className="animate-spin h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isUpdating ? 'Updating...' : 'Update with ChatGPT'}
        </Button>
      </div>

      {showDataImportAlert && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>No products found in the database. Import pharmaceutical data to get started.</span>
            <Button 
              onClick={handleImportBlockbusters}
              disabled={isImporting}
              size="sm"
              className="ml-4"
            >
              {isImporting ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import 40 Blockbusters
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Companies</CardTitle>
            <CardDescription>Top 50 pharma companies (ChatGPT updated)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {companiesQuery.isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                companiesQuery.data?.length || 0
              )}
            </p>
            <Button 
              onClick={() => handleTriggerIngest('top100')}
              className="mt-4"
              variant="outline"
            >
              Ingest Top 100
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Product catalogues (ChatGPT updated)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productsQuery.isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                productsQuery.data?.length || 0
              )}
            </p>
            <div className="space-y-2 mt-4">
              <Button 
                onClick={handleImportBlockbusters}
                disabled={isImporting}
                className="w-full"
                variant="default"
              >
                {isImporting ? (
                  <>
                    <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Blockbusters
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleTriggerIngest('products')}
                className="w-full"
                variant="outline"
              >
                Ingest Products
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Competitor Graph</CardTitle>
            <CardDescription>ATC classification-based</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleTriggerIngest('competitors')}
              className="mt-4"
              variant="outline"
            >
              Rebuild Competitor Graph
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="graph">Competitor Graph</TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>
                Top 50 pharmaceutical companies by sales (updated via ChatGPT search)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companiesQuery.isLoading ? (
                <div className="flex justify-center p-8">
                  <LoaderCircle className="animate-spin h-8 w-8" />
                </div>
              ) : (
                <CompaniesTable companies={companiesQuery.data || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Product catalogues from ChatGPT search and EMA/FDA data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsQuery.isLoading ? (
                <div className="flex justify-center p-8">
                  <LoaderCircle className="animate-spin h-8 w-8" />
                </div>
              ) : (
                <ProductsTable products={productsQuery.data || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Graph</CardTitle>
              <CardDescription>
                Therapeutic-Area & Competitor Graph using WHO ATC classification
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <CompetitorGraph />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmaDashboard;
