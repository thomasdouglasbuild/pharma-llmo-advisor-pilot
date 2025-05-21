
import { Product } from "@/types/PharmaTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";

interface ProductsTableProps {
  products: Product[];
}

const ProductsTable = ({ products }: ProductsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand Name</TableHead>
            <TableHead>INN</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>ATC Level 3</TableHead>
            <TableHead>Indication</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link 
                  to={`/product/${product.id}`} 
                  className="text-blue-600 hover:underline"
                >
                  {product.brand_name || 'N/A'}
                </Link>
              </TableCell>
              <TableCell>{product.inn || 'N/A'}</TableCell>
              <TableCell>
                {product.company ? (
                  <Link 
                    to={`/company/${product.company.id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {product.company.name}
                  </Link>
                ) : 'N/A'}
              </TableCell>
              <TableCell>{product.atc_level3 || 'N/A'}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={product.indication || ''}>
                {product.indication || 'N/A'}
              </TableCell>
              <TableCell>
                {product.first_approval ? new Date(product.first_approval).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  product.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  product.status === 'Withdrawn' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {product.status || 'Unknown'}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No products found. Click "Ingest Products" to fetch data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
