import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { getCompanies, getProducts, seedInitialData, searchAndUpdatePharmaData } from "@/services/pharmaDataService";
import { LoaderCircle, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SelectionPage = () => {
  console.log('SelectionPage: Component mounting...');
  
  const navigate = useNavigate();
  const [selectionType, setSelectionType] = useState<"company" | "product">("company");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => {
      console.log('SelectionPage: Fetching companies...');
      return getCompanies();
    },
    retry: 1,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => {
      console.log('SelectionPage: Fetching products...');
      return getProducts();
    },
    retry: 1,
  });

  console.log('SelectionPage: Companies query state:', {
    isLoading: companiesQuery.isLoading,
    isError: companiesQuery.isError,
    error: companiesQuery.error,
    dataLength: companiesQuery.data?.length
  });

  console.log('SelectionPage: Products query state:', {
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    dataLength: productsQuery.data?.length
  });

  const companyOptions = companiesQuery.data 
    ? companiesQuery.data
        .filter(company => company && company.id && company.name)
        .map(company => ({
          value: company.id.toString(),
          label: `${company.name} (Rank: ${company.rank_2024 || 'N/A'})`
        }))
    : [];

  const productOptions = productsQuery.data 
    ? productsQuery.data
        .filter(product => product && product.id && product.brand_name)
        .map(product => ({
          value: product.id.toString(),
          label: `${product.brand_name} (${product.inn || 'unknown INN'})`
        }))
    : [];

  const isLoading = companiesQuery.isLoading || productsQuery.isLoading;
  const hasError = companiesQuery.isError || productsQuery.isError;
  const isEmpty = !isLoading && !hasError && (companyOptions.length === 0 && productOptions.length === 0);

  console.log('SelectionPage: Render state:', { isLoading, hasError, isEmpty });

  const handleSeedData = async () => {
    console.log('SelectionPage: Starting data seeding...');
    setIsSeeding(true);
    try {
      const success = await seedInitialData();
      if (success) {
        console.log('SelectionPage: Seeding successful, refetching data...');
        // Refetch data after seeding
        companiesQuery.refetch();
        productsQuery.refetch();
      }
    } catch (error) {
      console.error('SelectionPage: Seeding failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed initial data. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLoadProducts = async () => {
    console.log('SelectionPage: Loading products from top 25 companies...');
    setIsLoadingProducts(true);
    try {
      const success = await searchAndUpdatePharmaData();
      if (success) {
        console.log('SelectionPage: Product loading successful, refetching data...');
        // Refetch data after loading products
        companiesQuery.refetch();
        productsQuery.refetch();
      }
    } catch (error) {
      console.error('SelectionPage: Product loading failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleContinue = () => {
    if (selectionType === "company" && selectedCompanyId) {
      navigate(`/dashboard?companyId=${selectedCompanyId}`);
    } else if (selectionType === "product" && selectedProductId) {
      navigate(`/dashboard?productId=${selectedProductId}`);
    }
  };

  if (hasError) {
    console.log('SelectionPage: Rendering error state');
    const errorMessage = companiesQuery.error?.message || productsQuery.error?.message || 'Unknown error';
    console.error('SelectionPage: Error details:', errorMessage);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
            <CardDescription>
              Unable to connect to the database. Please check your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Error: {errorMessage}
              </p>
              <p className="text-sm text-gray-600">
                Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly configured.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('SelectionPage: Retrying connection...');
                  companiesQuery.refetch();
                  productsQuery.refetch();
                }}
              >
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEmpty) {
    console.log('SelectionPage: Rendering empty state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              No Data Found
            </CardTitle>
            <CardDescription>
              The database appears to be empty. Would you like to populate it with initial data?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Populate Initial Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('SelectionPage: Rendering main interface');
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">RepuScore™ Analysis</CardTitle>
          <CardDescription>
            Select a company or product to begin the analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoaderCircle className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <>
              {/* Load Products Button - Show if products are empty */}
              {productOptions.length === 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    No products found. Load products from top 25 pharmaceutical companies:
                  </p>
                  <Button 
                    onClick={handleLoadProducts}
                    disabled={isLoadingProducts}
                    size="sm"
                    className="w-full"
                  >
                    {isLoadingProducts ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Loading Products...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Load Top 25 Company Products
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Tabs value={selectionType} onValueChange={(value: "company" | "product") => setSelectionType(value)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="company">By Company</TabsTrigger>
                  <TabsTrigger value="product">By Product</TabsTrigger>
                </TabsList>
                
                <TabsContent value="company" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select a company</label>
                    <Combobox 
                      items={companyOptions}
                      value={selectedCompanyId}
                      onChange={setSelectedCompanyId}
                      placeholder="Search companies..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="product" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select a product</label>
                    <Combobox 
                      items={productOptions}
                      value={selectedProductId}
                      onChange={setSelectedProductId}
                      placeholder={productOptions.length === 0 ? "Load products first..." : "Search products..."}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                className="w-full mt-6" 
                onClick={handleContinue}
                disabled={
                  (selectionType === "company" && !selectedCompanyId) || 
                  (selectionType === "product" && !selectedProductId)
                }
              >
                Start Analysis
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectionPage;
