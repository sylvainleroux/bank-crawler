# Bank crawler

```javascript
# /etc/bank/crawler.json
{
  "login": "login",
  "password":"password",
  "path" :
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
