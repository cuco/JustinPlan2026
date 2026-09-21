CREATE TABLE `progress` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` integer NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `key`)
);
