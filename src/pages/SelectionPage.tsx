
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { getCompanies, getProducts } from "@/services/pharmaDataService";
import { LoaderCircle } from "lucide-react";

const SelectionPage = () => {
  const navigate = useNavigate();
  const [selectionType, setSelectionType] = useState<"company" | "product">("company");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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

  // Enhanced safety: Ensure we always have valid arrays with additional checks
  const companyOptions = companiesQuery.data 
    ? companiesQuery.data
        .filter(company => company && company.id && company.name) // Filter out invalid entries
        .map(company => ({
          value: company.id.toString(),
          label: `${company.name} (Rank: ${company.rank_2024 || 'N/A'})`
        }))
    : [];

  const productOptions = productsQuery.data 
    ? productsQuery.data
        .filter(product => product && product.id && product.brand_name) // Filter out invalid entries
        .map(product => ({
          value: product.id.toString(),
          label: `${product.brand_name} (${product.inn || 'unknown INN'})`
        }))
    : [];

  const isLoading = companiesQuery.isLoading || productsQuery.isLoading;
  const hasError = companiesQuery.isError || productsQuery.isError;

  // Debug logging
  console.log("Companies query data:", companiesQuery.data);
  console.log("Products query data:", productsQuery.data);
  console.log("Company options:", companyOptions);
  console.log("Product options:", productOptions);

  const handleContinue = () => {
    if (selectionType === "company" && selectedCompanyId) {
      navigate(`/dashboard?companyId=${selectedCompanyId}`);
    } else if (selectionType === "product" && selectedProductId) {
      navigate(`/dashboard?productId=${selectedProductId}`);
    }
  };

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
          ) : hasError ? (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-4">Error loading data</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  companiesQuery.refetch();
                  productsQuery.refetch();
                }}
              >
                Retry
              </Button>
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
