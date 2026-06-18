-- Hace dni y address opcionales para reducir fricción en el formulario
ALTER TABLE leads ALTER COLUMN dni     DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN address DROP NOT NULL;
