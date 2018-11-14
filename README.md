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
