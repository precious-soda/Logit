import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getForms, deleteForm } from '../db/database';

export default function HomeScreen({ navigation }: any) {
  const [forms, setForms] = useState<any[]>([]);

  // Runs every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loaded = getForms();
      setForms(loaded);
    }, [])
  );

  const handleDelete = (id: number) => {
    deleteForm(id);
    setForms(prev => prev.filter(f => f.id !== id));
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FormDetail', {
        formId: item.id,
        formName: item.name,
      })}
    >
      <View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.field_count} {item.field_count === 1 ? 'field' : 'fields'}
        </Text>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Forms</Text>

      <FlatList
        data={forms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No forms yet. Tap + to create one.</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSubtitle: { color: '#666', marginTop: 4 },
  deleteText: { color: 'red', fontWeight: '600' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#007bff', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
});