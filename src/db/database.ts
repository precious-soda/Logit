import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('formbuilder.db');

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      field_order INTEGER NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entry_values_meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS entry_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      field_id INTEGER NOT NULL,
      value TEXT,
      FOREIGN KEY (entry_id) REFERENCES entry_values_meta(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_entries_form_id 
      ON entry_values_meta(form_id);
    CREATE INDEX IF NOT EXISTS idx_entries_created_at 
      ON entry_values_meta(form_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_values_entry_id 
      ON entry_values(entry_id);
  `);
}

export function saveForm(name: string, fields: { label: string }[]): number {
  const result = db.runSync(
    'INSERT INTO forms (name, created_at) VALUES (?, ?)',
    [name, new Date().toISOString()]
  );

  const formId = result.lastInsertRowId;

  fields.forEach((field, index) => {
    db.runSync(
      'INSERT INTO fields (form_id, label, field_order) VALUES (?, ?, ?)',
      [formId, field.label, index]
    );
  });

  return formId;
}

export function getForms(): any[] {
  return db.getAllSync(`
    SELECT f.id, f.name, f.created_at, COUNT(fi.id) as field_count
    FROM forms f
    LEFT JOIN fields fi ON fi.form_id = f.id
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `);
}

export function deleteForm(id: number) {
  db.runSync('DELETE FROM forms WHERE id = ?', [id]);
}

export function getFormWithFields(formId: number): any {
  const form = db.getFirstSync('SELECT * FROM forms WHERE id = ?', [formId]);
  const fields = db.getAllSync(
    'SELECT * FROM fields WHERE form_id = ? ORDER BY field_order',
    [formId]
  );
  const formData = typeof form === 'object' && form !== null ? form : {};
  return { ...formData, fields };
}

export function saveEntry(formId: number, values: { fieldId: number; value: string }[]) {
  const result = db.runSync(
    'INSERT INTO entry_values_meta (form_id, created_at) VALUES (?, ?)',
    [formId, new Date().toISOString()]
  );
  const entryId = result.lastInsertRowId;

  values.forEach(({ fieldId, value }) => {
    db.runSync(
      'INSERT INTO entry_values (entry_id, field_id, value) VALUES (?, ?, ?)',
      [entryId, fieldId, value]
    );
  });
}

export function getEntries(
  formId: number,
  limit: number,
  offset: number
): { fields: any[]; rows: any[] } {
  const fields = db.getAllSync(
    'SELECT * FROM fields WHERE form_id = ? ORDER BY field_order',
    [formId]
  );

  const entries = db.getAllSync(
    `SELECT * FROM entry_values_meta 
     WHERE form_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [formId, limit, offset]
  );

  const rows = entries.map((entry: any) => {
    const values = db.getAllSync(
      'SELECT field_id, value FROM entry_values WHERE entry_id = ?',
      [entry.id]
    );
    const valueMap: Record<number, string> = {};
    values.forEach((v: any) => { valueMap[v.field_id] = v.value; });

    return {
      entryId: entry.id,
      createdAt: entry.created_at,
      values: fields.map((f: any) => valueMap[f.id] ?? ''),
    };
  });

  return { fields, rows };
}

export function getAllEntries(formId: number): { fields: any[]; rows: any[] } {
  const fields = db.getAllSync(
    'SELECT * FROM fields WHERE form_id = ? ORDER BY field_order',
    [formId]
  );

  const entries = db.getAllSync(
    'SELECT * FROM entry_values_meta WHERE form_id = ? ORDER BY created_at DESC',
    [formId]
  );

  const rows = entries.map((entry: any) => {
    const values = db.getAllSync(
      'SELECT field_id, value FROM entry_values WHERE entry_id = ?',
      [entry.id]
    );
    const valueMap: Record<number, string> = {};
    values.forEach((v: any) => { valueMap[v.field_id] = v.value; });

    return {
      entryId: entry.id,
      createdAt: entry.created_at,
      values: fields.map((f: any) => valueMap[f.id] ?? ''),
    };
  });

  return { fields, rows };
}