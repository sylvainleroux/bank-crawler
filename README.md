# Bank crawler

Crawler for CMB accounts

## Configure

```
cp template.env .env
vi .env
```

## Run

```
docker-compose up -d
```

## Show logs

```
docker logs crawler (--follow)
```


## Build image


```
docker build -t sylvainleroux/rpi-node-puppeteer .

docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t sylvainleroux/crawler:latest --push .
```

-
