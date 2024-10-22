import RecentActivityContent from "@/app/components/PageContent/RecentActivityContent";

export default async function RecentActivity({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <RecentActivityContent searchParams={searchParams} />;
}
