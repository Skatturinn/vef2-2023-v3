CREATE TABLE public.deild (
	id SERIAL PRIMARY KEY,
  	name VARCHAR(64) NOT NULL UNIQUE,
	description TEXT,
  	slug VARCHAR(64) NOT NULL UNIQUE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  	updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.namsskeid (
 	id SERIAL PRIMARY KEY,
 	numer VARCHAR(64) NOT NULL UNIQUE,
 	name TEXT,
 	category VARCHAR(64) NOT NULL,
 	einingar FLOAT,
 	kennslumisseri VARCHAR(64) NOT NULL,
 	namstig VARCHAR(64),
 	vefsida VARCHAR(256),
 	created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
 	CONSTRAINT category FOREIGN KEY(category) REFERENCES deild(slug)
);