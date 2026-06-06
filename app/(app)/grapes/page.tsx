import { getGrapes } from "@/actions/grape.actions";
import { CreateGrapeDialog } from "@/components/create-grape-dialog";
import { EditGrapeDialog } from "@/components/edit-grape-dialog";
import { DeleteGrapeButton } from "@/components/delete-grape-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function GrapesPage() {
  const { data: grapes, error } = await getGrapes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Grape Varieties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {grapes?.length ?? 0} varieties in your collection
          </p>
        </div>
        <CreateGrapeDialog />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Wines</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grapes?.map((grape) => (
            <TableRow key={grape.id}>
              <TableCell className="font-medium">{grape.name}</TableCell>
              <TableCell>
                {grape._count.wines > 0 ? (
                  <Badge variant="secondary">{grape._count.wines}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <EditGrapeDialog grape={grape} />
                  <DeleteGrapeButton
                    grapeId={grape.id}
                    grapeName={grape.name}
                    wineCount={grape._count.wines}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {grapes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No grape varieties yet. Add one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
