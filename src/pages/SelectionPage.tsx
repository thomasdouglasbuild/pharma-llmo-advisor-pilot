
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { getCompanies, getProducts, seedInitialData } from "@/services/pharmaDataService";
import { LoaderCircle, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SelectionPage = () => {
  const navigate = useNavigate();
  const [selectionType, setSelectionType] = useState<"company" | "product">("company");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    retry: 1,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    retry: 1,
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

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const success = await seedInitialData();
      if (success) {
        // Refetch data after seeding
        companiesQuery.refetch();
        productsQuery.refetch();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to seed initial data. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
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
                Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly configured.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
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
          <CardContent>
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
                      placeholder="Search products..."
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
