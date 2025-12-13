#!/bin/bash
set -e

### Update system
apt-get update -y
apt-get upgrade -y

### Install dependencies
apt-get install -y unzip wget curl apt-transport-https ca-certificates \
                   software-properties-common gnupg lsb-release

### Fix GRUB for Judge0 (force cgroup v1 instead of v2)
sed -i 's/^GRUB_CMDLINE_LINUX="/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 /' /etc/default/grub || true
update-grub || true

### Install Docker (if not already installed)
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

### Enable Docker service
systemctl enable docker
systemctl start docker

### Install Docker Compose plugin (v2)
if ! docker compose version >/dev/null 2>&1; then
  DOCKER_CONFIG=/usr/local/lib/docker/cli-plugins
  mkdir -p $DOCKER_CONFIG
  curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
       -o $DOCKER_CONFIG/docker-compose
  chmod +x $DOCKER_CONFIG/docker-compose
fi

### Download Judge0 release (if not already present)
if [ ! -d /opt/judge0 ]; then
  mkdir -p /opt/judge0
  cd /opt/judge0
  wget -q https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
  unzip judge0-v1.13.1.zip
fi

cd /opt/judge0/judge0-v1.13.1

### Generate secure random passwords for Redis & Postgres
REDIS_PASS=$(openssl rand -base64 12)
POSTGRES_PASS=$(openssl rand -base64 12)

sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" judge0.conf
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASS/" judge0.conf

### Start Judge0 services
docker compose up -d db redis
sleep 10
docker compose up -d
sleep 5
