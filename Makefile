.PHONY: build up down logs clean restart status

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f

restart:
	docker-compose down
	docker-compose up -d

status:
	docker-compose ps
