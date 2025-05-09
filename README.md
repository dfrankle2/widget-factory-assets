# Webflow Widget Factory 🚀

End-to-end catalogue of anonymous-friendly utility widgets  
built with **Make.com + AWS S3 + Webflow CMS** or **Supabase**.

## Repo layout
infra/ SAM / CDK / Terraform IaC
lambdas/ Serverless functions
make/ Raw Make.com scenario exports
widgets/ Per-widget front-end bundles
.github/workflows CI (lint + tests + SAM validate)

## Backend Options

The Widget Factory now supports two backend options:

1. **Make.com + AWS S3** - The original implementation using Make.com webhooks and S3 storage
2. **Supabase** - A new implementation using Supabase for authentication, storage, and serverless functions

## Getting started with Make.com backend

```bash
npm ci
sam build -t infra/template.yaml
sam deploy --guided   # first time only
```

## Getting started with Supabase backend

1. Create a Supabase project at https://supabase.com
2. Set up the database schema and Edge Functions as described in the Supabase documentation
3. Include both the widget.js and supabase-client.js files in your project
4. Configure your widget with Supabase credentials