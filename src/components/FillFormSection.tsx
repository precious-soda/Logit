import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { saveEntry } from '../db/database';

type Props = {
  form: any;
  onSaved: () => void; 
};

export default function FillFormSection({ form, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  if (!form) return null;

  const handleChange = (fieldId: number, text: string) => {
    setValues(prev => ({ ...prev, [fieldId]: text }));
  };

  const buildPayload = () =>
    form.fields.map((f: any) => ({ fieldId: f.id, value: values[f.id] ?? '' }));

  const resetInputs = () => {
    const empty: Record<string, string> = {};
    form.fields.forEach((f: any) => { empty[f.id] = ''; });
    setValues(empty);
  };

  const handleSave = () => {
    saveEntry(form.id, buildPayload());
    resetInputs();
    onSaved();
    Alert.alert('Saved!', 'Entry has been saved.');
  };

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 120 },
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
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#f5f5f5',
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