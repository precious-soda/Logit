import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { getFormWithFields, saveEntry } from '../db/database';

export default function FillFormScreen({ route, navigation }: any) {
  const { formId } = route.params;
  const [form, setForm] = useState<any>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded = getFormWithFields(formId);
    setForm(loaded);
    // initialise all fields to empty string
    const init: Record<string, string> = {};
    loaded.fields.forEach((f: any) => { init[f.id] = ''; });
    setValues(init);
  }, [formId]);

  const handleChange = (fieldId: number, text: string) => {
    setValues(prev => ({ ...prev, [fieldId]: text }));
  };

  const buildPayload = () =>
    form.fields.map((f: any) => ({ fieldId: f.id, value: values[f.id] ?? '' }));

  const handleSave = () => {
    saveEntry(formId, buildPayload());
    Alert.alert('Saved!', 'Entry has been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleSaveAndContinue = () => {
    saveEntry(formId, buildPayload());
    // reset all inputs to empty without leaving the screen
    const reset: Record<string, string> = {};
    form.fields.forEach((f: any) => { reset[f.id] = ''; });
    setValues(reset);
    Alert.alert('Saved!', 'Entry saved. Fill in the next one.');
  };

  if (!form) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{form.name}</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {form.fields.map((field: any) => (
          <View key={field.id} style={styles.card}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={values[field.id] ?? ''}
              onChangeText={(text) => handleChange(field.id, text)}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleSaveAndContinue}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', padding: 14,
    borderRadius: 10, marginBottom: 12, elevation: 2,
  },
  label: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, padding: 10, fontSize: 15,
  },
  buttonRow: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    flexDirection: 'row', gap: 12,
  },
  saveButton: {
    flex: 1, backgroundColor: '#007bff',
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  continueButton: {
    flex: 1, backgroundColor: '#28a745',
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});