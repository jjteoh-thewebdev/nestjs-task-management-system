/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `labels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `comments_id_key` ON `comments`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `labels_name_key` ON `labels`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `tasks_id_key` ON `tasks`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_id_key` ON `users`(`id`);
