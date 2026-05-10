import {
    View, Text, FlatList, ScrollView,
    ActivityIndicator, StyleSheet
  } from 'react-native';
  
  type Props = {
    fields: any[];
    rows: any[];
    onLoadMore: () => void;
    hasMore: boolean;
    loadingMore: boolean;
  };
  
  const COL_WIDTH = 120;
  const TIME_COL_WIDTH = 90;
  
  export default function ViewEntriesSection({
    fields, rows, onLoadMore, hasMore, loadingMore
  }: Props) {
  
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
    );
  }
  
  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      + '\n'
      + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  
  const styles = StyleSheet.create({
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