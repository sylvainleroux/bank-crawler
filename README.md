# Bank crawler

## Run 

```
docker-compose up -d
```

## Show logs 

```
docker logs crawler (--follow)
```

## Create mysql USER

mysql
create user bank@localhost IDENTIFIED BY '';
grant all privileges on bank.* to bank@localhost;
flush privileges;

## Code Sign Chromium

 codesign -s SylvainCertif -f Chromium.app --deep