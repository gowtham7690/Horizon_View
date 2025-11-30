import { redirect } from 'next/navigation';
import VisualizeClient from './VisualizeClient';

interface SearchParams {
  from?: string;
  to?: string;
  dt?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function VisualizePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Validate required parameters
  if (!params.from || !params.to || !params.dt) {
    redirect('/');
  }

  return <VisualizeClient searchParams={{
    from: params.from,
    to: params.to,
    dt: params.dt
  }} />;
}
