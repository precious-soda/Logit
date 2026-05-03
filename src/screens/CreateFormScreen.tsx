import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { saveForm } from '../db/database';

export default function CreateFormScreen({ navigation }: any) {
  const [formName, setFormName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fields, setFields] = useState<any[]>([]);

  const addField = () => {
    if (!fieldLabel.trim()) return;

    const newField = {
      id: Date.now().toString(),
      label: fieldLabel,
    };

    setFields([...fields, newField]);
    setFieldLabel('');
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = () => {
    if (!formName.trim()) return;
  
    saveForm(formName, fields);      
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Form</Text>

      {/* Form Name Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Form Name</Text>
        <TextInput
          placeholder="Enter form name"
          value={formName}
          onChangeText={setFormName}
          style={styles.input}
        />
      </View>

      {/* Fields List */}
      <View style={styles.card}>
        <Text style={styles.label}>Fields</Text>

        <View style={styles.fieldListContainer}>
          <ScrollView>
            {fields.length === 0 ? (
              <Text style={styles.emptyText}>No fields added yet</Text>
            ) : (
              fields.map(field => (
                <View key={field.id} style={styles.fieldRow}>
                  <Text>{field.label}</Text>

                  <TouchableOpacity onPress={() => deleteField(field.id)}>
                    <Text style={styles.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        
      </View>

      {/* Add Field */}
      <View style={styles.card}>
        <Text style={styles.label}>Add Field</Text>

        <TextInput
          placeholder="Field label"
          value={fieldLabel}
          onChangeText={setFieldLabel}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addButton} onPress={addField}>
          <Text style={styles.addButtonText}>+ Add Field</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Form</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
  },
  emptyText: {
    color: '#888',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  delete: {
    color: 'red',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 'auto',
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fieldListContainer: {
    maxHeight: 60
  }
});