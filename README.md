# Bank crawler

## Run 

```
docker-compose up -d
```


## Create mysql USER

mysql
create user bank@localhost IDENTIFIED BY '';
grant all privileges on bank.* to bank@localhost;
flush privileges;

## Code Sign Chromium

 codesign -s SylvainCertif -f Chromium.app --deep