import { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getFormWithFields, getEntries } from '../db/database';
import FillFormSection from '../components/FillFormSection';
import ViewEntriesSection from '../components/ViewEntriesSection';

type Tab = 'fill' | 'view';
const LIMIT = 50;

export default function FormDetailScreen({ route, navigation }: any) {
  const { formId, formName } = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('fill');
  const [form, setForm] = useState<any>(null);

  const [fields, setFields] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isLoadingRef = useRef(false);

  const loadInitial = useCallback(() => {
    setForm(getFormWithFields(formId));

    const result = getEntries(formId, LIMIT, 0);
    setFields(result.fields);
    setRows(result.rows);
    setPage(0);
    setHasMore(result.rows.length === LIMIT);
  }, [formId]);

  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setLoadingMore(true);

    const nextPage = page + 1;
    const result = getEntries(formId, LIMIT, nextPage * LIMIT);

    setRows(prev => [...prev, ...result.rows]);
    setPage(nextPage);
    setHasMore(result.rows.length === LIMIT);  
    setLoadingMore(false);
    isLoadingRef.current = false;
  }, [formId, page, hasMore]);

  useFocusEffect(loadInitial);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fill' && styles.tabActive]}
          onPress={() => setActiveTab('fill')}
        >
          <Text style={[styles.tabText, activeTab === 'fill' && styles.tabTextActive]}>
            ✏️  Fill Form
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'view' && styles.tabActive]}
          onPress={() => setActiveTab('view')}
        >
          <Text style={[styles.tabText, activeTab === 'view' && styles.tabTextActive]}>
            📋  View Data
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'fill'
          ? <FillFormSection form={form} onSaved={loadInitial} />
          : <ViewEntriesSection
              fields={fields}
              rows={rows}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
        }
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  backBtn: { marginRight: 12, padding: 4 },
  backArrow: { fontSize: 22, color: '#007bff' },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, color: '#1a1a1a' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 16,marginTop: 12,
    borderRadius: 12, padding: 4, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#007bff' },
  tabText: { fontWeight: '600', color: '#888', fontSize: 14 },
  tabTextActive: { color: '#fff' },
});

