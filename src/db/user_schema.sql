CREATE TABLE IF NOT EXISTS users (                                    
    id        INTEGER PRIMARY KEY AUTOINCREMENT,          
    username  TEXT,                                       
    email     TEXT NOT NULL,
    password  TEXT NOT NULL,                              
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    role      TEXT
  );