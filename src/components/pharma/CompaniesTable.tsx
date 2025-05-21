
import { Company } from "@/types/PharmaTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "react-router-dom";

interface CompaniesTableProps {
  companies: Company[];
}

const CompaniesTable = ({ companies }: CompaniesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>HQ Country</TableHead>
            <TableHead className="text-right">Sales 2024 (bn)</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.rank_2024}</TableCell>
              <TableCell>
                <Link 
                  to={`/company/${company.id}`} 
                  className="text-blue-600 hover:underline"
                >
                  {company.name}
                </Link>
              </TableCell>
              <TableCell>{company.hq_country}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(company.sales_2024_bn, 'USD')}
              </TableCell>
              <TableCell>{company.ticker}</TableCell>
              <TableCell>
                {company.updated_at ? new Date(company.updated_at).toLocaleDateString() : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No companies found. Click "Ingest Top 100" to fetch data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
