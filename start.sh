#!/bin/bash
cd /home/ubuntu/terminal1
export $(cat /etc/terminal1.env | xargs)
npm run dev
