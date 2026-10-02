CREATE TYPE "public"."alcohol_status" AS ENUM('never', 'former', 'current');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('none', 'elementary', 'high_school', 'technical', 'undergraduate', 'postgraduate');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed', 'other');--> statement-breakpoint
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
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"birth_date" date NOT NULL,
	"marital_status" "marital_status" NOT NULL,
	"gender" "gender" NOT NULL,
	"education_level" "education_level" NOT NULL,
	"current_city" varchar(255) NOT NULL,
	"current_state" varchar(2) NOT NULL,
	"born_city" varchar(255) NOT NULL,
	"born_state" varchar(2) NOT NULL,
	"occupation" varchar(255) NOT NULL,
	"previous_illnesses" text[] DEFAULT '{}' NOT NULL,
	"previous_surgeries" text[] DEFAULT '{}' NOT NULL,
	"family_medical_history" text,
	"medications" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patients_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_constitutional_symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"triage_id" uuid NOT NULL,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"triage_id" uuid NOT NULL,
	"body_part" varchar(100) NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"phone" varchar(11) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_constitutional_symptoms" ADD CONSTRAINT "triage_constitutional_symptoms_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_exams" ADD CONSTRAINT "triage_exams_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_habits" ADD CONSTRAINT "triage_habits_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_physical_activities" ADD CONSTRAINT "triage_physical_activities_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_physical_symptoms" ADD CONSTRAINT "triage_physical_symptoms_triage_id_triages_id_fk" FOREIGN KEY ("triage_id") REFERENCES "public"."triages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triages" ADD CONSTRAINT "triages_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triages" ADD CONSTRAINT "triages_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "triage_constitutional_symptoms_triage_symptom_idx" ON "triage_constitutional_symptoms" USING btree ("triage_id","symptom");--> statement-breakpoint
CREATE UNIQUE INDEX "triage_physical_symptoms_triage_body_part_idx" ON "triage_physical_symptoms" USING btree ("triage_id","body_part");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clinic_cpf_idx" ON "users" USING btree ("clinic_id","cpf");