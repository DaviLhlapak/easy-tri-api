CREATE TYPE "public"."alcohol_status" AS ENUM('never', 'former', 'current');--> statement-breakpoint
CREATE TYPE "public"."smoking_status" AS ENUM('never', 'former', 'current');--> statement-breakpoint
CREATE TYPE "public"."symptom_intensity" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."triage_status" AS ENUM('waiting', 'in_review', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."triage_type" AS ENUM('new', 'follow-up', 'return', 'routine');--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subdomain" varchar(63) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinics_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "triage_constitutional_symptoms" (
	"triage_id" uuid PRIMARY KEY NOT NULL,
	"symptom" varchar(100) NOT NULL,
	"intensity" "symptom_intensity" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_exams" (
	"triage_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_habits" (
	"triage_id" uuid PRIMARY KEY NOT NULL,
	"alcohol_status" "alcohol_status" DEFAULT 'never' NOT NULL,
	"alcohol_frequency" varchar(100),
	"alcohol_quantity" varchar(100),
	"smoking_status" "smoking_status" DEFAULT 'never' NOT NULL,
	"cigarettes_per_day" integer,
	"smoking_years" integer,
	"diet_description" text,
	"dietary_restrictions" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_physical_activities" (
	"triage_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"days_per_week" integer NOT NULL,
	"minutes_per_day" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_physical_symptoms" (
	"triage_id" uuid PRIMARY KEY NOT NULL,
	"body_part" varchar(100) NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"triage_type" "triage_type" NOT NULL,
	"status" "triage_status" DEFAULT 'waiting' NOT NULL,
	"complaint" text,
	"renew_prescription" boolean DEFAULT false NOT NULL,
	"request_medical_exams" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_cpf_unique";--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_pkey";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "clinic_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "clinic_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "clinic_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "triage_constitutional_symptoms" ADD CONSTRAINT "triage_constitutional_symptoms_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_exams" ADD CONSTRAINT "triage_exams_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_habits" ADD CONSTRAINT "triage_habits_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_physical_activities" ADD CONSTRAINT "triage_physical_activities_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_physical_symptoms" ADD CONSTRAINT "triage_physical_symptoms_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triages" ADD CONSTRAINT "triages_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triages" ADD CONSTRAINT "triages_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_clinic_cpf_idx" ON "users" USING btree ("clinic_id","cpf");--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_unique" UNIQUE("user_id");
