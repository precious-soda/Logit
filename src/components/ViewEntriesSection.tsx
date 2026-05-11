import {
    View, Text, FlatList, ScrollView,
    ActivityIndicator, StyleSheet, Alert, TouchableOpacity
  } from 'react-native';
  import * as FileSystem from 'expo-file-system/next';
  import * as Sharing from 'expo-sharing';
  import XLSX from 'xlsx';
  import { getAllEntries } from '../db/database';

  
  type Props = {
    fields: any[];
    rows: any[];
    onLoadMore: () => void;
    hasMore: boolean;
    loadingMore: boolean;
    formId: number;
  };
  
  const COL_WIDTH = 120;
  const TIME_COL_WIDTH = 90;
  
  export default function ViewEntriesSection({
    fields, rows, onLoadMore, hasMore, loadingMore, formId
  }: Props) {
  
  const handleExport = async () => {
    try {
      const { fields: allFields, rows: allRows } =
        await getAllEntries(formId);

      // Create header row
      const headers = [
        ...allFields.map((f: any) => f.label),
        'Saved At',
      ];

      // Create data rows
      const excelData = allRows.map((row: any) => [
        ...allFields.map((_: any, i: number) =>
          row.values?.[i] ?? ''
        ),
        new Date(row.createdAt).toLocaleString('en-IN'),
      ]);

      // Combine headers + rows
      const worksheetData = [
        headers,
        ...excelData,
      ];

      // Create worksheet
      const worksheet =
        XLSX.utils.aoa_to_sheet(worksheetData);

      // Create workbook
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Entries'
      );

      // Generate base64 Excel
      const base64 = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const filename =
        `entries_${formId}_${Date.now()}.xlsx`;

      const file = new FileSystem.File(
        FileSystem.Paths.cache,
        filename
      );

      const binaryString = atob(base64);

      const bytes = new Uint8Array(
        binaryString.length
      );

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      file.write(bytes);

      await Sharing.shareAsync(file.uri, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Entries',
        UTI: 'com.microsoft.excel.xlsx',
      });

    } catch (e) {
      console.error(e);

      Alert.alert(
        'Export Failed',
        'Something went wrong while exporting.'
      );
    }
  };

    if (rows.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySubtitle}>
            Switch to Fill Form to add your first entry
          </Text>
        </View>
      );
    }
  
    const renderRow = ({ item, index }: { item: any; index: number }) => (
      <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
        {item.values.map((val: string, colIndex: number) => (
          <View key={colIndex} style={[styles.cell, { width: COL_WIDTH }]}>
            <Text style={styles.cellText} numberOfLines={1}>{val || '—'}</Text>
          </View>
        ))}
        <View style={[styles.cell, { width: TIME_COL_WIDTH }]}>
          <Text style={styles.cellTextMuted}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  
    const renderFooter = () => {
      if (!hasMore) return (
        <Text style={styles.endText}>All entries loaded</Text>
      );
      if (loadingMore) return (
        <ActivityIndicator style={{ margin: 16 }} color="#007bff" />
      );
      return null;
    };
  
    return (
    <View style={{ flex: 1 }}>

      <View style={styles.toolbar}>
        <Text style={styles.entryCount}>{rows.length} entries</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportIcon}>⬇</Text>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.tableHeader}>
            {fields.map((field: any) => (
              <View key={field.id} style={[styles.cell, styles.headerCell, { width: COL_WIDTH }]}>
                <Text style={styles.headerText} numberOfLines={1}>{field.label}</Text>
              </View>
            ))}
            <View style={[styles.cell, styles.headerCell, { width: TIME_COL_WIDTH }]}>
              <Text style={styles.headerText}>Saved At</Text>
            </View>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(item) => item.entryId.toString()}
            renderItem={renderRow}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

    </View>
    );
  }
  
  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      + '\n'
      + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  
  const styles = StyleSheet.create({
    toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
    entryCount: { fontSize: 13, color: '#888', fontWeight: '500' },
    exportBtn: {
      marginLeft: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#f0f7ff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#007bff',
    },
    exportIcon: { fontSize: 13, color: '#007bff' },
    exportText: { fontSize: 13, color: '#007bff', fontWeight: '600' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    emptySubtitle: { color: '#888', textAlign: 'center', paddingHorizontal: 40 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#1a1a2e' },
    headerCell: { paddingVertical: 12 },
    headerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    tableRow: { flexDirection: 'row', backgroundColor: '#fff' },
    tableRowAlt: { backgroundColor: '#f8f9ff' },
    cell: { paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
    cellText: { fontSize: 14, color: '#333' },
    cellTextMuted: { fontSize: 12, color: '#888' },
    endText: { textAlign: 'center', color: '#aaa', padding: 16, fontSize: 12 },
  });