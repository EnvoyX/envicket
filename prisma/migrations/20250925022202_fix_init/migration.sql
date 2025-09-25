-- AlterTable
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" SET DEFAULT 'Open',
ALTER COLUMN "priority" DROP DEFAULT;
