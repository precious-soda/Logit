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