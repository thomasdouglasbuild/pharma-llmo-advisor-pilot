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
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CompaniesTable from "@/components/pharma/CompaniesTable";
import ProductsTable from "@/components/pharma/ProductsTable";
import CompetitorGraph from "@/components/pharma/CompetitorGraph";
import { LoaderCircle, Search } from "lucide-react";

const PharmaDashboard = () => {
  const [activeTab, setActiveTab] = useState("companies");
  const [isUpdating, setIsUpdating] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
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
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
      }
    } finally {
      setIsUpdating(false);
    }
  };

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
            <Button 
              onClick={() => handleTriggerIngest('products')}
              className="mt-4"
              variant="outline"
            >
              Ingest Products
            </Button>
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
