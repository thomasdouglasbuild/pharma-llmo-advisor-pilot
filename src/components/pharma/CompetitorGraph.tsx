
import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanies, getProducts } from "@/services/pharmaDataService";
import { Product } from "@/types/PharmaTypes";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";

// Lazy load the ForceGraph2D component
const ForceGraph2D = lazy(() => import('react-force-graph-2d'));

interface GraphNode {
  id: string;
  name: string;
  val: number;
  group: string;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const CompetitorGraph = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const graphRef = useRef<any>(null);
  
  // Fetch products for the dropdown
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-for-graph"],
    queryFn: getProducts,
  });

  // Generate mock graph data based on ATC codes (this would be replaced by real data from API)
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // If no product is selected, show a subset of products for visualization
    const relevantProducts = selectedProduct 
      ? products.filter(p => 
          p.id.toString() === selectedProduct || 
          p.atc_level3 === products.find(sp => sp.id.toString() === selectedProduct)?.atc_level3
        )
      : products.slice(0, 20); // Take first 20 for initial view

    // Group by ATC code
    const atcGroups = relevantProducts.reduce<Record<string, Product[]>>((acc, product) => {
      const atc = product.atc_level3 || 'unknown';
      if (!acc[atc]) acc[atc] = [];
      acc[atc].push(product);
      return acc;
    }, {});

    // Generate color map for ATC codes
    const colors = [
      '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
      '#ffff33', '#a65628', '#f781bf', '#999999'
    ];
    
    const atcColors = Object.keys(atcGroups).reduce<Record<string, string>>((acc, atc, i) => {
      acc[atc] = colors[i % colors.length];
      return acc;
    }, {});

    // Create nodes
    const nodes: GraphNode[] = relevantProducts.map(product => ({
      id: `p-${product.id}`,
      name: product.brand_name || `Product ${product.id}`,
      val: 5, // Size of node
      group: product.atc_level3 || 'unknown',
      color: atcColors[product.atc_level3 || 'unknown']
    }));

    // Create links between products with the same ATC code
    const links: GraphLink[] = [];
    
    Object.values(atcGroups).forEach(group => {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            // Create a link between products in the same ATC group
            links.push({
              source: `p-${group[i].id}`,
              target: `p-${group[j].id}`,
              value: 1 // Strength of link
            });
          }
        }
      }
    });

    setGraphData({ nodes, links });
  }, [products, selectedProduct]);

  // Product selection options for dropdown
  const productOptions = products?.map(product => ({
    label: `${product.brand_name || 'Unnamed'} (${product.inn || 'No INN'})`,
    value: product.id.toString()
  })) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center">
        <div className="w-64 mr-4">
          <Combobox 
            items={productOptions}
            placeholder="Select a product..."
            value={selectedProduct}
            onChange={setSelectedProduct}
          />
        </div>
        
        {selectedProduct && (
          <Button 
            variant="outline"
            onClick={() => setSelectedProduct(null)}
          >
            Clear Selection
          </Button>
        )}
      </div>
      
      <div className="flex-1 border rounded-md overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <Suspense fallback={
            <div className="flex justify-center items-center h-full">
              <LoaderCircle className="animate-spin h-8 w-8" />
            </div>
          }>
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="name"
              nodeAutoColorBy="group"
              linkWidth={1}
              linkColor={() => "#cccccc"}
              nodeRelSize={6}
              onNodeClick={(node: any) => {
                setSelectedProduct(node.id.replace('p-', ''));
              }}
            />
          </Suspense>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No competitor data available. Try ingesting more products.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorGraph;
