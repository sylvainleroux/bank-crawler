# Bank crawler

```javascript
# /etc/bank-crawnler/config.json
{
  "login": "login",
  "password":"password",
  "cron" : "0 * * * *",
  "database" : {
    "schema" : "bank",
    "host": "host",
    "user" : "user",
    "password" : "password"
  }
}
```

```
/var/bank/crawler/****

```

## Frawework

- Extract
  - Launches extract
  - collect data and store them in a temporary file

## Status

```
$ systemctl status bank-crawler
$ journalctl -u bank-crawler -f
```

su -s /bin/bash -c "exec env QT_QPA_PLATFORM="offscreen" env NODE_ENV=production /usr/share/bank-crawler/app/index.js" bank-crawler


## Create mysql USER

mysql
create user bank@localhost IDENTIFIED BY '';
grant all privileges on bank.* to bank@localhost;
flush privileges;