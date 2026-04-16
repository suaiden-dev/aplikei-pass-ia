SELECT tgname, relname FROM pg_trigger JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid;
