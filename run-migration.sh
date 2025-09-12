#!/bin/bash
set -a
source ./.env
set +a
ts-node scripts/migrate-to-firestore.ts