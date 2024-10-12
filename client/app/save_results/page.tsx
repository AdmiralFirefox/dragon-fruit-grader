import SavedResults from "@/app/components/PageContent/SavedResults";

export default function SaveResults({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <SavedResults searchParams={searchParams} />;
}
