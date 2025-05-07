# Webflow Widget Factory 🚀

End-to-end catalogue of anonymous-friendly utility widgets  
built with **Make.com + AWS S3 + Webflow CMS**.

## Repo layout
infra/ SAM / CDK / Terraform IaC
lambdas/ Serverless functions
make/ Raw Make.com scenario exports
widgets/ Per-widget front-end bundles
.github/workflows CI (lint + tests + SAM validate)

## Getting started

```bash
npm ci
sam build -t infra/template.yaml
sam deploy --guided   # first time only
```