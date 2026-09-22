CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`stage` text NOT NULL,
	`interview` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);

