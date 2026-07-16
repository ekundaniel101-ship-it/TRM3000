import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { getResultsHeading, getResultsRows, type ScoreForSheet, type TestForSheet } from "@/lib/results";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  title: { fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 16 },
  table: { display: "flex", width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000" },
  row: { flexDirection: "row" },
  headerRow: { flexDirection: "row", backgroundColor: "#e5e7eb" },
  cell: {
    borderStyle: "solid",
    borderColor: "#000",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
  },
  headerCell: {
    borderStyle: "solid",
    borderColor: "#000",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    fontWeight: 700,
  },
});

type Column = { label: string; width: string; align?: "left" | "center" };

export async function buildClassResultsPdf(
  test: TestForSheet,
  scores: ScoreForSheet[]
): Promise<Buffer> {
  const isMock = test.type === "MOCK";
  const { title, subtitle } = getResultsHeading(test);
  const rows = getResultsRows(test, scores);

  const columns: Column[] = isMock
    ? [
        { label: "SN", width: "6%", align: "center" },
        { label: "NAME", width: "30%" },
        { label: "COURSE", width: "16%" },
        { label: "OBJECTIVE (40)", width: "14%", align: "center" },
        { label: "THEORY (60)", width: "14%", align: "center" },
        { label: "TOTAL (100)", width: "12%", align: "center" },
        { label: "GRADE", width: "8%", align: "center" },
      ]
    : [
        { label: "SN", width: "8%", align: "center" },
        { label: "NAME", width: "40%" },
        { label: "COURSE", width: "22%" },
        { label: "SCORE", width: "16%", align: "center" },
        { label: "GRADE", width: "14%", align: "center" },
      ];

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <Text key={col.label} style={{ ...styles.headerCell, width: col.width, textAlign: col.align ?? "left" }}>
                {col.label}
              </Text>
            ))}
          </View>
          {rows.map((row) => {
            const values = isMock
              ? [
                  String(row.sn),
                  row.name,
                  row.course,
                  row.objective != null ? String(row.objective) : "",
                  row.theory != null ? String(row.theory) : "",
                  String(row.total),
                  row.grade,
                ]
              : [String(row.sn), row.name, row.course, `${Math.round(row.percentage)}%`, row.grade];

            return (
              <View style={styles.row} key={row.sn} wrap={false}>
                {columns.map((col, i) => (
                  <Text
                    key={col.label}
                    style={{ ...styles.cell, width: col.width, textAlign: col.align ?? "left" }}
                  >
                    {values[i]}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
