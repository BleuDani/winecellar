import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  primary: "#d55d0d",
  foreground: "#190f0a",
  muted: "#78645a",
  border: "#ecdfd4",
  background: "#fefbf8",
  secondary: "#ffeede",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    color: COLORS.foreground,
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  wineName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  meta: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  note: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 3,
  },
  badge: {
    fontSize: 8,
    color: COLORS.primary,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  date: {
    fontSize: 9,
    color: COLORS.muted,
  },
  empty: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type ReportPdfWithdrawal = {
  id: string;
  wineLabel: string;
  cellarName: string;
  quantity: number;
  reason: string | null;
  observation: string | null;
  wouldBuyAgain: boolean | null;
  withdrawnAt: string;
};

export function ReportDocument({
  startDate,
  endDate,
  totalBottles,
  distinctWines,
  withdrawals,
}: {
  startDate: string;
  endDate: string;
  totalBottles: number;
  distinctWines: number;
  withdrawals: ReportPdfWithdrawal[];
}) {
  return (
    <Document title="Wine Cellar Consumption Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Wine Cellar</Text>
          <Text style={styles.subtitle}>
            Consumption report · {formatDate(startDate)} – {formatDate(endDate)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Bottles Consumed</Text>
            <Text style={styles.statValue}>{totalBottles}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distinct Wines</Text>
            <Text style={styles.statValue}>{distinctWines}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consumed Wines</Text>

        {withdrawals.length === 0 ? (
          <Text style={styles.empty}>No bottles consumed in this period.</Text>
        ) : (
          withdrawals.map((w) => (
            <View key={w.id} style={styles.row} wrap={false}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.wineName}>{w.wineLabel}</Text>
                <Text style={styles.meta}>
                  {w.quantity} {w.quantity === 1 ? "bottle" : "bottles"} from {w.cellarName}
                </Text>
                {w.reason && <Text style={styles.note}>{w.reason}</Text>}
                {w.observation && <Text style={styles.note}>{w.observation}</Text>}
                {w.wouldBuyAgain !== null && (
                  <Text style={styles.badge}>
                    {w.wouldBuyAgain ? "Would buy again" : "Wouldn't buy again"}
                  </Text>
                )}
              </View>
              <Text style={styles.date}>{formatDate(w.withdrawnAt)}</Text>
            </View>
          ))
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Generated ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })} · Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
