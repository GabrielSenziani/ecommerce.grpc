import { db } from "../database/connection.js";

export function criaTabelaDeControle() {
    db.exec(` 
        CREATE TABLE IF NOT EXISTS TabelaMigrations( 
        Id INTEGER PRIMARY KEY AUTOINCREMENT, 
        Nome TEXT NOT NULL UNIQUE CHECK (trim(Nome) != ''), 
        Data DATETIME DEFAULT CURRENT_TIMESTAMP 
        )
      `);
}