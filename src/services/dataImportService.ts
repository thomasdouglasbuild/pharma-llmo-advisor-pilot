import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const importBlockbusterProducts = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Importing Products',
      description: 'Loading 40 pharmaceutical blockbusters...',
    });

    console.log('Starting product import...');

    const { data, error } = await supabase.functions.invoke('ingest-products-csv', {
      body: {}
    });

    console.log('Import response:', data);

    if (error) {
      console.error('Error calling ingest-products-csv function:', error);
      throw error;
    }

    if (data.success) {
      const { products_added, products_updated, products_skipped, missing_companies } = data;
      
      let message = `Successfully processed ${products_added + products_updated} products`;
      if (products_skipped > 0) {
        message += `. Skipped ${products_skipped} products due to missing companies`;
      }
      
      toast({
        title: 'Import Complete',
        description: message,
        duration: 6000,
      });

      // Show details about missing companies if any
      if (missing_companies && missing_companies.length > 0) {
        console.warn('Missing companies:', missing_companies);
        setTimeout(() => {
          toast({
            title: 'Missing Companies',
            description: `Some companies not found: ${missing_companies.slice(0, 3).join(', ')}${missing_companies.length > 3 ? '...' : ''}`,
            variant: 'default',
            duration: 8000,
          });
        }, 2000);
      }

      return true;
    } else {
      throw new Error(data.error || 'Failed to import products');
    }
  } catch (error: any) {
    console.error('Error importing products:', error);
    toast({
      title: 'Import Failed',
      description: error.message || 'Failed to import pharmaceutical products',
      variant: 'destructive',
    });
    return false;
  }
};

export const seedSampleData = async (): Promise<boolean> => {
  try {
    toast({
      title: 'Seeding Sample Data',
      description: 'Loading realistic demo data with OpenAI answers...',
    });

    console.log('Starting sample data seeding...');

    const { data, error } = await supabase.functions.invoke('seed-sample-data', {
      body: {}
    });

    console.log('Sample data response:', data);

    if (error) {
      console.error('Error calling seed-sample-data function:', error);
      throw error;
    }

    if (data.success) {
      toast({
        title: 'Sample Data Loaded',
        description: `Successfully seeded ${data.answers_inserted} realistic answers for ${data.product_name} with ${data.sources_inserted} sources.`,
        duration: 6000,
      });

      return true;
    } else {
      throw new Error(data.error || 'Failed to seed sample data');
    }
  } catch (error: any) {
    console.error('Error seeding sample data:', error);
    toast({
      title: 'Sample Data Failed',
      description: error.message || 'Failed to seed sample data',
      variant: 'destructive',
    });
    return false;
  }
};

export const checkDataAvailability = async () => {
  try {
    const { data: companies, error: companiesError } = await supabase
      .from('company')
      .select('id, name')
      .limit(5);

    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('id, brand_name')
      .limit(5);

    if (companiesError || productsError) {
      throw new Error('Error checking data availability');
    }

    return {
      hasCompanies: (companies?.length || 0) > 0,
      hasProducts: (products?.length || 0) > 0,
      companiesCount: companies?.length || 0,
      productsCount: products?.length || 0
    };
  } catch (error) {
    console.error('Error checking data availability:', error);
    return {
      hasCompanies: false,
      hasProducts: false,
      companiesCount: 0,
      productsCount: 0
    };
  }
};
