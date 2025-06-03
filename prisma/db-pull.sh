#!/bin/bash
# Script to pull database schema with force flag
npx prisma db pull --force
npx prisma generate
