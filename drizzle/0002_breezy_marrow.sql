PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clique_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text,
	`option_id` integer,
	`order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`token`) REFERENCES `tokens`(`token`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_clique_votes`("id", "token", "option_id", "order", "created_at") SELECT "id", "token", "option_id", "order", "created_at" FROM `clique_votes`;--> statement-breakpoint
DROP TABLE `clique_votes`;--> statement-breakpoint
ALTER TABLE `__new_clique_votes` RENAME TO `clique_votes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`session_id` integer,
	`used` integer DEFAULT 0,
	`salt` text,
	`iv` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tokens`("token", "session_id", "used", "salt", "iv", "created_at") SELECT "token", "session_id", "used", "salt", "iv", "created_at" FROM `tokens`;--> statement-breakpoint
DROP TABLE `tokens`;--> statement-breakpoint
ALTER TABLE `__new_tokens` RENAME TO `tokens`;